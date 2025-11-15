export type Role = "interviewee" | "interviewer";

export type TabId = "sent" | "received" | "cancelled" | "scheduled" | "completed";

export interface Tab {
    id: TabId;
    label: string;
}

