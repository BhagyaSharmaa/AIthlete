import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

const PullupDetector = ({ videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [pullupCount, setPullupCount] = useState(0);
  const [isUp, setIsUp] = useState(false);
  const [prevWristY, setPrevWristY] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      refineFaceLandmarks: false,
    });

    holistic.onResults((results) => {
      if (!results.poseLandmarks) return;

      const landmarks = results.poseLandmarks;
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];

      if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return;

      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const wristY = (leftWrist.y + rightWrist.y) / 2;

      if (prevWristY !== null) {
        const velocity = wristY - prevWristY;

        if (wristY < shoulderY - 0.05 && !isUp && velocity < -0.005) {
          setIsUp(true);
        } else if (wristY > shoulderY - 0.02 && isUp && velocity > 0.005) {
          setIsUp(false);
          setPullupCount((prev) => prev + 1);
        }
      }

      setPrevWristY(wristY);

      // 🎨 Fix: Ensure canvas exists before drawing
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "red";

      [leftShoulder, rightShoulder, leftWrist, rightWrist].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await holistic.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      holistic.close();
    };
  }, [videoRef, canvasRef, isUp, prevWristY]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      {/* 🎥 Fix: Ensure both video & canvas render properly */}
      <video ref={videoRef} autoPlay playsInline style={{ position: "absolute", width: "640px", height: "480px", zIndex: 1 }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", width: "640px", height: "480px", zIndex: 2, backgroundColor: "transparent" }} />
      <div style={{ position: "absolute", top: "20px", left: "20px", padding: "10px 20px", backgroundColor: "rgba(0, 0, 0, 0.7)", color: "white", fontSize: "20px", borderRadius: "8px", zIndex: 3, fontWeight: "bold" }}>
        Pull-ups: {pullupCount}
      </div>
    </div>
  );
};

PullupDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default PullupDetector;
