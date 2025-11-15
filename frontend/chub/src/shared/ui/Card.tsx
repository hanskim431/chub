function Card({
    children,
    width = "full",
    height = "fit",
    className = "",
}: {
    children: React.ReactNode;
    width?: string;
    height?: string;
    className?: string;
}) {
    const getWidthClass = (w: string) => {
        if (w === "full") return "w-full";
        if (w === "fit") return "w-fit";
        if (w === "auto") return "w-auto";
        return `w-${w}`;
    };

    const getHeightClass = (h: string) => {
        if (h === "full") return "h-full";
        if (h === "fit") return "h-fit";
        if (h === "auto") return "h-auto";
        return `h-${h}`;
    };

    const widthClass = getWidthClass(width);
    const heightClass = getHeightClass(height);

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
