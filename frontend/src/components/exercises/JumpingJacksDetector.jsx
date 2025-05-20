import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const JumpingJacksDetector = ({ landmarks, videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [jumpCount, setJumpCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      console.warn("Invalid or insufficient landmarks data.");
      return;
    }

    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (!leftAnkle || !rightAnkle || !leftWrist || !rightWrist) {
      console.warn("Some required keypoints are missing.");
      return;
    }

    // Average Y position of ankles and wrists
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const wristY = (leftWrist.y + rightWrist.y) / 2;

    // Conditions for a jumping jack motion
    const legsApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.1;
    const handsAboveHead = wristY < ankleY - 0.1;

    if (legsApart && handsAboveHead) {
      if (!isJumping) setIsJumping(true);
    } else {
      if (isJumping) {
        setIsJumping(false);
        setJumpCount((prev) => prev + 1);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000); // Hide message after 2 seconds
      }
    }
  }, [landmarks, isJumping]);

  useEffect(() => {
    if (!canvasRef.current) {
      console.warn("Canvas reference is not available.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.warn("Could not get canvas 2D context.");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;

    [15, 16, 27, 28].forEach((index) => {
      const point = landmarks[index];
      if (!point) return;
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();
    });
  }, [canvasRef, landmarks]);

  // Handlers for workout buttons
  const handleStart = () => {
    setJumpCount(0);
    setShowSavedMessage(false);
  };

  const handleStop = () => {
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts")) || [];
    savedWorkouts.push({ exercise: "Jumping Jacks", count: jumpCount });
    localStorage.setItem("workouts", JSON.stringify(savedWorkouts));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };
  

  const handleReset = () => {
    setJumpCount(0);
    setShowSavedMessage(false);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          position: "absolute",
          width: "640px",
          height: "480px",
          zIndex: 1,
        }}
      />

      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          position: "absolute",
          width: "640px",
          height: "480px",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          fontSize: "20px",
          borderRadius: "8px",
          zIndex: 3,
        }}
      >
        <h2>Jumping Jacks: {jumpCount}</h2>
      </div>
      <div className="absolute bottom-10 left-5 flex gap-4">
        <button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Start Workout
        </button>
        <button onClick={handleStop} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">
          Stop Workout
        </button>
        <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Reset Reps
        </button>
      </div>

      {/* Saved message */}
      {showSavedMessage && (
        <div className="absolute top-20 left-5 bg-green-800 text-white px-4 py-2 rounded">
          Jumping Jacks saved to history!
        </div>
      )}
    </div>
  );
};

JumpingJacksDetector.propTypes = {
  landmarks: PropTypes.array.isRequired,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default JumpingJacksDetector;
