interface DisplayStorageProps {
  totalConsumeSize: number;
  currentSizeInGB: number;
  viewMode?: 1 | 2;
}

export default function DisplayStorage({
  totalConsumeSize,
  currentSizeInGB,
  viewMode = 1,
}: DisplayStorageProps) {
  const bytesToGB = Number(
    (totalConsumeSize / (1024 * 1024 * 1024)).toFixed(2),
  );

  const percentage = Math.min(
    Number(((bytesToGB / currentSizeInGB) * 100).toFixed(1)),
    100,
  );

  if (viewMode === 2) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Storage
        </span>

        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span className="text-[11px] font-semibold text-gray-500">
          {bytesToGB}/{currentSizeInGB} GB
        </span>

        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">
        Storage
      </span>

      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-gray-800">{bytesToGB}</span>
        <span className="text-xs font-bold text-gray-400">GB</span>
        <span className="mx-1 text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-500">
          {currentSizeInGB} GB
        </span>
      </div>

      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-[10px] font-semibold text-gray-400">
        {percentage}% used
      </span>
    </div>
  );
}
