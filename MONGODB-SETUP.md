# MongoDB Setup – Login ke liye

Login tabhi kaam karega jab MongoDB chal raha ho. Neeche do tareeqe hain:

---

## Option 1: MongoDB Local (apne PC par)

### 1. MongoDB install karo
- **Windows:** https://www.mongodb.com/try/download/community se "MongoDB Community Server" download karo  
- Install karte waqt **"Install MongoDB as a Service"** select karo (default port 27017)

### 2. Service start karo
- **Windows:** Services (Win + R → `services.msc`) open karo, **MongoDB Server** dhoondo, right-click → **Start**
- Ya Command Prompt **Admin** se:  
  `net start MongoDB`

### 3. Seed users create karo
Project folder mein terminal open karo:

```bash
npm run db:seed
```

### 4. Login
- Browser: `http://localhost:3000/login.html`
- **Admin:** admin@tutorconnect.com / admin123  
- **Student:** student@tutorconnect.com / student123  
- **Teacher:** teacher@tutorconnect.com / teacher123  

---

## Option 2: MongoDB Atlas (cloud, install ki zaroorat nahi)

### 1. Free cluster banao
- https://www.mongodb.com/cloud/atlas par jao  
- Sign up → **Create Free Cluster** (e.g. M0)

### 2. Database user banao
- Left menu: **Database Access** → **Add New Database User**  
- Username / Password set karo (yaad rakhna)

### 3. Network access
- Left menu: **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0) for dev

### 4. Connection string copy karo
- **Database** → **Connect** → **Connect your application**  
- Connection string copy karo, jaise:  
  `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/`

### 5. `.env` update karo
Project root mein `.env` file mein:

```
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/tutorconnect?retryWrites=true&w=majority"
MONGODB_DB="tutorconnect"
JWT_SECRET="tutorconnect-secret-change-in-production"
```

`USER` aur `PASSWORD` apne database user se replace karo.

### 6. Seed chalao
```bash
npm run db:seed
```

### 7. Dev server restart karo
```bash
npm run dev
```

Phir login try karo (same credentials: admin@tutorconnect.com / admin123, etc.).

---

## Summary

| Step | Local MongoDB | Atlas |
|------|----------------|--------|
| 1 | Install MongoDB + Start service | Create cluster + user + connection string |
| 2 | `npm run db:seed` | `.env` mein MONGODB_URI set karo |
| 3 | `npm run dev` → login | `npm run db:seed` → `npm run dev` → login |

Dono options mein login ke liye **pehle MongoDB connect hona chahiye**, phir **seed** chalao, phir **admin@tutorconnect.com / admin123** (ya student/teacher) se login karo.
