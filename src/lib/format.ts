export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const daysUntil = (target: string) => {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
