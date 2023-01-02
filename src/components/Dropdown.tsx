import React from "react";

type SelectionChangeEvent = (e: React.ChangeEvent<HTMLSelectElement>) => void;

type OptionType = string[];

export class DropdownProps {
  constructor(
    readonly value: string | undefined,
    readonly options: OptionType,
    readonly onChange: SelectionChangeEvent
  ) {}
}

export class DropdownState {
  constructor() {}
}

export class Dropdown extends React.Component<DropdownProps, DropdownState> {
  constructor(props: DropdownProps) {
    super(props);
  }
  render() {
    return (
      <label>
        <select value={this.props.value} onChange={this.props.onChange}>
          {this.props.options.map((option, i) => (
            <option key={i} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }
}
