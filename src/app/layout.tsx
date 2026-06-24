import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "提肛助手 - 科学盆底肌训练",
  description: "科学分级盆底肌训练课程，动画引导，语音辅助，AI 姿态矫正",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar />
        <main className="pt-14 pb-8">{children}</main>
      </body>
    </html>
  );
}
