import React from "react";
import { Provider, useSelector } from "react-redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { LoginPanel } from "components/LoginPanel";
import { LogoutPanel } from "components/LogoutPanel";
import { phase10 } from "reducers/Phase10";

const store = configureStore({
  reducer: phase10.reducer,
  middleware: [...getDefaultMiddleware(), phase10.middleware],
  devTools: process.env.NODE_ENV !== "production",
});

function App() {
  return (
    <Provider store={store}>
      <div className="h-full flex flex-row justify-center items-center">
        <Phase10 />
      </div>
    </Provider>
  );
}

function Phase10() {
  const isLoggedIn = useSelector((state) => state.color >= 0);
  return isLoggedIn ? <LogoutPanel /> : <LoginPanel />;
}

export default App;
