# TutorConnect – Django Backend

Yeh backend **Python Django** pe hai. Node/Next.js wale APIs ka replacement – same API paths aur response shape, taake existing frontend bina change ke chal sake.

## Pehle Python install karo

- **Windows:** https://www.python.org/downloads/ se Python 3.11 ya 3.12 download karo. Installer me **"Add python.exe to PATH"** zaroor check karo, phir Install Now.
- Install ke baad **naya terminal** kholo aur type karo: `python --version` – version dikhna chahiye.

Agar `Python was not found` aaye to Python PATH me nahi hai – installer dobara chala ke "Add to PATH" select karo.

## Setup

```bash
cd backend
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed
```

## Run

```bash
python manage.py runserver 8000
```

Backend: **http://localhost:8000**

## API Base URL

Frontend ab **http://localhost:8000** use karega (Node ki jagah).

- `POST http://localhost:8000/api/auth/login/`
- `GET  http://localhost:8000/api/auth/me/`
- `POST http://localhost:8000/api/auth/logout/`
- `POST http://localhost:8000/api/auth/signup/`
- `GET  http://localhost:8000/api/student/dashboard/`
- `GET  http://localhost:8000/api/student/offers/`
- `POST http://localhost:8000/api/student/request-connection/`
- `POST http://localhost:8000/api/student/sessions/`
- `GET  http://localhost:8000/api/student/payments/`
- `GET  http://localhost:8000/api/teacher/dashboard/`
- `POST http://localhost:8000/api/teacher/offers/`
- `PATCH http://localhost:8000/api/teacher/offers/<id>/`
- `PATCH http://localhost:8000/api/teacher/connections/<id>/`
- `POST http://localhost:8000/api/chat/send/`
- `GET  http://localhost:8000/api/chat/messages/?with=<userId>`
- `GET  http://localhost:8000/api/chat/conversations/`

## Frontend se Django use karne ke liye

Static HTML/JS ko **Django backend** se run karna ho to:

1. Django me `public` folder ko **static** serve karo, ya
2. Frontend ko alag (e.g. `npm run dev` on port 3000) chalao aur **CORS** already on hai; sirf fetch URL change karo: `http://localhost:8000/api/...` (ya relative `/api/...` agar same origin pe proxy karo).

## Seed users (run `python manage.py seed` once)

- **Student:** student@tutorconnect.com / **password123**
- **Teacher:** teacher@tutorconnect.com / **password123**
- **Admin:** admin@tutorconnect.com / **admin123**

Agar login pe **401 Unauthorized** aaye to: (1) `python manage.py seed` chala ke demo users create karo, (2) upar wale password sahi use karo (Admin = admin123, Student/Teacher = password123).

`python manage.py seed` dobara chalane se demo offers/connections/sessions wapas create ho jayenge (pehle wale delete ho kar).
