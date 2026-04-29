(function () {
  var offerDataById = {};
  var offerModal = document.getElementById("offer-modal");
  var offerForm = document.getElementById("offer-form");
  var offerIdInput = document.getElementById("offer-id");
  var offerSubjectInput = document.getElementById("offer-subject");
  var offerSubjectBadgeInput = document.getElementById("offer-subject-badge");
  var offerRateInput = document.getElementById("offer-rate");
  var offerLocationInput = document.getElementById("offer-location");
  var offerDescriptionInput = document.getElementById("offer-description");
  var offerModalTitle = document.getElementById("offer-modal-title");
  var btnNewOffer = document.getElementById("btn-new-offer");
  var offerModalClose = document.getElementById("offer-modal-close");
  var offerModalCancel = document.getElementById("offer-modal-cancel");

  function openOfferModal(offer) {
    if (offer) {
      offerModalTitle.textContent = "Edit Offer";
      offerIdInput.value = offer.id || "";
      offerSubjectInput.value = offer.title || offer.subject || "";
      offerSubjectBadgeInput.value = offer.subjectBadge || "";
      offerRateInput.value = offer.rateRaw != null ? offer.rateRaw : "";
      offerLocationInput.value = offer.location || "";
      offerDescriptionInput.value = offer.description || "";
    } else {
      offerModalTitle.textContent = "New Offer";
      offerIdInput.value = "";
      offerForm.reset();
      offerIdInput.value = "";
    }
    if (offerModal) {
      offerModal.classList.add("is-open");
      offerModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeOfferModal() {
    if (offerModal) {
      offerModal.classList.remove("is-open");
      offerModal.setAttribute("aria-hidden", "true");
    }
  }

  function loadDashboard() {
    fetch((window.API_BASE || '') + "/api/teacher/dashboard/", { credentials: "include" })
      .then(function (res) {
        if (!res.ok) return;
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        var stats = data.stats || {};
        var offers = data.offers || [];
        var pending = data.pendingMatches || [];
        var sessions = data.upcomingSessions || [];

        var el = document.getElementById("stat-students");
        if (el) el.textContent = stats.activeStudents != null ? stats.activeStudents : "0";
        el = document.getElementById("stat-earnings");
        if (el) el.textContent = stats.earnings || "Rs. 0";
        el = document.getElementById("stat-rating");
        if (el) el.textContent = stats.rating || "—";
        el = document.getElementById("stat-hours");
        if (el) el.textContent = stats.totalHours != null ? stats.totalHours : "0";

        var grid = document.getElementById("offers-grid");
        if (grid) {
          if (offers.length === 0) {
            grid.innerHTML = '<p class="empty-state">No offers yet. Add one to get students.</p>';
          } else {
            offerDataById = {};
          grid.innerHTML = offers
              .map(function (o) {
                var id = (o.id || "").replace(/"/g, "&quot;");
                var title = (o.title || "Offer").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                var badge = (o.subjectBadge || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                var rate = (o.rate || "").replace(/</g, "&lt;");
                var location = (o.location || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                var desc = (o.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
                var isPaused = o.status === "paused";
                offerDataById[id] = { id: o.id, title: o.title || "", subjectBadge: o.subjectBadge || "", rateRaw: o.rateRaw != null ? o.rateRaw : "", location: o.location || "", description: o.description || "", status: o.status || "active" };
                var pauseResumeBtn = isPaused
                  ? '<button type="button" class="btn-small btn-resume-offer" data-offer-id="' + id + '">Resume</button>'
                  : '<button type="button" class="btn-small btn-pause-offer" data-offer-id="' + id + '">Pause</button>';
                var pausedBadge = isPaused ? '<span class="offer-status-badge offer-status-paused">Paused – not visible to students</span>' : '';
                return (
                  '<div class="offer-card' + (isPaused ? ' offer-card-paused' : '') + '" data-offer-id="' + id + '">' +
                  (isPaused ? '<div class="offer-card-paused-header">' + pausedBadge + '</div>' : '') +
                  "<h3>" + title + "</h3>" +
                  '<p class="subject-badge">' + badge + "</p>" +
                  '<div class="offer-info">' +
                  (rate ? "<p>💵 " + rate + "</p>" : "") +
                  (location ? "<p>📍 " + location + "</p>" : "") +
                  "</div>" +
                  (desc ? '<p class="offer-desc">' + desc + "</p>" : "") +
                  '<div class="offer-actions">' +
                  '<button type="button" class="btn-small btn-edit-offer" data-offer-id="' + id + '">Edit</button>' +
                  pauseResumeBtn +
                  "</div></div>"
                );
              })
              .join("");
          }
        }

        var list = document.getElementById("matches-list");
        if (list) {
          if (pending.length === 0) {
            list.innerHTML = "<p class=\"empty-state\">No pending requests.</p>";
          } else {
            list.innerHTML = pending
              .map(function (p) {
                var connId = (p.id || "").replace(/"/g, "&quot;");
                var initials = (p.studentName || "S").trim().split(/\s+/).map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
                return (
                  '<div class="match-item" data-connection-id="' + connId + '">' +
                  '<div class="match-avatar">' + initials + "</div>" +
                  '<div class="match-details">' +
                  "<h3>" + (p.studentName || "Student") + "</h3>" +
                  "<p>Looking for: " + (p.subject || "Tutor") + "</p>" +
                  "<p>" + (p.budget ? "Budget: " + p.budget + " | " : "") + (p.location ? "Location: " + p.location : "") + "</p>" +
                  "</div>" +
                  '<div class="match-actions"><button type="button" class="btn-small btn-accept" data-connection-id="' + connId + '">Accept</button><button type="button" class="btn-small btn-reject" data-connection-id="' + connId + '">Decline</button></div>' +
                  "</div>"
                );
              })
              .join("");
          }
        }

        var slist = document.getElementById("teacher-sessions-list");
        if (slist) {
          if (sessions.length === 0) {
            slist.innerHTML = "<p class=\"empty-state\">No upcoming sessions.</p>";
          } else {
            slist.innerHTML = sessions
              .map(function (s) {
                var d = s.scheduledAt ? new Date(s.scheduledAt) : null;
                var timeStr = d ? d.toLocaleString("en-PK", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
                var initials = (s.studentName || "S").trim().split(/\s+/).map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
                var sessionId = (s.id || "").replace(/"/g, "&quot;");
                var studentId = (s.studentId || "").replace(/"/g, "&quot;");
                return (
                  '<div class="session-item">' +
                  '<div class="session-avatar">' + initials + "</div>" +
                  '<div class="session-details">' +
                  "<h3>" + (s.studentName || "Student") + " - " + (s.subject || "Session") + "</h3>" +
                  "<p>" + timeStr + " | Duration: " + (s.durationHours || 1) + " hour(s)</p>" +
                  "</div>" +
                  '<a href="/chat.html?with=' + encodeURIComponent(s.studentId || "") + '" class="btn-small btn-start-session" data-session-id="' + sessionId + '" data-student-id="' + studentId + '">Start Class</a></div>'
                );
              })
              .join("");
          }
        }
      })
      .catch(function () {});
  }

  if (btnNewOffer) {
    btnNewOffer.addEventListener("click", function () {
      openOfferModal(null);
    });
  }
  if (offerModalClose) {
    offerModalClose.addEventListener("click", closeOfferModal);
  }
  if (offerModalCancel) {
    offerModalCancel.addEventListener("click", closeOfferModal);
  }
  if (offerModal) {
    offerModal.addEventListener("click", function (e) {
      if (e.target === offerModal) closeOfferModal();
    });
  }

  var matchesList = document.getElementById("matches-list");
  if (matchesList) {
    matchesList.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.classList) return;
      var connId = t.getAttribute("data-connection-id");
      if (!connId) return;
      if (t.classList.contains("btn-accept") || t.classList.contains("btn-reject")) {
        e.preventDefault();
        var action = t.classList.contains("btn-accept") ? "accept" : "decline";
        fetch((window.API_BASE || '') + "/api/teacher/connections/" + encodeURIComponent(connId) + "/", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action }),
        })
          .then(function (res) {
            if (res.ok) loadDashboard();
          })
          .catch(function () {});
      }
    });
  }

  document.getElementById("offers-grid") && document.getElementById("offers-grid").addEventListener("click", function (e) {
    var target = e.target;
    if (!target || !target.classList) return;
    if (target.classList.contains("btn-edit-offer")) {
      e.preventDefault();
      var id = target.getAttribute("data-offer-id");
      var data = offerDataById[id];
      if (data) openOfferModal(data);
    } else if (target.classList.contains("btn-pause-offer")) {
      e.preventDefault();
      var id = target.getAttribute("data-offer-id");
      if (!id) return;
      fetch((window.API_BASE || '') + "/api/teacher/offers/" + encodeURIComponent(id) + "/", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      })
        .then(function (res) {
          if (res.ok) loadDashboard();
        })
        .catch(function () {});
    } else if (target.classList.contains("btn-resume-offer")) {
      e.preventDefault();
      var id = target.getAttribute("data-offer-id");
      if (!id) return;
      fetch((window.API_BASE || '') + "/api/teacher/offers/" + encodeURIComponent(id) + "/", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      })
        .then(function (res) {
          if (res.ok) loadDashboard();
        })
        .catch(function () {});
    }
  });

  if (offerForm) {
    offerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var id = offerIdInput && offerIdInput.value ? offerIdInput.value.trim() : "";
      var subject = offerSubjectInput && offerSubjectInput.value ? offerSubjectInput.value.trim() : "";
      var subjectBadge = offerSubjectBadgeInput && offerSubjectBadgeInput.value ? offerSubjectBadgeInput.value.trim() : subject;
      var rate = offerRateInput && offerRateInput.value ? Number(offerRateInput.value) : 0;
      var location = offerLocationInput && offerLocationInput.value ? offerLocationInput.value.trim() : "";
      var description = offerDescriptionInput && offerDescriptionInput.value ? offerDescriptionInput.value.trim() : "";

      if (!subject) return;

      var url = (window.API_BASE || '') + (id ? "/api/teacher/offers/" + encodeURIComponent(id) + "/" : "/api/teacher/offers/");
      var method = id ? "PATCH" : "POST";
      var body = id
        ? JSON.stringify({ subject: subject, subjectBadge: subjectBadge, rate: rate, location: location, description: description })
        : JSON.stringify({ subject: subject, subjectBadge: subjectBadge, rate: rate, location: location, description: description });

      fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body,
      })
        .then(function (res) {
          if (!res.ok) return res.json().then(function (err) { throw new Error(err.error || "Failed"); });
          closeOfferModal();
          loadDashboard();
        })
        .catch(function (err) {
          alert(err.message || "Something went wrong. Try again.");
        });
    });
  }

  loadDashboard();
})();
