import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { queryDictionary } from "./CardDatabase.js";

class CardViewProps {
  cardId: number = 0;

  constructor(cardId: number = 0) {
    this.cardId = cardId;
  }
}

class Word {
  hanja: string = "";
  hangul: string = "";
  english: string = "";

  constructor(hanja: string, hangul: string, english: string) {
    this.hanja = hanja;
    this.hangul = hangul;
    this.english = english;
  }
}

class SiblingViewProps {
  word: Word = new Word("", "", "");
}

class SiblingViewState {
  revealed: boolean = false;
}

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
  siblings: Array<Word> = [];
  hanja: string = "";
  englishMeaning: string = "";
}

class SiblingsView extends React.Component<SiblingsViewProps, any> {
  constructor(props: SiblingsViewProps) {
    super(props);
  }

  render() {
    let rows = [];
    for (const elem of this.props.siblings) {
      rows.push(<SiblingView word={elem} />);
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
  status: string | undefined;
  word: Word = new Word("", "", "");
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
    const queryData = async () => {
      try {
        const query = `SELECT c0hanja, c1hangul, c2english FROM hanjas_content WHERE docid = ${this.props.cardId};`;
        const queryResult = await queryDictionary(query);
        if (queryResult.length > 0) {
          const values = queryResult[0]["values"];
          if (values.length > 0) {
            const value = values[0];
            if (value.length == 3) {
              const hanjas = String(value[0]);
              const hangul = String(value[1]);
              const english = String(value[2]);
              const siblingsLists: Array<SiblingsViewProps> = [];
              for (const hanja of hanjas) {
                const hanjaQuery = `SELECT hanja, hangul, english FROM hanjas WHERE hanja LIKE "%${hanja}%" AND hangul != "${hangul}";`;
                const hanjaQueryResult = await queryDictionary(hanjaQuery);
                const siblings = [];
                if (hanjaQueryResult.length > 0) {
                  const siblingResults = hanjaQueryResult[0].values;
                  for (const rec of siblingResults) {
                    if (rec.length == 3) {
                      siblings.push(
                        new Word(String(rec[0]), String(rec[1]), String(rec[2]))
                      );
                    }
                  }
                }
                const englishMeaningQuery = `SELECT definition FROM hanja_definition WHERE hanjas = "${hanja}"`;
                const englishMeaningQueryResult = await queryDictionary(
                  englishMeaningQuery
                );
                let englishMeaning = "";
                if (englishMeaningQueryResult.length > 0) {
                  const englishMeaningValues =
                    englishMeaningQueryResult[0].values;
                  if (englishMeaningValues.length > 0) {
                    englishMeaning = String(englishMeaningValues[0]);
                  }
                }
                siblingsLists.push({
                  siblings: siblings,
                  hanja: hanja,
                  englishMeaning: englishMeaning,
                });
              }
              this.setState({
                status: undefined,
                word: new Word(hanjas, hangul, english),
                siblings: siblingsLists,
              });
            }
          }
        }
      } catch (err) {
        // TODO: Set component to a show an error
      }
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
    for (let i = 0; i < this.state.word.hangul.length; i++) {
      if (i < this.state.siblings.length) {
        rows.push(
          <Popup
            trigger={<button>{this.state.word.hangul[i]}</button>}
            position="right top"
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
      } else {
        extra = extra + this.state.word.hangul[i];
      }
    }
    return (
      <div>
        <div>{this.state.status != undefined ? this.state.status : ""}</div>
        <button onClick={this.toggleEnglish.bind(this)}>
          {this.state.englishVisible ? this.state.word.english : "영어"}
        </button>
        <div>
          {rows}
          {extra}
        </div>
      </div>
    );
  }
}
