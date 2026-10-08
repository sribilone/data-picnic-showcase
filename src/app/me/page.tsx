/**
 * ผลงานของฉัน · SCR-021 · FR-028 ถึง FR-031 FR-056 · BR-006 BR-007 BR-012
 * ข้อมูล public.my_works() public.my_votes()
 */
import { StudentHeader } from "@/components/StudentHeader";
import { Todo } from "@/components/Todo";

export default function MyWorkPage() {
  return (
    <>
      <StudentHeader userName="ผู้เรียน" />
      <main className="mx-auto max-w-[1280px] px-8 pb-14">
        <h1 className="text-5xl font-bold">ผลงานของฉัน</h1>
        <Todo
          scr="SCR-021"
          items={[
            "การ์ดผลงานแต่ละรอบ สถานะแสดงอยู่ ซ่อนอยู่ ปิดโหวตแล้ว",
            "ปุ่มแก้ไขผลงาน และยกเลิกการส่งผลงาน พร้อมกล่องยืนยัน เมื่อรับผลงานเปิดอยู่",
            "ยกเลิกแล้วเรียก cancel_work() แล้วลบไฟล์ใน Storage ตามที่อยู่ที่คืนมา",
            "หลังปิดโหวต แสดงจำนวนหัวใจและอันดับ ไม่แสดงว่าใครโหวตให้",
            "รายการหัวใจที่ฉันให้ในรอบที่แสดง",
          ]}
        />
      </main>
    </>
  );
}
