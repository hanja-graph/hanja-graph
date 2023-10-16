import { queryDictionary, QueryResponse } from "../db/CardDatabase.js";
import { CardReviewState } from "../scheduler/SM2";
import wordListScheme from "../assets//schemas/word_list.sql?raw";
import englishHanjaDefinitionSchema from "../assets//schemas/english_hanja_definition.sql?raw";
import koreanHanjaDefinitionSchema from "../assets//schemas/korean_hanja_definition.sql?raw";
import koreanPronunciationSchema from "../assets//schemas/korean_pronunciation.sql?raw";
import radicalsSchema from "../assets//schemas/radicals.sql?raw";
import tagsSchema from "../assets//schemas/tags.sql?raw";
import reviewsSchema from "../assets//schemas/reviews.sql?raw";

import wordListData from "../assets//sources/bravender/word_list.sql?raw";
import englishHanjaDefinitionData from "../assets//sources/bravender/english_hanja_definition.sql?raw";
import koreanHanjaDefinitionData from "../assets//sources/bravender/korean_hanja_definition.sql?raw";
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
  console.log("Seeding English Hanja definitions.");
  await loadTable(
    englishHanjaDefinitionSchema,
    englishHanjaDefinitionData,
    "SELECT * FROM english_hanja_definition LIMIT 1;"
  );
  console.log("Seeding Korean Hanja definitions.");
  await loadTable(
    koreanHanjaDefinitionSchema,
    koreanHanjaDefinitionData,
    "SELECT * FROM korean_hanja_definition LIMIT 1;"
  );
  console.log("Seeding Korean pronunciation.");
  await loadTable(
    koreanPronunciationSchema,
    koreanPronunciationData,
    "SELECT * FROM korean_pronunciation LIMIT 1;"
  );
  console.log("Seeding hanja words.");
  await loadTable(
    wordListScheme,
    wordListData,
    "SELECT * FROM word_list LIMIT 1;"
  );

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

