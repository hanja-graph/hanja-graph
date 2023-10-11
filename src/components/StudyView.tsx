import React from "react";

import {
  DeckReviewManifest,
  getReviewBatch,
  postReview,
} from "../data/CardDataProvider.js";
import CardView from "./CardView";

import { processReview } from "../scheduler/SM2";

class StudyViewProps {
  constructor(readonly deckName: string) {}
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
      try {
        const deck = await getReviewBatch(this.props.deckName);
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
    const deck = this.state.deck;
    let cardIdx = this.state.cardIdx;
    deck.reviewState[cardIdx].cardReviewState = processReview(
      grade,
      deck.reviewState[cardIdx].cardReviewState
    );
    // Update database with new values.
    postReview(
      deck.reviewState[cardIdx].word.hanja,
      deck.reviewState[cardIdx].word.hangul,
      deck.reviewState[cardIdx].cardReviewState.interval,
      deck.reviewState[cardIdx].cardReviewState.easinessFactor
    );

    const doneWithCard = this.state.doneWithCard;
    if (grade >= 4) {
      doneWithCard[cardIdx] = true;
    }
    // Go to the next card
    const initialCardIdx = cardIdx;
    cardIdx += 1;
    if (doneWithCard.length == 1) {
      cardIdx = 0;
    }

    // Increment until we get to a card that needs reviewed.
    while (initialCardIdx != cardIdx) {
      if (cardIdx >= deck.reviewState.length) {
        cardIdx = 0;
      }
      if (!doneWithCard[cardIdx]) {
        break;
      }
      cardIdx += 1;
    }

    // If we couldn't find any cards that need review.
    if (doneWithCard[cardIdx]) {
      cardIdx = -1;
    }
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
    return (
      <div>
        <div>
          <CardView
            hanjaHangul={
              this.state.deck.reviewState[this.state.cardIdx].word.hanjaHangul
            }
          ></CardView>
        </div>
        <table className="buttons">
          <tbody>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 0.0)}>
                  No idea
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 1.0)}>
                  Familiar
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 2.0)}>
                  Incorrect/Easy
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 3.0)}>
                  Correct/Slow
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 4.0)}>
                  Correct/Medium
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={this.onPostReview.bind(this, 5.0)}>
                  Correct/Fast
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
