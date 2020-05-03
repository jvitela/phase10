import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "components/Button";
import { Alert } from "components/Alert";
import { PlayerNameInput } from "components/PlayerNameInput";
import { phase10 } from "redux/Phase10";

const isValidName = /^[a-zA-Z0-9.!_ ]{3,15}$/;

export function LoginPanel() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.isLoading);
  const errorMsg = useSelector((state) => state.error);
  const [name, setName] = useState("");
  const isValid = isValidName.test(name);

  const onJoinGame = () => {
    dispatch(phase10.actions.joinGame(name));
  };

  return (
    <div className="bg-white shadow-md rounded px-6 py-6 my-6 flex flex-col mx-auto w-64">
      <h2 className="text-xl text-blue-700 mb-4">Login</h2>
      {errorMsg && <Alert color="red" title="Error" message={errorMsg} />}
      <PlayerNameInput onChange={(evt) => setName(evt.target.value)} />
      <Button onClick={onJoinGame} disabled={isLoading || !isValid}>
        {isLoading ? "Loading..." : "Join"}
      </Button>
    </div>
  );
}
