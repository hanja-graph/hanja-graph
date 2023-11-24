import { useState, useEffect } from "react";
import {
  fuzzySearch,
  Word,
  addCardToDeck,
  addWord,
} from "../data/CardDataProvider";
import { Link, useNavigate, useParams } from "react-router-dom";

function SearchResults(props: { words: Array<Word>; searchQuery: string }) {
  const [deckName, setDeckName] = useState("default");
  const [newHanja, setNewHanja] = useState("");
  const [newHangul, setNewHangul] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  useEffect(() => {
    setNewHangul("");
    setNewHanja("");
    setNewEnglish("");
    const hangulRe = /[\u3131-\uD79D]/giu;
    const alphaRe = /^[a-z0-9]+$/i;
    if (props.searchQuery.match(hangulRe)) {
      setNewHangul(props.searchQuery);
    } else if (props.searchQuery.match(alphaRe)) {
      setNewEnglish(props.searchQuery);
    }
  }, [props.searchQuery]);
  return (
    <div>
      <table>
        <thead>
          <tr>
            {["hanja", "hangul", "english", "card", "+"].map(
              (columnName: any, i: any) => (
                <td key={i}>{columnName}</td>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {props.words.map((word: Word, i: any) => (
            <tr key={i}>
              {[
                word.hanja,
                word.hangul,
                word.english,
                <Link to={`/card/${word.hanjaHangul}`}> card </Link>,
                <button
                  onClick={() => {
                    addCardToDeck(deckName, word.hanja, word.hangul);
                  }}
                >
                  +
                </button>,
              ].map((col: any, i: any) => (
                <td key={i}>{col}</td>
              ))}
            </tr>
          ))}
          <tr>
            <td>
              <input
                size={3}
                type="text"
                value={newHanja}
                onChange={(e) => {
                  setNewHanja(e.target.value);
                }}
              />
            </td>
            <td>
              <input
                size={3}
                type="text"
                value={newHangul}
                onChange={(e) => {
                  setNewHangul(e.target.value);
                }}
              />
            </td>
            <td>
              <input
                size={3}
                type="text"
                value={newEnglish}
                onChange={(e) => {
                  setNewEnglish(e.target.value);
                }}
              />
            </td>
            <td>-</td>
            <button
              disabled={
                !(newHanja.length === 0 || newHanja.length === newHangul.length)
              }
              onClick={() => {
                addWord(newHanja, newHangul, newEnglish).then(() => {
                  addCardToDeck(deckName, newHanja, newHangul);
                });
              }}
            >
              +
            </button>
            ,
          </tr>
        </tbody>
      </table>
      {"Add cards to: "}
      <input
        type="text"
        value={deckName}
        onChange={(e) => {
          setDeckName(e.target.value);
        }}
      />
    </div>
  );
}

export default function SearchView() {
  const [searchQueryInput, setSearchQueryInput] = useState("");
  const [tableData, setTableData] = useState<Array<Word>>([]);
  const { searchQuery } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery.length > 0) {
      setSearchQueryInput(searchQuery);
      fuzzySearch(searchQuery).then((result) => {
        console.log(result);
        setTableData(result);
      });
    } else {
      setTableData([]);
      setSearchQueryInput("");
    }
  }, [searchQuery]);
  return (
    <div>
      <form
        className="commentForm"
        onSubmit={() => {
          fuzzySearch(searchQueryInput).then((result) => {
            setTableData(result);
            navigate(`/search/${searchQueryInput}`);
          });
        }}
      >
        <input
          type="text"
          value={searchQueryInput}
          onChange={(e) => {
            setSearchQueryInput(e.target.value);
          }}
        />
        <button type="submit" disabled={searchQueryInput.length == 0}>
          Search
        </button>
      </form>
      <div>
        <SearchResults words={tableData} searchQuery={searchQueryInput} />
      </div>
    </div>
  );
}
