// Role-aware payments page: teacher = Earnings & Commission, student = Fees paid to teachers
(function () {
  var teacherView = document.getElementById("teacher-payments-view");
  var studentView = document.getElementById("student-payments-view");
  var navDashboard = document.getElementById("nav-dashboard");

  function showTeacherView() {
    if (teacherView) teacherView.style.display = "block";
    if (studentView) studentView.style.display = "none";
    if (navDashboard) navDashboard.href = "/teacher-dashboard.html";
  }

  function showStudentView() {
    if (teacherView) teacherView.style.display = "none";
    if (studentView) studentView.style.display = "block";
    if (navDashboard) navDashboard.href = "/student-dashboard.html";
    loadStudentPayments();
  }

  function loadStudentPayments() {
    var totalEl = document.getElementById("student-total-paid");
    var monthEl = document.getElementById("student-month-paid");
    var listEl = document.getElementById("student-payments-list");
    if (!listEl) return;

    listEl.innerHTML = "<p class=\"empty-state\">Loading…</p>";

    fetch("/api/student/payments", { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(function (data) {
        if (totalEl) totalEl.textContent = "Rs. " + (data.totalPaid || 0).toLocaleString();
        if (monthEl) monthEl.textContent = "Rs. " + (data.thisMonthPaid || 0).toLocaleString();

        var payments = data.payments || [];
        if (payments.length === 0) {
          listEl.innerHTML = "<p class=\"empty-state\">No payments yet. When you pay for sessions or courses, they will appear here.</p>";
          return;
        }

        var html = payments
          .map(function (p) {
            var dateStr = p.scheduledAt
              ? new Date(p.scheduledAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
              : "—";
            var title = (p.subject || "Session") + " – " + (p.teacherName || "Teacher");
            var detail = p.durationHours ? p.durationHours + " hr" + (p.durationHours !== 1 ? "s" : "") : "";
            if (p.amount) detail += (detail ? " · " : "") + "Rs. " + p.amount.toLocaleString();
            return (
              '<div class="earning-item">' +
              '<div class="earning-left">' +
              '<div class="avatar">' + (p.teacherName || "T").trim().split(/\s+/).map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase() + "</div>" +
              "<div><h3>" + title.replace(/</g, "&lt;") + "</h3>" +
              (detail ? "<p>" + detail.replace(/</g, "&lt;") + "</p>" : "") +
              '<p class="date">' + dateStr + "</p></div></div>" +
              '<div class="earning-amount amount-negative">-Rs. ' + (p.amount || 0).toLocaleString() + "</div></div>"
            );
          })
          .join("");
        listEl.innerHTML = html;
      })
      .catch(function () {
        listEl.innerHTML = "<p class=\"empty-state\">Could not load payment history.</p>";
      });
  }

  // Check auth and role, then show correct view
  fetch("/api/auth/me", { credentials: "same-origin" })
    .then(function (r) {
      if (r.status === 401) {
        window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
        return null;
      }
      return r.json();
    })
    .then(function (data) {
      if (!data || !data.user) return;
      var role = data.user.role;
      if (role === "teacher") showTeacherView();
      else if (role === "student") showStudentView();
      else showStudentView(); // admin or fallback
    })
    .catch(function () {
      if (teacherView) teacherView.style.display = "block";
      if (studentView) studentView.style.display = "none";
      if (navDashboard) navDashboard.href = "/student-dashboard.html";
    });
})();

// Switch tabs (teacher view only)
function switchTab(tabName) {
  var content = document.getElementById(tabName);
  var btns = document.querySelectorAll(".tab-btn");
  if (!content || !btns.length) return;
  document.querySelectorAll(".tab-content").forEach(function (el) {
    el.classList.remove("active");
  });
  btns.forEach(function (btn) {
    btn.classList.remove("active");
  });
  content.classList.add("active");
  if (event && event.target) event.target.classList.add("active");
}

function withdrawFunds() {
  alert("Withdraw funds – Connect your bank account or payment method");
}

function viewCommission() {
  alert("Viewing detailed commission breakdown for your area");
}

function addPaymentMethod() {
  alert("Add payment method – Bank transfer, PayPal, etc.");
}
