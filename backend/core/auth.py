"""Session auth without CSRF enforcement so SPA on different port can call API with cookies."""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        pass  # Skip CSRF check for API (frontend on :3000 doesn't send CSRF token)