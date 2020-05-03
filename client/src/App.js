import React from "react";
import { Provider, useSelector } from "react-redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { LoginPanel } from "components/LoginPanel";
import { LogoutPanel } from "components/LogoutPanel";
import { NotificationsList } from "components/Notifications";
import { phase10 } from "redux/Phase10";
import { sideEffectsMiddleware } from "redux/sideEffectsMiddleware";
import { socketCommsMiddleware } from "redux/socketCommsMiddleware";

const store = configureStore({
  reducer: phase10.reducer,
  middleware: [
    ...getDefaultMiddleware(),
    socketCommsMiddleware,
    sideEffectsMiddleware,
  ],
  devTools: process.env.NODE_ENV !== "production",
});

const toastAnimation = {
  timeout: 500,
  classNames: {},
  onEnter(elem) {
    elem.classList.add("opacity-0", "scale-0");
  },
  onEntering(elem) {
    elem.classList.add("ease-out", "duration-300");
    elem.classList.remove("opacity-0", "scale-0");
  },
  onExit(elem) {
    elem.classList.add("ease-in", "duration-500");
  },
  onExiting(elem) {
    elem.classList.add("opacity-0", "scale-0");
  },
};

function App() {
  return (
    <div className="h-full flex flex-row justify-center items-center">
      <Provider store={store}>
        <Phase10 />
      </Provider>
      <NotificationsList channel="TOASTS" animation={toastAnimation} />
    </div>
  );
}

function Phase10() {
  const isLoggedIn = useSelector((state) => state.color >= 0);
  return isLoggedIn ? <LogoutPanel /> : <LoginPanel />;
}

export default App;
