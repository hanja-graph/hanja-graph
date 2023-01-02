import { initBackend } from "absurd-sql/dist/indexeddb-main-thread";
import CardDatabaseWorker from "./CardDatabase.worker.js?worker";

let worker = undefined;

const runQuery = async (query) => {
  return new Promise((resolve) => {
    if (!worker) {
      worker = new CardDatabaseWorker();
      initBackend(worker);
    }
    worker.onmessage = function (e) {
      resolve(e.data);
    };
    worker.postMessage(query);
  });
};

export { runQuery };
