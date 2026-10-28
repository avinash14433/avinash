/** "Item total: $29.99" -> 29.99 */
export const parsePrice = (text: string): number => {
  const match = text.match(/\d+(\.\d+)?/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[0]);
};

/** Compare money in whole cents to avoid floating-point errors. */
export const toCents = (amount: number): number => Math.round(amount * 100);
