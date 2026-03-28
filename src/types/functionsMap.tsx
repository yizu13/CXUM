const daysAbbreviations = [
  "Dom", "Lun", "Mar", "Miér", "Jue", "Vie", "Sáb"
]

export const StatusCheckFunction = (schedule: string) => {
  const generatedArray = schedule.split(" ");
  const timeConsiderated = generatedArray[1].split("-");
  const daysConsiderated = generatedArray[0].split("-");

  const openDays = daysAbbreviations.slice(
    daysAbbreviations.indexOf(daysConsiderated[0]),
    daysAbbreviations.indexOf(daysConsiderated[1]) + 1
  );

  const [startHour, endhour] = timeConsiderated;

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = daysAbbreviations[now.getDay()];

  const start = to24Hour(startHour);
  const end = to24Hour(endhour);

  if (!openDays.includes(currentDay)) {
    return "closed";
  }

  let isOpen;

  if (start < end) {
    isOpen = currentHour >= start && currentHour < end;
  } 
  else {
    isOpen = currentHour >= start || currentHour < end;
  }
  if (!isOpen) {
    return "closed";
  }
  const hoursToClose = (end - currentHour + 24) % 24;

  if (hoursToClose <= 2) {
    return "closing_soon";
  }
  return "open";
};

function to24Hour(time: string) {
  const isPM = time.includes("PM");
  let hour = Number(time.replace(/AM|PM/, ""));

  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  return hour;
}