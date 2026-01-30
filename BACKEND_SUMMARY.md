# TutorConnect – Backend Ka Saara Kaam (Summary)

Is file mein woh sab cheezein likhi hain jo **backend** mein ki gayi hain: database, auth, APIs (auth, chat, student, teacher), lib, middleware, seed.

---

## 1. Database (MongoDB)

**Connection & config**
- **File:** `lib/mongodb.ts`
- MongoDB connect, cached connection
- Collection names yahan define: `USERS_COLLECTION`, `TEACHING_OFFERS_COLLECTION`, `CONNECTIONS_COLLECTION`, `SESSIONS_COLLECTION`, `MESSAGES_COLLECTION`
- `.env` se `MONGODB_URI`, `MONGODB_DB` use hota hai

**Collections (kya kahan store hota hai)**

| Collection         | Kya store hota hai |
|--------------------|--------------------|
| **users**          | Student, teacher, admin – email, passwordHash, name, role |
| **teaching_offers**| Teacher ke courses – userId, subject, subjectBadge, rate, location, description, status (active/paused) |
| **connections**    | Student–teacher link – studentId, teacherId, subject, status (pending/active) |
| **sessions**       | Scheduled sessions – studentId, teacherId, subject, scheduledAt, durationHours, status, amount |
| **messages**       | Chat – senderId, receiverId, text, createdAt |

**Seed script**
- **File:** `scripts/seed-mongo.js`
- **Command:** `npm run db:seed`
- Demo users: admin, student (Ayesha Malik), teacher (Fatima K.) + sample offers, connections, sessions

---

## 2. Auth (Login / Session)

**Session (JWT + cookie)**
- **File:** `lib/auth.ts`
- `createSession()` – JWT bana ke cookie set (userId, email, name, role)
- `getSession()` – Cookie se user nikaal ke return
- `deleteSession()` – Cookie delete (logout)
- Cookie name: `tutorconnect_session`, 7 din

**Auth APIs**

| API | Method | Kya karta hai |
|-----|--------|----------------|
| **/api/auth/login** | POST | Body: email, password, role. DB se user match, password bcrypt compare. Session create, redirect URL (student/teacher dashboard) return |
| **/api/auth/logout** | POST | Session delete (cookie clear) |
| **api/auth/me** | GET | Logged-in user return (userId, email, name, role). 401 agar login nahi |
| **/api/auth/signup** | POST | Body: email, password, name, role. Password hash (bcrypt), user DB mein insert |

**Admin route protection**
- **File:** `middleware.ts`
- Admin routes pe request aane pe session check; nahi hai to login pe redirect

---

## 3. Chat Backend

**APIs**

| API | Method | Kya karta hai |
|-----|--------|----------------|
| **/api/chat/send** | POST | Body: toUserId, text. Logged-in user = senderId, message **messages** collection mein save |
| **/api/chat/messages** | GET | Query: `?with=userId`. Dono taraf ki messages (senderId/receiverId) return, sorted by time. isSent flag (current user ne bheja ya receive kiya) |
| **/api/chat/conversations** | GET | Current user ki saari chats – jinke saath message hua, unka userId, name, initials, last message, last time. Optional `?with=userId` se us user ko bhi list mein include (agar abhi koi message nahi) |

**Files**
- `app/api/chat/send/route.ts`
- `app/api/chat/messages/route.ts`
- `app/api/chat/conversations/route.ts`

**Notes**
- senderId / receiverId hamesha **string** (consistent query, reload/logout ke baad bhi chat load)

---

## 4. Student Backend

**APIs**

| API | Method | Kya karta hai |
|-----|--------|----------------|
| **/api/student/dashboard** | GET | Active connections (teachers), upcoming sessions (teacher name, time, duration), stats (activeTutors, hoursCompleted, totalSpent) |
| **/api/student/offers** | GET | Saare **active** teaching offers + teacher name, initials, connection status (none/pending/active) is student ke liye |
| **/api/student/request-connection** | POST | Body: offerId. Pending connection create (studentId, teacherId, status: pending) |
| **/api/student/sessions** | POST | Body: teacherId, subject, startTime, durationHours. Session create (studentId, teacherId, subject, scheduledAt, durationHours, status: confirmed). Teacher exists check, date/duration validation |
| **/api/student/payments** | GET | Is student ke sessions se payment list – teacher name, subject, amount, date. totalPaid, thisMonthPaid bhi return |

**Files**
- `app/api/student/dashboard/route.ts`
- `app/api/student/offers/route.ts`
- `app/api/student/request-connection/route.ts`
- `app/api/student/sessions/route.ts`
- `app/api/student/payments/route.ts`

---

## 5. Teacher Backend

**APIs**

| API | Method | Kya karta hai |
|-----|--------|----------------|
| **/api/teacher/dashboard** | GET | Is teacher ke offers (active + paused), upcoming sessions (student name, time, duration), pending connection requests, stats (activeStudents, earnings, totalHours) |
| **/api/teacher/offers** | POST | Body: subject, subjectBadge, rate, location, description. Naya teaching offer create (userId = teacher) |
| **/api/teacher/offers/[id]** | PATCH | Body: title, rate, location, description **ya** status: paused / active. Offer update ya pause/resume |
| **/api/teacher/connections/[id]** | PATCH | Body: action: accept / decline. Pending connection ko active ya reject |

**Files**
- `app/api/teacher/dashboard/route.ts`
- `app/api/teacher/offers/route.ts` (POST)
- `app/api/teacher/offers/[id]/route.ts` (PATCH)
- `app/api/teacher/connections/[id]/route.ts` (PATCH)

---

## 6. Backend Files List (jo hum ne use/banayi)

**Lib (shared backend logic)**
- `lib/auth.ts` – JWT session create / get / delete
- `lib/mongodb.ts` – DB connection, collection names
- `lib/utils.ts` – Common helpers

**Middleware**
- `middleware.ts` – Admin routes protect

**API routes (app/api/)**
- `auth/login/route.ts`
- `auth/logout/route.ts`
- `auth/me/route.ts`
- `auth/signup/route.ts`
- `chat/send/route.ts`
- `chat/messages/route.ts`
- `chat/conversations/route.ts`
- `student/dashboard/route.ts`
- `student/offers/route.ts`
- `student/request-connection/route.ts`
- `student/sessions/route.ts`
- `student/payments/route.ts`
- `teacher/dashboard/route.ts`
- `teacher/offers/route.ts`
- `teacher/offers/[id]/route.ts`
- `teacher/connections/[id]/route.ts`

**Scripts**
- `scripts/seed-mongo.js` – DB seed (users, offers, connections, sessions)

---

## 7. Short Flow (Backend side)

1. **Login** → POST /api/auth/login → DB check → JWT cookie → redirect
2. **Student dashboard** → GET dashboard, offers, sessions; POST request-connection, sessions; GET payments
3. **Teacher dashboard** → GET dashboard (offers, sessions, pending); POST/PATCH offers; PATCH connections
4. **Chat** → POST send (message save); GET messages (conversation); GET conversations (list)
5. **Admin** → middleware session check; admin pages Next.js se

---

Ye file backend ka saara kaam ek jagah summarize karti hai. Isse project mein add kar diya gaya hai (**BACKEND_SUMMARY.md**).
