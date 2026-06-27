import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¿Qué nombre le ponemos, Valentina?",
  description: "Controla la vida útil de tus alimentos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="max-w-md mx-auto min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
