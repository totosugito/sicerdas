import { format as formatDateFns, parseISO } from "date-fns";

export function to_decimal_formatted(value: number, precision = 2) {
  const formattedNumber = new Intl.NumberFormat('en', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
  return (formattedNumber);
}

export function to_decimal_compact({ value, intl = "en", maximumFractionDigits = 2 }:
  {
    value: number,
    intl?: string,
    maximumFractionDigits?: number
  }) {
  try {
    const formatter = new Intl.NumberFormat(intl, {
      notation: "compact",
      maximumFractionDigits
    });

    return formatter.format(value);
  } catch (e) {
    return (value);
  }
}

export const string_to_locale_date = (
  localeId: string,
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return date.toLocaleString(localeId, options);
};

export function date_to_string(value: Date, format = "yyyy-MM-dd") {
  try {
    return (formatDateFns(value, format));
  } catch (e) {
    return (formatDateFns(new Date(), format));
  }
}

export const string_to_date = (value: string, format = "yyyy-MM-dd") => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Date(); // or return null / throw an error, as needed
  }
  return date;
}

export const string_gmt_to_string = (value: string) => {
  if (!value) return '';
  const v = value.split('T');
  return (v?.[0] ?? "");
}

export function getShortName(fullName: string): string {
  if (!fullName) return '';

  const parts = fullName.trim().split(/\s+/);

  if (parts.length >= 2) {
    // Use first character of first two words
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts[0].length >= 2) {
    // Use first and second character if only one word
    return (parts[0][0] + parts[0][1]).toUpperCase();
  } else {
    // Fallback for very short names
    return parts[0][0].toUpperCase();
  }
}

export function isDateExpired(date: Date) {
  const now = new Date();
  return date < now;
}

interface DateDifferenceResult {
  days: number;
  labels: string;
  style: string;
  value: string
}

export function getDaysFromCurrentDate(t: (key: string) => string, date: Date | string | number): DateDifferenceResult {
  // Ensure the input date is a valid Date object
  const inputDate = date instanceof Date ? date : new Date(date);

  if (isNaN(inputDate.getTime())) {
    return ({
      days: 0,
      labels: "",
      style: "",
      value: ""
    })
  }

  const currentDate = new Date();
  const differenceInMilliseconds = currentDate.getTime() - inputDate.getTime();
  const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  let labels = "";
  if (days < 1) {
    labels = t("labels.today"); // today
  } else if (days < 7) {
    labels = `${days} ${t("labels.dayAgo")}`; // X days ago
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    labels = `${weeks} ${t("labels.weekAgo")}`; // X weeks ago
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    labels = `${months} ${t("labels.monthAgo")}`; // X months ago
  } else {
    const years = Math.floor(days / 365);
    labels = `${years} ${t("labels.yearAgo")}`; // X years ago
  }

  let style = 'text-foreground bg-green-100 border-green-500';
  if (days < 3) {

  }
  else if (days < 7) {
    style = 'text-foreground bg-yellow-100 border-yellow-500';
  }
  else if (days < 30) {
    style = 'text-foreground bg-orange-100 border-orange-500';
  }
  else {
    style = 'text-foreground bg-gray-100 border-gray-500';
  }
  return ({
    days: days,
    labels: labels,
    style: style,
    value: date_to_string(inputDate, "yyyy-MM-dd HH:mm"),
  })
}

export const ObjToOptionList = (obj: Record<string, string>) => {
  return Object.keys(obj).map((key) => ({ value: key, label: obj[key] }));
}

export const ObjToOptionListValue = (obj: Record<string, Record<string, string>>) => {
  return Object.keys(obj).map((key) => ({ value: key, label: obj[key]["value"] }));
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function toPhysics({ value, precision = -1 }: { value: number; precision?: number }): string {
  if (isNaN(value) || (value === undefined)) {
    return "N/A";
  }

  if (value === 0) return "0";

  const absValue = Math.abs(value);
  if ((absValue < 1e-5) || (absValue > 1e+5)) {
    const formattedString = value.toExponential();
    const parts = formattedString.split('e');
    if (parts.length === 2) {
      const mantissa = parseFloat(parts[0]);
      const exponent = parseInt(parts[1], 10);
      return (precision < 0
        ? `${mantissa} × 10<sup>${exponent}</sup>`
        : `${mantissa.toFixed(precision)} × 10<sup>${exponent}</sup>`);
    } else {
      return (precision < 0 ? `${value}` : value.toFixed(precision));
    }
  } else {
    return (precision < 0 ? `${value}` : value.toFixed(precision));
  }
}

export function formatCurrency(amount: number, currency: string = "IDR", locale: string = "id-ID") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
