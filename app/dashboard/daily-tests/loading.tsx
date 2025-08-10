export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        <div className="flex space-x-2">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="h-10 w-80 bg-muted animate-pulse rounded" />
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
