import { KbMasterData } from "../types";

export const dummyKbData: KbMasterData[] = [
  {
    id: "kb-1",
    name: "Suntik 3 Bulan",
    tiers: [
      { tier: 1, durationDays: 90 },
      { tier: 2, durationDays: 90 },
      { tier: 3, durationDays: 90 },
    ],
  },
  {
    id: "kb-2",
    name: "Suntik 1 Bulan",
    tiers: [
      { tier: 1, durationDays: 30 },
      { tier: 2, durationDays: 30 },
    ],
  },
  {
    id: "kb-3",
    name: "Implan",
    tiers: [
      { tier: 1, durationDays: 1095 }, // 3 years
    ],
  },
  {
    id: "kb-4",
    name: "Pil KB",
    tiers: [
      { tier: 1, durationDays: 28 },
    ],
  },
];
