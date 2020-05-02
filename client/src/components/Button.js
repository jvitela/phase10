import React from "react";
import classnames from "classnames";

export function Button({ children, disabled, ...props }) {
  const styles = classnames(
    "bg-blue-600",
    "text-white font-bold",
    "py-2 px-4",
    "rounded",
    "focus:outline-none focus:shadow-outline",
    "transition ease-in-out duration-300",
    disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
  );
  return (
    <button {...props} disabled={disabled} className={styles} type="button">
      {children}
    </button>
  );
}
