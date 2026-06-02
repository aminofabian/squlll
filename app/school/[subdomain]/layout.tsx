import { RealtimeWrapper } from "./RealtimeWrapper"

export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen font-sans">
      <RealtimeWrapper>{children}</RealtimeWrapper>
    </div>
  )
}
