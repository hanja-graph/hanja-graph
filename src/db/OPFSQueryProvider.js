let dbWorkerSingleton = undefined;
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

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
  const uuid = uuidv4();
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      if (e.data["uuid"] === uuid) {
        resolve(
          e.data.initSucceeded !== undefined ? e.data.initSucceeded : false
        );
      }
    };
    dbWorker.postMessage({
      type: "init",
      uuid: uuid,
    });
  });
};

export const queryDB = async (query) => {
  return new Promise((resolve) => {
    const uuid = uuidv4();
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      if (e.data["uuid"] === uuid) {
        resolve(e.data);
      }
    };
    dbWorker.postMessage({
      type: "query",
      query: query,
      uuid: uuid,
    });
  });
};

const exportDB = async () => {
  return new Promise((resolve) => {
    const dbWorker = createOrGetDbWorker();
    const uuid = uuidv4();
    dbWorker.onmessage = function (e) {
      if (e.data["uuid"] === uuid) {
        resolve(e.data.buffer);
      }
    };
    dbWorker.postMessage({
      type: "export",
      uuid: uuid,
    });
  });
};

const importDB = async (dbData) => {
  return new Promise((resolve) => {
    const uuid = uuidv4();
    const dbWorker = createOrGetDbWorker();
    dbWorker.onmessage = function (e) {
      if (e.data["uuid"] === uuid) {
        resolve(e.data.status);
      }
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
