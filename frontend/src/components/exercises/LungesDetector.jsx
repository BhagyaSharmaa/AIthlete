import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const LungesDetector = ({
  videoRef: externalVideoRef,
  canvasRef: externalCanvasRef,
  workoutName = "Lunges",
}) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);
  const cameraRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [lungeCount, setLungeCount] = useState(0);
  const [isLunging, setIsLunging] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Start Mediapipe pose detection
  useEffect(() => {
    if (!isWorkoutActive || !videoRef.current) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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

  // Count lunges based on pose
  useEffect(() => {
    if (!landmarks || landmarks.length < 29) return;

    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;

    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const isDeepLunge = kneeY > ankleY + 0.02;

    if (isDeepLunge && !isLunging) {
      setIsLunging(true);
    } else if (!isDeepLunge && isLunging) {
      setIsLunging(false);
      setLungeCount((prev) => prev + 1);
    }
  }, [landmarks, isLunging]);

  // Draw skeleton on canvas
  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;

    const skeletonPairs = [
      [23, 25], [25, 27], [24, 26], [26, 28], // legs
      [11, 13], [13, 15], [12, 14], [14, 16], // arms
      [11, 12], [23, 24], [11, 23], [12, 24], // torso
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
  };

  // Controls
  const handleStart = () => {
    setLungeCount(0);
    setIsWorkoutActive(true);
    setShowSavedMessage(false);
  };

  const handleStop = () => {
    setIsWorkoutActive(false);
    const saved = JSON.parse(localStorage.getItem("workouts")) || [];
    saved.push({ exercise: workoutName, count: lungeCount });
    localStorage.setItem("workouts", JSON.stringify(saved));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const handleReset = () => {
    setLungeCount(0);
    setShowSavedMessage(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: "absolute", width: "640px", height: "480px", zIndex: 1 }}
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", width: "640px", height: "480px", zIndex: 2 }}
      />

      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        fontSize: "20px",
        borderRadius: "8px",
        zIndex: 3,
      }}>
        <h2>Lunges: {lungeCount}</h2>
      </div>

      <div style={{ position: "absolute", bottom: "10px", left: "5px", display: "flex", gap: "4px", zIndex: 3 }}>
        <button onClick={handleStart} style={{ backgroundColor: "#16a34a", color: "white", padding: "8px 16px", borderRadius: "4px" }}>
          Start Workout
        </button>
        <button onClick={handleStop} style={{ backgroundColor: "#ca8a04", color: "white", padding: "8px 16px", borderRadius: "4px" }}>
          Stop Workout
        </button>
        <button onClick={handleReset} style={{ backgroundColor: "#dc2626", color: "white", padding: "8px 16px", borderRadius: "4px" }}>
          Reset Reps
        </button>
      </div>

      {showSavedMessage && (
        <div style={{
          position: "absolute",
          top: "80px",
          left: "5px",
          backgroundColor: "#065f46",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          zIndex: 3,
        }}>
          Lunges saved to history!
        </div>
      )}
    </div>
  );
};

LungesDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
  workoutName: PropTypes.string,
};

export default LungesDetector;
