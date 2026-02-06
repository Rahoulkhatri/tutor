import datetime
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()


class SendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_user_id = request.data.get("toUserId")
        text = (request.data.get("text") or "").strip()
        if not to_user_id or not text:
            return Response(
                {"error": "toUserId and text are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(text) > 5000:
            return Response(
                {"error": "Message too long"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        receiver = get_object_or_404(User, pk=to_user_id)
        Message.objects.create(sender=request.user, receiver=receiver, text=text)
        return Response({"success": True})


class MessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with_user_id = request.query_params.get("with")
        if not with_user_id:
            return Response({"messages": []})
        try:
            other = User.objects.get(pk=with_user_id)
        except (User.DoesNotExist, ValueError):
            return Response({"messages": []})

        msgs = Message.objects.filter(
            sender=request.user, receiver=other
        ) | Message.objects.filter(sender=other, receiver=request.user)
        msgs = msgs.order_by("created_at")[:200]

        messages = []
        for m in msgs:
            messages.append({
                "id": str(m.pk),
                "senderId": str(m.sender_id),
                "receiverId": str(m.receiver_id),
                "text": m.text,
                "time": m.created_at,
                "isSent": m.sender_id == request.user.pk,
            })
        return Response({"messages": messages})


class ConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        include_user_id = request.query_params.get("with")

        sent = Message.objects.filter(sender=user).values_list("receiver_id", flat=True).distinct()
        received = Message.objects.filter(receiver=user).values_list("sender_id", flat=True).distinct()
        other_ids = set(sent) | set(received)
        if user.pk in other_ids:
            other_ids.discard(user.pk)

        conversations = []
        for uid in other_ids:
            try:
                u = User.objects.get(pk=uid)
            except User.DoesNotExist:
                continue
            last = (
                Message.objects.filter(sender=user, receiver=u)
                | Message.objects.filter(sender=u, receiver=user)
            ).order_by("-created_at").first()
            initials = (getattr(u, "name", "") or u.email or "U")[:2].upper()
            if u.name:
                parts = u.name.strip().split()
                initials = "".join(p[0] for p in parts)[:2].upper() if parts else "U"
            conversations.append({
                "userId": str(u.pk),
                "name": getattr(u, "name", None) or u.email or "User",
                "initials": initials,
                "lastMessage": last.text if last else "",
                "lastMessageAt": last.created_at if last else None,
            })

        conversations.sort(
            key=lambda c: c["lastMessageAt"] if c["lastMessageAt"] else datetime.datetime.min,
            reverse=True,
        )

        if include_user_id and str(include_user_id) != str(user.pk):
            try:
                inc = User.objects.get(pk=include_user_id)
            except (User.DoesNotExist, ValueError):
                inc = None
            if inc and not any(c["userId"] == str(inc.pk) for c in conversations):
                initials = (getattr(inc, "name", "") or inc.email or "U")[:2].upper()
                if getattr(inc, "name", None):
                    parts = inc.name.strip().split()
                    initials = "".join(p[0] for p in parts)[:2].upper() if parts else "U"
                conversations.insert(0, {
                    "userId": str(inc.pk),
                    "name": getattr(inc, "name", None) or inc.email or "User",
                    "initials": initials,
                    "lastMessage": "",
                    "lastMessageAt": None,
                })

        return Response({"conversations": conversations})
