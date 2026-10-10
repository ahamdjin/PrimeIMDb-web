import Footer from "@/components/blocks/Footer";
import Header from "@/components/blocks/Header";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://prime-imdb-web.vercel.app"),
  title: "Prime IMDb | Movie & TV Discovery",
  description: "Explore trending movies, TV shows, cast, ratings, trailers, and official viewing availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          dmSans.variable,
        )}
      >
        <div className="flex min-h-screen w-full flex-col pt-16">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
