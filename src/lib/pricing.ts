const EUR_TO_USD_RATE = Number(import.meta.env.VITE_EUR_TO_USD_RATE || 1.1534);

export function convertEurToUsd(valueInEur: number): number {
  return valueInEur * EUR_TO_USD_RATE;
}

export function roundUpTo99(amount: number): number {
  const whole = Math.floor(amount);
  let rounded = whole + 0.99;

  if (rounded < amount) {
    rounded = whole + 1 + 0.99;
  }

  return Number(rounded.toFixed(2));
}

export function convertEurToUsdRounded99(valueInEur: number): number {
  return roundUpTo99(convertEurToUsd(valueInEur));
}
