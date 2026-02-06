from django.urls import path
from .views import DashboardView, OffersView, OfferDetailView, ConnectionDetailView

urlpatterns = [
    path("dashboard/", DashboardView.as_view()),
    path("offers/", OffersView.as_view()),
    path("offers/<int:pk>/", OfferDetailView.as_view()),
    path("connections/<int:pk>/", ConnectionDetailView.as_view()),
]
