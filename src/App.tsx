import { Component } from "react";
import "./App.css";

import DbBrowser from "./DbBrowser";
import CardView from "./CardView";

// Set up URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Load app based on input parameter.
let application: string = "db_browser";
const appParameter = urlParams.get("app");
if (appParameter) {
  application = appParameter;
}
const rootElement = document.getElementById("root");

class AppProps {}

class AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = new AppState();
  }
  render() {
    if (application == "repl") {
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
    }
    return (
      <div>
        <DbBrowser />
      </div>
    );
  }
}