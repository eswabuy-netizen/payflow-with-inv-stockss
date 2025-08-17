export const formatCurrency = (amount: number | undefined | null): string => {
  const safeAmount = amount ?? 0;
  return `E${safeAmount.toLocaleString('en-SZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};