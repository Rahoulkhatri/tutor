from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("core.urls_auth")),
    path("api/student/", include("students.urls")),
    path("api/teacher/", include("teachers.urls")),
    path("api/chat/", include("chat.urls")),
]
