from decimal import Decimal
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import TeachingOffer, Connection, Session

User = get_user_model()


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "teacher":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        offers = TeachingOffer.objects.filter(teacher=user)
        connections_count = Connection.objects.filter(teacher=user, status="active").count()
        completed = Session.objects.filter(teacher=user, status="completed")
        total_hours = sum(float(s.duration_hours) for s in completed)
        earnings = sum(float(s.amount) for s in completed)

        now = timezone.now()
        upcoming_sessions = (
            Session.objects.filter(teacher=user, scheduled_at__gte=now, status="confirmed")
            .select_related("student")
            .order_by("scheduled_at")[:10]
        )
        pending = (
            Connection.objects.filter(teacher=user, status="pending")
            .select_related("student")
            .order_by("-created_at")[:10]
        )

        offers_formatted = []
        for o in offers:
            offers_formatted.append({
                "id": str(o.pk),
                "title": o.subject or "Tutoring",
                "subjectBadge": o.subject_badge or o.subject or "Subject",
                "rate": f"Rs. {o.rate:,.0f}/hour" if o.rate else "",
                "rateRaw": float(o.rate) if o.rate else 0,
                "location": o.location or "",
                "description": o.description or "",
                "status": "paused" if o.status == "paused" else "active",
            })

        sessions_formatted = []
        for s in upcoming_sessions:
            student_name = getattr(s.student, "name", None) or "Student"
            sessions_formatted.append({
                "id": str(s.pk),
                "studentId": str(s.student_id),
                "studentName": student_name,
                "subject": s.subject or "Session",
                "scheduledAt": s.scheduled_at,
                "durationHours": float(s.duration_hours) if s.duration_hours else 1,
            })

        pending_formatted = []
        for p in pending:
            student_name = getattr(p.student, "name", None) or "Student"
            pending_formatted.append({
                "id": str(p.pk),
                "studentName": student_name,
                "subject": p.subject or "Tutoring",
                "budget": getattr(p, "budget", "") or "",
                "location": p.location or "",
            })

        return Response({
            "user": {"name": user.name, "email": user.email, "role": user.role},
            "stats": {
                "activeStudents": connections_count,
                "earnings": f"Rs. {int(earnings):,}" if earnings > 0 else "Rs. 0",
                "rating": "4.9",
                "totalHours": round(total_hours, 1),
            },
            "offers": offers_formatted,
            "pendingMatches": pending_formatted,
            "upcomingSessions": sessions_formatted,
        })


class OffersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "teacher":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data or {}
        subject = (data.get("subject") or data.get("title") or "Tutoring").strip()
        subject_badge = data.get("subjectBadge") or subject
        rate = data.get("rate") or data.get("rateRaw") or 0
        try:
            rate = Decimal(str(rate))
        except Exception:
            rate = Decimal(0)
        location = (data.get("location") or "").strip()
        description = (data.get("description") or "").strip()

        offer = TeachingOffer.objects.create(
            teacher=request.user,
            subject=subject,
            subject_badge=subject_badge,
            rate=rate,
            location=location,
            description=description,
            status="active",
        )
        return Response({
            "id": str(offer.pk),
            "title": offer.subject,
            "subjectBadge": offer.subject_badge,
            "rate": f"Rs. {offer.rate:,.0f}/hour",
            "rateRaw": float(offer.rate),
            "location": offer.location,
            "description": offer.description,
            "status": offer.status,
        })


class OfferDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != "teacher":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        offer = get_object_or_404(TeachingOffer, pk=pk, teacher=request.user)
        data = request.data or {}

        if "status" in data:
            offer.status = data["status"]  # paused | active
        if "subject" in data:
            offer.subject = data["subject"]
        if "subjectBadge" in data:
            offer.subject_badge = data["subjectBadge"]
        if "rate" in data or "rateRaw" in data:
            r = data.get("rateRaw") or data.get("rate") or 0
            try:
                offer.rate = Decimal(str(r))
            except Exception:
                pass
        if "location" in data:
            offer.location = data["location"]
        if "description" in data:
            offer.description = data["description"]
        offer.save()

        return Response({
            "id": str(offer.pk),
            "title": offer.subject,
            "subjectBadge": offer.subject_badge,
            "rate": f"Rs. {offer.rate:,.0f}/hour",
            "rateRaw": float(offer.rate),
            "location": offer.location,
            "description": offer.description,
            "status": offer.status,
        })


class ConnectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != "teacher":
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        conn = get_object_or_404(Connection, pk=pk, teacher=request.user, status="pending")
        action = (request.data or {}).get("action")  # accept | decline

        if action == "accept":
            conn.status = "active"
            conn.save()
        elif action == "decline":
            conn.status = "rejected"
            conn.save()
        else:
            return Response({"error": "action must be accept or decline"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"success": True})