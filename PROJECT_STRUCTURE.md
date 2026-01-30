# TutorConnect – Project Structure

Is document mein project ke folders aur important files ka short description hai. Koi bhi folder open kare to samajh aa jaye ke kya kahan hai.

---

## Root (project ki base)

| File / Folder | Kya hai |
|---------------|--------|
| `package.json` | NPM scripts, dependencies (Next.js, MongoDB, bcrypt, etc.) |
| `next.config.mjs` | Next.js configuration |
| `middleware.ts` | Admin routes protect karta hai (login check) |
| `.env` | Secrets (MONGODB_URI, JWT_SECRET) – git me add mat karo |
| `README.md` | Project overview |
| `MONGODB-SETUP.md` | MongoDB setup guide |
| `PROJECT_STRUCTURE.md` | Ye file – structure explain karti hai |

---

## `app/` – Next.js App Router (backend + admin UI)

Next.js ka main app: API routes yahan chalte hain, admin dashboard bhi yahan se serve hota hai.

### `app/api/` – Backend API (sab routes yahan)

**Auth**
| Path | Method | Kya karta hai |
|------|--------|----------------|
| `api/auth/login` | POST | Login (email, password, role) |
| `api/auth/logout` | POST | Session clear |
| `api/auth/me` | GET | Logged-in user (session) |
| `api/auth/signup` | POST | New user (student/teacher) |

**Chat**
| Path | Method | Kya karta hai |
|------|--------|----------------|
| `api/chat/send` | POST | Message bhejna (toUserId, text) |
| `api/chat/messages` | GET | Conversation ki messages (?with=userId) |
| `api/chat/conversations` | GET | Chat list (sidebar ke liye) |

**Student**
| Path | Method | Kya karta hai |
|------|--------|----------------|
| `api/student/dashboard` | GET | Student dashboard data (tutors, sessions) |
| `api/student/offers` | GET | Saare active courses (teachers ke) |
| `api/student/request-connection` | POST | Course request (offerId) |
| `api/student/sessions` | POST | Session schedule (teacherId, subject, startTime, duration) |
| `api/student/payments` | GET | Student ke fees / payment history |

**Teacher**
| Path | Method | Kya karta hai |
|------|--------|----------------|
| `api/teacher/dashboard` | GET | Teacher dashboard (offers, sessions, pending) |
| `api/teacher/offers` | POST | Naya offer; GET list nahi (dashboard me aata hai) |
| `api/teacher/offers/[id]` | PATCH | Offer edit / pause / resume |
| `api/teacher/connections/[id]` | PATCH | Connection accept / decline |

### `app/(admin)/` – Admin Dashboard (React/Next.js pages)

Admin login ke baad yahi pages open hote hain (sidebar se).

| Folder / File | Page / Kya hai |
|---------------|----------------|
| `(admin)/layout.tsx` | Admin layout (sidebar + content) |
| `(admin)/page.tsx` | Admin home |
| `(admin)/students/page.tsx` | Students list |
| `(admin)/teachers/page.tsx` | Teachers list |
| `(admin)/matches/page.tsx` | Matches |
| `(admin)/site-insights/page.tsx` | Insights |
| `(admin)/payouts/page.tsx` | Payouts |
| `(admin)/transactions/page.tsx` | Transactions |
| `(admin)/schedule/page.tsx` | Schedule |
| `(admin)/ratings/page.tsx` | Ratings |
| `(admin)/settings/page.tsx` | Settings |
| `(admin)/help/page.tsx` | Help |
| `(admin)/performance/page.tsx` | Performance |

### `app/` – Root layout

| File | Kya hai |
|------|--------|
| `app/layout.tsx` | Root HTML layout |
| `app/globals.css` | Global CSS |

---

## `public/` – Static Frontend (HTML + CSS + JS)

Ye sab **static** pages hain. Browser inhe direct open karta hai (e.g. `/login.html`, `/chat.html`). Next.js inhe `public/` se serve karta hai.

### HTML pages (public/)

| File | Kya hai |
|------|--------|
| `index.html` | Landing page |
| `login.html` | Login (student / teacher) |
| `signup.html` | Sign up |
| `student-dashboard.html` | Student dashboard |
| `teacher-dashboard.html` | Teacher dashboard |
| `chat.html` | Messages / chat |
| `payments.html` | Payments (role se student vs teacher view) |
| `search-tutors.html` | Tutor search |
| `notifications.html` | Notifications |
| `admin-commissions.html` | Admin commissions (agar use ho) |
| `SETUP-GUIDE.html` | Setup guide |

