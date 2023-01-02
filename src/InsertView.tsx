import React from "react";
import { AddHanjaView, AddHanjaViewState } from "./AddHanjaView";
import { getHangulforHanja } from "./data/CardDataProvider";

class InsertViewProps {}
class InsertViewState {
  constructor(
    readonly hanjaWord: string = "",
    readonly hangulWord: string = "",
    readonly hanjaToHangulMemo: Map<string, string> = new Map(),
    readonly undefinedHanjas: Set<string> = new Set()
  ) {}
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
          newState.undefinedHanjas.add(hanjaChar);
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

  addHanjaWord(hanjaState: AddHanjaViewState) {
    console.log("TODO: add hanja word");
  }

  render() {
    let hanjaView = <div></div>;
    if (this.state.undefinedHanjas.size > 0) {
      const hanjaToAdd = this.state.undefinedHanjas.values().next().value;
      hanjaView = (
        <AddHanjaView
          hanja={hanjaToAdd}
          onSubmit={this.addHanjaWord.bind(this)}
        />
      );
    }
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
        {hanjaView}
        <button onClick={this.commitWord.bind(this)}>Commit</button>
      </div>
    );
  }
}
