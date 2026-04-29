from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = "Create demo users and full test data (offers, connections, sessions, messages)"

    def handle(self, *args, **options):
        def get_or_create(email, name, role, password="password123"):
            parts = (name or "").strip().split(None, 1)
            first = parts[0] if parts else ""
            last = parts[1] if len(parts) > 1 else ""
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": first,
                    "last_name": last,
                    "role": role,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created {role}: {email}"))
            elif role == "admin" and email == "admin@tutorconnect.com":
                user.set_password("admin123")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Reset admin password: {email}"))
            return user

        # Users (admin password always admin123 after seed)
        get_or_create("admin@tutorconnect.com", "Admin User", "admin", "admin123")
        student_main = get_or_create("student@tutorconnect.com", "Ayesha Malik", "student", "password123")
        teacher_main = get_or_create("teacher@tutorconnect.com", "Fatima K.", "teacher", "password123")
        student_ali = get_or_create("ali.khan@test.com", "Ali Khan", "student")
        student_sara = get_or_create("sara.ahmed@test.com", "Sara Ahmed", "student")
        student_omar = get_or_create("omar.hassan@test.com", "Omar Hassan", "student")
        student_zainab = get_or_create("zainab.rizvi@test.com", "Zainab Rizvi", "student")
        teacher_rahim = get_or_create("teacher.rahim@test.com", "Rahim Sheikh", "teacher")
        teacher_nadia = get_or_create("teacher.nadia@test.com", "Nadia Hussain", "teacher")
        teacher_kamran = get_or_create("teacher.kamran@test.com", "Kamran Malik", "teacher")
        teacher_sana = get_or_create("teacher.sana@test.com", "Sana Khan", "teacher")
        teacher_faisal = get_or_create("teacher.faisal@test.com", "Faisal Ahmed", "teacher")
        teacher_layla = get_or_create("teacher.layla@test.com", "Layla Hassan", "teacher")

        from teachers.models import TeachingOffer, Connection, Session
        from chat.models import Message

        # Teaching offers
        TeachingOffer.objects.all().delete()
        offers_data = [
            (teacher_main, "Mathematics Tutor", "High School Math", 2000, "Gulshan-e-Iqbal, Karachi", "Algebra, geometry, calculus.", "active"),
            (teacher_main, "Physics Tutor", "AP Physics", 2200, "Defence, Karachi", "AP Physics for advanced students.", "active"),
            (teacher_main, "Test Prep", "SAT/ACT", 2400, "Clifton, Karachi", "SAT/ACT preparation.", "active"),
            (teacher_rahim, "Chemistry", "O-Level", 1800, "DHA, Karachi", "Organic and inorganic chemistry.", "active"),
            (teacher_rahim, "Biology", "A-Level", 1900, "DHA, Karachi", "Cell biology, genetics.", "active"),
            (teacher_nadia, "English Literature", "IELTS", 1500, "Bahria Town", "Essay writing, comprehension.", "active"),
            (teacher_nadia, "Creative Writing", "Creative", 1600, "Online", "Fiction and non-fiction.", "paused"),
            (teacher_kamran, "Computer Science", "Programming", 2500, "Korangi", "Python, data structures.", "active"),
            (teacher_kamran, "Web Development", "Full Stack", 2800, "Online", "React, Node.js.", "active"),
            (teacher_sana, "Urdu", "Matric", 1200, "Nazimabad", "Grammar and composition.", "active"),
            (teacher_sana, "Pakistan Studies", "O-Level", 1300, "Nazimabad", "History and geography.", "active"),
            (teacher_faisal, "Accounting", "CA Foundation", 2000, "I.I. Chundrigar", "Financial accounting.", "active"),
            (teacher_faisal, "Economics", "A-Level", 2100, "Online", "Micro and macro economics.", "active"),
            (teacher_layla, "Art & Design", "Portfolio", 2200, "Clifton", "Sketching, digital art.", "active"),
        ]
        for teacher, subj, badge, rate, loc, desc, status in offers_data:
            TeachingOffer.objects.create(
                teacher=teacher, subject=subj, subject_badge=badge,
                rate=Decimal(rate), location=loc, description=desc, status=status,
            )
        self.stdout.write(self.style.SUCCESS(f"Created {len(offers_data)} teaching offers."))

        # Connections
        Connection.objects.all().delete()
        conn_data = [
            (student_main, teacher_main, "Mathematics Expert", "Gulshan-e-Iqbal", 2000, "active", None),
            (student_ali, teacher_main, "Physics", "Defence", 2200, "active", None),
            (student_sara, teacher_rahim, "Chemistry", "DHA", 1800, "active", None),
            (student_omar, teacher_nadia, "English", "Online", 1500, "active", None),
            (student_zainab, teacher_kamran, "Programming", "Online", 2500, "active", None),
            (student_ali, teacher_rahim, "Biology", "DHA", 1900, "pending", "Rs. 5000/month"),
            (student_sara, teacher_main, "Math", "Gulshan", 2000, "pending", "Rs. 8000"),
            (student_omar, teacher_kamran, "Web Dev", "Online", 2800, "pending", "Rs. 10000"),
            (student_zainab, teacher_nadia, "Creative Writing", "Online", 1600, "declined", None),
        ]
        for stud, teach, subj, loc, rate, status, budget in conn_data:
            Connection.objects.create(
                student=stud, teacher=teach, subject=subj, location=loc,
                rate=Decimal(rate), status=status, budget=budget or "",
            )
        self.stdout.write(self.style.SUCCESS(f"Created {len(conn_data)} connections."))

        # Sessions
        Session.objects.all().delete()
        now = timezone.now()
        today = now.replace(hour=15, minute=0, second=0, microsecond=0)
        tomorrow = (now + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0)
        last_week = now - timedelta(days=7)
        next_week = now + timedelta(days=7)
        sessions_data = [
            (student_main, teacher_main, "Mathematics", today, 1, 2000, "confirmed"),
            (student_main, teacher_main, "Physics", tomorrow, 1.5, 3300, "confirmed"),
            (student_main, teacher_main, "Math Revision", last_week.replace(hour=10), 1, 2000, "completed"),
            (student_ali, teacher_main, "Physics", tomorrow.replace(hour=16), 1, 2200, "confirmed"),
            (student_ali, teacher_main, "Physics Intro", last_week.replace(hour=11), 1, 2200, "completed"),
            (student_sara, teacher_rahim, "Chemistry", next_week.replace(hour=9), 1, 1800, "confirmed"),
            (student_sara, teacher_rahim, "Organic Chem", last_week.replace(hour=14), 1.5, 2700, "completed"),
            (student_omar, teacher_nadia, "English Essay", tomorrow.replace(hour=17), 1, 1500, "confirmed"),
            (student_omar, teacher_nadia, "IELTS Prep", last_week.replace(hour=15), 2, 3000, "completed"),
            (student_zainab, teacher_kamran, "Python Basics", next_week.replace(hour=10), 1.5, 3750, "confirmed"),
            (student_zainab, teacher_kamran, "Data Structures", last_week.replace(hour=16), 1, 2500, "completed"),
        ]
        for stud, teach, subj, at, hrs, amt, status in sessions_data:
            Session.objects.create(
                student=stud, teacher=teach, subject=subj, scheduled_at=at,
                duration_hours=Decimal(str(hrs)), amount=Decimal(amt), status=status,
            )
        self.stdout.write(self.style.SUCCESS(f"Created {len(sessions_data)} sessions."))

        # Messages
        Message.objects.all().delete()
        msg_data = [
            (student_main, teacher_main, ["Hi, I need help with calculus.", "Sure, we can do a session tomorrow.", "Thank you!"]),
            (teacher_main, student_main, ["Reminder: session at 3 PM today.", "See you then."]),
            (student_ali, teacher_main, ["Hello, is the physics slot still available?", "Yes, you can book from the dashboard."]),
            (student_sara, teacher_rahim, ["When can we start chemistry?", "How about next Monday at 9 AM?"]),
            (teacher_rahim, student_sara, ["Done. I've added the topic list."]),
            (student_omar, teacher_nadia, ["I need help with my essay.", "Send me the topic and I'll review it."]),
            (student_zainab, teacher_kamran, ["Hi! Interested in Python classes.", "Great, I have slots this week. Check the offers page."]),
        ]
        count = 0
        for sender, receiver, texts in msg_data:
            for text in texts:
                Message.objects.create(sender=sender, receiver=receiver, text=text)
                count += 1
        self.stdout.write(self.style.SUCCESS(f"Created {count} messages."))

        self.stdout.write(self.style.SUCCESS(
            "Seed done. Login: student@tutorconnect.com / teacher@tutorconnect.com (password: password123). Admin: admin123"
        ))
