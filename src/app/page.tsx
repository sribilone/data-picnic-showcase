/**
 * บอร์ดผลงาน · SCR-001 SCR-003 SCR-005 SCR-006 SCR-007
 * FR-006 ถึง FR-021 · BR-001 ถึง BR-006 BR-018 BR-019
 * ข้อมูล public.shown_round() public.board() public.my_votes()
 */
import { StudentHeader } from "@/components/StudentHeader";
import { Todo } from "@/components/Todo";

export default function BoardPage() {
  return (
    <>
      <StudentHeader />
      <main className="mx-auto max-w-[1280px] px-8 pb-14">
        <h1 className="text-5xl font-bold">ผลงาน Infographic</h1>
        <Todo
          scr="SCR-001 SCR-003"
          items={[
            "ดึงรอบที่แสดงด้วย shown_round() ไม่มีแถวให้แสดง SCR-006",
            "ดึงผลงานด้วย board() ไม่มีผลงานให้แสดง SCR-005",
            "การ์ดใช้ ArtFrame กรอบจัตุรัส เรียงตามรหัส",
            "เข้าสู่ระบบแล้วแสดงตัวนับหัวใจ ปุ่มโหวต ถอนโหวต ผลงานของคุณ ครบแล้ว",
            "ปิดโหวตและ counts_visible เป็นจริง แสดงอันดับแบบ SCR-007",
          ]}
        />
      </main>
    </>
  );
}
