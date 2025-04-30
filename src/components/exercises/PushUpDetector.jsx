import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const PushUpDetector = ({ landmarks, videoRef, canvasRef }) => {
  const [pushUpCount, setPushUpCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);

  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);
  const streamRef = useRef(null); // Store camera stream for stopping later

  const videoElement = videoRef || internalVideoRef;
  const canvasElement = canvasRef || internalCanvasRef;

  const startCamera = async () => {
    if (!videoElement.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      streamRef.current = stream;
      videoElement.current.srcObject = stream;
      setCameraStarted(true);
      console.log("Camera started successfully");
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      videoElement.current.srcObject = null;
      setCameraStarted(false);
      console.log("Camera stopped");
    }
  };

  const resetCounter = () => {
    setPushUpCount(0);
    setIsDown(false);
  };

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  useEffect(() => {
    if (!landmarks || !videoElement.current || !canvasElement.current) return;

    const canvas = canvasElement.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoElement.current.videoWidth || 640;
    canvas.height = videoElement.current.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "yellow";
      ctx.fill();
    });

    const connect = (a, b) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
      ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
      ctx.stroke();
    };

    const connections = [
      [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 12], [11, 23], [12, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    connections.forEach(([a, b]) => {
      if (landmarks[a] && landmarks[b]) connect(a, b);
    });

    detectPushUps(landmarks);
  }, [landmarks]);

  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    return Math.abs((angle * 180) / Math.PI);
  };

  const detectPushUps = (landmarks) => {
    if (landmarks.length < 33) return;

    const [lS, lE, lW] = [landmarks[11], landmarks[13], landmarks[15]];
    const [rS, rE, rW] = [landmarks[12], landmarks[14], landmarks[16]];

    const leftAngle = calculateAngle(lS, lE, lW);
    const rightAngle = calculateAngle(rS, rE, rW);

    const elbowThreshold = 150;
    const elbowBentThreshold = 90;

    if (leftAngle < elbowBentThreshold && rightAngle < elbowBentThreshold && !isDown) {
      setIsDown(true);
    }

    if (leftAngle > elbowThreshold && rightAngle > elbowThreshold && isDown) {
      setIsDown(false);
      setPushUpCount((prev) => prev + 1);

      // Save the count and timestamp to localStorage when a push-up is completed
      const timestamp = new Date().toISOString();
      const workoutData = JSON.parse(localStorage.getItem("pushUpWorkoutData")) || [];
      workoutData.push({ count: pushUpCount + 1, timestamp });
      localStorage.setItem("pushUpWorkoutData", JSON.stringify(workoutData));
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mt-4">Push-Up Counter</h1>

      <div className="relative mt-4">
        <video ref={videoElement} autoPlay playsInline className="w-[640px] h-[480px] rounded-lg shadow-lg" />
        <canvas ref={canvasElement} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <div className="absolute top-5 right-5 bg-black/70 px-6 py-3 rounded-lg text-xl font-semibold shadow-md">
        Push-ups: {pushUpCount}
      </div>

      <div className="mt-6 flex gap-4">
        {!cameraStarted && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
          >
            Start Camera
          </button>
        )}
        {cameraStarted && (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Stop Camera
          </button>
        )}
        <button
          onClick={resetCounter}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold text-black"
        >
          Reset Counter
        </button>
      </div>
    </div>
  );
};

PushUpDetector.propTypes = {
  landmarks: PropTypes.array,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default PushUpDetector;
