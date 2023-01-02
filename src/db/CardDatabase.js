import { initBackend } from "absurd-sql/dist/indexeddb-main-thread";
import CardDatabaseWorker from "./CardDatabase.worker.js?worker";

let dbWorker = undefined;

export const initializeDictionary = async () => {
  await queryDictionary("SELECT sqlite_version();");
};

export const queryDictionary = async (query) => {
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
