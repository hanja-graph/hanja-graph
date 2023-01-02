import { Component } from "react";
import "./App.css";

import DbBrowser from "./components/DbBrowser";
import CardView from "./components/CardView";
import InsertView from "./components/InsertView";
import { initializeDictionary } from "./db/CardDatabase";

// Set up URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Load app based on input parameter.
let application: string = "db_browser";
const appParameter = urlParams.get("app");
if (appParameter) {
  application = appParameter;
}
class AppProps {}

class AppState {
  constructor(readonly dbInitialized: boolean = false) {}
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = new AppState();
  }

  async componentDidMount() {
    await initializeDictionary();
    this.setState({ dbInitialized: true });
  }

  render() {
    if (!this.state.dbInitialized) {
      return <div></div>;
    } else if (application == "repl") {
      return (
        <div>
          <DbBrowser />
        </div>
      );
    } else if (application == "card") {
      const cardParameter = urlParams.get("card_id");
      if (cardParameter) {
        return (
          <div>
            <CardView cardId={parseInt(cardParameter)} />
          </div>
        );
      }
    } else if (application == "insert") {
      return (
        <div>
          <InsertView />
        </div>
      );
    }
    return (
      <div>
        <DbBrowser />
      </div>
    );
  }
}
