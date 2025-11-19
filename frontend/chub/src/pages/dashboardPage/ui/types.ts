export type Role = "interviewee" | "interviewer";

export type TabId = "sent" | "received" | "scheduled" | "completed";

export interface Tab {
    id: TabId;
    label: string;
}

