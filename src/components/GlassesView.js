import { useEffect, useRef } from "react";
import { GlassesTryOn } from "./GlassesTryOn";

const GlassesView = ({ videoRef, canvasRef, glasses }) => {
  const trackerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const initialize = async () => {
      const glassesTryOn = new GlassesTryOn(
        videoRef.current,
        canvasRef.current
      );
      await glassesTryOn.init();
      trackerRef.current = glassesTryOn;

      await glassesTryOn.loadGlassesModel(glasses);
    };

    initialize();

    return () => {
      trackerRef.current = null;
    };
  }, [videoRef, canvasRef]);

  useEffect(() => {
    if (trackerRef.current) {
      trackerRef.current.loadGlassesModel(glasses);
    }
  }, [glasses]);

  return null;
};

export default GlassesView;
