// src/components/Webcam.js
import { useRef } from "react";
import GlassesView from "./GlassesView";

const Webcam = ({ selectedGlasses, setSelectedGlasses }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  return (
    <div className="h-96">
      <GlassesView
        videoRef={videoRef}
        canvasRef={canvasRef}
        glasses={selectedGlasses}
      />
      <div
        id="controls"
        className="flex flex-col items-start gap-2 p-4 bg-gray-100 rounded-lg shadow-md"
      >
        <label
          htmlFor="glassesSelector"
          className="text-sm font-medium text-gray-700"
        >
          Choisissez vos lunettes :
        </label>
        <select
          id="glassesSelector"
          value={selectedGlasses}
          onChange={(e) => setSelectedGlasses(e.target.value)}
          className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="/models/sans_nom5.glb">Modèle 1</option>
          <option value="/models/sans_nom1.glb">Modèle 2</option>
          <option value="/models/sans_nom2.glb">Modèle 3</option>
          <option value="/models/sans_nom3.glb">Lunettes C</option>
        </select>
      </div>
      <div className="w-full h-full relative">
        <video ref={videoRef} playsInline autoPlay muted></video>
        <canvas
          className="!w-full !h-full !z-50 !relative"
          ref={canvasRef}
        ></canvas>
      </div>
    </div>
  );
};

export default Webcam;
