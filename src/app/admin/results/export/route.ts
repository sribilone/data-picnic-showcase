import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";
import type { AdminResultRow } from "@/lib/types";

/** ส่งออกผลโหวตเป็น CSV ไม่มีข้อมูลผู้โหวต · FR-048 BR-007 */
export async function GET(request: Request) {
  const round = new URL(request.url).searchParams.get("round");
  if (!round) return NextResponse.json({ error: "ต้องระบุรอบ" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_results", { p_round: round });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  const rows = (data ?? []) as AdminResultRow[];
  const csv = toCsv(
    ["อันดับ", "รหัส", "เจ้าของผลงาน", "อีเมล", "สไตล์", "โทนสี", "หัวใจ"],
    rows.map((r) => [r.rank, r.code, r.owner_name, r.owner_email, r.style, r.tone, r.hearts]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="showcase-results-${round}.csv"`,
    },
  });
}
