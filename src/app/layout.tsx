import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar />
        <main className="pt-14 pb-8">{children}</main>
      </body>
    </html>
  );
}
