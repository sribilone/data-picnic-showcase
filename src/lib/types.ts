// ชนิดข้อมูลที่ฟังก์ชันในฐานข้อมูลคืนมา · supabase/migrations/20261008000003_functions.sql

export type VoteStatus = "not_started" | "open" | "closed";
export type ShowCounts = "after_close" | "always" | "never";

export type ShownRound = {
  id: string;
  name: string;
  period: string;
  hearts_per_user: number;
  upload_open: boolean;
  vote_status: VoteStatus;
  counts_visible: boolean;
  upload_close_label: string | null;
  vote_close_label: string | null;
};

export type BoardWork = {
  work_id: string;
  code: string;
  style: string;
  tone: string;
  image_path: string;
  image_w: number;
  image_h: number;
  hearts: number | null;
  rank: number | null;
  is_mine: boolean;
};

export type MyWork = {
  work_id: string;
  round_id: string;
  round_name: string;
  code: string;
  style: string;
  tone: string;
  image_path: string;
  image_w: number;
  image_h: number;
  status: "shown" | "hidden";
  upload_open: boolean;
  vote_status: VoteStatus;
  hearts: number | null;
  rank: number | null;
  total: number | null;
};

export type AdminResultRow = {
  rank: number;
  code: string;
  owner_name: string;
  owner_email: string;
  style: string;
  tone: string;
  hearts: number;
  image_path: string;
  image_w: number;
  image_h: number;
};

/** สัดส่วนภาพ · ข้อ 4.3 ของ FRD */
export function orientation(w: number, h: number) {
  if (w > h) return "แนวนอน";
  if (w === h) return "จัตุรัส";
  return h >= 2 * w ? "แนวตั้งยาว" : "แนวตั้ง";
}
