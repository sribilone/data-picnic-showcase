# หน้าจอและธีม

หน้าจอทั้งหมดอยู่ใน Claude Design · Showcase โหวตผลงาน Infographic
https://claude.ai/artifact/YU5EgBTNaxmwCQVaSKNCWd

ธีม data.picnic Dark Glassmorphism
https://claude.ai/artifact/HsYWnZAQY5waELiJUtQSAF

## หน้าจอกับเส้นทาง

| Board ใน Claude Design | SCR | เส้นทาง |
|---|---|---|
| Main | SCR-001 | `/` ยังไม่เข้าสู่ระบบ |
| Login | SCR-002 | `/login` |
| BoardVote | SCR-003 | `/` เข้าสู่ระบบแล้ว |
| Detail · DetailLandscape · DetailTall | SCR-004 | `/works/[code]` |
| Round2 | SCR-005 | `/` รอบที่แสดงยังไม่มีผลงาน |
| NoRound | SCR-006 | `/` ไม่มีรอบที่แสดง |
| Results | SCR-007 | `/` หลังปิดโหวต |
| MyWork · MyWorkClosed | SCR-021 | `/me` |
| Upload | SCR-022 | `/submit` |
| AdminRounds · AdminRoundEdit | SCR-041 SCR-042 | `/admin/rounds` |
| AdminWorks | SCR-043 | `/admin/works` |
| AdminResults | SCR-044 | `/admin/results` |
| AdminSettings | SCR-045 | `/admin/settings` |
| NoAccess | SCR-046 | `/no-access` |

## ค่าสีและตัวอักษร

ประกาศไว้ใน `src/app/globals.css` บล็อก `@theme`

| ชื่อ | ค่า | ใช้กับ |
|---|---|---|
| ink | #04120C | ตัวอักษรบนปุ่มสีสว่าง |
| bg-1 bg-2 bg-3 | #05140E #020604 #06281D | พื้นหลังไล่สี |
| mint | #3EE0A1 | สีหลัก ปุ่ม หัวใจ |
| glow | #7CF5C4 | ขอบ ไอคอน ลิงก์ |
| ice | #CFFFE3 | ตัวอักษรรอง |
| warn | #FF9A3D | ปุ่มลบ ยกเลิก คำเตือน |
| ตัวอักษร | Bai Jamjuree | ทั้งเว็บ |
| โลโก้ | Space Grotesk 600 บนพื้นขาวทรงแคปซูล | |

## กติกาการแสดงภาพ

บอร์ดใช้กรอบจัตุรัสเท่ากันทุกใบ ภาพไม่ตัดขอบ ไม่ยืด ไม่หมุน · DEC-008 BR-019
ผลงานแบบขยายเลือกโครงตามสัดส่วนภาพ ดู FRD ข้อ 4.3
