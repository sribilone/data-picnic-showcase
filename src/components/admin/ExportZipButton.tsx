"use client";

/**
 * ดาวน์โหลดภาพผลงานและไฟล์ Excel เป็น .zip · SCR-044 · FR-048 · BR-007
 * 1 โฟลเดอร์ต่อ 1 รอบ · ภาพชื่อ รหัส_ชื่อ-นามสกุล · Excel มีหัวใจที่ได้รับ ไม่มีข้อมูลผู้โหวต
 * รวมไฟล์ในเบราว์เซอร์ เพราะ Vercel จำกัดขนาดข้อมูลที่ส่งกลับจากเซิร์ฟเวอร์
 */
import { useState } from "react";
import { zipSync } from "fflate";
import { getExportData } from "@/app/admin/actions";
import { EXCEL_HEADER, EXCEL_WIDTHS, excelRow, imageFileName, safeName } from "@/lib/exportZip";
import { publicImageUrl } from "@/lib/image";
import { orientation } from "@/lib/types";
import { buildXlsx } from "@/lib/xlsx";

type Props = { roundId: string; roundPrefix: string; allRoundIds: string[] };

export function ExportZipButton({ roundId, roundPrefix, allRoundIds }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  async function run(ids: string[], zipLabel: string) {
    setBusy(true);
    setMsg({ text: "กำลังเตรียมข้อมูล" });
    try {
      const res = await getExportData(ids);
      if (res.error || !res.rounds) throw new Error(res.error ?? "ส่งออกไม่สำเร็จ ลองอีกครั้ง");
      const total = res.rounds.reduce((n, r) => n + r.works.length, 0);
      const files: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
      const usedFolders = new Set<string>();
      let done = 0;
      const missing: string[] = [];

      for (const r of res.rounds) {
        let folder = safeName(r.name) || "รอบ";
        for (let i = 2; usedFolders.has(folder); i++) folder = `${safeName(r.name)} (${i})`;
        usedFolders.add(folder);
        const used = new Set<string>([`${folder}.xlsx`.toLowerCase()]);
        const rows = [];
        // โหลดภาพทีละ 4 ไฟล์
        const names = r.works.map((w) => imageFileName(w.code, w.owner_name, w.image_path, used));
        for (let i = 0; i < r.works.length; i += 4) {
          await Promise.all(r.works.slice(i, i + 4).map(async (w, k) => {
            const name = names[i + k];
            try {
              const resp = await fetch(publicImageUrl(w.image_path), { cache: "no-store" });
              if (!resp.ok) throw new Error(String(resp.status));
              files[`${folder}/${name}`] = [new Uint8Array(await resp.arrayBuffer()), { level: 0 }];
            } catch {
              missing.push(w.code);
            }
            done++;
            setMsg({ text: `กำลังโหลดภาพ ${done}/${total}` });
          }));
        }
        for (let i = 0; i < r.works.length; i++) rows.push(excelRow(r.works[i], names[i], orientation));
        files[`${folder}/${folder}.xlsx`] = [buildXlsx(r.name, EXCEL_HEADER, rows, EXCEL_WIDTHS), { level: 0 }];
      }

      setMsg({ text: "กำลังรวมไฟล์" });
      const zip = zipSync(files);
      const url = URL.createObjectURL(new Blob([zip as BlobPart], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      // ชื่อ .zip ใช้อักษรอังกฤษ เบราว์เซอร์บางตัวไม่รับชื่อไฟล์ดาวน์โหลดภาษาไทย ชื่อโฟลเดอร์และไฟล์ข้างในยังเป็นภาษาไทย
      a.download = `showcase_${zipLabel}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setMsg(missing.length
        ? { text: `ดาวน์โหลดแล้ว ภาพที่โหลดไม่ได้ ${missing.join(", ")}`, error: true }
        : { text: `ดาวน์โหลดแล้ว ${total} ผลงาน` });
    } catch (e) {
      setMsg({ text: e instanceof Error && /[฀-๿]/.test(e.message) ? e.message : "ส่งออกไม่สำเร็จ ลองอีกครั้ง", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={busy} onClick={() => run([roundId], `round-${roundPrefix}`)}
        className="btn-ghost h-[46px] px-5 text-[15px] disabled:opacity-40">ภาพ + Excel รอบนี้</button>
      {allRoundIds.length > 1 && (
        <button type="button" disabled={busy} onClick={() => run(allRoundIds, "all-rounds")}
          className="btn-ghost h-[46px] px-5 text-[15px] disabled:opacity-40">ภาพ + Excel ทุกรอบ</button>
      )}
      {msg && <span role="status" className={`text-sm ${msg.error ? "text-warn-soft" : "text-ice"}`}>{msg.text}</span>}
    </div>
  );
}
