(function () {
  function loadDashboard() {
    fetch("/api/student/dashboard", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) return;
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        var stats = data.stats || {};
        var tutors = data.tutors || [];
        var sessions = data.upcomingSessions || [];

        var el = document.getElementById("stat-active-tutors");
        if (el) el.textContent = stats.activeTutors != null ? stats.activeTutors : "0";
        el = document.getElementById("stat-hours");
        if (el) el.textContent = stats.hoursCompleted != null ? stats.hoursCompleted : "0";
        el = document.getElementById("stat-rating");
        if (el) el.textContent = stats.averageRating || "—";
        el = document.getElementById("stat-spent");
        if (el) el.textContent = stats.totalSpent || "Rs. 0";

        var grid = document.getElementById("tutors-grid");
        if (grid) {
          if (tutors.length === 0) {
            grid.innerHTML = '<p class="empty-state">No tutors yet. Browse courses above and request to connect.</p>';
          } else {
            grid.innerHTML = tutors
              .map(function (t) {
                var chatHref = "/chat.html" + (t.id ? "?with=" + encodeURIComponent(t.id) : "");
                var safeName = (t.name || "Teacher").replace(/"/g, "&quot;");
                var safeSubject = (t.subject || "Session").replace(/"/g, "&quot;");
                return (
                  '<div class="tutor-card">' +
                  '<div class="tutor-header"><div class="tutor-avatar">' + (t.initials || "T") + "</div>" +
                  "<div><h3>" + (t.name || "Teacher") + "</h3><p>" + (t.subject || "") + "</p></div></div>" +
                  '<div class="tutor-info">' +
                  (t.location ? "<p>📍 " + t.location + "</p>" : "") +
                  (t.rate ? "<p>💵 " + t.rate + "</p>" : "") +
                  (t.rating ? "<p>⭐ " + t.rating + (t.reviews ? " (" + t.reviews + " reviews)" : "") + "</p>" : "") +
                  "</div>" +
                  '<div class="tutor-actions"><a href="' + chatHref + '" class="btn-small">Message</a><button type="button" class="btn-small btn-schedule" data-teacher-id="' +
                  (t.id || "").replace(/"/g, "&quot;") +
                  '" data-teacher-name="' +
                  safeName +
                  '" data-subject="' +
                  safeSubject +
                  '">Schedule</button></div>' +
                  "</div>"
                );
              })
              .join("");
          }
        }

        var list = document.getElementById("sessions-list");
        if (list) {
          if (sessions.length === 0) {
            list.innerHTML = "<p class=\"empty-state\">No upcoming sessions.</p>";
          } else {
            list.innerHTML = sessions
              .map(function (s) {
                var d = s.time ? new Date(s.time) : null;
                var timeStr = d ? d.toLocaleString("en-PK", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
                var sessionId = (s.id || "").replace(/"/g, "&quot;");
                var teacherId = (s.teacherId || "").replace(/"/g, "&quot;");
                return (
                  '<div class="session-item">' +
                  '<div class="session-time">' + timeStr + "</div>" +
                  '<div class="session-details">' +
                  "<p><strong>" + (s.subject || "Session") + " with " + (s.teacherName || "Teacher") + "</strong></p>" +
                  "<p>Duration: " + (s.duration || "1 hour") + " | Status: " + (s.status || "Confirmed") + "</p>" +
                  "</div>" +
                  '<a href="/chat.html?with=' + encodeURIComponent(s.teacherId || "") + '" class="btn-small btn-join-session" data-session-id="' + sessionId + '" data-teacher-id="' + teacherId + '">Join</a></div>'
                );
              })
              .join("");
          }
        }
      })
      .catch(function () {});
  }

  function loadAvailableCourses() {
        var grid = document.getElementById("available-courses-grid");
    if (!grid) return;
    fetch("/api/student/offers", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) {
          grid.innerHTML = "<p class=\"empty-state\">Unable to load courses.</p>";
          return;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        var courses = data.courses || [];
        if (courses.length === 0) {
          grid.innerHTML = "<p class=\"empty-state\">No courses available right now. Check back later.</p>";
          return;
        }
        grid.innerHTML = courses
          .map(function (c) {
            var title = (c.title || "Course").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var badge = (c.subjectBadge || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var teacherName = (c.teacherName || "Teacher").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var rate = (c.rate || "").replace(/</g, "&lt;");
            var location = (c.location || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var desc = (c.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var chatHref = "/chat.html" + (c.teacherId ? "?with=" + encodeURIComponent(c.teacherId) : "");
            var status = c.connectionStatus || "none";
            var actions = "";
            if (status === "active") {
              actions =
                '<a href="' +
                chatHref +
                '" class="btn-small">Message</a><button type="button" class="btn-small btn-schedule" data-teacher-id="' +
                (c.teacherId || "").replace(/"/g, "&quot;") +
                '" data-teacher-name="' +
                teacherName +
                '" data-subject="' +
                title +
                '">Schedule</button>';
            } else if (status === "pending") {
              actions = '<a href="' + chatHref + '" class="btn-small">Message</a><span class="btn-small btn-disabled">Request sent</span>';
            } else {
              actions = '<a href="' + chatHref + '" class="btn-small">Message</a><button type="button" class="btn-small btn-request-course" data-offer-id="' + (c.offerId || c.id || "").replace(/"/g, "&quot;") + '">Request course</button>';
            }
            return (
              '<div class="tutor-card course-card">' +
              '<div class="tutor-header">' +
              '<div class="tutor-avatar">' + (c.teacherInitials || "T") + "</div>" +
              "<div><h3>" + teacherName + "</h3><p>" + title + " <span class=\"subject-badge-inline\">" + badge + "</span></p></div></div>" +
              '<div class="tutor-info">' +
              (rate ? "<p>💵 " + rate + "</p>" : "") +
              (location ? "<p>📍 " + location + "</p>" : "") +
              (desc ? "<p class=\"course-desc\">" + desc + "</p>" : "") +
              "</div>" +
              '<div class="tutor-actions">' + actions + "</div>" +
              "</div>"
            );
          })
          .join("");

        grid.querySelectorAll(".btn-request-course").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var offerId = btn.getAttribute("data-offer-id");
            if (!offerId) return;
            btn.disabled = true;
            btn.textContent = "Sending...";
            fetch("/api/student/request-connection", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ offerId: offerId }),
            })
              .then(function (res) {
                return res.json().then(function (body) {
                  if (res.ok) {
                    loadAvailableCourses();
                    loadDashboard();
                  } else {
                    alert(body.error || "Request failed");
                    btn.disabled = false;
                    btn.textContent = "Request course";
                  }
                });
              })
              .catch(function () {
                alert("Something went wrong.");
                btn.disabled = false;
                btn.textContent = "Request course";
              });
          });
        });
      })
      .catch(function () {
        grid.innerHTML = "<p class=\"empty-state\">Unable to load courses.</p>";
      });
  }

  // Scheduling modal logic
  var scheduleModal = document.getElementById("schedule-modal");
  var scheduleForm = document.getElementById("schedule-form");
  var scheduleTeacherIdInput = document.getElementById("schedule-teacher-id");
  var scheduleTeacherName = document.getElementById("schedule-teacher-name");
  var scheduleSubjectInput = document.getElementById("schedule-subject");
  var scheduleDatetimeInput = document.getElementById("schedule-datetime");
  var scheduleDurationInput = document.getElementById("schedule-duration");
  var scheduleModalClose = document.getElementById("schedule-modal-close");
  var scheduleModalCancel = document.getElementById("schedule-modal-cancel");

  function openScheduleModal(teacherId, teacherName, subject) {
    if (!scheduleModal) return;
    if (scheduleTeacherIdInput) scheduleTeacherIdInput.value = teacherId || "";
    if (scheduleTeacherName) scheduleTeacherName.textContent = teacherName || "Teacher";
    if (scheduleSubjectInput) scheduleSubjectInput.value = subject || "Session";
    if (scheduleDatetimeInput) {
      var now = new Date();
      now.setMinutes(now.getMinutes() + 120); // default 2 hours later
      var iso = now.toISOString().slice(0, 16);
      scheduleDatetimeInput.value = iso;
    }
    scheduleModal.classList.add("is-open");
    scheduleModal.setAttribute("aria-hidden", "false");
  }

  function closeScheduleModal() {
    if (!scheduleModal) return;
    scheduleModal.classList.remove("is-open");
    scheduleModal.setAttribute("aria-hidden", "true");
  }

  // Delegate click for schedule buttons in both grids
  document.addEventListener("click", function (e) {
    var target = e.target;
    if (!target || !target.classList) return;
    if (target.classList.contains("btn-schedule")) {
      e.preventDefault();
      var teacherId = target.getAttribute("data-teacher-id") || "";
      var teacherName = target.getAttribute("data-teacher-name") || "Teacher";
      var subject = target.getAttribute("data-subject") || "Session";
      openScheduleModal(teacherId, teacherName, subject);
    }
  });

  if (scheduleModalClose) {
    scheduleModalClose.addEventListener("click", closeScheduleModal);
  }
  if (scheduleModalCancel) {
    scheduleModalCancel.addEventListener("click", closeScheduleModal);
  }
  if (scheduleModal) {
    scheduleModal.addEventListener("click", function (e) {
      if (e.target === scheduleModal) closeScheduleModal();
    });
  }

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var teacherId = scheduleTeacherIdInput && scheduleTeacherIdInput.value;
      var subject = scheduleSubjectInput && scheduleSubjectInput.value;
      var startTime = scheduleDatetimeInput && scheduleDatetimeInput.value;
      var duration = scheduleDurationInput && scheduleDurationInput.value;
      if (!teacherId || !subject || !startTime) {
        alert("Please fill in Teacher, Subject, and Date & Time.");
        return;
      }
      var submitBtn = scheduleForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Scheduling…";
      }

      fetch("/api/student/sessions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacherId.trim(),
          subject: subject.trim(),
          startTime: startTime.trim(),
          durationHours: Number(duration || 1) || 1,
        }),
      })
        .then(function (res) {
          return res.json()
            .then(function (body) {
              if (!res.ok) {
                alert(body.error || "Could not schedule session. Please try again.");
                return;
              }
              closeScheduleModal();
              alert("Session scheduled successfully! It will appear in Upcoming Sessions.");
              loadDashboard();
              loadAvailableCourses();
            })
            .catch(function () {
              alert(res.status === 401 ? "Please log in as a student and try again." : "Could not schedule session. Please try again.");
            });
        })
        .catch(function () {
          alert("Network error. Please check your connection and try again.");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirm Session";
          }
        });
    });
  }

  loadDashboard();
  loadAvailableCourses();
})();
