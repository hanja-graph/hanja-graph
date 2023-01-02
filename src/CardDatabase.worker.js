import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";
import sqlWasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url";

const DICTIONARY_DB_STORAGE_PATH = "/sql/db.sqlite";

let dbSingleton = undefined;

const initDBEngine = async function () {
  if (dbSingleton) {
    return initDBEngine;
  }
  let SQL = await initSqlJs({
    locateFile: (file) => {
      return sqlWasm;
    },
  });
  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");
  return SQL;
};

const mountDictionaryDatabase = async (dbSingleton, dbPath) => {
  let db = new dbSingleton.Database(dbPath, { filename: true });
  if (typeof SharedArrayBuffer === "undefined") {
    let stream = dbSingleton.FS.open(dbPath, "a+");
    await stream.node.contents.readIfFallback();
    dbSingleton.FS.close(stream);
  }
  db.exec(`
    PRAGMA journal_mode=MEMORY;
  `);
  return db;
};

const setupDB = async (db) => {
  try {
    db.exec("CREATE TABLE hello (a int, b char);");
  } catch (e) {
    console.log(`error: ${e}`);
  }
  try {
    db.exec("INSERT INTO hello VALUES (0, 'hello');");
    db.exec("INSERT INTO hello VALUES (1, 'world');");
  } catch (e) {
    console.log(`error: ${e}`);
  }
};

onmessage = async function (e) {
  const dbEngine = await initDBEngine();
  const dictionaryDB = await mountDictionaryDatabase(
    dbEngine,
    DICTIONARY_DB_STORAGE_PATH
  );
  await setupDB(dictionaryDB);
  const result = dictionaryDB.exec(e.data);
  postMessage(result);
};
