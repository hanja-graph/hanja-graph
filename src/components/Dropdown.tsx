import React from "react";

type SelectionChangeEvent = (e: React.ChangeEvent<HTMLSelectElement>) => void;

type OptionType = { label: string; value: string }[];

export class DropdownProps {
  constructor(
    readonly value: string,
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
        {this.props.value}
        <select value={this.props.value} onChange={this.props.onChange}>
          {this.props.options.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }
}
