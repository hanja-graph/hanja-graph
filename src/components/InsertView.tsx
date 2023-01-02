import React from "react";
import { AddHanjaView, AddHanjaViewState } from "./AddHanjaView";
import { Dropdown } from "./Dropdown";
import {
  getHangulforHanja,
  addHanjaWordAndDefinition,
} from "../data/CardDataProvider";

class InsertViewProps {}
class InsertViewState {
  constructor(
    readonly hanjaWord: string = "",
    readonly hangulWord: Array<Array<string>> = [],
    readonly undefinedHanjas: Set<string> = new Set(),
    readonly selectedHangul: Array<number> = []
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
    this.setState({
      ...this.state,
      hanjaWord: e.target.value,
    });
    newState.hangulWord = [];
    newState.undefinedHanjas = new Set();
    for (let i = 0; i < e.target.value.length; i++) {
      const hanjaChar = e.target.value[i];
      const hangulChars = await getHangulforHanja(hanjaChar);
      newState.hangulWord.push(hangulChars);
      newState.selectedHangul.push(0);
    }
    console.log(newState);
    this.setState(newState);
  }

  commitWord() {
    console.log("TODO: commit word");
  }

  addHanjaWord(hanjaState: AddHanjaViewState) {
    addHanjaWordAndDefinition(
      hanjaState.hanja,
      hanjaState.meaning,
      hanjaState.koreanPronuncation
    );
  }

  onSelectionChange(i: number, e: React.ChangeEvent<HTMLSelectElement>) {
    console.log(i);
    console.log(e);
    const newState = { ...this.state };
    const selectedIdx = this.state.hangulWord[i].findIndex(
      (val) => val == e.target.value
    );
    console.log(selectedIdx);
    newState.selectedHangul[i] = selectedIdx;
    this.setState(newState);
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
    const hangulView = [];
    for (let i = 0; i < this.state.hangulWord.length; i++) {
      hangulView.push(
        <div key={i}>
          <Dropdown
            options={this.state.hangulWord[i]}
            value={
              this.state.hangulWord[i].length == 0
                ? undefined
                : this.state.hangulWord[i][this.state.selectedHangul[i]]
            }
            onChange={this.onSelectionChange.bind(this, i)}
          />
        </div>
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
        <div>{hangulView}</div>
        <div>{hanjaView}</div>
        <button onClick={this.commitWord.bind(this)}>Commit</button>
      </div>
    );
  }
}