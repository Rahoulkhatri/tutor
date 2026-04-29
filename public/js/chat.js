(function () {
  var currentContactId = null;
  var currentContactName = null;
  var currentContactInitials = null;
  var messagesByUserId = {};
  var area = document.getElementById("chat-messages-area");

  function escapeHtml(s) {
    if (s == null) return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function formatTime(dateStr) {
    if (!dateStr) return "—";
    var d = new Date(dateStr);
    return d.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });
  }

  function renderMessagesList(list) {
    if (!area) return;
    if (list.length === 0) {
      area.innerHTML = "<p class=\"empty-state\" id=\"messages-empty\">No messages yet. Say hi!</p>";
      return;
    }
    var html = list
      .map(function (m) {
        var side = m.side || (m.isSent ? "sent" : "received");
        var time = m.timeFormatted || formatTime(m.time) || m.time;
        return "<div class=\"message " + side + "\"><p>" + escapeHtml(m.text) + "</p><span>" + escapeHtml(time) + "</span></div>";
      })
      .join("");
    area.innerHTML = html;
    area.scrollTop = area.scrollHeight;
  }

  function showSessionNotice() {
    var params = new URLSearchParams(window.location.search);
    if (!params.get("with")) return;
    var notice = document.createElement("div");
    notice.className = "chat-session-notice";
    notice.style.cssText = "background:#e8f4fd;border:1px solid #5b5bff;border-radius:8px;padding:12px 16px;margin:0 16px 12px;font-size:14px;color:#333;";
    notice.textContent = "Session chat – You can share your meeting link (Zoom, Google Meet, etc.) here with your tutor/student.";
    if (area && area.parentNode) area.parentNode.insertBefore(notice, area);
  }

  function loadConversations() {
    var listEl = document.getElementById("conversations-list");
    var emptyEl = document.getElementById("conversations-empty");
    var withParam = new URLSearchParams(window.location.search).get("with");

    fetch((window.API_BASE || '') + "/api/chat/conversations/" + (withParam ? "?with=" + encodeURIComponent(withParam) : ""), { credentials: "include" })
      .then(function (r) {
        if (r.status === 401) {
          window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
          return null;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data || !listEl) return;
        var convos = data.conversations || [];
        if (convos.length === 0) {
          listEl.innerHTML = "<p class=\"empty-state\" id=\"conversations-empty\">No conversations yet. Open chat from Dashboard (Start Class / Join).</p>";
          return;
        }
        var emptyNode = listEl.querySelector("#conversations-empty");
        if (emptyNode) emptyNode.remove();
        listEl.innerHTML = convos
          .map(function (c) {
            var name = (c.name || "User").replace(/"/g, "&quot;");
            var last = (c.lastMessage || "").replace(/</g, "&lt;").slice(0, 35);
            if (c.lastMessage && c.lastMessage.length > 35) last += "…";
            var timeStr = c.lastMessageAt ? formatTime(c.lastMessageAt) : "";
            var active = withParam === c.userId ? " active" : "";
            return (
              '<div class="conversation' + active + '" data-user-id="' + escapeHtml(c.userId) + '" data-name="' + name + '" data-initials="' + (c.initials || "U") + '" onclick="window.selectConversation(this)">' +
              '<div class="conversation-avatar">' + (c.initials || "U") + "</div>" +
              '<div class="conversation-info"><h3>' + name + "</h3><p>" + escapeHtml(last) + "</p></div>" +
              '<span class="time">' + escapeHtml(timeStr) + "</span></div>"
            );
          })
          .join("");

        if (withParam) {
          var first = convos.find(function (c) { return c.userId === withParam; });
          if (first) {
            currentContactId = first.userId;
            currentContactName = first.name;
            currentContactInitials = first.initials || "U";
            updateHeader(first.name, first.initials);
            loadMessages(withParam);
          }
        }
        showSessionNotice();
      })
      .catch(function () {
        if (emptyEl) emptyEl.textContent = "Could not load conversations.";
      });
  }

  function loadMessages(userId) {
    if (!userId) return;
    fetch((window.API_BASE || '') + "/api/chat/messages/?with=" + encodeURIComponent(userId), { credentials: "include" })
      .then(function (r) {
        if (r.status === 401) {
          window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
          return null;
        }
        if (!r.ok) return { messages: [] };
        return r.json();
      })
      .then(function (data) {
        if (data == null) return;
        var list = (data.messages || []).map(function (m) {
          return {
            side: m.isSent ? "sent" : "received",
            text: m.text,
            time: m.time,
            timeFormatted: formatTime(m.time),
          };
        });
        messagesByUserId[userId] = list;
        if (userId === currentContactId) {
          renderMessagesList(list);
          updateHeader(currentContactName, currentContactInitials);
        }
      })
      .catch(function () {
        messagesByUserId[userId] = [];
        if (userId === currentContactId) renderMessagesList([]);
      });
  }

  function updateHeader(name, initials) {
    var headerAvatar = document.getElementById("chat-header-avatar");
    var headerName = document.getElementById("chat-header-name");
    var headerSubtitle = document.getElementById("chat-header-subtitle");
    if (headerAvatar) headerAvatar.textContent = initials || "—";
    if (headerName) headerName.textContent = name || "Select a conversation";
    if (headerSubtitle) headerSubtitle.textContent = name ? "Online • TutorConnect" : "—";
  }

  window.selectConversation = function (element) {
    var userId = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-name") || "User";
    var initials = element.getAttribute("data-initials") || "U";
    if (!userId) return;

    document.querySelectorAll(".conversation").forEach(function (c) { c.classList.remove("active"); });
    element.classList.add("active");

    currentContactId = userId;
    currentContactName = name;
    currentContactInitials = initials;
    updateHeader(name, initials);

    if (history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("with", userId);
      history.replaceState({}, "", url.pathname + "?" + url.searchParams.toString());
    }

    if (messagesByUserId[userId]) {
      renderMessagesList(messagesByUserId[userId]);
    } else {
      loadMessages(userId);
    }
    showSessionNotice();
  };

  function sendMessage() {
    var input = document.getElementById("chat-input");
    if (!input) return;
    var text = (input.value || "").trim();
    if (!text) return;
    if (!currentContactId) {
      var toast = document.createElement("div");
      toast.className = "chat-toast";
      toast.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;z-index:9999;";
      toast.textContent = "Select a conversation first.";
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 2000);
      return;
    }

    fetch((window.API_BASE || '') + "/api/chat/send/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: currentContactId, text: text }),
    })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) {
            alert(body.error || "Could not send message.");
            return;
          }
          input.value = "";
          var timeFormatted = new Date().toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });
          if (!messagesByUserId[currentContactId]) messagesByUserId[currentContactId] = [];
          messagesByUserId[currentContactId].push({ side: "sent", text: text, timeFormatted: timeFormatted });
          renderMessagesList(messagesByUserId[currentContactId]);
        });
      })
      .catch(function () {
        alert("Could not send message. Try again.");
      });
  }

  function setupMessageInput() {
    var input = document.getElementById("chat-input");
    var btnSend = document.querySelector(".message-input .btn-send");
    var btnAttach = document.querySelector(".message-input .btn-attach");
    var btnEmoji = document.querySelector(".message-input .btn-emoji");

    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });
    }
    if (btnSend) btnSend.addEventListener("click", sendMessage);

    if (btnAttach) {
      btnAttach.addEventListener("click", function () {
        var notice = document.createElement("div");
        notice.className = "chat-toast";
        notice.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;z-index:9999;";
        notice.textContent = "Attach file – coming soon";
        document.body.appendChild(notice);
        setTimeout(function () { notice.remove(); }, 2000);
      });
    }
    if (btnEmoji) {
      btnEmoji.addEventListener("click", function () {
        var emojis = "😊 👍 ❤️ 🙏 ✅ 📌 📎 📤";
        var picker = document.createElement("div");
        picker.className = "emoji-picker";
        picker.style.cssText = "position:absolute;bottom:100%;right:0;margin-bottom:8px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:100;";
        emojis.split(" ").forEach(function (emoji) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = emoji;
          b.style.cssText = "padding:6px;border:none;background:transparent;cursor:pointer;font-size:18px;";
          b.addEventListener("click", function () {
            if (input) input.value = (input.value || "") + emoji;
            picker.remove();
          });
          picker.appendChild(b);
        });
        var wrap = document.querySelector(".message-input");
        if (wrap) {
          wrap.style.position = "relative";
          wrap.appendChild(picker);
          setTimeout(function () {
            document.addEventListener("click", function closePicker(ev) {
              if (!picker.contains(ev.target) && ev.target !== btnEmoji) {
                picker.remove();
                document.removeEventListener("click", closePicker);
              }
            });
          }, 0);
        }
      });
    }
  }

  loadConversations();
  setupMessageInput();
})();
