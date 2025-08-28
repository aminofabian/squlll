import { Outfit } from "next/font/google"

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
      {children}
    </div>
  )
} 