### `public/css/` – Styles

| File | Kya hai |
|------|--------|
| `style.css` | Global / landing |
| `auth.css` | Login / signup |
| `dashboard.css` | Student dashboard |
| `teacher-dashboard.css` | Teacher dashboard |
| `chat.css` | Chat page |
| `payments.css` | Payments page |
| `search.css` | Search tutors |
| `admin-commissions.css` | Admin commissions |

### `public/js/` – Frontend logic (static pages ke liye)

| File | Kya hai |
|------|--------|
| `auth.js` | Login / signup form, redirect |
| `dashboard-auth.js` | Session check, logout (dashboards pe) |
| `student-dashboard-data.js` | Student dashboard: courses, sessions, schedule, request |
| `teacher-dashboard-data.js` | Teacher dashboard: offers, sessions, accept/decline, pause |
| `chat.js` | Chat: conversations, messages, send, emoji |
| `payments.js` | Payments: role se teacher/student view, tabs |
| `search.js` | Search tutors: filters, request |
| `main.js` | Landing / common |
| `dashboard.js` | Common dashboard helpers (agar use ho) |
| `teacher-dashboard.js` | Teacher extra (agar use ho) |
| `admin-commissions.js` | Admin commissions (agar use ho) |

### `public/` – Images / assets

| File | Kya hai |
|------|--------|
| `icon.svg`, `icon-dark-32x32.png`, `icon-light-32x32.png` | Icons |
| `apple-icon.png` | Apple icon |
| `placeholder*.png`, `placeholder*.svg`, `placeholder-user.jpg` | Placeholder images |

---

## `components/` – React components (admin + shared)

Admin dashboard aur shared UI ke liye.

| Folder / File | Kya hai |
|---------------|--------|
| `sidebar.tsx` | Admin sidebar |
| `header.tsx` | Admin header |
| `metric-cards.tsx`, `recent-matches.tsx`, etc. | Admin dashboard widgets |
| `theme-provider.tsx` | Theme (dark/light) |
| `components/ui/` | Reusable UI (buttons, cards, inputs, etc.) |

---

## `lib/` – Backend / shared logic

| File | Kya hai |
|------|--------|
| `auth.ts` | JWT session: create, get, delete (cookies) |
| `mongodb.ts` | MongoDB connection, collection names (users, messages, sessions, etc.) |
| `utils.ts` | Common helpers |

---

## `scripts/` – One-time / setup scripts

| File | Kya karta hai |
|------|----------------|
| `seed-mongo.js` | MongoDB seed: admin, student, teacher, sample offers/sessions (npm run db:seed) |
| `seed-mongo.ts` | Same ka TS version (agar use ho) |

---

## `hooks/` – React hooks (admin / UI)

| File | Kya hai |
|------|--------|
| `use-mobile.ts` | Mobile detection |
| `use-toast.ts` | Toast notifications |

---

## Kaun kahan se serve hota hai

| Cheez | Kahan se aati hai |
|-------|-------------------|
| Landing, Login, Signup, Student/Teacher dashboard, Chat, Payments, Search | `public/*.html` + `public/css/*` + `public/js/*` |
| Admin dashboard (after login) | `app/(admin)/**` + `components/` |
| Sab API (auth, chat, student, teacher) | `app/api/**` |
| Database | MongoDB (connection `lib/mongodb.ts`, config `.env`) |

---

## Short flow

1. User `index.html` / `login.html` pe jata hai → static HTML + `public/js/auth.js`.
2. Login → `POST /api/auth/login` → cookie set → redirect student/teacher dashboard.
3. Student dashboard → `public/student-dashboard.html` + `public/js/student-dashboard-data.js` → data `GET /api/student/dashboard`, `GET /api/student/offers`, etc.
4. Teacher dashboard → `public/teacher-dashboard.html` + `public/js/teacher-dashboard-data.js` → `GET /api/teacher/dashboard`, PATCH offers/connections.
5. Chat → `public/chat.html` + `public/js/chat.js` → `GET /api/chat/conversations`, `GET /api/chat/messages`, `POST /api/chat/send`.
6. Admin → `/` (after login) → Next.js `app/(admin)/` pages.

Is structure ko follow karke koi bhi naya developer samajh sakta hai ke frontend, backend, aur admin files kahan rakhi hain.
