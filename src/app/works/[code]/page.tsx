/**
 * ผลงานแบบขยาย · SCR-004 · FR-009 FR-010 FR-015 ถึง FR-021 FR-057 FR-058 · BR-019
 * แนวตั้ง ภาพซ้าย ข้อมูลขวา · แนวนอน ภาพบน ข้อมูลล่าง · แนวตั้งยาว กรอบเลื่อน + ซูม
 */
import { StudentHeader } from "@/components/StudentHeader";
import { Todo } from "@/components/Todo";

export default async function WorkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <>
      <StudentHeader />
      <main className="mx-auto max-w-[1280px] px-8 pb-14">
        <h1 className="text-6xl font-bold">#{code}</h1>
        <Todo
          scr="SCR-004"
          items={[
            "หาผลงานจาก board() ด้วยรหัส ไม่พบให้แสดงหน้าไม่พบ",
            "เลือกโครงตาม orientation() ใน lib/types.ts",
            "ภาพแนวตั้งยาวใช้ .tall-scroll รางเลื่อนสีมิ้นต์ ป้ายเลื่อนลงหายเมื่อถึงล่างสุด",
            "ปุ่มโหวต ถอนโหวต ผลงานก่อนหน้า ผลงานถัดไป",
          ]}
        />
      </main>
    </>
  );
}
