import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import {
  getWord,
  getSiblings,
  getEnglishDefinitionForHanja,
  Word,
} from "../data/CardDataProvider.js";

class CardViewProps {
  constructor(readonly hanjaHangul: string) {}
}

class SiblingViewProps {
  constructor(readonly word: Word) {}
}

class SiblingViewState {
  constructor(readonly revealed: boolean = false) {}
}

const contentStyle = {
  height: "70vh",
  width: "100%",
  overflow: "auto",
};

class SiblingView extends React.Component<SiblingViewProps, SiblingViewState> {
  constructor(props: SiblingViewProps) {
    super(props);
    this.state = { revealed: false };
  }

  toggleActive() {
    this.setState({ revealed: !this.state.revealed });
  }

  render() {
    return (
      <div>
        <button onClick={this.toggleActive.bind(this)}>
          {this.props.word.hangul}
        </button>
        {this.state.revealed ? this.props.word.english : ""}
      </div>
    );
  }
}

class SiblingsViewProps {
  constructor(
    readonly siblings: Array<Word>,
    readonly hanja: string | null,
    readonly englishMeaning: string
  ) {}
}

class SiblingsView extends React.Component<SiblingsViewProps, any> {
  constructor(props: SiblingsViewProps) {
    super(props);
  }

  render() {
    let rows = [];
    let i = 0;
    console.log(this.state);
    for (const elem of this.props.siblings) {
      rows.push(<SiblingView key={i} word={elem} />);
      i++;
    }
    return (
      <div>
        <div>
          {this.props.hanja} / {this.props.englishMeaning}{" "}
        </div>
        <div>{rows}</div>
      </div>
    );
  }
}

class CardViewState {
  englishVisible: boolean = false;
  word: Word | undefined = undefined;
  siblings: Array<SiblingsViewProps> = [];
}

export default class CardView extends React.Component<
  CardViewProps,
  CardViewState
> {
  constructor(props: CardViewProps) {
    super(props);
    this.state = new CardViewState();
  }

  componentDidMount() {
    this.updateView(this.props);
  }

  componentDidUpdate(prevProps: CardViewProps) {
    if (prevProps.hanjaHangul == this.props.hanjaHangul) {
      return;
    }
    this.updateView(this.props);
  }

  updateView(props: CardViewProps) {
    const queryData = async () => {
      try {
        const word = await getWord(props.hanjaHangul);
        if (word) {
          const siblingsLists: Array<SiblingsViewProps> = [];
          for (let i = 0; i < word.hangul.length; i++) {
            const hanja = word.hanja;
            if (hanja == null) {
              siblingsLists.push({
                siblings: [],
                hanja: null,
                englishMeaning: "",
              });
            } else {
              const siblings = await getSiblings(hanja[i], word.hangul);
              let englishMeaning = await getEnglishDefinitionForHanja(hanja[i]);
              siblingsLists.push({
                siblings: siblings,
                hanja: hanja[i],
                englishMeaning: englishMeaning ? englishMeaning : "",
              });
            }
          }
          this.setState({
            word: word,
            siblings: siblingsLists,
            englishVisible: false,
          });
        }
      } catch (err) {}
    };
    queryData();
  }

  toggleEnglish() {
    this.setState({
      ...this.state,
      englishVisible: !this.state.englishVisible,
    });
  }
  render() {
    const rows = [];
    let extra = "";
    if (this.state.word) {
      for (let i = 0; i < this.state.word.hangul.length; i++) {
        if (i < this.state.siblings.length) {
          if (this.state.word.hanja == null) {
            rows.push(
              <button key={i} disabled={true}>
                {this.state.word.hangul[i]}
              </button>
            );
          } else {
            rows.push(
              <Popup
                trigger={<button>{this.state.word.hangul[i]}</button>}
                position="right top"
                key={i}
                modal
                contentStyle={contentStyle}
              >
                <div>
                  <SiblingsView
                    siblings={this.state.siblings[i].siblings}
                    hanja={this.state.siblings[i].hanja}
                    englishMeaning={this.state.siblings[i].englishMeaning}
                  />
                </div>
              </Popup>
            );
          }
        } else {
          extra = extra + this.state.word.hangul[i];
        }
      }
    }
    return (
      <div>
        <button onClick={this.toggleEnglish.bind(this)}>
          {this.state.englishVisible && this.state.word
            ? this.state.word.english
            : "?"}
        </button>
        <div>
          {rows}
          {extra}
        </div>
      </div>
    );
  }
}
