/** ตารางและฟังก์ชันของระบบนี้อยู่ใน schema showcase แยกจากระบบอื่นใน project เดียวกัน */
export const DB_SCHEMA = "showcase";

/** ป้ายใน app_metadata ของบัญชีที่สมัครผ่านระบบนี้ ใช้เลือกบัญชีที่ลบหรือตั้งรหัสใหม่ได้ */
export const APP_TAG = "showcase";

export function isShowcaseUser(u: { app_metadata?: Record<string, unknown> }) {
  return u.app_metadata?.app === APP_TAG;
}
