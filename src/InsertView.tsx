import React from "react";

class InsertViewProps {}
class InsertViewState {}

export default class InsertView extends React.Component<
  InsertViewProps,
  InsertViewState
> {
  constructor(props: InsertViewProps) {
    super(props);
    this.state = new InsertViewState();
  }

  render() {
    return <div></div>;
  }
}
