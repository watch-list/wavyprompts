import React from "https://aistudiocdn.com/react@^19.2.1";
import ReactDOM from "https://aistudiocdn.com/react-dom@^19.2.1/client";

function App() {
  return React.createElement(
    "div",
    { className: "min-h-screen flex items-center justify-center text-white text-4xl font-bold" },
    "✅ WavyPrompts is LIVE"
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
