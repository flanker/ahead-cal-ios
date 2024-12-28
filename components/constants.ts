interface Holiday {
  name: string;
  type: "holiday";
}

export const HOLIDAYS: Record<string, Holiday> = {
  "2025-01-01": { name: "元旦", type: "holiday" },
  "2025-01-28": { name: "春节", type: "holiday" },
  "2025-01-29": { name: "春节", type: "holiday" },
  "2025-01-30": { name: "春节", type: "holiday" },
  "2025-01-31": { name: "春节", type: "holiday" },
  "2025-02-01": { name: "春节", type: "holiday" },
  "2025-02-02": { name: "春节", type: "holiday" },
  "2025-02-03": { name: "春节", type: "holiday" },
  "2025-02-04": { name: "春节", type: "holiday" },
};
