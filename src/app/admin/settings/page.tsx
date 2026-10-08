/**
 * ตั้งค่า · SCR-045 · FR-050 ถึง FR-055 · BR-016 BR-017
 * admin_add_admin admin_remove_admin admin_can_purge admin_purge_round_works
 * ลบบัญชีผู้เรียนใช้ Server Action กับ createServiceClient() เท่านั้น
 */
import { Todo } from "@/components/Todo";

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">ตั้งค่า</h1>
      <Todo
        scr="SCR-045"
        items={[
          "รายชื่อผู้ดูแล เพิ่มด้วยอีเมล ลบได้ยกเว้นบัญชีตัวเอง",
          "ลบบัญชีผู้เรียนทั้งหมด ยกเว้นผู้ดูแล ต้องพิมพ์ ลบ เพื่อยืนยัน",
          "ลบผลงานและไฟล์ภาพของรอบ",
          "ประวัติการทำรายการจากตาราง audit_log",
        ]}
      />
    </>
  );
}
