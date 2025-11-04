export default function SkeletonLine({
  h = "h-4",
  w = "w-full",
}: {
  h?: string;
  w?: string;
  className?: string;
}) {
  return (
    <div
      role="line"
      className={`${h} ${w} animate-pulse rounded bg-gray-200`}
    />
  );
}
