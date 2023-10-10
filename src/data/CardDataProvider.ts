import { queryDictionary, QueryResponse } from "../db/CardDatabase.js";
import { CardReviewState } from "../scheduler/SM2";
import hanjasSchema from "../assets//schemas/hanjas.sql?raw";
import hanjaDefinitionSchema from "../assets//schemas/hanja_definition.sql?raw";
import koreanPronunciationSchema from "../assets//schemas/korean_pronunciation.sql?raw";
import radicalsSchema from "../assets//schemas/radicals.sql?raw";
import tagsSchema from "../assets//schemas/tags.sql?raw";
import reviewsSchema from "../assets//schemas/reviews.sql?raw";

import hanjasData from "../assets//sources/bravender/hanjas.sql?raw";
import hanjaDefinitionData from "../assets//sources/bravender/hanja_definition.sql?raw";
import koreanPronunciationData from "../assets//sources/bravender/korean_pronunciation.sql?raw";
import radicalsData from "../assets//sources/bravender/radicals.sql?raw";
import tagsData from "../assets//sources/john/tags.sql?raw";
import reviewsData from "../assets//sources/john/reviews.sql?raw";

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

  console.log("Seeding reviews.");
  await loadTable(reviewsSchema, reviewsData, "SELECT * FROM reviews LIMIT 1;");
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

  public get hanjaHangul() {
    return `${this.hanja}${this.hangul}`;
  }
}

const unpackWordFromQuery = (value: any) => {
  if (value.length == 3) {
    const hanja = String(value[0]);
    const hangul = String(value[1]);
    const english = String(value[2]);
    return new Word(hanja, hangul, english);
  }
  return undefined;
};

const unpackWordsFromQuery = (queryResult: QueryResponse) => {
  const words: Array<Word> = [];
  for (const res of queryResult.values) {
    const unpacked = unpackWordFromQuery(res);
    if (unpacked !== undefined) {
      words.push(unpacked);
    }
  }
  return words;
};

export class Deck {
  constructor(readonly name: string) {}
}

export interface CardReviewStateEntry {
  readonly word: Word;
  cardReviewState: CardReviewState;
}

export interface DeckReviewManifest {
  reviewState: Array<CardReviewStateEntry>;
}

export interface ReviewDump {
  hanja: Array<string>;
  hangul: Array<string>;
  interval: Array<number>;
  easinessFactor: Array<number>;
  lastReviewed: Array<string>;
}

export const validateReviewDump = (obj: any): ReviewDump => {
  let i = 0;
  const fields = [
    "hanja",
    "hangul",
    "easinessFactor",
    "lastReviewed",
    "interval",
  ];
  for (const field of fields) {
    if (obj[field] === undefined) {
      throw new Error(`Field ${field} does not exist on blob.`);
    }
    i++;
    if (i == 0) {
      const prevailingLength: number = obj[field].length;
      for (const thisField of fields) {
        const thisLength: number = obj[thisField].length;
        if (thisLength != prevailingLength) {
          throw new Error(
            `Field ${field} is of length ${thisLength}, not ${prevailingLength}.`
          );
        }
      }
    }
  }
  const res = obj as ReviewDump;
  return res;
};

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
      return unpackWordFromQuery(values[0]);
    }
  }
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
): Promise<Array<Word>> {
  const query = `SELECT hanja, hangul, english FROM hanjas WHERE hanja LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  return unpackWordsFromQuery(results);
}

export async function searchForCardWithHangul(
  searchQuery: string
): Promise<Array<Word>> {
  const query = `SELECT hanja, hangul, english FROM hanjas WHERE hangul LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  return unpackWordsFromQuery(results);
}

