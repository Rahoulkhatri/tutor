from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views_auth import LoginView, LogoutView, MeView, SignupView

urlpatterns = [
    path("login/", csrf_exempt(LoginView.as_view())),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("signup/", csrf_exempt(SignupView.as_view())),
]
