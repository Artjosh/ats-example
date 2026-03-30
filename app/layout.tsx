import type { Metadata } from "next";
import "./globals.css";
import TopNavBar from "./components/TopNavBar";
import BackgroundDecorations from "./components/BackgroundDecorations";
import TutorialOverlay from "./components/TutorialOverlay";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "SmartScreen ATS - App",
  description: "SmartScreen ATS - AI-powered resume screening",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script src="https://js.puter.com/v2/" defer></script>
      </head>
      <body className="bg-background text-on-background font-body selection:bg-primary/30 min-h-screen relative overflow-x-hidden">
        <AppProvider>
          <TopNavBar />
          <TutorialOverlay />
          {children}
          <BackgroundDecorations />
        </AppProvider>
      </body>
    </html>
  );
}
