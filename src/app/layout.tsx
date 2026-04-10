import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { resolveAppUrl } from "@/lib/site-url";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(resolveAppUrl()),
  title: {
    default: "FLUJO BYL",
    template: "%s | FLUJO BYL",
  },
  description:
    "Asistente financiero personal para registrar movimientos, clasificarlos y ver tu presupuesto con claridad.",
  manifest: "/manifest.webmanifest",
  applicationName: "FLUJO BYL",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FLUJO BYL",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c7c59",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${manrope.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
