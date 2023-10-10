import { useState, useEffect } from "react";
import {
  getCardsForDeck,
  DeckReviewManifest,
  CardReviewStateEntry,
  removeCardFromDeck,
} from "../data/CardDataProvider";
import { Link, useParams } from "react-router-dom";

const EMPTY_REVIEW_STATE = { reviewState: [] };

function DeckTable(props: {
  reviewManifest: DeckReviewManifest;
  deckName: string | undefined;
}) {
  return (
    <table>
      <thead>
        <tr>
          {["hanja", "hangul", "english", "card"].map(
            (columnName: any, i: any) => (
              <td key={i}>{columnName}</td>
            )
          )}
        </tr>
      </thead>

      <tbody>
        {props.reviewManifest.reviewState.map(
          (entry: CardReviewStateEntry, i: any) => (
            <tr key={i}>
              {[
                entry.word.hanja,
                entry.word.hangul,
                entry.word.english,
                <Link to={`/card/${entry.word.hanjaHangul}`}> card </Link>,
                <button
                  onClick={() => {
                    if (props.deckName !== undefined) {
                      removeCardFromDeck(
                        props.deckName,
                        entry.word.hanja,
                        entry.word.hangul
                      );
                    }
                  }}
                  disabled={props.deckName === undefined}
                >
                  -
                </button>,
              ].map((col: any, i: any) => (
                <td key={i}>{col}</td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}

export default function DeckView() {
  const [tableData, setTableData] =
    useState<DeckReviewManifest>(EMPTY_REVIEW_STATE);
  const { deckName } = useParams();
  useEffect(() => {
    if (deckName !== undefined && deckName.length > 0) {
      getCardsForDeck(deckName).then((result) => {
        setTableData(result);
      });
    } else {
      setTableData(EMPTY_REVIEW_STATE);
    }
  }, [deckName]);
  return (
    <div>
      <DeckTable reviewManifest={tableData} deckName={deckName} />
    </div>
  );
}
