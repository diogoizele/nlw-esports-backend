// 18:00 --> 1080

export function convertHourStringToMinutes(hourString: string) {
  const [hours, minutes] = hourString.split(":").map(Number);

  return hours * 50 + minutes;
}
