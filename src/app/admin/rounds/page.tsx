/**
 * จัดการรอบ · SCR-041 SCR-042 · FR-032 ถึง FR-040 · BR-002 BR-003 BR-013
 * ฟังก์ชัน admin_save_round admin_show_round admin_set_upload admin_set_vote admin_delete_round
 */
import { Todo } from "@/components/Todo";

export default function RoundsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">จัดการรอบ</h1>
      <Todo
        scr="SCR-041 SCR-042"
        items={[
          "การ์ดรอบพร้อมสวิตช์ รับผลงาน โหวต แสดงบนบอร์ด",
          "เลือกแสดงรอบใหม่แล้วรอบเดิมปิดทั้ง 3 สวิตช์",
          "กล่องเพิ่มหรือแก้ไขรอบ ชื่อ ช่วง ตัวอักษรนำหน้า หัวใจต่อคน เวลาที่แสดง โหวตผลงานตัวเอง การแสดงจำนวนหัวใจ",
          "ลบรอบได้เฉพาะรอบที่ยังไม่มีผลงาน",
        ]}
      />
    </>
  );
}
