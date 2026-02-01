import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Paws vs Claws Leaderboard | Puffpaw",
  description: "Our PnL-Efficiency Model eliminates bots. Take high-conviction positions to discover Puffpaw's true price. Track the FDV prediction market and compete for $VAPE rewards!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Paws vs Claws Leaderboard",
    description: "Who will discover the true price first? Human intuition or Machine precision? Track the Puffpaw FDV prediction market and compete for $VAPE rewards!",
    url: "https://pawsvsclaws.xyz",
    siteName: "Paws vs Claws",
    images: [
      {
        url: "https://pawsvsclaws.xyz/paws-vs-claws-logo.png",
        width: 1200,
        height: 630,
        alt: "Paws vs Claws - Puffpaw FDV Prediction Market",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paws vs Claws Leaderboard",
    description: "Who will discover the true price first? Human intuition or Machine precision? Track the Puffpaw FDV prediction market!",
    images: ["https://pawsvsclaws.xyz/paws-vs-claws-logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
