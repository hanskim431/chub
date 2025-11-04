import React from "react";

type PillColor =
  | "gray"
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "violet"
  | "point";

const colorStyles: Record<PillColor, string> = {
  gray: "border-gray-300 bg-gray-50 text-gray-700",
  blue: "border-blue-300 bg-blue-50 text-blue-700",
  emerald: "border-emerald-300 bg-emerald-50 text-emerald-700",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
  red: "border-red-300 bg-red-50 text-red-700",
  violet: "border-violet-300 bg-violet-50 text-violet-700",
  point: "border-point-300 bg-point-50 text-point-500",
};

function Pill({
  children,
  color = "gray",
  className = "",
}: {
  children: React.ReactNode;
  color?: PillColor;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full",
        "border px-2.5 py-0.5 text-xs font-semibold",
        colorStyles[color],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Pill;
