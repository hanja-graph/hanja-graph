import { useState, Component } from "react";
import "./App.css";
import DbBrowser from "./DbBrowser";

class AppProps {}

class AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = new AppState();
  }
  render() {
    return (
      <div>
        <DbBrowser />
      </div>
    );
  }
}
