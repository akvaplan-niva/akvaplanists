const openAlexApi = "https://api.openalex.org";

export const openalexPersonUrl = (id: string) =>
  new URL(`/people/${id}`, openAlexApi);

export const fetchOpenalexPerson = async (id: string) =>
  await fetch(openalexPersonUrl(id));
