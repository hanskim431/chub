import type { Tab, TabId } from "../types";

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function TabNavigation({
    tabs,
    activeTab,
    onTabChange,
}: TabNavigationProps) {
    return (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                        activeTab === tab.id
                            ? "text-point border-point"
                            : "text-gray-600 border-transparent hover:text-point hover:border-point-200"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

