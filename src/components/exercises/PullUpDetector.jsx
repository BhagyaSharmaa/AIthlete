import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const PullupDetector = ({ videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [pullupCount, setPullupCount] = useState(0);
  const [isUp, setIsUp] = useState(false);
  const [landmarks, setLandmarks] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize the Pose detector from Mediapipe
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
        setLandmarks(results.poseLandmarks); // Update landmarks state with the detected landmarks
      }
      drawSkeleton(results.poseLandmarks); // Draw skeleton when pose is detected
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, [videoRef]);

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

  // Draw skeleton & keypoints on canvas
  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    ctx.strokeStyle = "cyan";
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
    </div>
  );
};

PullupDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default PullupDetector;