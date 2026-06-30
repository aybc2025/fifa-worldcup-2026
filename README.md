# worldcup-2026 ⚽

PWA מלאה עם כל נתוני מונדיאל 2026 — משחקים חיים, בתים, עץ נוקאאוט, נבחרות.

**ללא API keys. ללא שרת. פרוסה על GitHub Pages בחינם.**

## Setup — 4 שלבים

### 1. צור ריפו GitHub

צור ריפו חדש בשם `worldcup-2026` ב-GitHub.

### 2. הפעל GitHub Pages

ב-GitHub: Settings → Pages → Source → **GitHub Actions**

### 3. Clone, install, push

```bash
unzip worldcup-2026.zip
cd worldcup-2026
npm install
git init
git remote add origin https://github.com/YOUR-USERNAME/worldcup-2026.git
git add -A
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

GitHub Actions יבנה אוטומטית ויפרס ל:
`https://YOUR-USERNAME.github.io/worldcup-2026/`

### 4. זהו!

אין keys. אין שרת. אין Netlify.

## מקורות נתונים

| מקור | נתונים | key? |
|------|---------|------|
| worldcup26.ir | משחקים חיים, דירוגים, נבחרות, אצטדיונים | ❌ |
| openfootball/worldcup.json | לוח משחקים (fallback) | ❌ |
| flagcdn.com | דגלי נבחרות | ❌ |

## טכנולוגיות

- React 18 + Vite
- Tailwind CSS (RTL + LTR)
- React Query v5 (polling + fallback)
- Framer Motion (אנימציות)
- vite-plugin-pwa + Workbox (PWA + אופליין)
- react-i18next (עברית ↔ אנגלית)
- GitHub Pages + GitHub Actions (CI/CD)
