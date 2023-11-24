/*
 * This worker supports DB operations through OPFS.
 *
 * Not all browsers support the OPFS standard as of December 2022,
 * but this functionality entered mainstream Chrome in
 * literally the last browser update I installed. So
 * it appears to be entering web standards and since this
 * is a free-time project, with one user, I'm not particularly
 * concerned about compatibility.
 *
 * Safari for MacOS has OPFS support but doesn't appear to support
 * workers inside of workers. So this wasn't working on that browser
 * as of the time of this writing, on my Mac, though I'm not on
 * Monterey.
 *
 * Alternative strategies should be implemented if this module fails to
 * initialize.
 */

console.log("service worker loaded");
importScripts(["./jswasm/sqlite3.js"]);
console.log("sqlite3.js imported.");
const CONFIG = {
  print: console.log,
  printErr: console.error,
};
const DICTIONARY_DB_FILE_NAME = "card_db.sqlite";
let dictionaryDBSingleton = undefined;
let sqlite3Singleton = undefined;
let poolSingleton = undefined;

const initDBEngine = async function () {
  if (!sqlite3Singleton) {
    console.log("Attempting initialization of sqlite3.");
    try {
      const newSqlite3Singleton = await sqlite3InitModule(CONFIG);
      const capi = newSqlite3Singleton.capi;
      sqlite3Singleton = newSqlite3Singleton;
      poolSingleton = await sqlite3Singleton.installOpfsSAHPoolVfs();
      console.log("Successfully initialized OPFS pool implementation");
      console.log(
        `sqlite3 version=${capi.sqlite3_libversion()}, sourceId=${capi.sqlite3_sourceid()}`
      );
    } catch (error) {
      console.log("Error while loading OPFS");
      console.log(error);
      return undefined;
    }
  }
  return poolSingleton;
};

const mountDictionaryDatabase = async (poolUtil, dbPath) => {
  if (!dictionaryDBSingleton) {
    dictionaryDBSingleton = new poolUtil.OpfsSAHPoolDb(dbPath);
  }
  return dictionaryDBSingleton;
};

onmessage = async function (e) {
  uuid = e.data["uuid"];
  if (e.data["type"] !== undefined && e.data["type"] == "init") {
    const dbEngine = await initDBEngine();
    if (!dbEngine) {
      postMessage({
        initSucceeded: false,
        reason: "Could not create DB engine.",
        uuid: uuid,
      });
      return;
    }
    const dictionaryDB = await mountDictionaryDatabase(
      dbEngine,
      DICTIONARY_DB_FILE_NAME
    );
    if (!dictionaryDB) {
      postMessage({
        initSucceeded: false,
        reason: "Could not create or access dictionary DB.",
        uuid: uuid,
      });
      return;
    }
    postMessage({
      initSucceeded: true,
      uuid: uuid,
    });
    return;
  } else if (e.data["type"] !== undefined && e.data["type"] == "query") {
    if (!e.data["query"]) {
      throw new Error(
        "Invalid message; type was 'query' but no 'query' was specified."
      );
    }
    const dbEngine = await initDBEngine();
    const dictionaryDB = await mountDictionaryDatabase(
      dbEngine,
      DICTIONARY_DB_FILE_NAME
    );
    try {
      const resultRows = [];
      dictionaryDB.exec({
        sql: e.data["query"],
        rowMode: "object",
        resultRows: resultRows,
      });
      if (resultRows.length == 0) {
        postMessage({
          columns: [],
          values: [],
          error: e.message,
          uuid: uuid,
        });
        return;
      }
      const result = {
        columns: Object.getOwnPropertyNames(resultRows[0]),
        values: [],
        uuid: uuid,
      };
      for (let row of resultRows) {
        result.values.push(Object.values(row));
      }
      postMessage(result);
    } catch (error) {
      postMessage({
        columns: [],
        values: [],
        error: error.message,
        query:
          e.data !== undefined && e.data["query"] !== undefined
            ? e.data["query"]
            : undefined,
        uuid: uuid,
      });
    }
    postMessage({
      columns: [],
      values: [],
      error: undefined,
      uuid: uuid,
    });
    return;
  } else if (e.data["type"] !== undefined && e.data["type"] == "export") {
    const dbEngine = await initDBEngine();
    const dictionaryDB = await mountDictionaryDatabase(
      dbEngine,
      DICTIONARY_DB_FILE_NAME
    );
    const dbArr = dbEngine.capi.sqlite3_js_db_export(dictionaryDB.pointer);
    postMessage({
      buffer: dbArr.buffer,
      uuid: uuid,
    });
  } else if (e.data["type"] !== undefined && e.data["type"] == "import") {
    const dbData = e.data["buffer"];
    if (!dbData) {
      postMessage({
        status: false,
        reason: "No buffer provided.",
        uuid: uuid,
      });
    }
    try {
      const dbEngine = await initDBEngine();
      let dictionaryDB = await mountDictionaryDatabase(
        dbEngine,
        DICTIONARY_DB_FILE_NAME
      );
      dictionaryDB.close();
      const root = await navigator.storage.getDirectory();
      const dbFileHandle = await root.getFileHandle(DICTIONARY_DB_FILE_NAME, {
        create: true,
      });
      const dbAccessHandle = await dbFileHandle.createSyncAccessHandle();
      const view = new DataView(dbData);
      const writtenSize = dbAccessHandle.write(view);
      await dbAccessHandle.flush();
      await dbAccessHandle.close();
      console.log(`Read ${writtenSize} bytes.`);
      dictionaryDB = await mountDictionaryDatabase(
        dbEngine,
        "/" + DICTIONARY_DB_FILE_NAME
      );
      postMessage({
        status: true,
        uuid: uuid,
      });
    } catch (error) {
      console.log(error);
      postMessage({
        status: false,
        reason: e.message,
        uuid: uuid,
      });
    }
  }
};
