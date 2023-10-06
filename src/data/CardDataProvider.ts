import { queryDictionary } from "../db/CardDatabase.js";
import { CardReviewState } from "../scheduler/SM2";
import hanjasSchema from "../assets//schemas/hanjas.sql?raw";
import hanjaDefinitionSchema from "../assets//schemas/hanja_definition.sql?raw";
import koreanPronunciationSchema from "../assets//schemas/korean_pronunciation.sql?raw";
import radicalsSchema from "../assets//schemas/radicals.sql?raw";
import tagsSchema from "../assets//schemas/tags.sql?raw";

import hanjasData from "../assets//sources/bravender/hanjas.sql?raw";
import hanjaDefinitionData from "../assets//sources/bravender/hanja_definition.sql?raw";
import koreanPronunciationData from "../assets//sources/bravender/korean_pronunciation.sql?raw";
import radicalsData from "../assets//sources/bravender/radicals.sql?raw";
import tagsData from "../assets//sources/john/tags.sql?raw";

export const loadTable = async (
  schema: any,
  dataSource: any,
  probeQuery: string
) => {
  let selectFromHanjasResult = await queryDictionary(probeQuery);
  if (selectFromHanjasResult.error) {
    let seedResult = await queryDictionary(schema);
    console.log(seedResult);
    seedResult = await queryDictionary(dataSource);
    console.log(seedResult);
  } else {
    console.log("no need to seed");
  }
  selectFromHanjasResult = await queryDictionary(probeQuery);
  if (selectFromHanjasResult.error) {
    throw new Error(
      `Seeding failed; after seeding, we got error ${selectFromHanjasResult.error}`
    );
  }
};

export const initializeAndSeedDictionary = async () => {
  console.log("Seeding radicals");
  await loadTable(
    radicalsSchema,
    radicalsData,
    "SELECT * FROM radicals LIMIT 1;"
  );
  console.log("Seeding hanja definitions.");
  await loadTable(
    hanjaDefinitionSchema,
    hanjaDefinitionData,
    "SELECT * FROM hanja_definition LIMIT 1;"
  );
  console.log("Seeding Korean pronunciation.");
  await loadTable(
    koreanPronunciationSchema,
    koreanPronunciationData,
    "SELECT * FROM korean_pronunciation LIMIT 1;"
  );
  console.log("Seeding hanja words.");
  await loadTable(hanjasSchema, hanjasData, "SELECT * FROM hanjas LIMIT 1;");

  console.log("Seeding tags.");
  await loadTable(tagsSchema, tagsData, "SELECT * FROM tags LIMIT 1;");
  console.log("Done seeding all.");
};

function assertCharacter(maybeCharacter: string) {
  if (maybeCharacter.length != 1) {
    throw new Error("Is not a character");
  }
}

export class Word {
  constructor(
    readonly hanja: string,
    readonly hangul: string,
    readonly english: string
  ) {}
}

export class Deck {
  constructor(readonly name: string) {}
}

export interface CardReviewStateEntry {
  readonly hanjaHangul: string;
  cardReviewState: CardReviewState;
}

export interface DeckReviewManifest {
  reviewState: Array<CardReviewStateEntry>;
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

export async function getWord(hanjahangul: string): Promise<Word | undefined> {
  const query = `SELECT hanja, hangul, english FROM hanjas WHERE  hanja || hangul = '${hanjahangul}';`;
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
  const query = `INSERT INTO hanjas (hanja, hangul, english) VALUES ('${hanja}', '${hangul}', '${english}');`;
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
): Promise<string | undefined> {
  const query = `SELECT hanja || hangul FROM hanjas WHERE hanja LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  if (results.values.length > 0) {
    return results.values[0];
  }
  return undefined;
}

export async function searchForCardWithHangul(
  searchQuery: string
): Promise<string | undefined> {
  const query = `SELECT hanja || hangul FROM hanjas WHERE hangul LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  if (results.values.length > 0) {
    return results.values[0];
  }
  return undefined;
}

export async function searchForCardWithEnglish(
  searchQuery: string
): Promise<string | undefined> {
  const query = `SELECT hanja || hangul FROM hanjas WHERE english LIKE '%${searchQuery}%'`;
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

export async function getDecks(): Promise<Array<Deck>> {
  const query = "SELECT DISTINCT name FROM tags;";
  const res = await queryDictionary(query);
  let decks: Array<Deck> = [];
  for (const elem of res.values) {
    decks = decks.concat(new Deck(elem[0]));
  }
  return decks;
}

export async function getCardsForDeck(
  deckName: string
): Promise<DeckReviewManifest> {
  const query = `SELECT hanja, hangul FROM tags WHERE name = '${deckName}';`;
  const res = await queryDictionary(query);
  console.log(res);
  let states: Array<CardReviewStateEntry> = [];
  for (const elem of res.values) {
    // TODO: properly populate cardReviewState from DB
    states.push({
      hanjaHangul: `${elem[0]}${elem[1]}`,
      cardReviewState: new CardReviewState(0, 1.3, 1),
    });
  }
  return {
    reviewState: states,
  };
}
