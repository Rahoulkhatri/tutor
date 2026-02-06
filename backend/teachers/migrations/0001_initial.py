# Generated manually for TutorConnect Django backend

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="TeachingOffer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subject", models.CharField(max_length=200)),
                ("subject_badge", models.CharField(blank=True, max_length=200)),
                ("rate", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("location", models.CharField(blank=True, max_length=200)),
                ("description", models.TextField(blank=True)),
                ("status", models.CharField(default="active", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("teacher", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="offers", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Session",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subject", models.CharField(default="Session", max_length=200)),
                ("scheduled_at", models.DateTimeField()),
                ("duration_hours", models.DecimalField(decimal_places=1, default=1, max_digits=4)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("status", models.CharField(choices=[("confirmed", "Confirmed"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="confirmed", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sessions_as_student", to=settings.AUTH_USER_MODEL)),
                ("teacher", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sessions_as_teacher", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["scheduled_at"]},
        ),
        migrations.CreateModel(
            name="Connection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subject", models.CharField(default="Tutoring", max_length=200)),
                ("location", models.CharField(blank=True, max_length=200)),
                ("rate", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("budget", models.CharField(blank=True, max_length=100)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("active", "Active"), ("rejected", "Rejected")], default="pending", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="student_connections", to=settings.AUTH_USER_MODEL)),
                ("teacher", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="teacher_connections", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
