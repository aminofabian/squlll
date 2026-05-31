import { Outfit } from "next/font/google"
import { RealtimeWrapper } from "./RealtimeWrapper"

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
})

export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${outfit.variable} font-sans min-h-screen`}>
      <RealtimeWrapper>{children}</RealtimeWrapper>
    </div>
  )
} 