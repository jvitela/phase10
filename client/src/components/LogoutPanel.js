import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "components/Button";
import { phase10 } from "reducers/Phase10";

export function LogoutPanel() {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.players[state.color].name);

  const onLeaveGame = () => {
    dispatch(phase10.actions.leaveGame());
  };

  return (
    <div className="bg-white shadow-md rounded px-6 py-6 my-6 flex flex-col mx-auto w-64">
      <h2 className="text-xl text-blue-700 mb-4">Logout</h2>
      <p className="text-gray-700 mb-4">
        You are currently connected as: {name}
      </p>
      <Button onClick={onLeaveGame}>Leave</Button>
    </div>
  );
}
