import React, { useRef, useEffect } from "react";
import { TextInput } from "components/TextInput";

export function PlayerNameInput({ onChange, ...props }) {
  const inputRef = useRef();
  // const [error, setError] = useState(null);

  // function onNameChange(event) {
  //   const name = event.target.value;
  //   if (isValidName.test(name)) {
  //     setError(null);
  //     onChange(name);
  //   } else {
  //     onChange("");
  //   }
  // }

  // function onValidate(event) {
  //   const name = event.target.value;
  //   if (!isValidName.test(name)) {
  //     setError("invalid_name");
  //   } else {
  //     setError(null);
  //   }
  // }

  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <TextInput
      {...props}
      id="name"
      label="Name"
      className="mb-4"
      ref={inputRef}
      minLength={3}
      maxLength={15}
      onChange={onChange}
    />
  );
}
