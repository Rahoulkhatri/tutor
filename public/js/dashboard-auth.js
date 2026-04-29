/**
 * Student / Teacher dashboard: check session and handle logout.
 * Include this script on student-dashboard.html and teacher-dashboard.html.
 */
(function() {
  async function checkAuth() {
    try {
      const res = await fetch((window.API_BASE || '') + '/api/auth/me/', { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }
      const data = await res.json().catch(function() { return {}; });
      if (data.user) {
        var nameEl = document.querySelector('.app-shell-user-name');
        if (nameEl && data.user.name) nameEl.textContent = data.user.name;
        var roleEl = document.querySelector('.app-shell-user-role');
        if (roleEl && data.user.role) roleEl.textContent = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
        var avatarEl = document.querySelector('.app-shell-avatar');
        if (avatarEl && data.user.name) {
          var parts = data.user.name.trim().split(/\s+/);
          var initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : (data.user.name.slice(0, 2) || 'U').toUpperCase();
          avatarEl.textContent = initials;
        }
      }
    } catch (e) {
      window.location.href = '/login.html';
    }
  }

  function setupLogout() {
    document.querySelectorAll('.app-shell-logout').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        fetch((window.API_BASE || '') + '/api/auth/logout/', { method: 'POST', credentials: 'include' })
          .then(function() { window.location.href = '/login.html'; })
          .catch(function() { window.location.href = '/login.html'; });
      });
    });
  }

  checkAuth();
  setupLogout();
})();
