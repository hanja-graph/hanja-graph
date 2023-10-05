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
            <Route path="cards">
              <Route index element={<CardWrapper />} />
              <Route path=":cardId" element={<CardWrapper />} />
            </Route>
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

async function fuzzySearch(searchQuery: string): Promise<undefined | number> {
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
  let { cardId } = useParams();
  const navigate = useNavigate();
  const [cardIdText, setCardIdText] = useState("");
  const goToCard = (_e: React.MouseEvent<HTMLElement>) => {
    if (cardIdText.length > 0) {
      const newCardId = parseInt(cardIdText);
      if (!isNaN(newCardId)) {
        navigate(`/cards/${newCardId}`);
      } else {
        fuzzySearch(cardIdText).then((result) => {
          if (result != undefined) {
            navigate(`/cards/${result}`);
          }
        });
      }
    }
  };
  if (cardId) {
    return (
      <div>
        <CardView cardId={parseInt(cardId)} />
        <Link to="/cards">Card index</Link>
      </div>
    );
  } else {
    return (
      <div>
        <input
          type="text"
          value={cardIdText}
          onChange={(e) => {
            setCardIdText(e.target.value);
          }}
        />
        <button onClick={goToCard} disabled={cardIdText.length == 0}>
          Search
        </button>
      </div>
    );
  }
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
