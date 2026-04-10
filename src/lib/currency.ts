const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCurrencyCLP(value: number) {
  return currencyFormatter.format(value);
}

export function formatSignedCurrencyCLP(value: number) {
  const prefix = value > 0 ? "+" : "";

  return `${prefix}${formatCurrencyCLP(value)}`;
}
