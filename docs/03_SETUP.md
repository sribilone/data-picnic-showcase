# ตั้งค่าบริการ GitHub Supabase และ Vercel

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

ใช้ project เดิมร่วมกับระบบอื่นได้ ระบบนี้แยกของตัวเองไว้ดังนี้

| ส่วน | ชื่อที่ใช้ |
|---|---|
| ตารางและฟังก์ชัน | schema `showcase` |
| ค่าลับ | schema `showcase_private` |
| ที่เก็บภาพ | bucket `showcase-works` |
| บัญชีที่สมัครผ่านระบบนี้ | `app_metadata.app = showcase` ปุ่มลบบัญชีและตั้งรหัสผ่านใหม่ทำได้เฉพาะบัญชีกลุ่มนี้ |

1. **Project Settings > API** จดค่า Project URL · anon หรือ publishable key · service_role หรือ secret key
2. **SQL Editor** วางไฟล์แล้วกด Run ทีละไฟล์ตามลำดับ
   - `supabase/migrations/20261008000001_schema.sql`
   - `supabase/migrations/20261008000002_rls.sql`
   - `supabase/migrations/20261008000003_functions.sql`
   - `supabase/migrations/20261008000004_storage.sql`
   - `supabase/seed.sql` แก้ `teacher@example.com` เป็นอีเมลของผู้สอนก่อนรัน
3. **Project Settings > Data API > Exposed schemas** เพิ่ม `showcase` แล้วกด Save ถ้าไม่เพิ่ม หน้าเว็บจะอ่านข้อมูลไม่ได้
4. **Authentication > Rate Limits** ทั้งห้องใช้ IP เดียวกัน เพิ่มค่าต่อไปนี้เป็นอย่างน้อย 300 ต่อ 5 นาที มีผลกับระบบอื่นใน project ด้วย แต่เป็นการเพิ่มเพดานเท่านั้น
   - Sign-ups and sign-ins
   - Token refreshes

ไม่ต้องแก้ค่า Confirm email ของ project ระบบนี้สร้างบัญชีที่ยืนยันอีเมลแล้วให้เอง

---

## C. Vercel

1. เข้า vercel.com เข้าสู่ระบบด้วย GitHub กด **Add New > Project** เลือก repo `data-picnic-showcase`
2. **Environment Variables** ใส่ 3 ค่าตาม `.env.example`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. กด Deploy

---

## D. บัญชีผู้สอน

1. ถ้าอีเมลใน `seed.sql` มีบัญชีในระบบเดิมอยู่แล้ว กดเข้าสู่ระบบด้วยรหัสผ่านเดิมได้เลย ถ้ายังไม่มี เลือก **สมัครครั้งแรก**
2. ทำข้อนี้ก่อนแจกลิงก์ให้ผู้เรียน เพราะระบบไม่ยืนยันอีเมล ใครสมัครด้วยอีเมลนี้ก่อนจะได้สิทธิ์ผู้ดูแล
3. เพิ่มผู้ดูแลคนอื่นในหน้า **ตั้งค่า** หลังจากคนนั้นสมัครแล้ว
4. ผู้เรียนลืมรหัสผ่าน ตั้งรหัสใหม่ให้ในหน้า **ตั้งค่า > ตั้งรหัสผ่านใหม่**

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
| เปิดเว็บบน Vercel | เห็นหน้าบอร์ด ถ้าขึ้นว่าเชื่อมต่อไม่ได้ ตรวจข้อ B3 |
| สมัครครั้งแรกด้วยอีเมลและรหัสผ่าน | กลับมาหน้าเดิมและเห็นชื่อที่หัวหน้า |
| เปิด `/admin` ด้วยบัญชีผู้สอน | เห็นหน้าจัดการรอบ |
| เปิด `/admin` ด้วยบัญชีอื่น | เห็นหน้าไม่มีสิทธิ์เข้าหลังบ้าน |
