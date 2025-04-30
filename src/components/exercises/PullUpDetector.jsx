import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const PullupDetector = ({ videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);
  const cameraRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [pullupCount, setPullupCount] = useState(0);
  const [isUp, setIsUp] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    if (!isWorkoutActive || !videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        setLandmarks(results.poseLandmarks);
      }
      drawSkeleton(results.poseLandmarks);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      camera.stop();
    };
  }, [isWorkoutActive]);

  useEffect(() => {
    if (!landmarks || landmarks.length < 17) return;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return;

    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const wristY = (leftWrist.y + rightWrist.y) / 2;
    const isAboveBar = wristY < shoulderY - 0.02;

    if (isAboveBar && !isUp) {
      setIsUp(true);
    } else if (!isAboveBar && isUp) {
      setIsUp(false);
      setPullupCount((prev) => prev + 1);
    }
  }, [landmarks, isUp]);

  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;

    const skeletonPairs = [
      [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 12], [23, 24], [11, 23], [12, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    skeletonPairs.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((point) => {
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  const handleStart = () => {
    setIsWorkoutActive(true);
    setShowSavedMessage(false);
  };

  const handleStop = () => {
    setIsWorkoutActive(false);
    if (cameraRef.current) {
      cameraRef.current.stop();
    }

    // Save to localStorage
    const previousReps = JSON.parse(localStorage.getItem("pullupReps")) || [];
    const updatedReps = [
      ...previousReps,
      {
        timestamp: new Date().toISOString(),
        reps: pullupCount,
      },
    ];
    localStorage.setItem("pullupReps", JSON.stringify(updatedReps));
    setShowSavedMessage(true);
  };

  const handleReset = () => {
    setPullupCount(0);
    setIsUp(false);
    setShowSavedMessage(false);
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute w-[640px] h-[480px] z-1"
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="absolute z-2"
      />
      <div className="absolute top-5 left-5 bg-gray-900 text-white p-3 rounded text-lg font-bold">
        Pull-ups: {pullupCount}
      </div>

      <div className="absolute bottom-10 left-5 flex gap-4">
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Start Workout
        </button>
        <button
          onClick={handleStop}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Stop Workout
        </button>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reset Reps
        </button>
      </div>

      {showSavedMessage && (
        <div className="absolute bottom-5 right-5 bg-green-800 text-white px-4 py-2 rounded text-sm">
          Workout saved!
        </div>
      )}
    </div>
  );
};

PullupDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default PullupDetector;
