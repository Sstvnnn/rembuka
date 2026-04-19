export function calculateContribution(taxPaid: number, totalBudget: number, itemAmount: number) {
  if (totalBudget === 0) return 0;
  const ratio = itemAmount / totalBudget;
  return taxPaid * ratio;
}
