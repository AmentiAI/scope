import type { Metadata } from "next"
import { Inter } from "next/font/google"
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

// ─── Clerk key validation ────────────────────────────────────────────────────
// Clerk v5 ClerkProvider makes server-side API calls to your Clerk domain.
// With a fake key it tries to reach a non-existent domain → 500.
// Only render ClerkProvider when we have a verified real key.

const CLERK_PK = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""

function isRealClerkKey(pk: string): boolean {
  if (!pk.startsWith("pk_")) return false
  try {
    const b64 = pk.replace(/^pk_test_|^pk_live_/, "")
    const decoded = Buffer.from(b64, "base64").toString("utf-8").replace(/\$$/, "")
    // Real Clerk keys decode to: <instance-id>.clerk.accounts.dev or <domain>.clerk.com
    return decoded.includes(".clerk.accounts.dev") || decoded.includes(".clerk.com")
  } catch {
    return false
  }
}

const HAS_REAL_CLERK = isRealClerkKey(CLERK_PK)

// Conditionally load ClerkProvider at module level — only imported when key is real.
// Short-circuit evaluation means require() is never called with a fake key.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MaybeClerkProvider = HAS_REAL_CLERK
  ? (require("@clerk/nextjs") as typeof import("@clerk/nextjs")).ClerkProvider
  : null

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const inner = (
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
  )

  if (MaybeClerkProvider) {
    return <MaybeClerkProvider publishableKey={CLERK_PK}>{inner}</MaybeClerkProvider>
  }

  return inner
}
