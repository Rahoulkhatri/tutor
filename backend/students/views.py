from decimal import Decimal
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from teachers.models import TeachingOffer, Connection, Session

User = get_user_model()


def _teacher_json(teacher):
    name = getattr(teacher, "name", None) or teacher.email or "Teacher"
    parts = name.strip().split()
    initials = "".join(p[0] for p in parts)[:2].upper() if parts else "T"
    return {
        "id": str(teacher.pk),
        "name": name,
        "initials": initials,
        "subject": "Tutoring",
        "location": "",
        "rate": "",
        "rating": "4.9",
        "reviews": 0,
    }


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        connections = Connection.objects.filter(student=user, status="active").select_related("teacher")
        teachers = [c.teacher for c in connections]
        teacher_map = {str(t.pk): t for t in teachers}

        now = timezone.now()
        upcoming = Session.objects.filter(
            student=user, scheduled_at__gte=now, status="confirmed"
        ).select_related("teacher").order_by("scheduled_at")[:10]

        completed = Session.objects.filter(student=user, status="completed")
        hours = sum(float(s.duration_hours) for s in completed)
        total_spent = sum(float(s.amount) for s in completed)

        tutors = []
        for c in connections:
            t = teacher_map.get(str(c.teacher_id))
            if not t:
                continue
            tj = _teacher_json(t)
            tj["subject"] = c.subject or "Tutoring"
            tj["location"] = c.location or ""
            tj["rate"] = f"Rs. {c.rate:,.0f}/hour" if c.rate else ""
            tutors.append(tj)

        sessions_formatted = []
        for s in upcoming:
            sessions_formatted.append({
                "id": str(s.pk),
                "teacherId": str(s.teacher_id),
                "time": s.scheduled_at,
                "subject": s.subject or "Session",
                "teacherName": getattr(s.teacher, "name", None) or "Teacher",
                "duration": f"{s.duration_hours} hour(s)" if s.duration_hours else "1 hour",
                "status": s.status,
            })

        return Response({
            "user": {"name": user.name, "email": user.email, "role": user.role},
            "stats": {
                "activeTutors": len(tutors),
                "hoursCompleted": round(hours, 1),
                "averageRating": "4.8",
                "totalSpent": f"Rs. {int(total_spent):,}" if total_spent > 0 else "Rs. 0",
            },
            "tutors": tutors,
            "upcomingSessions": sessions_formatted,
        })


class OffersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        student = request.user
        offers = TeachingOffer.objects.filter(status="active").select_related("teacher")
        my_connections = Connection.objects.filter(student=student)
        connection_by_teacher = {str(c.teacher_id): c.status for c in my_connections}

        courses = []
        for o in offers:
            teacher_id = str(o.teacher_id)
            teacher = o.teacher
            name = getattr(teacher, "name", None) or teacher.email or "Teacher"
            parts = name.strip().split()
            initials = "".join(p[0] for p in parts)[:2].upper() if parts else "T"
            status_conn = connection_by_teacher.get(teacher_id, "none")
            rate_str = f"Rs. {o.rate:,.0f}/hour" if o.rate else ""
            courses.append({
                "id": str(o.pk),
                "offerId": str(o.pk),
                "teacherId": teacher_id,
                "teacherName": name,
                "teacherInitials": initials,
                "title": o.subject or "Tutoring",
                "subjectBadge": o.subject_badge or o.subject or "Subject",
                "rate": rate_str,
                "location": o.location or "",
                "description": o.description or "",
                "connectionStatus": status_conn,
            })

        return Response({"courses": courses})


class RequestConnectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "student":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        offer_id = request.data.get("offerId")
        if not offer_id:
            return Response({"error": "offerId required"}, status=status.HTTP_400_BAD_REQUEST)

        offer = get_object_or_404(TeachingOffer, pk=offer_id, status="active")
        student = request.user
        teacher = offer.teacher

        if Connection.objects.filter(student=student, teacher=teacher).exists():
            return Response({"error": "Already connected or request sent"}, status=status.HTTP_400_BAD_REQUEST)

        Connection.objects.create(
            student=student,
            teacher=teacher,
            subject=offer.subject or "Tutoring",
            location=offer.location or "",
            rate=offer.rate,
            status="pending",
        )
        return Response({"success": True})


class SessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "student":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        teacher_id = request.data.get("teacherId")
        subject = (request.data.get("subject") or "Session").strip()
        start_time = request.data.get("startTime")
        duration = request.data.get("durationHours", 1)
        try:
            duration = float(duration)
        except (TypeError, ValueError):
            duration = 1
        if duration < 0.5 or duration > 24:
            return Response(
                {"error": "Duration must be between 0.5 and 24 hours."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not teacher_id or not start_time:
            return Response(
                {"error": "teacherId and startTime required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        teacher = get_object_or_404(User, pk=teacher_id, role="teacher")
        try:
            from datetime import datetime
            scheduled_at = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            if timezone.is_naive(scheduled_at):
                scheduled_at = timezone.make_aware(scheduled_at)
        except Exception:
            return Response(
                {"error": "Invalid date or time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = request.data.get("amount") or 0
        try:
            amount = Decimal(str(amount))
        except Exception:
            amount = Decimal(0)

        session = Session.objects.create(
            student=request.user,
            teacher=teacher,
            subject=subject,
            scheduled_at=scheduled_at,
            duration_hours=duration,
            amount=amount,
            status="confirmed",
        )
        return Response({
            "id": str(session.pk),
            "scheduledAt": session.scheduled_at,
            "subject": session.subject,
            "durationHours": float(session.duration_hours),
            "status": session.status,
        })


class PaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        sessions = Session.objects.filter(student=user).select_related("teacher").order_by("-scheduled_at")[:100]

        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total_paid = sum(float(s.amount) for s in sessions)
        this_month = sum(
            float(s.amount) for s in sessions
            if s.scheduled_at >= start_of_month
        )

        payments = []
        for s in sessions:
            teacher_name = getattr(s.teacher, "name", None) or "Teacher"
            payments.append({
                "id": str(s.pk),
                "teacherId": str(s.teacher_id),
                "teacherName": teacher_name,
                "subject": s.subject or "Session",
                "scheduledAt": s.scheduled_at,
                "durationHours": float(s.duration_hours),
                "amount": float(s.amount),
                "status": s.status,
            })

        return Response({
            "payments": payments,
            "totalPaid": int(total_paid),
            "thisMonthPaid": int(this_month),
        })