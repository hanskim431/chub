import type { InterviewRequestStatus } from "@/pages/dashboardPage/api/interviewRequests";

interface StatusFilterProps {
    filters: { value: InterviewRequestStatus | undefined; label: string }[];
    selectedFilter: InterviewRequestStatus | undefined;
    onFilterChange: (filter: InterviewRequestStatus | undefined) => void;
}

export function StatusFilter({
    filters,
    selectedFilter,
    onFilterChange,
}: StatusFilterProps) {
    return (
        <div className="flex gap-2 mb-6 flex-wrap">
            {filters.map((filter) => (
                <button
                    key={filter.value ?? "all"}
                    onClick={() => onFilterChange(filter.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedFilter === filter.value
                            ? "bg-point text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
