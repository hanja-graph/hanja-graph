import "./repl-styles.css";
import {
  queryDictionary,
  exportDatabase,
  importDatabase,
  QueryResponse,
} from "../db/CardDatabase.js";
import { initializeAndSeedDictionary } from "../data/CardDataProvider";
import { Component } from "react";

class ReplProps {}

class ReplState {
  constructor(
    readonly results: QueryResponse | undefined = undefined,
    readonly error: string | undefined = undefined,
    readonly query: string = ""
  ) {}
}

export default class DbBrowser extends Component<ReplProps, ReplState> {
  constructor(props: ReplProps) {
    super(props);
    this.state = new ReplState();
  }

  setQueryBox(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const textArea = document.getElementById("queryBox");
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
    this.setState({ ...this.state, query: e.target.value });
  }

  setResults(results: any) {
    const newState = { ...this.state, results: results, error: undefined };
    this.setState(newState);
  }

  setError(error: string | undefined) {
    const newState = {
      ...this.state,
      results: { columns: [], values: [] },
      error: error,
    };
    this.setState(newState);
  }

  async executeQuery() {
    try {
      const results: QueryResponse = await queryDictionary(this.state.query);
      this.setResults(results);
      if (results.error) {
        this.setError(results.error);
      }
    } catch (err) {
      const error = err as Error;
      this.setError(error.toString());
      this.setResults([]);
    }
  }

  async exportDatabase() {
    try {
      const resultDump = await exportDatabase();
      const blob = new Blob([resultDump], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "card-db.sqlite");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      const error = err as Error;
      this.setError(error.toString());
    }
  }
  async importDatabase() {
    const fileElement = document.getElementById("fileItem") as HTMLInputElement;
    if (!fileElement) {
      return;
    }
    if (!fileElement.files) {
      return;
    }
    if (fileElement.files.length == 0) {
      alert("No file added, can't import");
      return;
    }
    const file = fileElement.files[0];
    let reader = new FileReader();

    reader.onload = async function (_) {
      if (reader.result) {
        const result = await importDatabase(reader.result as ArrayBuffer);
        console.log(`Import result: ${result}`);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async clearDatabase() {
    await queryDictionary("DROP TABLE hanjas;");
    await queryDictionary("DROP TABLE hanja_definition;");
    await queryDictionary("DROP TABLE korean_pronunciation;");
    await queryDictionary("DROP TABLE radicals;");
    await queryDictionary("DROP TABLE tags;");
    await initializeAndSeedDictionary();
  }

  render() {
    return (
      <div>
        <div className="App">
          <h1>Database Browser</h1>
          <button onClick={this.executeQuery.bind(this)}>Execute </button>
          <button onClick={this.exportDatabase.bind(this)}>Export</button>
          <button onClick={this.importDatabase.bind(this)}>Import</button>
          <input id="fileItem" type="file"></input>
          <button onClick={this.clearDatabase.bind(this)}>Reset DB</button>
        </div>
        <textarea
          id="queryBox"
          className="query-area"
          placeholder="Enter some SQL. No inspiration ? Try “select sqlite_version()”"
          value={this.state.query}
          onChange={this.setQueryBox.bind(this)}
        ></textarea>
        <pre className="error">{(this.state.error || "").toString()}</pre>

        <pre>
          <ResultsTable resp={this.state.results} />
        </pre>
      </div>
    );
  }
}

/**
 * Renders a single value of the array returned by db.exec(...) as a table
 * @param {QueryResponse} props
 */
function ResultsTable(props: { resp: QueryResponse | undefined }) {
  if (!props.resp) {
    return <table></table>;
  }
  // For debugging.
  /*
  let concatStr = "";
  for (const row of props.resp.values) {
    concatStr += `'${row[0]}'\n`;
  }
  for (const row of props.resp.values) {
    concatStr += "(";
    for (const [i, col] of row.entries()) {
      concatStr += `'${col}'`;
      if (i != row.length - 1) {
        concatStr += ",";
      }
    }
    concatStr += ");\n";
  }
  return <div>{concatStr}</div>;
  */
  return (
    <table>
      <thead>
        <tr>
          {props.resp.columns.map((columnName: any, i: any) => (
            <td key={i}>{columnName}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {props.resp.values.map((row: Array<any>, i: any) => (
          <tr key={i}>
            {row.map((col: any, i: any) => (
              <td key={i}>{col}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
