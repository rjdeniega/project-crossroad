import React from "react";
import Year from "./year";

function YearsList({ selectedYear, choiseYear }) {
  const startYear = selectedYear - 4;
  const yearsArray = Array.from(
    new Array(9),
    (val, index) => index + startYear
  );

  return yearsArray.map(item => (
    <Year
      key={item}
      choiseYear={choiseYear}
      selectedYear={selectedYear}
      year={item}
    />
  ));
}

export default YearsList;
