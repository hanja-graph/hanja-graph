import React from "react";
import { queryDictionary } from "./CardDatabase.js";

class InsertViewProps {}
class InsertViewState {
  constructor(
    readonly hanjaWord: string = "",
    readonly hangulWord: string = "",
    readonly hanjaToHangulMemo: Map<string, string> = new Map()
  ) {}
}

async function getHangulforHanja(hanja: string): Promise<string | undefined> {
  if (hanja.length > 1 || hanja.length == 0) {
    throw Error("Function takes only one characrter");
  }
  const query = `SELECT hangul FROM korean_pronunciation WHERE hanjas LIKE '%${hanja}%';`;
  const result = await queryDictionary(query);
  if (result.length == 0) {
    return undefined;
  }
  return result[0].values[0].toString();
}

export default class InsertView extends React.Component<
  InsertViewProps,
  InsertViewState
> {
  constructor(props: InsertViewProps) {
    super(props);
    this.state = new InsertViewState();
  }

  async setHanjaBox(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newState = {
      ...this.state,
    };
    newState.hanjaWord = e.target.value;
    let hangulWord = "";
    this.setState({
      ...this.state,
      hanjaWord: e.target.value,
    });
    for (const hanjaChar of e.target.value) {
      if (newState.hanjaToHangulMemo.has(hanjaChar)) {
        hangulWord = hangulWord + newState.hanjaToHangulMemo.get(hanjaChar);
      } else {
        const hangulChar = await getHangulforHanja(hanjaChar);
        if (hangulChar) {
          hangulWord = hangulWord + hangulChar;
          newState.hanjaToHangulMemo.set(hanjaChar, hangulChar);
        } else {
          hangulWord = hangulWord + "?";
        }
      }
    }
    newState.hangulWord = hangulWord;
    this.setState(newState);
  }

  commitWord() {
    console.log("TODO: commit word");
  }

  render() {
    return (
      <div>
        <h1>Insert a word</h1>
        <textarea
          placeholder="Enter a hanja word"
          value={this.state.hanjaWord}
          onChange={this.setHanjaBox.bind(this)}
        ></textarea>
        <textarea value={this.state.hangulWord} readOnly={true}>
          "
        </textarea>
        <button onClick={this.commitWord.bind(this)}>Commit</button>
      </div>
    );
  }
}
