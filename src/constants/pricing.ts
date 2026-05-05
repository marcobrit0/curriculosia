export const PRICING = {
  oneTimeExport: {
    amount: "9,99",
    label: "R$ 9,99",
    description: "pagamento único",
  },
  premiumMonthly: {
    amount: "24,99",
    label: "R$ 24,99/mês",
    cadence: "por mês",
  },
  premiumAnnual: {
    amount: "209,90",
    label: "R$ 209,90/ano",
    monthlyEquivalent: "17,49",
    cadence: "por ano",
  },
} as const;
