/**
 * ผลโหวตและส่งออก · SCR-044 · FR-046 ถึง FR-049 · BR-007 BR-018
 * admin_results() admin_round_stats() · ส่งออก CSV ที่ /admin/results/export?round=
 */
import { Todo } from "@/components/Todo";

export default function ResultsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">ผลโหวตและส่งออก</h1>
      <Todo
        scr="SCR-044"
        items={[
          "ตัวเลือกรอบ และตัวเลขสรุป ผลงาน ผู้โหวต หัวใจทั้งหมด สถานะ",
          "ตารางอันดับพร้อมชื่อและอีเมลเจ้าของ หัวใจเท่ากันได้อันดับเดียวกัน",
          "ปุ่มส่งออก CSV",
          "ส่งออก Google Sheets รอคำตอบ OQ-06",
        ]}
      />
    </>
  );
}
