import "./App.css";
import { useState, useEffect } from "react";
import DbBrowser from "./components/DbBrowser";
import CardView from "./components/CardView";
import InsertView from "./components/InsertView";
import StudyView from "./components/StudyView";
import DecksView from "./components/DecksView";
import {
  initializeAndSeedDictionary,
  searchForCardWithHanja,
  searchForCardWithHangul,
  searchForCardWithEnglish,
  getWord,
} from "./data/CardDataProvider";

import {
  Routes,
  Route,
  Outlet,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initializeAndSeedDictionary().then(() => {
        setIsInitialized(true);
      });
    }
    setIsInitializing(true);
  });
  if (!isInitialized) {
    return <div>{"Loading..."}</div>;
  } else {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="db" element={<DbBrowser />} />
            <Route path="add" element={<InsertView />} />
            <Route path="card">
              <Route index element={<CardWrapper />} />
              <Route path=":hanjaHangul" element={<CardWrapper />} />
            </Route>
            <Route path="cards" element={<SearchWrapper />} />
            <Route path="decks" element={<DecksView />} />
            <Route path="study">
              <Route index element={<StudyWrapper />} />
              <Route path=":deckIdText" element={<StudyWrapper />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </div>
    );
  }
}

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/db">Database</Link>
          </li>
          <li>
            <Link to="/add">Add card</Link>
          </li>
          <li>
            <Link to="/decks">Decks</Link>
          </li>
          <li>
            <Link to="/cards">Card view</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

async function fuzzySearch(searchQuery: string): Promise<undefined | string> {
  const word = await getWord(searchQuery);
  if (word != undefined) {
    return searchQuery;
  }
  let result = await searchForCardWithHanja(searchQuery);
  if (result != undefined) {
    return result;
  }
  result = await searchForCardWithHangul(searchQuery);
  if (result != undefined) {
    return result;
  }
  result = await searchForCardWithEnglish(searchQuery);
  if (result != undefined) {
    return result;
  }
  return undefined;
}

function CardWrapper() {
  const { hanjaHangul } = useParams();
  if (hanjaHangul == undefined) {
    return (
      <div>
        Did not get a card.
        <li>
          <Link to="/">Home</Link>
        </li>
      </div>
    );
  }
  return (
    <div>
      <CardView hanjaHangul={hanjaHangul} />
    </div>
  );
}

function SearchWrapper() {
  const navigate = useNavigate();
  const [hanjaHangul, setHanjaHangul] = useState("");
  const goToCard = (_e: React.MouseEvent<HTMLElement>) => {
    if (hanjaHangul.length > 0) {
      fuzzySearch(hanjaHangul).then((result) => {
        if (result != undefined) {
          navigate(`/card/${result}`);
        }
      });
    }
  };
  return (
    <div>
      <input
        type="text"
        value={hanjaHangul}
        onChange={(e) => {
          setHanjaHangul(e.target.value);
        }}
      />
      <button onClick={goToCard} disabled={hanjaHangul.length == 0}>
        Search
      </button>
    </div>
  );
}

function StudyWrapper() {
  let { deckIdText } = useParams();
  if (deckIdText == undefined) {
    return (
      <div>
        Deck is invalid
        <li>
          <Link to="/">Home</Link>
        </li>
      </div>
    );
  }
  const deckId = parseInt(deckIdText);
  if (isNaN(deckId)) {
    return (
      <div>
        Could not parse deck ID
        <li>
          <Link to="/">Home</Link>
        </li>
      </div>
    );
  }
  return (
    <div>
      <StudyView deckId={deckId} />
    </div>
  );
}
