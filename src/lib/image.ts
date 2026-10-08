/**
 * ย่อภาพในเบราว์เซอร์ก่อนอัปโหลด · FR-027 BR-008
 * ด้านยาวไม่เกิน 2,000 พิกเซล บันทึกเป็น JPEG
 */
export const MAX_SIDE = 2000;
export const MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT = ["image/png", "image/jpeg"];

export async function resizeImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (!ACCEPT.includes(file.type)) throw new Error("ใช้ได้เฉพาะไฟล์ PNG หรือ JPG");
  if (file.size > MAX_BYTES) throw new Error("ไฟล์ใหญ่เกิน 10 MB");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
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
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("ย่อภาพไม่สำเร็จ"))), "image/jpeg", 0.88),
  );
  return { blob, width, height };
}

/** URL สาธารณะของภาพใน bucket works */
export function publicImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${path}`;
}
