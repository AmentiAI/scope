import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { TRPCProvider } from "@/lib/trpc/provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

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
  twitter: {
    card: "summary_large_image",
    title: "CryptoScope",
    description: "The CRM built for Crypto Creators",
  },
}

// Fallback key keeps ClerkProvider happy during builds / demo mode
// Replace with real key from https://dashboard.clerk.com
const CLERK_PK =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xlcmsuY3J5cHRvc2NvcGUuaW8k";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={CLERK_PK}>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <TRPCProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(240 10% 6%)",
                  border: "1px solid hsl(240 4% 15%)",
                  color: "hsl(0 0% 95%)",
                  borderRadius: "12px",
                  fontSize: "13px",
                },
              }}
            />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
