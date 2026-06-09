import type { Metadata } from "next";
import React from "react";

import { appCopy } from "@/content/ro";

import "./globals.css";

export const metadata: Metadata = {
  title: appCopy.app.name,
  description: appCopy.app.title
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
