import { render, screen, fireEvent } from "@testing-library/react";
import Chat from "./components/Chat";

describe("Chat Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("check username in localstorage", () => {
    render(<Chat />);
    expect(screen.getByText(/Masukkan Username/i)).toBeInTheDocument();
  });

  it("check chatroom channel", () => {
    localStorage.setItem("userlocal", "Tester");
    render(<Chat />);
    expect(screen.getByText(/Chatroom: General/i)).toBeInTheDocument();
  });
  
});