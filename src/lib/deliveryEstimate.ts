const DEFAULT_LOCALE = "en-US";

type DeliveryEstimateConfig = {
  minDaysAfterToday?: number;
  maxDaysAfterToday?: number;
  baseDate?: Date;
  locale?: string;
};

function addDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + Math.max(0, Math.floor(days)));
  return result;
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getEstimatedDeliveryRange(config: DeliveryEstimateConfig = {}): string {
  const {
    minDaysAfterToday = 5,
    maxDaysAfterToday = 10,
    baseDate = new Date(),
    locale = DEFAULT_LOCALE,
  } = config;

  const start = addDays(baseDate, minDaysAfterToday);
  const end = addDays(baseDate, maxDaysAfterToday);

  return `${formatDate(start, locale)} - ${formatDate(end, locale)}`;
}
