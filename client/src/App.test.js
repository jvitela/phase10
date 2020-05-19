import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders login form", () => {
  const { getByText } = render(<App />);
  const nameInput = getByText(/Name/i);
  const joinButton = getByText(/Join/i);
  expect(nameInput).toBeInTheDocument();
  expect(joinButton).toBeInTheDocument();
});
