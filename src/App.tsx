import "./App.css";
import { useState, useEffect } from "react";
import DbBrowser from "./components/DbBrowser";
import CardView from "./components/CardView";
import StudyView from "./components/StudyView";
import DecksView from "./components/DecksView";
import SearchView from "./components/SearchView";
import DeckView from "./components/DeckView";
import SyncView from "./components/SyncView";
import { initializeAndSeedDictionary } from "./data/CardDataProvider";

import {
  Routes,
  Route,
  Outlet,
  Link,
  useParams,
  Navigate,
} from "react-router-dom";
const debug = true;

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
            <Route path="search">
              <Route index element={<SearchView />} />
              <Route path=":searchQuery" element={<SearchView />} />
            </Route>
            <Route path="sync" element={<SyncView />} />
            <Route path="about" element={<About />} />
            <Route path="db" element={<DbBrowser />} />
            <Route path="card">
              <Route index element={<CardWrapper />} />
              <Route path=":hanjaHangul" element={<CardWrapper />} />
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
            <Route path="*" element={<Navigate to={"/search"} />} />
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
            <Link to="/search">Search</Link>
          </li>
          <li>
            <Link to="/decks">Decks</Link>
          </li>
          <li>
            <Link to="/sync">Sync</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <div hidden={!debug}>
            <li>
              <Link to="/db">Database</Link>
            </li>
          </div>
        </ul>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>Hanja graph</h2>
      <p>
        Hanja graph is a Korean flash card program. It's designed to help you
        remember Korean vocabulary by leveraging Hanja as a mnemonic. See{" "}
        <a href="https://github.com/hanja-graph/hanja-graph">Github</a> for more
        information.
      </p>{" "}
      Use the nav bar to begin. This app is designed to work completely offline.
      In your current browser session, all data will be saved and persisted.
      Make sure to use the sync functionality to back up your flash card review
      state and share it between computers.
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
