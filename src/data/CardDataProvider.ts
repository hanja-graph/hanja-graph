import { queryDictionary } from "../db/CardDatabase.js";

class Word {
  constructor(
    readonly hanja: string,
    readonly hangul: string,
    readonly english: string
  ) {}
}

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

export async function getSiblings(
  hanja: string,
  hangul: string
): Promise<Array<Word>> {
  const hanjaQuery = `SELECT hanja, hangul, english FROM hanjas WHERE hanja LIKE "%${hanja}%" AND hangul != "${hangul}";`;
  const hanjaQueryResult = await queryDictionary(hanjaQuery);
  const siblings = [];
  if (hanjaQueryResult.length > 0) {
    const siblingResults = hanjaQueryResult[0].values;
    for (const rec of siblingResults) {
      if (rec.length == 3) {
        siblings.push(new Word(String(rec[0]), String(rec[1]), String(rec[2])));
      }
    }
  }
  return siblings;
}
