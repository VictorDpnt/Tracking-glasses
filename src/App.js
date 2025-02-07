// src/App.js
import React, { useState } from "react";
import Chatbot from "./components/Chatbot";
import Webcam from "./components/Webcam";
import sunglasses from "./data/sunglasses.json";

function App() {
  const [selectedGlasses, setSelectedGlasses] = useState(
    "/models/sans_nom5.glb"
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Section pour la caméra (Webcam) */}
      <div style={{ flex: 2, position: "relative" }}>
        <Webcam
          selectedGlasses={selectedGlasses}
          setSelectedGlasses={setSelectedGlasses}
        />
      </div>
      {/* Section pour le chatbot */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#f8f8f8",
          padding: "1rem",
        }}
      >
        <Chatbot setSelectedGlasses={setSelectedGlasses} />
      </div>
    </div>
  );
}

export default App;
