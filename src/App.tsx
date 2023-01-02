import "./App.css";
import { useState, useEffect } from "react";
import DbBrowser from "./components/DbBrowser";
import CardView from "./components/CardView";
import InsertView from "./components/InsertView";
import { initializeAndSeedDictionary } from "./data/CardDataProvider";

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

function CardWrapper() {
  let { cardId } = useParams();
  const navigate = useNavigate();
  const [cardIdText, setCardIdText] = useState("");
  const goToCard = (_e: React.MouseEvent<HTMLElement>) => {
    if (cardIdText.length > 0) {
      const newCardId = parseInt(cardIdText);
      console.log(newCardId);
      if (!isNaN(newCardId)) {
        navigate(`/cards/${newCardId}`);
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
        <button onClick={goToCard} disabled={isNaN(parseInt(cardIdText))}>
          Go
        </button>
      </div>
    );
  }
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
