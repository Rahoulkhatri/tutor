// Dynamic search page pulling real teaching offers for students.
(function () {
  var priceFilter = document.getElementById("priceFilter");
  var priceValue = document.getElementById("priceValue");
  var tutorsList = document.getElementById("tutors-list");

  var allCourses = [];

  if (priceFilter && priceValue) {
    var updatePriceLabel = function () {
      var v = Number(priceFilter.value || "0") || 0;
      priceValue.textContent = "Up to Rs. " + v.toLocaleString() + "/hour";
    };
    priceFilter.addEventListener("input", updatePriceLabel);
    updatePriceLabel();
  }

  function renderCourses(courses) {
    if (!tutorsList) return;
    if (!courses || courses.length === 0) {
      tutorsList.innerHTML =
        '<p class="empty-state">No tutors match your filters. Try changing subject or price.</p>';
      return;
    }

    // Group courses by teacher so student first sees teacher name,
    // then can expand to see that teacher's courses.
    var byTeacher = {};
    courses.forEach(function (c) {
      var key = c.teacherId || ("no-id-" + (c.teacherName || "Teacher"));
      if (!byTeacher[key]) {
        byTeacher[key] = {
          teacherId: c.teacherId,
          teacherName: c.teacherName || "Teacher",
          teacherInitials: c.teacherInitials || "T",
          location: c.location || "",
          courses: [],
        };
      }
      byTeacher[key].courses.push(c);
    });

    tutorsList.innerHTML = Object.keys(byTeacher)
      .map(function (key) {
        var group = byTeacher[key];
        var teacherName = group.teacherName.replace(/</g, "&lt;").replace(/"/g, "&quot;");
        var mainLocation = (group.location || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        var subjects = Array.from(
          new Set(
            group.courses.map(function (c) {
              return (c.title || "").trim();
            })
          )
        )
          .filter(Boolean)
          .join(", ");
        var subjectsSafe = subjects.replace(/</g, "&lt;").replace(/"/g, "&quot;");

        var coursesHtml = group.courses
          .map(function (c) {
            var title = (c.title || "Course").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var subjectBadge = (c.subjectBadge || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var location = (c.location || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var rate = (c.rate || "").replace(/</g, "&lt;");
            var desc = (c.description || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            var chatHref =
              "/chat.html" + (c.teacherId ? "?with=" + encodeURIComponent(c.teacherId) : "");
            var status = c.connectionStatus || "none";
            var actions = "";

            if (status === "active") {
              actions =
                '<a href="' +
                chatHref +
                '" class="btn btn-secondary">Message</a><button type="button" class="btn btn-primary" disabled>Already connected</button>';
            } else if (status === "pending") {
              actions =
                '<a href="' +
                chatHref +
                '" class="btn btn-secondary">Message</a><button type="button" class="btn btn-primary" disabled>Request sent</button>';
            } else {
              actions =
                '<a href="' +
                chatHref +
                '" class="btn btn-secondary">Message</a><button type="button" class="btn btn-primary btn-send-request" data-offer-id="' +
                (c.offerId || c.id || "").replace(/"/g, "&quot;") +
                '">Send Request</button>';
            }

            return (
              '<div class="course-row">' +
              "<h4>" +
              title +
              (subjectBadge ? ' <span class="subject-badge-inline">' + subjectBadge + "</span>" : "") +
              "</h4>" +
              '<div class="tutor-stats">' +
              (location ? "<span>📍 " + location + "</span>" : "") +
              (rate ? "<span>💵 " + rate + "</span>" : "") +
              "</div>" +
              (desc ? '<p class="bio">' + desc + "</p>" : "") +
              '<div class="tutor-actions">' +
              actions +
              "</div>" +
              "</div>"
            );
          })
          .join("");

        var countLabel =
          group.courses.length === 1
            ? "View 1 course"
            : "View " + group.courses.length + " courses";

        return (
          '<div class="tutor-result">' +
          '<div class="tutor-image">👨‍🏫</div>' +
          '<div class="tutor-content">' +
          '<div class="tutor-header">' +
          "<div>" +
          "<h3>" +
          teacherName +
          "</h3>" +
          '<p class="subject">' +
          (subjectsSafe || "Available courses") +
          "</p>" +
          (mainLocation ? '<p class="location">📍 ' + mainLocation + "</p>" : "") +
          "</div>" +
          '<div class="tutor-actions">' +
          '<button type="button" class="btn btn-secondary btn-toggle-courses" data-teacher-id="' +
          key.replace(/"/g, "&quot;") +
          '">' +
          countLabel +
          "</button>" +
          "</div>" +
          "</div>" +
          '<div class="courses-list" data-teacher-id="' +
          key.replace(/"/g, "&quot;") +
          '" style="display:none">' +
          coursesHtml +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    // Expand / collapse courses for each teacher
    var toggles = tutorsList.querySelectorAll(".btn-toggle-courses");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-teacher-id");
        var panel = tutorsList.querySelector('.courses-list[data-teacher-id="' + id + '"]');
        if (!panel) return;
        var isHidden = panel.style.display === "none" || panel.style.display === "";
        panel.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          btn.textContent = "Hide courses";
        } else {
          var g = byTeacher[id];
          var label =
            g && g.courses
              ? g.courses.length === 1
                ? "View 1 course"
                : "View " + g.courses.length + " courses"
              : "View courses";
          btn.textContent = label;
        }
      });
    });

    // Attach click handlers for request buttons
    var buttons = tutorsList.querySelectorAll(".btn-send-request");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var offerId = btn.getAttribute("data-offer-id");
        if (!offerId) return;
        btn.disabled = true;
        btn.textContent = "Sending...";
        fetch((window.API_BASE || '') + "/api/student/request-connection/", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: offerId }),
        })
          .then(function (res) {
            return res.json().then(function (body) {
              if (res.ok) {
                fetchCourses();
              } else {
                alert(body.error || "Request failed");
                btn.disabled = false;
                btn.textContent = "Send Request";
              }
            });
          })
          .catch(function () {
            alert("Something went wrong. Please try again.");
            btn.disabled = false;
            btn.textContent = "Send Request";
          });
      });
    });
  }

  function filterCourses() {
    var subjectInput = document.getElementById("subjectFilter");
    var locationInput = document.getElementById("locationFilter");
    var ratingInput = document.getElementById("ratingFilter");

    var subject = subjectInput && subjectInput.value ? subjectInput.value.toLowerCase() : "";
    var location = locationInput && locationInput.value ? locationInput.value.toLowerCase() : "";
    var maxPrice = priceFilter ? Number(priceFilter.value || "0") || 0 : 0;
    var minRating = ratingInput && ratingInput.value ? Number(ratingInput.value) || 0 : 0;

    var filtered = allCourses.filter(function (c) {
      var ok = true;
      if (subject) {
        var hay = ((c.title || "") + " " + (c.subjectBadge || "")).toLowerCase();
        ok = ok && hay.indexOf(subject) !== -1;
      }
      if (location) {
        var loc = (c.location || "").toLowerCase();
        ok = ok && loc.indexOf(location) !== -1;
      }
      if (maxPrice > 0 && c.rate) {
        var match = c.rate.match(/([\d,]+)/);
        if (match && match[1]) {
          var num = Number(match[1].replace(/,/g, "")) || 0;
          ok = ok && num <= maxPrice;
        }
      }
      // Rating data not stored yet; if user asked for high rating we still return all.
      if (minRating > 0) {
        ok = ok; // placeholder for future rating implementation
      }
      return ok;
    });

    renderCourses(filtered);
  }

  function fetchCourses() {
    if (!tutorsList) return;
    tutorsList.innerHTML = "<p>Loading tutors...</p>";
    fetch((window.API_BASE || '') + "/api/student/offers/", { credentials: "include" })
      .then(function (res) {
        if (!res.ok) {
          tutorsList.innerHTML =
            '<p class="empty-state">Unable to load tutors. Please try again.</p>';
          return;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        allCourses = data.courses || [];
        filterCourses();
      })
      .catch(function () {
        tutorsList.innerHTML =
          '<p class="empty-state">Unable to load tutors. Please try again.</p>';
      });
  }

  // Expose applyFilters globally for the button's onclick
  window.applyFilters = filterCourses;

  fetchCourses();
})();
