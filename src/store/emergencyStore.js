import { create } from "zustand";

export const useEmergencyStore = create((set) => ({
  emergencyActive: false,
  emergencyReason: "",
  lastSOSAt: null,

  startEmergency: (reason = "Manual SOS") =>
    set({
      emergencyActive: true,
      emergencyReason: reason,
      lastSOSAt: Date.now(),
    }),

  stopEmergency: () =>
    set({
      emergencyActive: false,
      emergencyReason: "",
      lastSOSAt: null,
    }),
}));
