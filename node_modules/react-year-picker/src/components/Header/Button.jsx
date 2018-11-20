import React from "react";
import FontAwesome from "react-fontawesome";

function Button({ direction, onClick }) {
  let icon = direction === "forward" ? "angle-right" : "angle-left";
  let buttonClass =
    direction === "forward" ? "nav-button-next" : "nav-button-back";
  function handlerClick(e) {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  }

  return (
    <button className={`nav-button  ${buttonClass}`} onClick={handlerClick}>
      <FontAwesome name={icon} size="2x" />
    </button>
  );
}

export default Button;
