import { queryDictionary } from "./db/CardDatabase.js";

export async function getHangulforHanja(
  hanja: string
): Promise<string | undefined> {
  if (hanja.length > 1 || hanja.length == 0) {
    throw Error("Function takes only one characrter");
  }
  const query = `SELECT hangul FROM korean_pronunciation WHERE hanjas LIKE '%${hanja}%';`;
  const result = await queryDictionary(query);
  if (result.length == 0) {
    return undefined;
  }
  return result[0].values[0].toString();
}
