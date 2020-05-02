import React from "react";
import classnames from "classnames";

export function Alert({ color, title, message }) {
  const cls = classnames(
    `bg-${color}-100`,
    "border-t-4",
    `border-${color}-500`,
    "rounded-b",
    `text-${color}-900`,
    "px-4",
    "py-3",
    "shadow-md",
    "mb-4"
  );
  return (
    <div className={cls} role="alert">
      <div className="flex">
        <div className="py-1 mr-2">
          <i className="fas fa-exclamation"></i>
        </div>
        <div>
          <p className="font-bold pt-1">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