export async function searchForCardWithEnglish(
  searchQuery: string
): Promise<Array<Word>> {
  const query = `SELECT hanja, hangul, english FROM hanjas WHERE english LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  return unpackWordsFromQuery(results);
}

export async function fuzzySearch(searchQuery: string): Promise<Array<Word>> {
  const word = await getWord(searchQuery);
  if (word != undefined) {
    return [word];
  }
  let words: Array<Word> = [];
  words = words.concat(await searchForCardWithHanja(searchQuery));
  words = words.concat(await searchForCardWithHangul(searchQuery));
  words = words.concat(await searchForCardWithEnglish(searchQuery));
  return words;
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
  const query = `SELECT tags.hanja as hanja, 
    tags.hangul AS hangul, 
  hanjas.english AS english FROM tags 
  LEFT JOIN hanjas ON tags.hanja = hanjas.hanja AND tags.hangul = hanjas.hangul 
  WHERE tags.name = '${deckName}';`;
  const res = await queryDictionary(query);
  let states: Array<CardReviewStateEntry> = [];
  for (const elem of res.values) {
    // TODO: properly populate cardReviewState from DB
    states.push({
      word: new Word(elem[0], elem[1], elem[2]),
      cardReviewState: new CardReviewState(0, 1.3, 1),
    });
  }
  return {
    reviewState: states,
  };
}

export async function getReviewBatch(
  deckName: string
): Promise<DeckReviewManifest> {
  const query = `
  SELECT hanjas.hanja as hanja, 
    hanjas.hangul as hangul, 
    hanjas.english as english,
    reviews.easiness_factor as easiness_factor,
    reviews.interval as interval
  FROM tags
  LEFT JOIN reviews ON
    tags.hanja = reviews.hanja AND
    tags.hangul = reviews.hangul
  LEFT JOIN hanjas ON
    hanjas.hanja = tags.hanja AND
    hanjas.hangul = tags.hangul
  WHERE tags.name = '${deckName}'
    AND (unixepoch(datetime('now')) - unixepoch(reviews.last_reviewed)) / (60.0*60.0*24.0) > reviews.interval;
  `;
  const res = await queryDictionary(query);
  let states: Array<CardReviewStateEntry> = [];
  for (const elem of res.values) {
    // TODO: properly populate cardReviewState from DB
    states.push({
      word: new Word(elem[0], elem[1], elem[2]),
      cardReviewState: new CardReviewState(0, elem[3], elem[4]),
    });
  }
  return {
    reviewState: states,
  };
}

export async function postReview(
  hanja: string,
  hangul: string,
  interval: number,
  easinessFactor: number
): Promise<void> {
  const query = `
  UPDATE reviews 
    SET 
      last_reviewed = datetime('now'),
      interval = ${interval},
      easiness_factor = ${easinessFactor}
  WHERE reviews.hanja = '${hanja}'
    AND reviews.hangul = '${hangul}';`;
  const res = await queryDictionary(query);
  if (res.error != undefined) {
    throw new Error(res.error);
  }
}

export async function addCardToDeck(
  deckName: string,
  hanja: string,
  hangul: string
): Promise<void> {
  const query = `INSERT INTO tags 
    (hanja, hangul, name)
    VALUES
    ('${hanja}', '${hangul}', '${deckName}') ON CONFLICT DO NOTHING;`;
  const res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
}

export async function removeCardFromDeck(
  deckName: string,
  hanja: string,
  hangul: string
): Promise<void> {
  const query = `DELETE FROM tags 
    WHERE hanja = '${hanja}' AND hangul = '${hangul}' AND name = '${deckName}';`;
  const res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
}

export async function dumpReviews(): Promise<ReviewDump> {
  const query = `SELECT hanja, hangul, interval, easiness_factor, last_reviewed FROM reviews;`;
  const res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
  const dump: ReviewDump = {
    hanja: [],
    hangul: [],
    interval: [],
    easinessFactor: [],
    lastReviewed: [],
  };
  for (const elem of res.values) {
    dump.hanja.push(elem[0]);
    dump.hangul.push(elem[1]);
    dump.interval.push(elem[2]);
    dump.easinessFactor.push(elem[3]);
    dump.lastReviewed.push(elem[4]);
  }
  return dump;
}

export async function importReviews(reviews: ReviewDump): Promise<void> {
  console.log(reviews);
  let i = 0;
  let query =
    "INSERT INTO reviews(hanja, hangul, interval, easiness_factor, last_reviewed) VALUES";
  while (i < reviews.hanja.length) {
    query += `('${reviews.hanja[i]}', '${reviews.hangul[i]}', ${reviews.interval[i]}, ${reviews.easinessFactor[i]}, '${reviews.lastReviewed[i]}')`;
    if (i + 1 < reviews.hanja.length) {
      query += `,
        `;
    } else {
      query += `
        `;
    }
    i++;
  }
  query += `
  ON CONFLICT(hanja, hangul) DO UPDATE SET
    interval=excluded.interval,
    easiness_factor=excluded.easiness_factor,
    last_reviewed=excluded.last_reviewed
  WHERE excluded.hanja = reviews.hanja AND excluded.hangul = reviews.hangul;
    `;
  console.log(query);
  const res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
}
