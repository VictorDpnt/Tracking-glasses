import React from "react";
import Chatbot from "../components/Chatbot";
import Webcam from "../components/Webcam";

const Home = () => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="text-center">
        <Webcam />
      </div>
      <Chatbot />
    </div>
  );
};

export default Home;
