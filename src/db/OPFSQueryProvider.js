let dbWorkerSingleton = undefined;

const createOrGetDbWorker = () => {
  if (!dbWorkerSingleton) {
    const url = new URL("/assets/CardDatabaseWorker.js", import.meta.url);
    url.searchParams.append("sqlite3.dir", "jswasm");
    dbWorkerSingleton = new Worker(url, {
      type: "classic",
    });
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
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      resolve(e.data.buffer);
    };
    dbWorker.postMessage({
      type: "export",
    });
  });
};

const importDB = async (dbData) => {
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      resolve(e.data.status);
    };
    dbWorker.postMessage({
      type: "import",
      buffer: dbData,
    });
  });
};

export const getOPFSQueryFunctions = () => {
  return {
    queryDB: queryDB,
    exportDB: exportDB,
    importDB: importDB,
  };
};
