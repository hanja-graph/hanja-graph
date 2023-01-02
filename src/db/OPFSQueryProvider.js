let dbWorkerSingleton = undefined;

const createOrGetDbWorker = () => {
  if (!dbWorkerSingleton) {
    dbWorkerSingleton = new Worker(
      new URL("/CardDatabaseWorker.js", import.meta.url) +
        "&sqlite3.dir=jswasm",
      {
        type: "classic",
      }
    );
  }
  return dbWorkerSingleton;
};

export const initOPFSWorker = async () => {
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      resolve(
        e.data.initSucceeded !== undefined ? e.data.initSucceeded : false
      );
    };
    dbWorker.postMessage({
      type: "init",
    });
  });
};

export const queryDB = async (query) => {
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      resolve(e.data);
    };
    dbWorker.postMessage({
      type: "query",
      query: query,
    });
  });
};

const exportDB = async () => {
  // TODO
  return "";
};

const importDB = async (dbData) => {
  // TODO
};

export const getOPFSQueryFunctions = () => {
  return {
    queryDB: queryDB,
    exportDB: exportDB,
    importDB: importDB,
  };
};
