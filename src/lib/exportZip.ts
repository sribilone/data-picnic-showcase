/**
 * ชื่อไฟล์และโฟลเดอร์สำหรับส่งออกภาพผลงาน · FR-048
 * ภาพตั้งชื่อ รหัส_ชื่อ-นามสกุล · 1 โฟลเดอร์ต่อ 1 รอบ
 */
import type { Cell } from "./xlsx";

/** ตัดอักขระที่ใช้ในชื่อไฟล์ไม่ได้บน Windows และ macOS */
export function safeName(s: string, max = 80) {
  const t = s
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+|\.+$/g, "");
  return t.slice(0, max).trim();
}

/** ชื่อภาพ เช่น A01_สมศรี ใจดี.jpg · ถ้าชื่อซ้ำในโฟลเดอร์เดียวกันจะต่อท้าย (2) */
export function imageFileName(code: string, ownerName: string, path: string, used: Set<string>) {
  const ext = (path.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg").toLowerCase();
  const base = [safeName(code, 20), safeName(ownerName)].filter(Boolean).join("_") || "work";
  let name = `${base}.${ext}`;
  for (let i = 2; used.has(name.toLowerCase()); i++) name = `${base} (${i}).${ext}`;
  used.add(name.toLowerCase());
  return name;
}

export type ExportWork = {
  rank: number | null;
  code: string;
  owner_name: string;
  owner_email: string;
  style: string;
  tone: string;
  hearts: number;
  hidden: boolean;
  image_path: string;
  image_w: number;
  image_h: number;
  created_at: string;
};

export type ExportRound = { name: string; period: string; works: ExportWork[] };

export const EXCEL_HEADER = [
  "อันดับ", "รหัส", "ชื่อ-นามสกุล", "อีเมล", "สไตล์", "โทนสี", "หัวใจที่ได้รับ",
  "สถานะ", "แนวภาพ", "ขนาดภาพ (พิกเซล)", "เวลาส่ง", "ชื่อไฟล์ภาพ",
];
export const EXCEL_WIDTHS = [8, 8, 26, 30, 22, 18, 13, 10, 12, 16, 18, 34];

export function excelRow(w: ExportWork, fileName: string, orientationOf: (w: number, h: number) => string): Cell[] {
  const at = new Intl.DateTimeFormat("th-TH", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "Asia/Bangkok",
  }).format(new Date(w.created_at));
  return [
    w.rank, w.code, w.owner_name, w.owner_email, w.style, w.tone, w.hearts,
    w.hidden ? "ซ่อน" : "แสดง", orientationOf(w.image_w, w.image_h), `${w.image_w} x ${w.image_h}`, at, fileName,
  ];
}
