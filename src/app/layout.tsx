import type { Metadata } from "next";
import "./globals.css";
import InteractiveBackground from "@/components/InteractiveBackground";

export const metadata: Metadata = {
  title: "LifeOS — Your autonomous health agent",
  description: "The agent that doesn't recommend. It acts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative">
        <InteractiveBackground />
        <div className="relative z-[1] w-full">{children}</div>
      </body>
    </html>
  );
}
