let dictionaryDBSingleton = undefined;
let sqlite3Singleton = undefined;

const initDBEngine = async function () {
  if (!sqlite3Singleton) {
    console.log("Loading sqlite3 module");
    sqlite3Singleton = await sqlite3InitModule();
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
      return undefined;
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
  // TODO
  return "";
};

const importDB = async (dbData) => {
  // TODO
};

export const getKVVFSQueryFunctions = () => {
  return {
    queryDB: queryDB,
    exportDB: queryDB,
    importDB: importDB,
  };
};
