import "./App.css";
import { useState, useEffect } from "react";
import DbBrowser from "./components/DbBrowser";
import CardView from "./components/CardView";
import InsertView from "./components/InsertView";
import StudyView from "./components/StudyView";
import DecksView from "./components/DecksView";
import SearchView from "./components/SearchView";
import DeckView from "./components/DeckView";
import SyncView from "./components/SyncView";
import { initializeAndSeedDictionary } from "./data/CardDataProvider";

import { Routes, Route, Outlet, Link, useParams } from "react-router-dom";
const debug = false;

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
            <Route path="sync" element={<SyncView />} />
            <Route path="db" element={<DbBrowser />} />
            <Route path="add" element={<InsertView />} />
            <Route path="card">
              <Route index element={<CardWrapper />} />
              <Route path=":hanjaHangul" element={<CardWrapper />} />
            </Route>
            <Route path="search">
              <Route index element={<SearchView />} />
              <Route path=":searchQuery" element={<SearchView />} />
            </Route>
            <Route path="decks" element={<DecksView />} />
            <Route path="study">
              <Route index element={<StudyWrapper />} />
              <Route path=":deckName" element={<StudyWrapper />} />
            </Route>
            <Route path="editDeck">
              <Route index element={<DeckView />} />
              <Route path=":deckName" element={<DeckView />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </div>
    );
  }
}

function Layout() {
  const [sidebarOpen, setSideBarOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setSideBarOpen(!sidebarOpen)}>
        {sidebarOpen ? "⦀" : "☰"}
      </button>
      <nav hidden={!sidebarOpen}>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/sync">Sync</Link>
          </li>
          <div hidden={!debug}>
            <li>
              <Link to="/db">Database</Link>
            </li>
          </div>
          <li>
            <Link to="/add">Add card</Link>
          </li>
          <li>
            <Link to="/decks">Decks</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <div>
        <Outlet />
      </div>
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

function StudyWrapper() {
  let { deckName } = useParams();
  if (deckName == undefined) {
    return <div></div>;
  }
  return (
    <div>
      <StudyView deckName={deckName} />
    </div>
  );
}
