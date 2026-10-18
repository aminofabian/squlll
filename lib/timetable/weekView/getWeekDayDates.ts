const MS_PER_DAY = 86_400_000;
const MONDAY = 1;

export type WeekDayDate = {
  dayOfWeek: number;
  dayOfMonth: number;
  monthShort: string;
};

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Calendar dates for each weekday, given the Monday `YYYY-MM-DD` of the week. */
export function getWeekDayDates(
  weekStartYmd: string,
  dayNumbers: readonly number[],
): WeekDayDate[] {
  const [year, month, day] = weekStartYmd.split("-").map(Number);
  const mondayUtc = Date.UTC(year, month - 1, day);

  return dayNumbers.map((dayOfWeek) => {
    const date = new Date(mondayUtc + (dayOfWeek - MONDAY) * MS_PER_DAY);
    return {
      dayOfWeek,
      dayOfMonth: date.getUTCDate(),
      monthShort: MONTH_SHORT_NAMES[date.getUTCMonth()],
    };
  });
}
