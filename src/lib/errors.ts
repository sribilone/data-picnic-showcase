/**
 * แปลข้อผิดพลาดจากฐานข้อมูลเป็นข้อความตาม FRD ข้อ 8.2
 * ข้อความภาษาไทยที่ฟังก์ชัน SQL ส่งมาใช้ได้ตรง ๆ ข้อความระบบภาษาอังกฤษแปลงก่อนแสดง
 */
const MAP: [RegExp, string][] = [
  [/rounds_prefix_unique/, "ตัวอักษรนำหน้ารหัสนี้มีรอบอื่นใช้แล้ว"],
  [/rounds_one_shown/, "บอร์ดแสดงได้ทีละ 1 รอบ"],
  [/works_one_per_owner/, "ส่งได้ 1 ผลงานต่อรอบ"],
  [/JWT|not authenticated|28000/i, "ต้องเข้าสู่ระบบก่อน"],
  [/permission denied|42501/i, "ไม่มีสิทธิ์"],
  [/Failed to fetch|NetworkError|network/i, "เชื่อมต่อไม่ได้ ลองอีกครั้ง"],
];

export function friendlyError(message: string | null | undefined): string {
  if (!message) return "ทำรายการไม่สำเร็จ ลองอีกครั้ง";
  if (/[฀-๿]/.test(message) && !/[A-Za-z_]{6,}/.test(message)) return message;
  for (const [re, text] of MAP) if (re.test(message)) return text;
  return "ทำรายการไม่สำเร็จ ลองอีกครั้ง";
}
