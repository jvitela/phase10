import React, { useReducer, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
const Store = {};

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return state.concat(action.payload);
    case "REMOVE":
      return state.filter((item) => item.id !== action.payload);
    default:
      return state;
  }
}

export function addNotice(channel, content, timeout) {
  const id = Date.now();
  Store[channel].dispatch({
    type: "ADD",
    payload: { id, content, timeout },
  });
  return id;
}

export function removeNotice(channel, id) {
  Store[channel].dispatch({
    type: "REMOVE",
    payload: id,
  });
}

export const NotificationsList = ({ channel, animation }) => {
  const [state, dispatch] = useReducer(reducer, []);

  useEffect(
    function initChannel() {
      Store[channel] = {
        getState: () => state,
        dispatch: dispatch,
      };
      return function dispose() {
        Store[channel] = null;
      };
    },
    [channel, state, dispatch]
  );

  return (
    <TransitionGroup className="fixed z-100 bottom-0 pb-2 right-0 sm:pb-5 text-right">
      {state.map((item) => (
        <CSSTransition key={item.id} {...animation}>
          <Notification channel={channel} item={item} />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

const Notification = ({ channel, item }) => {
  useEffect(
    function dismiss() {
      const { id, timeout } = item;
      if (timeout) {
        setTimeout(() => removeNotice(channel, id), timeout);
      }
    },
    [channel, item]
  );

  return (
    <div className="transition transform ease-out duration-500 mb-2">
      <div className="inline-block px-2 sm:px-4">
        <div className="p-2 rounded-lg bg-gray-700 shadow-lg sm:p-3">
          <p className="font-medium text-white truncate">{item.content}</p>
        </div>
      </div>
    </div>
  );
};
