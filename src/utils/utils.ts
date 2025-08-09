export function isNumber(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}
