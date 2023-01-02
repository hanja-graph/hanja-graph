import { useState, Component } from "react";
import "./App.css";
import { runQuery } from "./CardDatabase.js";

class AppProps {}

class AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = new AppState();
  }
  componentDidMount() {
    const startDb = async () => {
      const queryResult = await runQuery("SELECT * FROM hello;");
      console.log(queryResult);
    };
    startDb();
  }
  render() {
    return <div>{"Foo"}</div>;
  }
}
