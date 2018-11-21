import React from "react";

function YearInput({ value, openPanel, selected, clear }) {
  const selectedClass = selected ? "imput-wrapper-selected" : "";

  function clearHandler(e) {
    clear();
  }

  return (
    <div className={`input-wrapper ${selectedClass}`}>
      <input
        className="year-input"
        value={value}
        onClick={openPanel}
        placeholder="Select"
        readOnly
      />
      <i
        name="times"
        className="input-icon input-icon-calendar fa fa-calendar"
      />
      <i
        name="calendar"
        className="input-icon input-icon-close fa fa-times"
        onClick={clearHandler}
      />
    </div>
  );
}

export default YearInput;
