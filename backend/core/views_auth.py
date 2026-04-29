from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
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
    permission_classes = [AllowAny]
    authentication_classes = []  # no session yet; avoids DRF SessionAuthentication CSRF 403

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
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
                # Required for login(): user must have backend set when not from authenticate()
                user.backend = "django.contrib.auth.backends.ModelBackend"

            login(request, user)
            # Redirect by actual account role so correct dashboard loads (ignore selected tab if mismatch)
            redirect_url = (
                "/"
                if user.role == "admin"
                else "/teacher-dashboard.html"
                if user.role == "teacher"
                else "/student-dashboard.html"
            )
            return Response({"success": True, "redirectUrl": redirect_url})
        except Exception as e:
            import traceback
            from django.conf import settings
            err_msg = str(e)
            if getattr(settings, "DEBUG", False):
                err_msg += " | " + traceback.format_exc().replace("\n", " ")
            return Response(
                {"error": "Server error during login.", "detail": err_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


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
    permission_classes = [AllowAny]
    authentication_classes = []  # no session yet; avoids DRF SessionAuthentication CSRF 403

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
        if role not in ("student", "teacher"):
            return Response(
                {"error": "Signup is for student or teacher only"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email already exists"},
                status=status.HTTP_409_CONFLICT,
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
