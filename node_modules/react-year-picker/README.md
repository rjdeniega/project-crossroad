# React Year Picker

A simple Yearpicker component for React

![](https://user-images.githubusercontent.com/20069293/35214964-e35e3ca2-ff73-11e7-910e-82b56a324b1a.png)

## Installation

The package can be installed via NPM:

```
npm install react-year-picker --save
```

```js
import React from "react";
import YearPicker from "react-year-picker";

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(date) {
    console.log(date);
  }

  render() {
    return <YearPicker onChange={this.handleChange} />;
  }
}
```

### Browser Support

The year picker is compatible with the latest versions of Chrome, Firefox, and IE11+.
