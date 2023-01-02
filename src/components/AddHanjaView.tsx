import React from "react";

class AddHanjaViewProps {
  constructor(
    readonly onSubmit: (hanjaState: AddHanjaViewState) => void,
    readonly hanja: string
  ) {}
}
export class AddHanjaViewState {
  constructor(
    readonly hanja: string = "",
    readonly koreanPronuncation: string = "",
    readonly meaning: string = ""
  ) {}
}

export class AddHanjaView extends React.Component<
  AddHanjaViewProps,
  AddHanjaViewState
> {
  constructor(props: AddHanjaViewProps) {
    super(props);
    this.state = new AddHanjaViewState(props.hanja, "", "");
  }

  setKoreanPronunciation(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      ...this.state,
      koreanPronuncation: e.target.value.toString(),
    });
  }

  setMeaning(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ ...this.state, meaning: e.target.value.toString() });
  }

  commitWord() {
    this.props.onSubmit(this.state);
  }

  render() {
    return (
      <div>
        <input value={this.props.hanja} readOnly={true}></input>
        <input
          placeholder="Enter a Korean pronunciation"
          value={this.state.koreanPronuncation}
          onChange={this.setKoreanPronunciation.bind(this)}
        ></input>
        <input
          placeholder="Enter a meaning"
          value={this.state.meaning}
          onChange={this.setMeaning.bind(this)}
        ></input>
        <button
          onClick={this.commitWord.bind(this)}
          disabled={
            this.state.meaning.length == 0 ||
            this.state.koreanPronuncation.length == 0
          }
        >
          Add word
        </button>
      </div>
    );
  }
}
