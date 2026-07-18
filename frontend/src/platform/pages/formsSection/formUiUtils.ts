export function asPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function compactNumber(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("es-DO") : value.toFixed(2);
}
