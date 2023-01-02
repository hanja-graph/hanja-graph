import { useState } from "react";
import "./App.css";
import { initCardDB } from "./CardDatabase.js";

function App() {
  initCardDB();
  const [count, setCount] = useState(0);
  return <div className="App">{"FooBar"}</div>;
}

export default App;
