from django.contrib import admin
from .models import TeachingOffer, Connection, Session


@admin.register(TeachingOffer)
class TeachingOfferAdmin(admin.ModelAdmin):
    list_display = ("subject", "teacher", "status", "rate")


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ("student", "teacher", "status")


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("student", "teacher", "subject", "scheduled_at", "status")
