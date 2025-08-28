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
    <html lang="en">
      <body className={`${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
} 