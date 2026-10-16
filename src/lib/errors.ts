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

/** ข้อผิดพลาดตอนเข้าสู่ระบบและสมัคร */
const AUTH: [RegExp, string][] = [
  [/invalid login credentials|invalid_credentials/i, "อีเมลหรือรหัสผ่านไม่ถูกต้อง"],
  [/already (been )?registered|already exists|user_already_exists|email_exists/i, "อีเมลนี้สมัครแล้ว ให้กดเข้าสู่ระบบ"],
  [/password.*(6|short|weak)|weak_password/i, "รหัสผ่านอย่างน้อย 6 ตัว"],
  [/email.*(invalid|format)|validation_failed/i, "อีเมลไม่ถูกต้อง"],
  [/not confirmed|email_not_confirmed/i, "สมัครแล้ว แต่ยังเข้าใช้ไม่ได้ แจ้งผู้สอน"],
  [/signups not allowed|signup_disabled/i, "ระบบปิดรับสมัคร แจ้งผู้สอน"],
  [/rate limit|too many|over_request_rate_limit|429/i, "มีคนเข้าพร้อมกันมาก รอสักครู่แล้วลองอีกครั้ง"],
  [/Failed to fetch|NetworkError|network/i, "เชื่อมต่อไม่ได้ ลองอีกครั้ง"],
];

export function authError(message: string | null | undefined): string {
  for (const [re, text] of AUTH) if (message && re.test(message)) return text;
  return "เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง";
}

export function friendlyError(message: string | null | undefined): string {
  if (!message) return "ทำรายการไม่สำเร็จ ลองอีกครั้ง";
  if (/[฀-๿]/.test(message) && !/[A-Za-z_]{6,}/.test(message)) return message;
  for (const [re, text] of MAP) if (re.test(message)) return text;
  return "ทำรายการไม่สำเร็จ ลองอีกครั้ง";
}
