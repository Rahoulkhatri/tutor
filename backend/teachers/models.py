from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class TeachingOffer(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="offers")
    subject = models.CharField(max_length=200)
    subject_badge = models.CharField(max_length=200, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, default="active")  # active, paused
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class Connection(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("active", "Active"),
        ("declined", "Declined"),
        ("rejected", "Rejected"),
    )
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="student_connections")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_connections")
    subject = models.CharField(max_length=200, default="Tutoring")
    location = models.CharField(max_length=200, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class Session(models.Model):
    STATUS_CHOICES = (
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions_as_student")
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions_as_teacher")
    subject = models.CharField(max_length=200, default="Session")
    scheduled_at = models.DateTimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["scheduled_at"]
