import initSqlJs from "@jlongster/sql.js";
import { SQLiteFS } from "absurd-sql";
import IndexedDBBackend from "absurd-sql/dist/indexeddb-backend";
import sqlWasm from "@jlongster/sql.js/dist/sql-wasm.wasm?url";

const initDB = async function () {
  let SQL = await initSqlJs({
    locateFile: (file) => {
      console.log(`sqlWasm: ${sqlWasm}`);
      console.log(`that file: ${file}`);
      return sqlWasm;
    },
  });
  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  console.log(SQL);
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir("/sql");
  SQL.FS.mount(sqlFS, {}, "/sql");

  const path = "/sql/db.sqlite";
  if (typeof SharedArrayBuffer === "undefined") {
    let stream = SQL.FS.open(path, "a+");
    await stream.node.contents.readIfFallback();
    SQL.FS.close(stream);
  }

  let db = new SQL.Database(path, { filename: true });
  // You might want to try `PRAGMA page_size=8192;` too!
  db.exec(`
    PRAGMA journal_mode=MEMORY;
  `);
  console.log("Done.");
};

onmessage = async function (e) {
  await initDB();
  console.log("Worker: Message received from main script");
  const result = e.data[0] * e.data[1];
  if (isNaN(result)) {
    postMessage("Please write two numbers");
  } else {
    const workerResult = "Result: " + result;
    console.log("Worker: Posting message back to main script");
    postMessage(workerResult);
  }
};
