import { initBackend } from "absurd-sql/dist/indexeddb-main-thread";
import CardDatabaseWorker from "./CardDatabase.worker.js?worker";

let dbWorker = undefined;

const queryDictionary = async (query) => {
  return new Promise((resolve) => {
    if (!dbWorker) {
      dbWorker = new CardDatabaseWorker();
      initBackend(dbWorker);
    }
    dbWorker.onmessage = function (e) {
      resolve(e.data);
    };
    dbWorker.postMessage(query);
  });
};

export { queryDictionary };
