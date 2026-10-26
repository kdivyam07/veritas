import type { Metadata } from "next";
import "./veritas.css";

export const metadata: Metadata = {
  title: "Veritas | Evidence-first intelligence",
  description: "Know the source. Trust the answer. An enterprise knowledge safety workbench.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
