from django.urls import path
from .views import (
    DashboardView,
    OffersView,
    RequestConnectionView,
    SessionsView,
    PaymentsView,
)

urlpatterns = [
    path("dashboard/", DashboardView.as_view()),
    path("offers/", OffersView.as_view()),
    path("request-connection/", RequestConnectionView.as_view()),
    path("sessions/", SessionsView.as_view()),
    path("payments/", PaymentsView.as_view()),
]
