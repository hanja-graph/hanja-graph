import {
  dumpReviews,
  importReviews,
  ReviewDump,
  validateReviewDump,
} from "../data/CardDataProvider";
import { Component } from "react";

class SyncViewProps {}

class SyncViewState {}

export default class SyncView extends Component<SyncViewProps, SyncViewState> {
  constructor(props: SyncViewProps) {
    super(props);
    this.state = new SyncViewState();
  }

  setResults(results: any) {
    const newState = { ...this.state, results: results, error: undefined };
    this.setState(newState);
  }

  async exportDatabase() {
    try {
      const resultDump = await dumpReviews();
      const blob = new Blob([JSON.stringify(resultDump)], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "hanja-reviews.json");
      document.body.appendChild(link);
      link.click();
    } catch (err) {}
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
        const buffer = reader.result as ArrayBuffer;
        const decoder = new TextDecoder("utf-8");
        const decoded = decoder.decode(buffer);
        const parsed = JSON.parse(decoded);
        const castResult = validateReviewDump(parsed);
        const res = await importReviews(castResult);
        console.log(`Import input: ${res}`);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  render() {
    return (
      <div>
        <h1>Synchronization</h1>
        <button onClick={this.exportDatabase.bind(this)}>Export</button>
        <button onClick={this.importDatabase.bind(this)}>Import</button>
        <input id="fileItem" type="file"></input>
      </div>
    );
  }
}
