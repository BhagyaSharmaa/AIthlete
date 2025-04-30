import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const JumpingJacksDetector = ({ landmarks, videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [jumpCount, setJumpCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(true);

  useEffect(() => {
    if (!landmarks || landmarks.length < 29 || !isDetectionActive) {
      console.warn("Invalid or insufficient landmarks data or detection is inactive.");
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

    const ankleY = (leftAnkle.y + rightAnkle.y) / 2;
    const wristY = (leftWrist.y + rightWrist.y) / 2;

    const legsApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.1;
    const handsAboveHead = wristY < ankleY - 0.1;

    if (legsApart && handsAboveHead) {
      if (!isJumping) setIsJumping(true);
    } else {
      if (isJumping) {
        setIsJumping(false);
        setJumpCount((prev) => prev + 1);
      }
    }
  }, [landmarks, isJumping, isDetectionActive]);

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

  const handleStartStopDetection = () => {
    setIsDetectionActive((prev) => !prev);
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
        flexDirection: "column",
      }}
    >
      {/* Video Element */}
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

      {/* Canvas for Pose Skeleton */}
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

      {/* Jumping Jacks Counter Overlay */}
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

      {/* Buttons to Start/Stop Detection */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
          display: "flex",
          gap: "20px",
        }}
      >
        <button
          onClick={handleStartStopDetection}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isDetectionActive ? "red" : "green",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {isDetectionActive ? "Stop Detection" : "Start Detection"}
        </button>
      </div>
    </div>
  );
};

JumpingJacksDetector.propTypes = {
  landmarks: PropTypes.array,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default JumpingJacksDetector;
