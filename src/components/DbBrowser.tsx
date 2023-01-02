import "./repl-styles.css";
import { queryDictionary, exportDatabase } from "../db/CardDatabase.js";
import { Component } from "react";

class ReplProps {}

interface QueryResponse {
  columns: Array<string>;
  values: Array<any>;
  error?: string | undefined;
}

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
    this.setState({ ...this.state, query: e.target.value });
  }

  setResults(results: any) {
    this.setState({ ...this.state, results: results });
  }

  setError(error: string | undefined) {
    this.setState({ ...this.state, error: error });
  }

  async executeQuery() {
    try {
      const results: QueryResponse = await queryDictionary(this.state.query);
      this.setResults(results);
      this.setError(results.error);
    } catch (err) {
      const error = err as Error;
      this.setError(error.toString());
      this.setResults([]);
    }
  }

  async exportDatabase() {
    try {
      const resultDump = await exportDatabase();
    } catch (err) {
      const error = err as Error;
      this.setError(error.toString());
    }
  }

  render() {
    console.log(this.state.results);
    return (
      <div>
        <div className="App">
          <h1>React SQL interpreter</h1>

          <textarea
            placeholder="Enter some SQL. No inspiration ? Try “select sqlite_version()”"
            value={this.state.query}
            onChange={this.setQueryBox.bind(this)}
          ></textarea>
          <button onClick={this.executeQuery.bind(this)}>Execute </button>

          <pre className="error">{(this.state.error || "").toString()}</pre>

          <pre>
            <ResultsTable resp={this.state.results} />
          </pre>
        </div>
        <div>
          <button onClick={this.exportDatabase.bind(this)}>Export</button>
        </div>
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
