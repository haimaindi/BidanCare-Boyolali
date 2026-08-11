export interface FollowUpItem {
  id: string;
  whatsapp: string;
  panggilanType: "Follow Up" | "Reminder";
  patientName: string;
  visitType: string;
  templateMessage: string;
  status: "Pending" | "Sent";
}
