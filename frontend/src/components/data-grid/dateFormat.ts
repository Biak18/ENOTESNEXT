import dayjs, { type Dayjs } from "dayjs";

/** Normalise a stored value (YYYYMMDD / ISO / Date / dayjs) to a Dayjs. */
export function toDayjs(value: unknown): Dayjs | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return dayjs(value);
  if (dayjs.isDayjs(value)) return value;
  const s = String(value);
  if (/^\d{8}$/.test(s)) return dayjs(s, "YYYYMMDD");
  const d = dayjs(s);
  return d.isValid() ? d : null;
}

/** Format a cell's stored value for display as YYYY/MM/DD. */
export function formatYmd(value: unknown): string {
  const d = toDayjs(value);
  return d && d.isValid() ? d.format("YYYY/MM/DD") : "";
}
