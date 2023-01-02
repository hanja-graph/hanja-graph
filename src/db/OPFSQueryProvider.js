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
      resolve(e.data);
    };
    dbWorker.postMessage({
      type: "init",
    });
  });
};

export const queryOPFSWorker = async (query) => {
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
