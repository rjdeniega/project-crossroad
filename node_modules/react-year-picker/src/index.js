import "babel-polyfill";
import "element-closest";
import "./index.css";
import React, { Component } from "react";
import YearInput from "./components/YearInput";
import PickerPanel from "./components/PickerPanel/index";

class YearPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentYear: "",
      yearIsSelected: false,
      selectedYear: new Date().getFullYear(),
      panelIsOpen: false,
      panelTop: 0,
      panelLeft: 0
    };
  }

  panelPosition = () => {
    const picker = document.querySelector(".year-picker");
    const X = picker.getBoundingClientRect().left; // расстояние от левой стороны окна до левой стороны элемента
    const Y = picker.getBoundingClientRect().bottom; //расстояние от верхней стороны окна до нижней стороны элемента

    const elementHeight = picker.getBoundingClientRect().height; // Высота элемента
    const elementWidth = picker.getBoundingClientRect().width; // Ширина элемента

    const windowHeight = window.innerHeight; //высота окна браузера
    const windowWidth = window.innerWidth; // ширина окна браузера

    const topTrue = Y - elementHeight - 10 > 220;
    const halfTopTrue = Y - elementHeight - 10 > 110;
    const botTrue = windowHeight - Y - 10 > 220;
    const halfBotTrue = windowHeight - Y - 10 > 110;
    const leftTrue = X + elementHeight / 2 > 120;
    const rightTrue = windowWidth - X - elementWidth / 2 > 120;

    if (topTrue && !botTrue && leftTrue && rightTrue) {
      console.log("Сверху  по центру");
      const top = -230;
      const left = -120 + elementWidth / 2;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (!topTrue && botTrue && rightTrue && leftTrue) {
      console.log("Снизу по центру");
      const top = elementHeight + 10;
      const left = -120 + elementWidth / 2;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (halfBotTrue && halfTopTrue && leftTrue && !rightTrue) {
      console.log("Слева по центру");
      const top = -110 + elementHeight / 2;
      const left = -250;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (halfBotTrue && halfTopTrue && !leftTrue && rightTrue) {
      console.log("Справа по центру");
      const top = -110 + elementHeight / 2;
      const left = elementWidth + 10;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (!topTrue && botTrue && leftTrue && !rightTrue) {
      console.log("слева вниз");
      const top = 0;
      const left = -250;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (topTrue && !rightTrue && leftTrue && !botTrue) {
      console.log("слева вверх");
      const top = -220 + elementHeight;
      const left = -250;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (!topTrue && rightTrue && !leftTrue && botTrue) {
      console.log("Справа вниз ");
      const top = 0;
      const left = elementWidth + 10;
      this.setState({ panelTop: top, panelLeft: left });
    } else if (topTrue && rightTrue && !leftTrue && !botTrue) {
      console.log("Справа вверх");
      const top = -220 + elementHeight;
      const left = elementWidth + 10;
      this.setState({ panelTop: top, panelLeft: left });
    }
  };

  componentDidMount() {
    this.panelPosition();

    document.addEventListener(
      "scroll",
      function(event) {
        this.panelPosition();
      }.bind(this)
    );

    document.addEventListener(
      "click",
      function(event) {
        if (!event.target.closest(".year-picker")) {
          this.closePanel();
        }
      }.bind(this)
    );
  }

  openPanel = event => {
    this.panelPosition();
    this.setState({ panelIsOpen: true });
  };

  closePanel = event => {
    this.setState({ panelIsOpen: false });
  };

  callback = ()=>{
    if (this.props.onChange){
      this.props.onChange(this.state.currentYear)
    }
  }

  choiseYear = year => {
    this.setState({
      selectedYear: year,
      currentYear: year,
      yearIsSelected: true
    }, ()=>this.callback());
    this.closePanel();
  };

  clearYear = () => {
    this.setState({
      selectedYear: new Date().getFullYear(),
      currentYear: "",
      yearIsSelected: false
    });
  };

  increaseYear = event => {
    this.setState({ selectedYear: this.state.selectedYear + 1 });
  };

  decreaseYear = event => {
    this.setState({ selectedYear: this.state.selectedYear - 1 });
  };

  jumpForward = event => {
    this.setState({ selectedYear: this.state.selectedYear + 5 });
  };

  jumpBackward = event => {
    this.setState({ selectedYear: this.state.selectedYear - 5 });
  };

  thisYear = event => {
    const year = new Date().getFullYear();
    this.setState({
      currentYear: year,
      selectedYear: year,
      yearIsSelected: true
    });
    this.closePanel();
  };

  render() {
    return (
      <div className="year-picker">
        <YearInput
          value={this.state.currentYear}
          openPanel={this.openPanel}
          selected={this.state.yearIsSelected}
          clear={this.clearYear}
        />
        <PickerPanel
          isOpen={this.state.panelIsOpen}
          selectedYear={this.state.selectedYear}
          currentYear={this.state.currentYear}
          increaseYear={this.increaseYear}
          decreaseYear={this.decreaseYear}
          jumpForward={this.jumpForward}
          jumpBackward={this.jumpBackward}
          thisYear={this.thisYear}
          choiseYear={this.choiseYear}
          top={this.state.panelTop}
          left={this.state.panelLeft}
        />
      </div>
    );
  }
}

export default YearPicker;
