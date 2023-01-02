/*
import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";
import sqlWasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url";
import hanjaDictionarySeed from "../assets/hanjadic.sql?raw";
*/

const DICTIONARY_DB_STORAGE_PATH = "/sql/db.sqlite";

let dbEngineSingleton = undefined;
let dictionaryDBSingleton = undefined;
let sqlite3;
const CONFIG = {
  print: console.log,
  printErr: console.error,
};

const initDBEngine = async function () {
  if (dbEngineSingleton) {
    return dbEngineSingleton;
  }
  console.log("Initializing database engine.");
  let SQL = await initSqlJs({
    locateFile: (file) => {
      return sqlWasm;
    },
  });
  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");
  dbEngineSingleton = SQL;
  return SQL;
};

const mountDictionaryDatabase = async (dbEngine, dbPath) => {
  if (dictionaryDBSingleton) {
    return dictionaryDBSingleton;
  }
  console.log("Initializing dictionary DB.");
  let db = new dbEngine.Database(dbPath, { filename: true });
  if (typeof SharedArrayBuffer === "undefined") {
    let stream = dbEngine.FS.open(dbPath, "a+");
    await stream.node.contents.readIfFallback();
    dbEngine.FS.close(stream);
  }
  db.exec(`
    PRAGMA journal_mode=MEMORY;
  `);
  dictionaryDBSingleton = db;
  return db;
};

const setupDB = async (db) => {
  try {
    db.exec("SELECT * FROM hanjas LIMIT 1;");
  } catch (e) {
    console.log(`Initializing DB with seed data.`);
    db.exec(hanjaDictionarySeed);
  }
};

onmessage = async function (e) {
  if (e.data["type"] !== undefined && e.data["type"] == "query") {
    if (!e.data["query"]) {
      throw new Error(
        "Invalid message; type was 'query' but no 'query' was specified."
      );
    }
    const dbEngine = await initDBEngine();
    const dictionaryDB = await mountDictionaryDatabase(
      dbEngine,
      DICTIONARY_DB_STORAGE_PATH
    );
    await setupDB(dictionaryDB);
    const result = dictionaryDB.exec(e.data["query"]);
    postMessage(result);
  } else if (e.data["type"] !== undefined && e.data["type"] == "export") {
    const urlParams = new URL(self.location.href).searchParams;
    console.log(urlParams);
    console.log(self);
    /*
    if (sqlite3 === undefined) {
      sqlite3 = await sqlite3InitModule(CONFIG);
      const version = sqlite3.capi.sqlite3_libversion();
      console.log(`Loaded SQLite ${version}`);
    }
    */
  }
};
