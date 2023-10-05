import React from "react";

import {
  DeckReviewManifest,
  getCardsForDeck,
} from "../data/CardDataProvider.js";
import CardView from "./CardView";

import { processReview } from "../scheduler/SM2";

class StudyViewProps {
  constructor(readonly deckId: number) {}
}
export class StudyViewState {
  constructor(
    readonly deck: DeckReviewManifest,
    readonly cardIdx: number,
    readonly doneWithCard: Array<boolean>
  ) {}
}

export default class StudyView extends React.Component<
  StudyViewProps,
  StudyViewState
> {
  constructor(props: StudyViewProps) {
    super(props);
    this.state = new StudyViewState({ reviewState: [] }, 0, []);
  }

  componentDidMount() {
    const queryData = async () => {
      console.log(this.props);
      try {
        const deck = await getCardsForDeck(this.props.deckId);
        let doneWithCard = [];
        for (const _ in deck.reviewState) {
          doneWithCard.push(false);
        }
        if (deck) {
          this.setState({
            deck: deck,
            doneWithCard: doneWithCard,
          });
        }
      } catch (err) {}
    };
    queryData();
  }

  onPostReview(grade: number) {
    console.log(`${this.state.cardIdx} - ${grade}`);
    const deck = this.state.deck;
    let cardIdx = this.state.cardIdx;
    deck.reviewState[cardIdx].cardReviewState = processReview(
      grade,
      deck.reviewState[cardIdx].cardReviewState
    );
    const doneWithCard = this.state.doneWithCard;
    if (grade >= 4) {
      doneWithCard[cardIdx] = true;
    }
    // Go to the next card
    const initialCardIdx = cardIdx;
    cardIdx += 1;

    // Increment until we get to a card that needs reviewed.
    while (initialCardIdx != cardIdx) {
      console.log(cardIdx);
      if (cardIdx >= deck.reviewState.length) {
        console.log("fell off end");
        console.log(cardIdx);
        cardIdx = 0;
      }
      if (!doneWithCard[cardIdx]) {
        console.log("out");
        console.log(cardIdx);
        break;
      }
      cardIdx += 1;
    }

    // If we couldn't find any cards that need review.
    if (doneWithCard[cardIdx]) {
      cardIdx = -1;
    }
    console.log(`after ${cardIdx} / ${doneWithCard}`);
    this.setState({
      ...this.state,
      deck: deck,
      doneWithCard: doneWithCard,
      cardIdx: cardIdx,
    });
  }

  render() {
    if (this.state.cardIdx < 0 || this.state.deck.reviewState.length == 0) {
      return <div>You have finished all reviews.</div>;
    }
    console.log(
      `Rendering ${this.state.cardIdx} / ${
        this.state.deck.reviewState[this.state.cardIdx].cardId
      }`
    );
    return (
      <div>
        <div>
          {this.state.deck.reviewState[this.state.cardIdx].cardId}
          <CardView
            cardId={this.state.deck.reviewState[this.state.cardIdx].cardId}
          ></CardView>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 0.0)}>No idea</button>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 1.0)}>Familiar</button>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 2.0)}>
            Would remember
          </button>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 3.0)}>Hard</button>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 4.0)}>Medium</button>
        </div>
        <div>
          <button onClick={this.onPostReview.bind(this, 5.0)}>Easy</button>
        </div>
      </div>
    );
  }
}
