/** สร้าง CSV พร้อม BOM ให้ Excel และ Google Sheets อ่านภาษาไทยถูก · FR-048 */
export function toCsv(header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  return "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}
