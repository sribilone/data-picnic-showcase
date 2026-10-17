import { describe, expect, it } from "vitest";
import { toCsv } from "../csv";
import { imageFileName, safeName } from "../exportZip";
import { buildXlsx, sheetName } from "../xlsx";
import { authError, friendlyError } from "../errors";
import { checkFile, thumbPath } from "../image";
import { orientation, ratioText } from "../types";

describe("orientation · BR-019", () => {
  it("แยกแนวภาพ", () => {
    expect(orientation(1600, 900)).toBe("แนวนอน");
    expect(orientation(900, 1200)).toBe("แนวตั้ง");
    expect(orientation(600, 1200)).toBe("แนวตั้งยาว");
    expect(orientation(800, 800)).toBe("จัตุรัส");
  });
  it("ข้อความสัดส่วน", () => {
    expect(ratioText(1920, 1080)).toBe("16:9");
    expect(ratioText(900, 1200)).toBe("3:4");
    expect(ratioText(600, 1200)).toBe("1:2");
    expect(ratioText(1000, 377)).toBe("2.65:1");
  });
});

describe("ไฟล์ภาพ · BR-008", () => {
  const f = (type: string, size: number) => ({ type, size }) as File;
  it("รับ PNG และ JPG ไม่เกิน 10 MB", () => {
    expect(checkFile(f("image/png", 1000))).toBeNull();
    expect(checkFile(f("image/jpeg", 10 * 1024 * 1024))).toBeNull();
  });
  it("ข้อความตาม FRD 8.2", () => {
    expect(checkFile(f("image/gif", 1000))).toBe("ใช้ได้เฉพาะไฟล์ PNG หรือ JPG");
    expect(checkFile(f("image/png", 10 * 1024 * 1024 + 1))).toBe("ไฟล์ใหญ่เกิน 10 MB");
  });
  it("ที่อยู่ภาพย่อ", () => {
    expect(thumbPath("r/u/123.jpg")).toBe("r/u/123_t.jpg");
  });
});

describe("ข้อความผิดพลาด", () => {
  it("ข้อความไทยจาก SQL ผ่านตรง", () => {
    expect(friendlyError("ครบ 3 หัวใจแล้ว ถอนหัวใจจากผลงานอื่นก่อน")).toBe("ครบ 3 หัวใจแล้ว ถอนหัวใจจากผลงานอื่นก่อน");
  });
  it("แปลข้อความระบบ", () => {
    expect(friendlyError('duplicate key value violates unique constraint "rounds_prefix_unique"')).toBe("ตัวอักษรนำหน้ารหัสนี้มีรอบอื่นใช้แล้ว");
    expect(friendlyError("TypeError: Failed to fetch")).toBe("เชื่อมต่อไม่ได้ ลองอีกครั้ง");
    expect(friendlyError("something odd")).toBe("ทำรายการไม่สำเร็จ ลองอีกครั้ง");
  });
});

describe("CSV · FR-048", () => {
  it("มี BOM และหนีเครื่องหมายคำพูด", () => {
    const csv = toCsv(["รหัส", "สไตล์"], [["A01", 'ป๊อป "อาร์ต"']]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"A01","ป๊อป ""อาร์ต"""');
  });
});

describe("authError · FR-001", () => {
  it("แปลข้อผิดพลาดตอนเข้าสู่ระบบ", () => {
    expect(authError("Invalid login credentials")).toBe("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    expect(authError("User already registered")).toBe("อีเมลนี้สมัครแล้ว ให้กดเข้าสู่ระบบ");
    expect(authError("Password should be at least 6 characters.")).toBe("รหัสผ่านอย่างน้อย 6 ตัว");
    expect(authError("Request rate limit reached")).toBe("มีคนเข้าพร้อมกันมาก รอสักครู่แล้วลองอีกครั้ง");
    expect(authError("Email not confirmed")).toBe("สมัครแล้ว แต่ยังเข้าใช้ไม่ได้ แจ้งผู้สอน");
    expect(authError("something else")).toBe("เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง");
  });
});

describe("export zip names · FR-048", () => {
  it("ตั้งชื่อภาพ รหัส_ชื่อ และกันชื่อซ้ำ", () => {
    const used = new Set<string>();
    expect(imageFileName("A01", "สมศรี ใจดี", "r/u/1.jpg", used)).toBe("A01_สมศรี ใจดี.jpg");
    expect(imageFileName("A01", "สมศรี ใจดี", "r/u/2.jpg", used)).toBe("A01_สมศรี ใจดี (2).jpg");
    expect(imageFileName("A02", 'a/b:c*?"<>|', "x.jpg", used)).toBe("A02_a b c.jpg");
    expect(safeName("  รอบที่ 1 / เช้า  ")).toBe("รอบที่ 1 เช้า");
  });
  it("ชื่อชีต Excel ไม่เกิน 31 ตัว และไม่มีอักขระต้องห้าม", () => {
    expect(sheetName("รอบ[1]:ทดสอบ")).toBe("รอบ 1 ทดสอบ");
    expect(sheetName("x".repeat(40)).length).toBe(31);
    expect(buildXlsx("s", ["a"], [[1]])[0]).toBe(0x50);
  });
});
