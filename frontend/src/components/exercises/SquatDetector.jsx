import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const SquatDetector = ({ videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [squatCount, setSquatCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Setting up MediaPipe Pose and Camera for squat detection
  useEffect(() => {
    if (!videoRef.current || !isWorkoutActive) return;

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
      if (!results.poseLandmarks) return;
      detectSquat(results.poseLandmarks);
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
  }, [videoRef, isWorkoutActive]);

  // Detect squat based on knee and hip angles
  const detectSquat = (landmarks) => {
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftKnee || !rightKnee || !leftHip || !rightHip || !leftAnkle || !rightAnkle) return;

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    const isSquatting = leftKneeAngle < 160 && rightKneeAngle < 160;
    const isStanding = leftKneeAngle > 170 && rightKneeAngle > 170;

    if (isSquatting && !isDown) {
      setIsDown(true);
    } else if (isStanding && isDown) {
      setIsDown(false);
      setSquatCount((prev) => prev + 1);
    }
  };

  // Calculate angle between three points to determine knee angles
  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    return Math.abs((angle * 180) / Math.PI);
  };

  // Draw skeleton lines and points on the canvas
  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const skeletonPairs = [
      [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 12], [23, 24], [11, 23], [12, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;

    skeletonPairs.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvasRef.current.width, start.y * canvasRef.current.height);
        ctx.lineTo(end.x * canvasRef.current.width, end.y * canvasRef.current.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * canvasRef.current.width, point.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  // Handle workout start, stop, and reset actions
  const handleStart = () => {
    setIsWorkoutActive(true);
    setSquatCount(0);
    setShowSavedMessage(false);
  };

  const handleStop = () => {
    setIsWorkoutActive(false);
    handleSave(); // Automatically save on stop
  };

  const handleReset = () => {
    setSquatCount(0);
  };

  // Save workout count to localStorage
  const handleSave = () => {
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts")) || [];
    savedWorkouts.push({ workout: "Squats", count: squatCount, timestamp: new Date().toISOString() });
    localStorage.setItem("workouts", JSON.stringify(savedWorkouts));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video ref={videoRef} autoPlay playsInline className="absolute w-[640px] h-[480px] z-1" />
      <canvas ref={canvasRef} width="640" height="480" className="absolute z-2" />
      <div className="absolute top-5 left-5 bg-gray-900 text-white p-3 rounded text-lg font-bold">
        Squats: {squatCount}
      </div>
      <div className="absolute bottom-10 left-5 flex gap-4">
        <button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Start Workout</button>
        <button onClick={handleStop} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">Stop Workout</button>
        <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Reset Reps</button>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Save Workout</button>
      </div>
      {showSavedMessage && (
        <div className="absolute bottom-5 right-5 bg-green-800 text-white px-4 py-2 rounded text-sm">
          Workout saved!
        </div>
      )}
    </div>
  );
};

SquatDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default SquatDetector;
