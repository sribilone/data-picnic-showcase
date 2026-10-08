import type { Metadata } from "next";
import { Bai_Jamjuree, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bai = Bai_Jamjuree({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai",
});
const space = Space_Grotesk({ subsets: ["latin"], weight: ["600"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "AI for HR Showcase · data.picnic",
  description: "บอร์ดผลงาน Infographic และโหวตผลงานในคลาส",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${bai.variable} ${space.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
