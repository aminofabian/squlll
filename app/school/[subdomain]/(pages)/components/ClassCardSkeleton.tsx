import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ClassCardSkeleton() {
  return (
    <Card className="border-l-4 overflow-hidden" style={{ borderLeftColor: '#3b82f6' }}>
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-[250px] mb-3" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="mb-5 bg-custom-blue/10 p-4 shadow-sm border border-custom-blue/20">
          <div className="flex items-center mb-3">
            <Skeleton className="h-6 w-6 mr-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-3 shadow-sm border border-custom-blue/10">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 