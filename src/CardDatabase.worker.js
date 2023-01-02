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
  return db;
};

let db = undefined;

const setupDB = async () => {
  console.log("create table");
  try {
    db.exec("CREATE TABLE hello (a int, b char);");
  } catch (e) {
    console.log(`error: ${e}`);
  }
  console.log("insert values");
  try {
    db.exec("INSERT INTO hello VALUES (0, 'hello');");
    db.exec("INSERT INTO hello VALUES (1, 'world');");
  } catch (e) {
    console.log(`error: ${e}`);
  }
};

onmessage = async function (e) {
  console.log("setup");
  if (!db) {
    db = await initDB();
  }
  await setupDB();

  const result = db.exec(e.data);
  postMessage(result);
};
