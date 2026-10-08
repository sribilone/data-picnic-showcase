// จำลองผู้เรียนโหวตพร้อมกัน · NFR-02 NFR-03
// ใช้กับโปรเจกต์ Supabase สำหรับทดสอบเท่านั้น ห้ามรันกับโปรเจกต์ที่ใช้สอนจริง
// ต้องเปิด Email provider ใน Authentication > Providers ชั่วคราว และมีรอบที่แสดงอยู่ เปิดโหวต และมีผลงานอย่างน้อย 3 ชิ้น
//
// รัน   N=60 node --env-file=.env.local scripts/loadtest-votes.mjs
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const N = Number(process.env.N ?? 60);
if (!URL || !ANON || !SERVICE) throw new Error("ตั้งค่า .env.local ให้ครบก่อน");

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const password = "loadtest-" + Math.random().toString(36).slice(2);
const users = [];

console.log(`สร้างผู้ใช้ทดสอบ ${N} บัญชี`);
for (let i = 0; i < N; i++) {
  const email = `loadtest${String(i).padStart(3, "0")}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error && !error.message.includes("already")) throw error;
  users.push({ email, id: data?.user?.id });
}

const clients = await Promise.all(
  users.map(async ({ email }) => {
    const c = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return c;
  }),
);

const { data: works } = await clients[0].rpc("board");
if (!works || works.length < 3) throw new Error("ต้องมีผลงานบนบอร์ดอย่างน้อย 3 ชิ้น");

console.log("ทุกคนโหวตพร้อมกันคนละ 3 ครั้ง");
const times = [];
let failed = 0;
await Promise.all(
  clients.map(async (c, i) => {
    for (let k = 0; k < 3; k++) {
      const w = works[(i + k) % works.length];
      const t = performance.now();
      const { error } = await c.rpc("cast_vote", { p_work: w.work_id });
      times.push(performance.now() - t);
      if (error) failed++;
    }
  }),
);
times.sort((a, b) => a - b);
const p = (q) => times[Math.min(times.length - 1, Math.floor(q * times.length))].toFixed(0);
console.log(`คำขอ ${times.length} · ไม่สำเร็จ ${failed} · p50 ${p(0.5)} ms · p95 ${p(0.95)} ms · เกณฑ์ NFR-02 p95 ไม่เกิน 1000 ms`);

console.log("ลบผู้ใช้ทดสอบ");
for (const u of users) if (u.id) await admin.auth.admin.deleteUser(u.id);
