import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const LungesDetector = ({ landmarks, videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [lungeCount, setLungeCount] = useState(0);
  const [isLunging, setIsLunging] = useState(false);

  useEffect(() => {
    if (!landmarks || landmarks.length < 29) {
      console.warn("Invalid or insufficient landmarks data.");
      return;
    }

    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      console.warn("Some required keypoints are missing.");
      return;
    }

    // Compute knee position relative to ankle
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

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    landmarks
      ?.filter((point, index) => [25, 26, 27, 28].includes(index)) // Only keypoints we need
      .forEach((point) => {
        if (!point) return;
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      });
  }, [canvasRef, landmarks]);

  // Initialize Pose and Camera
  useEffect(() => {
    if (!videoRef.current) return;

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

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    pose.onResults((results) => {
      if (results.poseLandmarks) {
        landmarks = results.poseLandmarks; // Update landmarks with Pose detection results
        drawSkeleton(results.poseLandmarks); // Draw skeleton on canvas
      }
    });
  }, [videoRef]);

  // Draw skeleton & keypoints on canvas
  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    const skeletonPairs = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [23, 24], // Hips
      [11, 23], [12, 24], // Torso
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    // Draw skeleton lines
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

    // Draw keypoints (red dots)
    landmarks.forEach((point) => {
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
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

      {/* Lunge Counter Overlay */}
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
        <h2>Lunges: {lungeCount}</h2>
      </div>
    </div>
  );
};

LungesDetector.propTypes = {
  landmarks: PropTypes.array.isRequired,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default LungesDetector;