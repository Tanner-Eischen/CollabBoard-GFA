import type { Metadata } from "next";
import { Providers } from "@/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabBoard",
  description: "Collaborative whiteboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
