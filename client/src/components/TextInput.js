import React, { useState } from "react";
import classnames from "classnames";

export const TextInput = React.forwardRef(
  ({ id, label, className, error, ...props }, ref) => {
    const [hasFocus, setFocus] = useState(false);

    const cls = classnames(
      "block",
      "shadow-inner",
      "border",
      "rounded",
      "pt-2",
      "px-2",
      "text-grey-darker",
      { "shadow-outline": hasFocus },
      className
    );

    return (
      <label htmlFor={id} className={cls}>
        <div className="block text-grey-700 font-light">{label}</div>
        <input
          {...props}
          ref={ref}
          id={id}
          type="text"
          className="outline-none text-lg"
          onFocus={(event) => {
            setFocus(true);
            props.onFocus && props.onFocus(event);
          }}
          onBlur={(event) => {
            setFocus(false);
            props.onBlur && props.onBlur(event);
          }}
        />
        <div className="leading-none text-red-500 h-5">{error}</div>
      </label>
    );
  }
);
