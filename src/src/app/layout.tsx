import type { Metadata } from "next";
import "./globals.css";

import ErrorReporter from "@/components/ErrorReporter";

import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "StackSense | See your stack clearly",
  description: "Private supplement and peptide logger with safety clarity.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AppProvider>
          <ErrorReporter />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
