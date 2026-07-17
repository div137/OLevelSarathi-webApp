# GitHub Actions Auto-Deploy Setup Guide
## O Level Sarathi — Static Blog Auto-Deploy

Ye guide follow karo — ek baar setup hone ke baad, **har baar blog publish karte hi ~2-3 min mein
automatically static pages live ho jayenge** on Firebase Hosting.

---

## Step 1 — GitHub Par Repository Push Karo

Agar project already GitHub pe nahi hai:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Step 2 — Firebase Service Account Key Banao

1. **Firebase Console** open karo → https://console.firebase.google.com
2. Apna project select karo: `olevelsarathi`
3. **Project Settings** (gear icon) → **Service accounts** tab
4. **"Generate new private key"** button click karo
5. JSON file download hogi — isko safely rakh lo

---

## Step 3 — GitHub Secrets Add Karo

1. GitHub pe apni repository open karo
2. **Settings** → **Secrets and variables** → **Actions**
3. **"New repository secret"** click karo

### Secret 1: `FIREBASE_SERVICE_ACCOUNT`
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Upar download ki hui **poori JSON file ka content** paste karo
  ```json
  {
    "type": "service_account",
    "project_id": "olevelsarathi",
    ...
  }
  ```

### Secret 2 (Optional - agar private repo hai):
- Agar repo **public** hai toh `GITHUB_TOKEN` automatically available hota hai — kuch nahi karna.
- Agar repo **private** hai toh Actions settings mein "Allow GitHub Actions to create and approve pull requests" enable karo.

---

## Step 4 — GitHub Personal Access Token Banao (Admin Panel ke liye)

1. GitHub.com → apna avatar → **Settings**
2. Left sidebar mein sabse neeche → **Developer settings**
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
4. Settings:
   - **Token name**: `OLevelSarathi Admin Deploy`
   - **Expiration**: 1 year
   - **Repository access**: Only select repositories → apna repo choose karo
   - **Permissions** (Repository permissions):
     - `Actions` → **Read and write**
5. **Generate token** → Token copy karo (ek baar hi dikhega!)

---

## Step 5 — Admin Panel Mein Configure Karo

1. Admin Panel open karo (`/admin-olevelsarathi-2026`)
2. **Blogs** section mein jao
3. **"Auto Static Deploy"** panel mein → **"⚙️ GitHub Config"** click karo
4. Fill karo:
   - **GitHub Repo**: `your-username/your-repo-name` (e.g. `johndoe/olevel-sarathi`)
   - **GitHub Token**: Step 4 mein copy kiya hua token paste karo
5. **Save Config** click karo ✅

---

## Step 6 — Test Karo

1. Admin Panel → Blogs → koi bhi blog add/edit karo
2. **"Publish Static Pages"** button dabao
3. Success message aayega: "Deploy trigger ho gaya!"
4. GitHub → Actions tab pe jao → workflow run hota dikhega
5. ~2-3 min mein `https://olevelsarathi.in/blog/your-slug` live ho jayega ✅

---

## Workflow Kaise Kaam Karta Hai

```
Admin Panel → "Publish Static Pages" button dabao
                    ↓
        GitHub API → repository_dispatch event
                    ↓
        GitHub Actions workflow trigger hota hai
                    ↓
        Ubuntu runner: npm ci (dependencies install)
                    ↓
        npm run build (React + Vite build)
                    ↓
        node scripts/generate-blog-pages.js
        (Firebase RTDB se posts fetch → static HTML generate)
                    ↓
        firebase deploy --only hosting:olevelsarathi
                    ↓
        ✅ https://olevelsarathi.in/blog/[slug].html LIVE!
```

---

## Automatic Schedule (Safety Net)

Workflow **har 6 ghante mein** automatically bhi run hota hai (cron schedule).
Matlab agar koi button na dabao, phir bhi blog posts 6 ghante mein live ho jayenge.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "❌ GitHub API error: 401" | Token galat ya expire ho gaya — naya token banao |
| "❌ GitHub API error: 404" | Repo naam galat hai — `username/repo` format check karo |
| "❌ GitHub API error: 422" | Workflow file `.github/workflows/deploy-blog.yml` repo mein exist nahi karta |
| Build fail in Actions | GitHub → Actions → failed run click karo → logs dekho |
| Firebase deploy fail | `FIREBASE_SERVICE_ACCOUNT` secret sahi se paste hua hai check karo |

---

## Files Created

```
.github/
  workflows/
    deploy-blog.yml          ← GitHub Actions workflow
scripts/
  generate-blog-pages.js     ← Static HTML generator (Node.js)
src/
  utils/
    staticBlogGenerator.js   ← Browser-side generator (admin panel download)
```
