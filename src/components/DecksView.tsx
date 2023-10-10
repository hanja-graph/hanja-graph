import React from "react";
import "reactjs-popup/dist/index.css";
import { Link } from "react-router-dom";
import { Deck, getDecks } from "../data/CardDataProvider.js";

class DecksViewProps {
  constructor() {}
}

class DecksViewState {
  decks: Array<Deck> | undefined = undefined;
}

export default class DecksView extends React.Component<
  DecksViewProps,
  DecksViewState
> {
  constructor(props: DecksViewProps) {
    super(props);
    this.state = new DecksViewState();
  }

  componentDidMount() {
    const queryData = async () => {
      try {
        const decks = await getDecks();
        if (decks) {
          this.setState({
            decks: decks,
          });
        }
      } catch (err) {}
    };
    queryData();
  }

  render() {
    let links = [];
    if (this.state.decks === undefined) {
      return <div>Loading</div>;
    }
    let i = 0;
    for (const deck of this.state.decks) {
      i++;
      links.push(
        <li key={i}>
          {deck.name}
          {" - "}
          <Link to={`/study/${deck.name}`}>study</Link>
          {", "}
          <Link to={`/editDeck/${deck.name}`}>edit</Link>
        </li>
      );
    }
    return (
      <div>
        {"Decks"}
        <div>{links}</div>
      </div>
    );
  }
}
