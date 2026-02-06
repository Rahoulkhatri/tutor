from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create demo users (admin, student, teacher) and sample data"

    def handle(self, *args, **options):
        def get_or_create(email, name, role, password="demo123"):
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": name.split()[0] if name else "",
                    "last_name": name.split(None, 1)[1] if name and len(name.split()) > 1 else "",
                    "role": role,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created {role}: {email}"))
            return user

        get_or_create("admin@tutorconnect.com", "Admin User", "admin", "admin123")
        student = get_or_create("student@tutorconnect.com", "Ayesha Malik", "student", "student123")
        teacher = get_or_create("teacher@tutorconnect.com", "Fatima K.", "teacher", "teacher123")

        from teachers.models import TeachingOffer, Connection, Session
        from django.utils import timezone
        from decimal import Decimal

        TeachingOffer.objects.filter(teacher=teacher).delete()
        TeachingOffer.objects.create(
            teacher=teacher,
            subject="Mathematics Tutor",
            subject_badge="High School Math",
            rate=Decimal("2000"),
            location="Gulshan-e-Iqbal, Karachi",
            description="Algebra, geometry, calculus for high school.",
            status="active",
        )
        TeachingOffer.objects.create(
            teacher=teacher,
            subject="Physics Tutor",
            subject_badge="AP Physics",
            rate=Decimal("2200"),
            location="Defence, Karachi",
            description="AP Physics for advanced students.",
            status="active",
        )

        Connection.objects.filter(student=student, teacher=teacher).delete()
        Connection.objects.create(
            student=student,
            teacher=teacher,
            subject="Mathematics Expert",
            location="Gulshan-e-Iqbal",
            rate=Decimal("2000"),
            status="active",
        )

        Session.objects.filter(student=student, teacher=teacher).delete()
        now = timezone.now()
        from datetime import timedelta
        Session.objects.create(
            student=student,
            teacher=teacher,
            subject="Mathematics",
            scheduled_at=now + timedelta(days=1),
            duration_hours=Decimal("1"),
            amount=Decimal("2000"),
            status="confirmed",
        )

        self.stdout.write(self.style.SUCCESS("Seed done. Login: student@tutorconnect.com / student123 (Student), teacher@tutorconnect.com / teacher123 (Teacher)."))
