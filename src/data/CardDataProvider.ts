import { queryDictionary, QueryResponse } from "../db/CardDatabase.js";
import hanjaDictionarySeed from "../assets/hanjadic.sql?raw";

export const initializeAndSeedDictionary = async () => {
  const isDbSeededQuery = "SELECT * FROM hanjas LIMIT 2;";
  let selectFromHanjasResult = await queryDictionary(isDbSeededQuery);
  if (selectFromHanjasResult.error) {
    console.log("Seeding dictionary.");
    const seedResult = await queryDictionary(hanjaDictionarySeed);
    console.log(seedResult);
    console.log("Done seeding dictionary.");
  } else {
    console.log("no need to seed");
  }
  selectFromHanjasResult = await queryDictionary(isDbSeededQuery);
  if (selectFromHanjasResult.error) {
    throw new Error(
      `Seeding failed; after seeding, we got error ${selectFromHanjasResult.error}`
    );
  }
};

function assertCharacter(maybeCharacter: string) {
  if (maybeCharacter.length != 1) {
    throw new Error("Is not a character");
  }
}

class Word {
  constructor(
    readonly hanja: string,
    readonly hangul: string,
    readonly english: string
  ) {}
}

export async function getHangulforHanja(hanja: string): Promise<Array<string>> {
  assertCharacter(hanja);
  const query = `SELECT hangul FROM korean_pronunciation WHERE hanjas LIKE '%${hanja}%';`;
  const result = await queryDictionary(query);
  if (result.values.length == 0) {
    return [];
  }
  return result.values.map((elem) => elem.toString());
}

export async function getWord(cardId: number): Promise<Word | undefined> {
  const query = `SELECT hanja, hangul, english FROM hanjas WHERE id = ${cardId};`;
  const queryResult = await queryDictionary(query);
  if (queryResult.values.length > 0) {
    const values = queryResult.values;
    if (values.length > 0) {
      const value = values[0];
      if (value.length == 3) {
        const hanja = String(value[0]);
        const hangul = String(value[1]);
        const english = String(value[2]);
        return new Word(hanja, hangul, english);
      }
    }
  }
  return undefined;
}

export async function addWord(hanja: string, hangul: string, english: string) {
  const query = `INSERT INTO hanjas_content (c0hanja, c1hangul, c2english) VALUES ('${hanja}', '${hangul}', '${english}');`;
  await queryDictionary(query);
}

export async function getEnglishDefinitionForHanja(
  hanja: string
): Promise<string | undefined> {
  assertCharacter(hanja);
  const englishMeaningQuery = `SELECT definition FROM hanja_definition WHERE hanjas = '${hanja}'`;
  const englishMeaningQueryResult = await queryDictionary(englishMeaningQuery);
  if (englishMeaningQueryResult.values.length > 0) {
    const englishMeaningValues = englishMeaningQueryResult.values;
    if (englishMeaningValues.length > 0) {
      return englishMeaningValues[0].toString();
    }
  }
  return undefined;
}

export async function getSiblings(
  hanja: string,
  hangulWord: string
): Promise<Array<Word>> {
  assertCharacter(hanja);
  const hanjaQuery = `SELECT hanja, hangul, english FROM hanjas WHERE hanja LIKE '%${hanja}%' AND hangul != '${hangulWord}';`;
  const hanjaQueryResult = await queryDictionary(hanjaQuery);
  const siblings = [];
  if (hanjaQueryResult.values.length > 0) {
    const siblingResults = hanjaQueryResult.values;
    for (const rec of siblingResults) {
      if (rec.length == 3) {
        siblings.push(new Word(String(rec[0]), String(rec[1]), String(rec[2])));
      }
    }
  }
  return siblings;
}

export async function koreanPronunciationDefined(
  hanjaCharacter: string
): Promise<boolean> {
  assertCharacter(hanjaCharacter);
  const query = `SELECT hangul FROM korean_pronunciation WHERE hanjas like '%${hanjaCharacter}%'`;
  const results = await queryDictionary(query);
  return results.values.length > 0;
}

export async function searchForCardWithHanja(
  searchQuery: string
): Promise<number | undefined> {
  const query = `SELECT id FROM hanjas WHERE hanja LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  if (results.values.length > 0) {
    return results.values[0];
  }
  return undefined;
}

export async function searchForCardWithHangul(
  searchQuery: string
): Promise<number | undefined> {
  const query = `SELECT id FROM hanjas WHERE hangul LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  if (results.values.length > 0) {
    return results.values[0];
  }
  return undefined;
}

export async function searchForCardWithEnglish(
  searchQuery: string
): Promise<number | undefined> {
  const query = `SELECT id FROM hanjas WHERE english LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  if (results.values.length > 0) {
    return results.values[0];
  }
  return undefined;
}

export async function hanjaDefinitionExists(
  hanjaCharacter: string
): Promise<boolean> {
  assertCharacter(hanjaCharacter);
  const query = `SELECT hanjas FROM hanja_definition WHERE hanjas = '${hanjaCharacter}'`;
  const results = await queryDictionary(query);
  return results.values.length > 0;
}

async function addHangulPronunciationForHanja(
  hanjaCharacter: string,
  hangulPronunciation: string
) {
  assertCharacter(hanjaCharacter);
  assertCharacter(hangulPronunciation);
  const query = `UPDATE korean_pronunciation SET hanjas = hanjas || '${hanjaCharacter}' WHERE hangul = '${hangulPronunciation};`;
  await queryDictionary(query);
}

async function addHanjaMeaning(hanjaCharacter: string, meaning: string) {
  assertCharacter(hanjaCharacter);
  const query = `INSERT INTO hanja_definition (hanjas, definition) VALUES ('${hanjaCharacter}', '${meaning}')`;
  await queryDictionary(query);
}

export async function addHanjaWordAndDefinition(
  hanjaCharacter: string,
  meaning: string,
  hangulPronunciation: string
): Promise<void> {
  assertCharacter(hanjaCharacter);
  assertCharacter(hangulPronunciation);
  const hasHanjaDefinition = await hanjaDefinitionExists(hanjaCharacter);
  const hasKoreanPronunciation = await koreanPronunciationDefined(
    hangulPronunciation
  );
  if (!hasHanjaDefinition && !hasKoreanPronunciation) {
    await addHangulPronunciationForHanja(hanjaCharacter, hangulPronunciation);
    await addHanjaMeaning(hanjaCharacter, meaning);
  } else if (hasHanjaDefinition && hasKoreanPronunciation) {
    return;
  } else {
    throw new Error(
      "Invalid state: hasHanjaDefinition=${hasHanjaDefinition}, hasKoreanPronunciation=${hasKoreanPronunciation}"
    );
  }
}
