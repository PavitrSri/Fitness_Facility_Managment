import React from "react";
import { render, screen } from "@testing-library/react";
import Schedule from "../components/Schedule";

describe("Schedule Component", () => {
  test("renders the schedule heading", () => {
    render(<Schedule />);
    
    const heading = screen.getByText(/our schedule/i);
    expect(heading).toBeInTheDocument();
  });

  test("shows the schedule image", () => {
    render(<Schedule />);

    const img = screen.getByRole("img", { name: /schedule/i });
    expect(img).toBeInTheDocument();
  });

  test("displays the additional information text", () => {
    render(<Schedule />);

    const infoText = screen.getByText(/additional details about the schedule/i);
    expect(infoText).toBeInTheDocument();
  });
});
