// Resume Entity Types

export interface ResumeResponse {
    pdfUrl: string;
}

export interface ResumeItem {
    id: number;
    name: string;
    pdfUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    data?: T;
    errorCode?: string;
    errorMessage?: string;
    errorData?: unknown;
    timestamp: string;
}
