# ตั้งค่าบริการ GitHub Supabase Google และ Vercel

ทำตามลำดับ A ถึง E ใช้บัญชี Gmail ของผู้สอน ไม่ต้องผูกบัตร
ชื่อเมนูในแต่ละบริการอาจเปลี่ยนเล็กน้อยตามรุ่นของหน้าเว็บ

---

## A. GitHub

1. สร้าง repository ใหม่ชื่อ `data-picnic-showcase` แบบ Private ไม่ต้องติ๊กสร้าง README
2. ในโฟลเดอร์นี้บนเครื่อง เปิด Terminal แล้วรัน

```bash
git add .
git commit -m "P0 โครงโปรเจกต์"
git branch -M main
git remote add origin https://github.com/<ชื่อบัญชี>/data-picnic-showcase.git
git push -u origin main
```

---

## B. Supabase

1. สร้างโปรเจกต์ใหม่ เลือก Region **Southeast Asia (Singapore)** ตั้งรหัสผ่านฐานข้อมูลแล้วเก็บไว้
2. **Project Settings > API** จดค่า Project URL · anon หรือ publishable key · service_role หรือ secret key
3. **SQL Editor** วางไฟล์แล้วกด Run ทีละไฟล์ตามลำดับ
   - `supabase/migrations/20261008000001_schema.sql`
   - `supabase/migrations/20261008000002_rls.sql`
   - `supabase/migrations/20261008000003_functions.sql`
   - `supabase/migrations/20261008000004_storage.sql`
   - `supabase/seed.sql` แก้ `teacher@example.com` เป็นอีเมลบัญชี Google ของผู้สอนก่อนรัน
4. **Authentication > URL Configuration**
   - Site URL ใส่ที่อยู่เว็บบน Vercel ที่ได้จากข้อ D ระหว่างนี้ใส่ `http://localhost:3000`
   - Redirect URLs เพิ่ม `http://localhost:3000/auth/callback` และ `https://<ชื่อเว็บ>.vercel.app/auth/callback`
5. **Authentication > Rate Limits** เพิ่มค่าการเข้าสู่ระบบต่อ IP เป็นอย่างน้อย 300 ครั้งต่อ 5 นาที เพราะทั้งห้องออกเน็ตด้วย IP เดียวกัน
6. จดที่อยู่ Callback URL ของ Google จาก **Authentication > Providers > Google** มีรูปแบบ `https://<project-ref>.supabase.co/auth/v1/callback` ใช้ในข้อ C

---

## C. Google Cloud

1. เข้า console.cloud.google.com สร้างโปรเจกต์ใหม่ชื่อ `data-picnic-showcase`
2. **Google Auth Platform** หรือ **APIs & Services > OAuth consent screen**
   - User type เลือก External
   - App name `AI for HR Showcase` · Support email และ Developer contact ใส่อีเมลผู้สอน
   - Scopes ใช้แค่ `openid` `email` `profile` ไม่ต้องเพิ่ม
   - หน้า Audience กด **Publish app** ให้สถานะเป็น In production ถ้ายังเป็น Testing จะเข้าได้เฉพาะบัญชีที่เพิ่มไว้
3. **Clients** หรือ **Credentials > Create credentials > OAuth client ID**
   - Application type เลือก Web application
   - Authorized JavaScript origins ใส่ `http://localhost:3000` และ `https://<ชื่อเว็บ>.vercel.app`
   - Authorized redirect URIs ใส่ Callback URL จากข้อ B6
4. คัดลอก Client ID และ Client secret ไปใส่ใน Supabase **Authentication > Providers > Google** แล้วเปิดใช้งาน

---

## D. Vercel

1. เข้า vercel.com เข้าสู่ระบบด้วย GitHub กด **Add New > Project** เลือก repo `data-picnic-showcase`
2. **Environment Variables** ใส่ 3 ค่าตาม `.env.example`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. กด Deploy แล้วนำที่อยู่เว็บที่ได้กลับไปใส่ในข้อ B4 และ C3

---

## E. รันบนเครื่อง

```bash
npm install
cp .env.example .env.local   # แล้วใส่ค่าจริง
npm run dev                  # เปิด http://localhost:3000
npm run typecheck
npm run lint
```

---

## ตรวจว่าตั้งค่าครบ

| ตรวจ | ผลที่ต้องได้ |
|---|---|
| เปิดเว็บบน Vercel | เห็นหน้าบอร์ด |
| กดเข้าสู่ระบบด้วย Google | กลับมาหน้าเดิมและเห็นชื่อบัญชีที่หัวหน้า |
| เปิด `/admin` ด้วยบัญชีผู้สอน | เห็นหน้าจัดการรอบ |
| เปิด `/admin` ด้วยบัญชีอื่น | เห็นหน้าไม่มีสิทธิ์เข้าหลังบ้าน |
