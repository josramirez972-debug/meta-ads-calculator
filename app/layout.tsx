import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "META ADS ROI CALCULATOR | Traffiker Digital",
  description:
    "Calculadora profesional de planificación publicitaria y rentabilidad para campañas de Facebook e Instagram Meta Ads.",
  keywords: [
    "Meta Ads",
    "Calculadora ROI",
    "ROAS",
    "CPA",
    "CPL",
    "Traffiker Digital",
    "Presupuesto publicitario",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className="bg-traffiker-dark text-slate-100 flex flex-col min-h-screen selection:bg-traffiker-orange selection:text-white"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <AuthGuard>{children}</AuthGuard>
        </main>
        <Footer />
      </body>
    </html>
  );
}
