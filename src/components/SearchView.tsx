import { useState, useEffect } from "react";
import { fuzzySearch, Word, addCardToDeck } from "../data/CardDataProvider";
import { Link, useNavigate, useParams } from "react-router-dom";

function SearchResults(props: { words: Array<Word> }) {
  const [deckName, setDeckName] = useState("default");
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
        <SearchResults words={tableData} />
      </div>
    </div>
  );
}
