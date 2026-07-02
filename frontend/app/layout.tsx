import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "QuipuRecicla",
  description: "Reduce el desperdicio alimentario con inteligencia artificial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="max-w-md mx-auto min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
