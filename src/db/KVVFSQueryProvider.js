let dictionaryDBSingleton = undefined;
let sqlite3Singleton = undefined;
const CONFIG = {
  print: console.log,
  printErr: console.error,
};

const initDBEngine = async function () {
  if (!sqlite3Singleton) {
    console.log("Loading sqlite3 module");
    sqlite3Singleton = await sqlite3InitModule(CONFIG);
    const capi = sqlite3Singleton.capi;
    console.log(
      `sqlite3 version=${capi.sqlite3_libversion()}, sourceId=${capi.sqlite3_sourceid()}`
    );
  }
  return sqlite3Singleton;
};

export const createOrGetDatabase = async () => {
  const dbEngine = await initDBEngine();
  dictionaryDBSingleton = new dbEngine.oo1.JsStorageDb("local");
  return dictionaryDBSingleton;
};

export const queryDB = async (query) => {
  const dictionaryDB = await createOrGetDatabase();
  try {
    const resultRows = [];
    dictionaryDB.exec({
      sql: query,
      rowMode: "object",
      resultRows: resultRows,
    });
    if (resultRows.length == 0) {
      return {
        columns: [],
        values: [],
      };
    }
    const result = {
      columns: Object.getOwnPropertyNames(resultRows[0]),
      values: [],
    };
    for (let row of resultRows) {
      result.values.push(Object.values(row));
    }
    return result;
  } catch (e) {
    return {
      columns: [],
      values: [],
      error: e.message,
    };
  }
};

const exportDB = async () => {
  const dbEngine = await initDBEngine();
  const dictionaryDB = await createOrGetDatabase();
  const dbArr = dbEngine.capi.sqlite3_js_db_export(dictionaryDB.pointer);
  return dbArr.buffer;
};

const importDB = async (dbData) => {
  try {
    const dbEngine = await initDBEngine();
    const dictionaryDB = await createOrGetDatabase();
    const bytes = new Uint8Array(dbData);
    const p = dbEngine.wasm.allocFromTypedArray(bytes);
    dbEngine.capi.sqlite3_deserialize(
      dictionaryDB.pointer,
      "main",
      p,
      bytes.length,
      bytes.length,
      dbEngine.capi.SQLITE_DESERIALIZE_FREEONCLOSE
    );
  } catch (e) {
    return false;
  }
  return true;
};

export const getKVVFSQueryFunctions = () => {
  return {
    queryDB: queryDB,
    exportDB: exportDB,
    importDB: importDB,
  };
};
