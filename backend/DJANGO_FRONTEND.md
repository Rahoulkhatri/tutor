# Frontend ko Django backend se chalana

Jab backend **Django** (port 8000) pe ho, frontend ko APIs **http://localhost:8000** se call karwane hain.

## Option 1: Static files Django se serve karo

Django me `public` folder ko static serve karke sab same origin pe ho jata hai (session cookie bhi kaam karegi):

1. `tutorconnect/settings.py` me add karo:
   ```python
   import os
   STATICFILES_DIRS = [os.path.join(BASE_DIR.parent, "public")]
   ```
2. Root URL pe `index.html` serve karne ke liye ek view add karo (e.g. `TemplateView` pointing to `public/index.html`).
3. `python manage.py runserver 8000` chalao – ab `http://localhost:8000/` pe site khulegi.

## Option 2: Frontend alag (e.g. port 3000), API Django (8000)

- Frontend (Next/static) ko port 3000 pe chalao.
- Saari `fetch("/api/...")` calls ko **full URL** pe bhejo: `http://localhost:8000/api/...`
- Ya Next.js me **rewrites** use karo taake `/api/*` requests 8000 pe proxy hon:

  ```js
  // next.config.mjs
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }];
  }
  ```

  Phir frontend same rahega (`fetch("/api/auth/me")`) aur Next requests Django ko forward karega.

## Session / cookie

Django session cookie **SameSite=Lax** hai. Agar frontend aur backend **same domain** pe hon (e.g. dono localhost:8000) to cookie apne aap jayegi. Agar frontend 3000 pe hai to CORS + credentials: 'include' ke sath cookie bhejne ke liye Django **CORS_ALLOW_CREDENTIALS = True** already hai; zarurat ho to **SESSION_COOKIE_SAMESITE** = 'None' aur **Secure** (HTTPS) bhi set kar sakte ho (local HTTP ke liye same origin ya proxy better hai).
