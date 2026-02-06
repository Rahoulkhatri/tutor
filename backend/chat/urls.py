from django.urls import path
from .views import SendView, MessagesView, ConversationsView

urlpatterns = [
    path("send/", SendView.as_view()),
    path("messages/", MessagesView.as_view()),
    path("conversations/", ConversationsView.as_view()),
]
