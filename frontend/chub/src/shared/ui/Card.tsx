function Card({
  children,
  width = "full",
  height = "full",
  className = "",
}: {
  children: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
}) {
  const widthClass = width === "full" ? "w-full" : `w-${width}`;
  const heightClass = height === "full" ? "h-full" : `h-${height}`;

  return (
    <div
      aria-label="card"
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${widthClass} ${heightClass} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
