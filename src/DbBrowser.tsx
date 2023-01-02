import { useState, useEffect } from "react";
import "./repl-styles.css";
import { queryDictionary } from "./CardDatabase.js";
import { Component } from "react";

class ReplProps {}

class ReplState {
  constructor(
    readonly results: any = [],
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
      console.log(`ran query: ${this.state.query}`);
      const results = await queryDictionary(this.state.query);
      this.setResults(results);
      this.setError(undefined);
    } catch (err) {
      const error = err as Error;
      this.setError(error.toString());
      this.setResults([]);
    }
  }

  render() {
    return (
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
          {
            // results contains one object per select statement in the query
            this.state.results.map(({ columns, values }: any, i: number) => (
              <ResultsTable key={i} columns={columns} values={values} />
            ))
          }
        </pre>
      </div>
    );
  }
}

/**
 * Renders a single value of the array returned by db.exec(...) as a table
 * @param {import("sql.js").QueryExecResult} props
 */
function ResultsTable({ columns, values }: any) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((columnName: any, i: any) => (
            <td key={i}>{columnName}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {values.map((row: any, i: any) => (
          <tr key={i}>
            {row.map((value: any, i: any) => (
              <td key={i}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
