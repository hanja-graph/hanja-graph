import { initBackend } from "absurd-sql/dist/indexeddb-main-thread";

import CardDatabaseWorker from "./CardDatabase.worker.js?worker";

export function initCardDB() {
  console.log("Creating worker");
  let worker = new CardDatabaseWorker();
  console.log("Created worker.");
  worker.onmessage = function (e) {
    console.log(`Message received from worker: ${e.data}`);
  };
  worker.postMessage([2, 3]);
  console.log("Message posted to worker");
  initBackend(worker);
}
