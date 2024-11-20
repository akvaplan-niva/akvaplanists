export const ndjson = (o: unknown) => console.log(JSON.stringify(o));

// https://www.30secondsofcode.org/js/s/split-array-into-chunks/
export const chunkArray = <T>(arr: T[], size: number) =>
  Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size),
  );
