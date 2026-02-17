import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { TRPCProvider } from "@/lib/trpc/provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoScope — Crypto Twitter Analytics",
  description:
    "Track your crypto Twitter growth. Monitor followers, engagement, mentions, and competitors for your NFT, ordinals, or crypto community.",
  keywords: ["crypto twitter", "nft analytics", "twitter growth", "ordinals", "web3 analytics"],
  authors: [{ name: "CryptoScope" }],
  openGraph: {
    title: "CryptoScope — Crypto Twitter Analytics",
    description: "Track your crypto Twitter growth in real-time.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