const unpackWordsFromQuery = (queryResult: QueryResponse) => {
  const words: Array<Word> = [];
  const wordsMap: Map<string, Map<string, Set<string>>> = new Map();
  for (const res of queryResult.values) {
    const hanja = res[0];
    const hangul = res[1];
    const english = res[2];
    let hangulMap: Map<string, Set<string>> = new Map();
    if (wordsMap.has(hanja)) {
      hangulMap = wordsMap.get(hanja)!;
    }
    let englishSet: Set<string> = new Set();
    if (hangulMap.has(hangul)) {
      englishSet = hangulMap.get(hangul)!;
    }
    englishSet.add(english);
    hangulMap.set(hangul, englishSet);
    wordsMap.set(hanja, hangulMap);
  }
  for (const [hanja, hangulMap] of wordsMap) {
    for (const [hangul, englishList] of hangulMap) {
      let englishString = "";
      let i = 0;
      console.log(englishList);
      for (const englishDef of englishList) {
        englishString += englishDef;
        i++;
        if (i < englishList.size) {
          englishString += ", ";
        }
      }
      words.push(new Word(hanja, hangul, englishString));
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
  lastReviewed: string;
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

export interface TagsDump {
  hanja: Array<string>;
  hangul: Array<string>;
  name: Array<string>;
}

export interface UserDataDump {
  reviews: ReviewDump;
  tags: TagsDump;
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

export const validateTagsDump = (obj: any): ReviewDump => {
  let i = 0;
  const fields = ["hanja", "hangul", "name"];
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

export const validateUserDataDump = (obj: any): UserDataDump => {
  validateReviewDump(obj["reviews"]);
  validateTagsDump(obj["tags"]);
  const res = obj as UserDataDump;
  return res;
};

export async function getWord(hanjahangul: string): Promise<Word | undefined> {
  const query = `SELECT hanja, hangul, english
    FROM word_list
    WHERE hanja || hangul = '${hanjahangul}';`;
  const queryResult = await queryDictionary(query);
  const results = unpackWordsFromQuery(queryResult);
  return results[0];
}

export async function getEnglishDefinitionForHanja(
  hanja: string
): Promise<string | undefined> {
  assertCharacter(hanja);
  const englishMeaningQuery = `SELECT definition FROM english_hanja_definition WHERE hanja = '${hanja}'`;
  const englishMeaningQueryResult = await queryDictionary(englishMeaningQuery);
  const koreanMeaningQuery = `SELECT definition FROM korean_hanja_definition WHERE hanja = '${hanja}'`;
  const koreanMeaningQueryResult = await queryDictionary(koreanMeaningQuery);
  let definition: string = "";
  for (const [idx, res] of koreanMeaningQueryResult.values.entries()) {
    definition = definition + res[0];
    if (idx + 1 < koreanMeaningQueryResult.values.length) {
      definition = definition + ", ";
    }
  }
  if (
    koreanMeaningQueryResult.values.length > 0 &&
    englishMeaningQueryResult.values.length > 0
  ) {
    definition += "/";
  }
  for (const [idx, res] of englishMeaningQueryResult.values.entries()) {
    definition = definition + res[0];
    if (idx + 1 < englishMeaningQueryResult.values.length) {
      definition = definition + ", ";
    } else {
    }
  }
  return definition;
}

export async function getSiblings(
  hanja: string,
  hangulWord: string
): Promise<Array<Word>> {
  assertCharacter(hanja);
  // TODO: return multi English definitiosn
  const hanjaQuery = `
  SELECT hanja, hangul, english
    FROM word_list
  WHERE hanja LIKE '%${hanja}%' AND hangul != '${hangulWord}';`;
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

export async function searchForCardWithHanja(
  searchQuery: string
): Promise<Array<Word>> {
  const query = `
  SELECT hanja, hangul, english
    FROM word_list
  WHERE hanja LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  console.log(results);
  return unpackWordsFromQuery(results);
}

export async function searchForCardWithHangul(
  searchQuery: string
): Promise<Array<Word>> {
  const query = `
  SELECT hanja, hangul, english
  FROM word_list 
  WHERE hangul LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  console.log(query);
  console.log(results);
  return unpackWordsFromQuery(results);
}

export async function searchForCardWithEnglish(
  searchQuery: string
): Promise<Array<Word>> {
  const query = `
  SELECT hanja, hangul, english
  FROM word_list 
  WHERE english LIKE '%${searchQuery}%'`;
  const results = await queryDictionary(query);
  console.log(results);
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
    word_list.english AS english,
    reviews.easiness_factor as easiness_factor,
    reviews.interval as interval,
    reviews.last_reviewed as last_reviewed
  FROM tags 
  LEFT JOIN word_list
    ON tags.hanja = word_list.hanja 
      AND tags.hangul = word_list.hangul 
  LEFT JOIN reviews
    ON tags.hanja = reviews.hanja 
      AND tags.hangul = reviews.hangul 
  WHERE tags.name = '${deckName}';`;
  const res = await queryDictionary(query);
  let states: Array<CardReviewStateEntry> = [];
  for (const elem of res.values) {
    states.push({
      word: new Word(elem[0], elem[1], elem[2]),
      cardReviewState: new CardReviewState(0, elem[3], elem[4]),
      lastReviewed: elem[5],
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
  SELECT word_list.hanja as hanja, 
    word_list.hangul as hangul, 
    word_list.english AS english,
    reviews.easiness_factor as easiness_factor,
    reviews.interval as interval,
    reviews.last_reviewed as last_reviewed
  FROM tags
  LEFT OUTER JOIN reviews ON
    tags.hanja = reviews.hanja AND
    tags.hangul = reviews.hangul
  LEFT JOIN word_list ON
    word_list.hanja = tags.hanja AND
    word_list.hangul = tags.hangul
  WHERE tags.name = '${deckName}'
    AND ((unixepoch(datetime('now')) - unixepoch(reviews.last_reviewed)) / (60.0*60.0*24.0) > reviews.interval
      OR reviews.interval IS NULL
      OR reviews.easiness_factor IS NULL);
  `;
  const res = await queryDictionary(query);
  let states: Array<CardReviewStateEntry> = [];
  for (const elem of res.values) {
    states.push({
      word: new Word(elem[0], elem[1], elem[2]),
      cardReviewState: new CardReviewState(0, elem[3], elem[4]),
      lastReviewed: elem[5],
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
  const query = `INSERT INTO reviews(hanja, hangul, interval, easiness_factor, last_reviewed) VALUES
('${hanja}', '${hangul}', ${interval}, ${easinessFactor}, datetime('now'))
  ON CONFLICT(hanja, hangul) DO UPDATE SET
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

export async function dumpUserData(): Promise<UserDataDump> {
  let query = `SELECT hanja, hangul, interval, easiness_factor, last_reviewed FROM reviews;`;
  let res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
  const dump: UserDataDump = {
    reviews: {
      hanja: [],
      hangul: [],
      interval: [],
      easinessFactor: [],
      lastReviewed: [],
    },
    tags: {
      hanja: [],
      hangul: [],
      name: [],
    },
  };
  for (const elem of res.values) {
    dump.reviews.hanja.push(elem[0]);
    dump.reviews.hangul.push(elem[1]);
    dump.reviews.interval.push(elem[2]);
    dump.reviews.easinessFactor.push(elem[3]);
    dump.reviews.lastReviewed.push(elem[4]);
  }
  query = `SELECT hanja, hangul, name FROM tags;`;
  res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
  for (const elem of res.values) {
    dump.tags.hanja.push(elem[0]);
    dump.tags.hangul.push(elem[1]);
    dump.tags.name.push(elem[2]);
  }
  return dump;
}

export async function importUserDataDump(dump: UserDataDump): Promise<void> {
  let i = 0;
  let query = "BEGIN;\n";
  query +=
    "INSERT INTO reviews(hanja, hangul, interval, easiness_factor, last_reviewed) VALUES\n";
  while (i < dump.reviews.hanja.length) {
    query += `('${dump.reviews.hanja[i]}', '${dump.reviews.hangul[i]}', ${dump.reviews.interval[i]}, ${dump.reviews.easinessFactor[i]}, '${dump.reviews.lastReviewed[i]}')`;
    if (i + 1 < dump.reviews.hanja.length) {
      query += ",\n";
    } else {
      query += "\n";
    }
    i++;
  }
  query += `
  ON CONFLICT(hanja, hangul) DO UPDATE SET
    interval=excluded.interval,
    easiness_factor=excluded.easiness_factor,
    last_reviewed=excluded.last_reviewed
  WHERE excluded.hanja = reviews.hanja 
    AND excluded.hangul = reviews.hangul;
    `;
  i = 0;
  query += "DELETE FROM tags;\n";
  query += "INSERT INTO tags(hanja, hangul, name) VALUES\n";
  while (i < dump.tags.hanja.length) {
    query += `('${dump.tags.hanja[i]}', '${dump.tags.hangul[i]}', '${dump.tags.name[i]}')`;
    if (i + 1 < dump.tags.hanja.length) {
      query += `,
        `;
    } else {
      query += ";\n";
    }
    i++;
  }
  query += "COMMIT;\n";
  const res = await queryDictionary(query);
  if (res.error !== undefined) {
    throw new Error(res.error);
  }
}
