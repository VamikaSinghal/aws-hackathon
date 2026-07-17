import type { Metadata } from "next";
import "./globals.css";
import "@/styles/theme.css";
import { ThemeProvider } from "@/lib/theme/context";

export const metadata: Metadata = {
  title: "LifeOS — Your autonomous health agent",
  description: "The agent that doesn't recommend. It acts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative">
        <ThemeProvider>
          <div className="relative w-full">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
