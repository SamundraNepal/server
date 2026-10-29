interface LoadingBetweenPagesProps {
  displayNumber: number;
}

export default function LoadingBetweenPages({
  displayNumber,
}: LoadingBetweenPagesProps) {
  return (
    <div className="min-h-screen bg-green-100 p-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-40 bg-green-200 rounded animate-pulse" />

        <div className="h-10 w-10 bg-green-200 rounded-full animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: displayNumber }).map((_, index) => (
          <div key={index} className="bg-green-50 rounded-xl p-4 shadow">
            {/* Image placeholder */}
            <div className="h-40 w-full bg-green-200 rounded-lg animate-pulse" />

            {/* Text placeholders */}
            <div className="mt-4 space-y-3">
              <div className="h-5 w-3/4 bg-green-200 rounded animate-pulse" />

              <div className="h-4 w-1/2 bg-green-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
