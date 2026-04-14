import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import SearchBar from "@/components/SearchBar";
import ReaderModeModal from "@/components/ReaderModeModal";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "C++ Codex",
  description: "Quick reference for C++ beginners",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        {/* <ReaderModeModal /> */}
        <main className="relative flex-1 px-4 py-6 max-w-[1400px] mx-auto w-full">
          <SearchBar />
          {children}
        </main>
        <footer className="text-center py-7 text-[11px] tracking-[2px] uppercase text-muted">
          C++17 · Advanced Reference
        </footer>
      </body>
    </html>
  );
}