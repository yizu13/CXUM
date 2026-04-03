const daysAbbreviations = [
  "Dom", "Lun", "Mar", "Miér", "Jue", "Vie", "Sáb"
];

export const StatusCheckFunction = (schedule: string) => {
  const parts = schedule.split(" ");
  if (parts.length < 2) return "closed";

  const [daysPart, timePart] = parts;
  const daysConsiderated = daysPart.split("-");
  const timeConsiderated = timePart.split("-");

  if (daysConsiderated.length < 2 || timeConsiderated.length < 2) return "closed";

  const startDayIdx = daysAbbreviations.indexOf(daysConsiderated[0]);
  const endDayIdx   = daysAbbreviations.indexOf(daysConsiderated[1]);

  if (startDayIdx === -1 || endDayIdx === -1) return "closed";

  const openDays: string[] = [];
  let idx = startDayIdx;
  while (idx !== endDayIdx) {
    openDays.push(daysAbbreviations[idx]);
    idx = (idx + 1) % 7;
  }
  openDays.push(daysAbbreviations[endDayIdx]);

  const now = new Date();
  const currentDay = daysAbbreviations[now.getDay()];

  if (!openDays.includes(currentDay)) return "closed";

  const start = toTotalMinutes(timeConsiderated[0]);
  const end   = toTotalMinutes(timeConsiderated[1]);

  if (start === null || end === null) return "closed";

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let isOpen: boolean;
  if (start < end) {
    isOpen = currentMinutes >= start && currentMinutes < end;
  } else {
    isOpen = currentMinutes >= start || currentMinutes < end;
  }

  if (!isOpen) return "closed";

  const minutesToClose = (end - currentMinutes + 1440) % 1440;

  if (minutesToClose <= 120) return "closing_soon"; 
  return "open";
};

function toTotalMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2})(?::(\d{2}))?(AM|PM)$/i);
  if (!match) return null;

  let hour   = parseInt(match[1], 10);
  const mins = parseInt(match[2] ?? "0", 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + mins;
}