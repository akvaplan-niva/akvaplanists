export const parseNorwegianDate = (whencreated: string) => {
  const [_date, _time] = whencreated?.split(" ");
  if (_date) {
    const date = _date?.split(".")?.reverse()?.join("-");
    const time = `${_time ?? "12:00:00Z"}`;
    return new Date(`${date}T${time}`);
  }
  return new Date();
};
// The Active Directory stores date/time values as the number of 100-nanosecond intervals that have elapsed since the 0 hour on January 1, 1601…
export const parseAdTime = (n: number) =>
  new Date(n / 10000 + new Date(Date.UTC(1601, 0, 1)).getTime());

// parse weird dates like "03/01/0024 01:00:00" to 2024-03-01T01:00:00Z
const weirdRegex =
  /^(?<_month>\d{2})\/(?<_day>\d{2})\/00(?<_yy>\d{2})\s(?<_t>\d{2}:\d{2}:\d{2})$/;
export const parseWeirdUsDate = (weird: string) => {
  const r = weirdRegex.exec(weird);
  if (r) {
    const { _month, _day, _yy, _t } = r.groups as Record<string, string>;
    const year = 2000 + Number(_yy);
    const [month, day] = [_month, _day].map(Number);
    const [h, m, s] = _t.split(":").map(Number);
    return new Date(Date.UTC(year, month - 1, day, h, m, s));
  }
  return undefined;
};
