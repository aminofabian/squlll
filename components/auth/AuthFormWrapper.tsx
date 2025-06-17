import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface AuthFormWrapperProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  titleClassName?: string
}

export function AuthWrapper({ 
  title, 
  description, 
  children, 
  className = "", 
  titleClassName = "" 
}: AuthFormWrapperProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-background ${className}`}>
      <Card className="w-full max-w-md border border-border shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className={`text-2xl font-semibold ${titleClassName}`}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
