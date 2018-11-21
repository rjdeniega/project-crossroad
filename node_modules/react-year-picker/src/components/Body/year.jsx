import React from "react";

function Year({ year, selectedYear, choiseYear }) {
  let selectedYearClass = year === selectedYear ? "selected-year" : "";

  function clickHandler(event) {
    choiseYear(year);
  }

  return (
    <div className="year-wrapper" year={year}>
      <a onClick={clickHandler} className={`year ${selectedYearClass}`}>
        {year}
      </a>
    </div>
  );
}

export default Year;
