import type { InterviewRequestStatus } from "@/pages/dashboardPage/api/interviewRequests";
import {
    getStatusColor,
    getStatusTextColor,
    getStatusLabel,
} from "@/pages/dashboardPage/ui/utils/statusUtils";

interface StatusBadgeProps {
    status: InterviewRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <div
            className={`${getStatusColor(
                status
            )} w-20 flex-shrink-0 flex flex-col items-center justify-center px-2`}
        >
            <span
                className={`${getStatusTextColor(
                    status
                )} text-lg font-bold whitespace-nowrap [writing-mode:vertical-rl]`}
            >
                {getStatusLabel(status)}
            </span>
        </div>
    );
}
