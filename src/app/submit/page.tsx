/**
 * ส่งผลงาน · SCR-022 · FR-022 ถึง FR-028 · BR-008 ถึง BR-011
 * ลำดับ ย่อภาพ lib/image.ts → อัปโหลด works/{round}/{uid}/{เวลา}.jpg → submit_work()
 */
import { StudentHeader } from "@/components/StudentHeader";
import { Todo } from "@/components/Todo";

export default function SubmitPage() {
  return (
    <>
      <StudentHeader userName="ผู้เรียน" />
      <main className="mx-auto max-w-[1280px] px-8 pb-14">
        <h1 className="text-5xl font-bold">ส่งผลงานของฉัน</h1>
        <Todo
          scr="SCR-022"
          items={[
            "เลือกไฟล์ PNG หรือ JPG ไม่เกิน 10 MB พร้อมภาพตัวอย่างตามสัดส่วนจริง",
            "ช่องพิมพ์สไตล์และโทนสี พร้อมคำแนะนำให้กดเลือก",
            "ช่องยืนยันไม่มีข้อมูลส่วนบุคคลของผู้อื่น",
            "ส่งสำเร็จแสดงรหัสผลงาน ปิดรับผลงานแล้วแสดงข้อความแทนแบบฟอร์ม",
            "ส่งไม่สำเร็จลองใหม่อัตโนมัติ 2 ครั้ง",
          ]}
        />
      </main>
    </>
  );
}
