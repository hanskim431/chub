import type { Role } from "../types";

interface RoleSwitcherProps {
    role: Role;
    onRoleChange: (role: Role) => void;
}

export function RoleSwitcher({ role, onRoleChange }: RoleSwitcherProps) {
    return (
        <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1">
            <button
                onClick={() => onRoleChange("interviewee")}
                className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all ${
                    role === "interviewee"
                        ? "bg-white text-point shadow-md"
                        : "text-gray-600 hover:text-point hover:bg-gray-50"
                }`}
            >
                면접자
            </button>
            <button
                onClick={() => onRoleChange("interviewer")}
                className={`flex-1 py-2 rounded-lg text-base font-semibold transition-all ${
                    role === "interviewer"
                        ? "bg-white text-point shadow-md"
                        : "text-gray-600 hover:text-point hover:bg-gray-50"
                }`}
            >
                면접관
            </button>
        </div>
    );
}

