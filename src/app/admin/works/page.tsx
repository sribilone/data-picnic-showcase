/**
 * จัดการผลงาน · SCR-043 · FR-041 ถึง FR-045 · BR-014 BR-015
 * อ่านตาราง works ได้ตรงเพราะ RLS ให้ผู้ดูแลอ่าน · admin_set_work_hidden admin_delete_work
 */
import { Todo } from "@/components/Todo";

export default function WorksPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">จัดการผลงาน</h1>
      <Todo
        scr="SCR-043"
        items={[
          "ตารางผลงานของรอบ รหัส ภาพ เจ้าของ อีเมล สไตล์ โทนสี เวลาส่ง สถานะ",
          "ค้นหาด้วยรหัส ชื่อ หรืออีเมล และตัวกรองสถานะ",
          "ซ่อน นำกลับขึ้นบอร์ด และลบ พร้อมกล่องยืนยัน",
        ]}
      />
    </>
  );
}
