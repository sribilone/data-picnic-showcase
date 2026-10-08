/**
 * ย่อภาพในเบราว์เซอร์ก่อนอัปโหลด · FR-027 BR-008 NFR-01
 * ภาพหลักด้านยาวไม่เกิน 2,000 พิกเซล · ภาพย่อสำหรับบอร์ดด้านยาวไม่เกิน 640 พิกเซล
 */
export const MAX_SIDE = 2000;
export const THUMB_SIDE = 640;
export const MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT = ["image/png", "image/jpeg"];

export type Resized = { blob: Blob; width: number; height: number };

/** ตรวจไฟล์ คืนข้อความผิดพลาดตาม FRD ข้อ 8.2 หรือ null */
export function checkFile(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return "ใช้ได้เฉพาะไฟล์ PNG หรือ JPG";
  if (file.size > MAX_BYTES) return "ไฟล์ใหญ่เกิน 10 MB";
  return null;
}

async function draw(bitmap: ImageBitmap, maxSide: number, quality: number): Promise<Resized> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF"; // PNG โปร่งใสให้พื้นขาว
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("ย่อภาพไม่สำเร็จ"))), "image/jpeg", quality),
  );
  return { blob, width, height };
}

/** คืนภาพหลักและภาพย่อ */
export async function prepareImages(file: File): Promise<{ main: Resized; thumb: Resized }> {
  const bitmap = await createImageBitmap(file);
  const main = await draw(bitmap, MAX_SIDE, 0.88);
  const thumb = await draw(bitmap, THUMB_SIDE, 0.82);
  bitmap.close();
  return { main, thumb };
}

/** ที่อยู่ภาพย่อ เก็บคู่กับภาพหลัก */
export function thumbPath(path: string) {
  return path.replace(/\.jpg$/, "_t.jpg");
}

/** URL สาธารณะของภาพใน bucket works */
export function publicImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${path}`;
}
