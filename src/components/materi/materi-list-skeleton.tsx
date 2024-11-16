// src/components/materi/materi-list-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function MateriListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-center mt-4">
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </CardContent>
    </Card>
  )
}