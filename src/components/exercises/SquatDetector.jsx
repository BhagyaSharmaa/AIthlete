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
  }, []);

  // Detect squat count based on knee angle and vertical position
  const detectSquat = (landmarks) => {
    if (landmarks.length < 33) return;

    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftKnee || !rightKnee || !leftHip || !rightHip || !leftAnkle || !rightAnkle) return;

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle); // Left knee angle
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle); // Right knee angle

    const isSquatting = leftKneeAngle < 160 && rightKneeAngle < 160; // Threshold for squatting
    const isStanding = leftKneeAngle > 170 && rightKneeAngle > 170; // Threshold for standing position

    if (isSquatting && !isDown) {
      setIsDown(true); // User is squatting down
    } else if (isStanding && isDown) {
      setIsDown(false); // User is standing up
      setSquatCount((prev) => prev + 1); // Increment squat count
    }
  };

  // Calculate angle between three points (hip, knee, and ankle)
  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    return Math.abs((angle * 180) / Math.PI);
  };

  // Draw skeleton & keypoints
  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const skeletonPairs = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [23, 24], // Hips
      [11, 23], [12, 24], // Torso
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;

    // Draw skeleton lines
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

    // Draw keypoints (red dots)
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * canvasRef.current.width, point.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video ref={videoRef} autoPlay playsInline className="absolute w-[640px] h-[480px] z-1" />

      <canvas ref={canvasRef} width="640" height="480" className="absolute z-2" />

      <div className="absolute top-5 left-5 bg-gray-900 text-white p-3 rounded text-lg font-bold">
        Squats: {squatCount}
      </div>
    </div>
  );
};

SquatDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default SquatDetector;