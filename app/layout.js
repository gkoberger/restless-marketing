import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Restless",
  description: "Coming soon",
  openGraph: {
    title: "Restless",
    description: "Coming soon",
    images: [{ url: "/social.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restless",
    description: "Coming soon",
    images: ["/social.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={mono.className}>{children}</body>
    </html>
  );
}
