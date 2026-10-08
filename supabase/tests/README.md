# ทดสอบกติกาในฐานข้อมูล

ทดสอบกับ PostgreSQL ในเครื่อง ไม่ต้องใช้ Supabase จริง
`00_supabase_stubs.sql` จำลอง schema `auth` และ `storage` ของ Supabase

```bash
createdb showcase_test
psql -d showcase_test -f supabase/tests/00_supabase_stubs.sql
psql -d showcase_test -c "alter default privileges in schema public grant all on tables to anon, authenticated"
for f in supabase/migrations/*.sql supabase/seed.sql; do psql -d showcase_test -v ON_ERROR_STOP=1 -f $f; done
psql -d showcase_test -f supabase/tests/01_rules_scenario.sql
```

ผลที่ต้องได้ ดูบรรทัดที่ขึ้นต้นด้วย `-- ` ในไฟล์ scenario ข้อความ ERROR ที่ระบุว่า expect error คือผลที่ถูกต้อง
