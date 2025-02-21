import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
// import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";

const SquatDetector = ({ landmarks, videoRef, canvasRef }) => {
  const [squatCount] = useState(0);
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoElement = videoRef || internalVideoRef;
  const canvasElement = canvasRef || internalCanvasRef;

  useEffect(() => {
    const startCamera = async () => {
      if (!videoElement.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        videoElement.current.srcObject = stream;
        console.log("Camera started successfully ✅");
      } catch (err) {
        console.error("❌ Error accessing camera:", err);
      }
    };

    startCamera();
  }, []);

  useEffect(() => {
    if (!landmarks || !videoElement.current || !canvasElement.current) {
      console.warn("❌ Landmarks, video, or canvas not available.");
      return;
    }

    console.log("✅ Landmarks detected:", landmarks);

    const canvas = canvasElement.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoElement.current.videoWidth || 640;
    canvas.height = videoElement.current.videoHeight || 480;
    console.log(`🎨 Canvas size set to: ${canvas.width}x${canvas.height}`);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    landmarks.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "yellow";
      ctx.fill();
      console.log(`📍 Drawing point ${index} at: x=${point.x}, y=${point.y}`);
    });

    const connect = (a, b) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
      ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
      ctx.stroke();
      console.log(`🔗 Connecting ${a} to ${b}`);
    };

    const connections = [
      [11, 13], [13, 15], // Left Leg
      [12, 14], [14, 16], // Right Leg
      [11, 12], [11, 23], [12, 24], // Shoulders to torso
      [23, 25], [25, 27], [24, 26], [26, 28] // Legs
    ];

    connections.forEach(([a, b]) => {
      if (landmarks[a] && landmarks[b]) connect(a, b);
    });
  }, [landmarks]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mt-4">Squat Counter</h1>

      <div className="relative mt-4">
        <video ref={videoElement} autoPlay playsInline className="w-[640px] h-[480px] rounded-lg shadow-lg" />
        <canvas ref={canvasElement} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <div className="absolute top-5 right-5 bg-black/70 px-6 py-3 rounded-lg text-xl font-semibold shadow-md">
        Squats: {squatCount}
      </div>
    </div>
  );
};

SquatDetector.propTypes = {
  landmarks: PropTypes.array,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default SquatDetector;
