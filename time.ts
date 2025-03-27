export const calcDays = (t1: Date | string, t0: Date | string) =>
  (new Date(t1).getTime() - new Date(t0).getTime()) /
  864e5;

export const isEqualTime = (
  t1: Date | string | undefined,
  t0: Date | string | undefined,
) => t1 && t0 ? new Date(t1).getTime() === new Date(t0).getTime() : false;
