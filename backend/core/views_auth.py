from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User


def _user_json(user):
    if not user or not user.is_authenticated:
        return None
    return {
        "userId": str(user.pk),
        "email": user.email or "",
        "name": getattr(user, "name", None) or user.email or "",
        "role": user.role,
    }


class LoginView(APIView):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        data = request.data or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        role = data.get("role")

        if not email or not password or not role:
            return Response(
                {"error": "Email, password and role are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if role not in ("student", "teacher", "admin"):
            return Response(
                {"error": "Invalid role. Use student, teacher or admin"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if user is None:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        if user.role != role:
            return Response(
                {"error": f"Please login as {user.role}. You selected {role}."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        redirect_url = (
            "/"
            if role == "admin"
            else "/teacher-dashboard.html"
            if role == "teacher"
            else "/student-dashboard.html"
        )
        return Response({"success": True, "redirectUrl": redirect_url})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"success": True})


class MeView(APIView):
    def get(self, request):
        payload = _user_json(request.user)
        if payload is None:
            return Response({"user": None}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"user": payload})


class SignupView(APIView):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        data = request.data or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        name = (data.get("name") or "").strip()
        role = data.get("role")

        if not email or not password or not role:
            return Response(
                {"error": "Email, password and role are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if role not in ("student", "teacher", "admin"):
            return Response(
                {"error": "Invalid role"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parts = name.split(None, 1)
        first_name = parts[0] if parts else ""
        last_name = parts[1] if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )
        login(request, user)
        redirect_url = (
            "/"
            if role == "admin"
            else "/teacher-dashboard.html"
            if role == "teacher"
            else "/student-dashboard.html"
        )
        return Response({"success": True, "redirectUrl": redirect_url})
