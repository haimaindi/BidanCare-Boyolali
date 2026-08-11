export type ServiceCategory = 
  | "Umum" 
  | "KB" 
  | "Imunisasi" 
  | "AnteNatal" 
  | "Persalinan" 
  | "Post Natal KF" 
  | "Post Natal KN" 
  | "Post Natal AKHIR NIFAS" 
  | "Mom & Baby Care";

export interface BroadcastConfig {
  id: string;
  category: ServiceCategory;
  followUpDays: number | null;
  reminderDays: number | null;
  followUpTemplate?: string;
  reminderTemplate?: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  type: "Follow Up" | "Reminder";
  content: string;
}
