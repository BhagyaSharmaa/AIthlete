import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const PushUpDetector = ({ landmarks, videoRef, canvasRef }) => {
  const [pushUpCount, setPushUpCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
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
        console.log("Camera started successfully");
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();
  }, []);

  useEffect(() => {
    if (!landmarks || !videoElement.current || !canvasElement.current) {
      console.warn("Landmarks, video, or canvas not available.");
      return;
    }

    console.log("Landmarks detected:", landmarks);

    const canvas = canvasElement.current;
    const ctx = canvas.getContext("2d");

    // Ensure Canvas Matches Video Size
    canvas.width = videoElement.current.videoWidth || 640;
    canvas.height = videoElement.current.videoHeight || 480;
    console.log(`Canvas size set to: ${canvas.width}x${canvas.height}`);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    // Draw Joints (Keypoints)
    landmarks.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "yellow";
      ctx.fill();
      console.log(`Drawing point ${index} at: x=${point.x}, y=${point.y}`);
    });

    // Draw Skeleton (Lines)
    const connect = (a, b) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
      ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
      ctx.stroke();
      console.log(`Connecting ${a} to ${b}`);
    };

    // Connect Key Points for the Skeleton
    const connections = [
      [11, 13], [13, 15], // Left Arm
      [12, 14], [14, 16], // Right Arm
      [11, 12], [11, 23], [12, 24], // Shoulders to torso
      [23, 25], [25, 27], [24, 26], [26, 28] // Legs
    ];
    
    connections.forEach(([a, b]) => {
      if (landmarks[a] && landmarks[b]) connect(a, b);
    });

    // Push-Up Detection Logic
    detectPushUps(landmarks);

  }, [landmarks]);

  // Calculate angle between three points (shoulder, elbow, and wrist)
  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    return Math.abs((angle * 180) / Math.PI);
  };

  // Detect push-up based on elbow angle
  const detectPushUps = (landmarks) => {
    if (landmarks.length < 33) return;

    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) return;

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Define thresholds for elbow angles (this can be adjusted based on needs)
    const elbowThreshold = 150; // Elbow angle below this means pushing up (top position)
    const elbowBentThreshold = 90; // Elbow angle below this means bottom position

    // Detect if the user is at the bottom of the push-up
    if (leftElbowAngle < elbowBentThreshold && rightElbowAngle < elbowBentThreshold && !isDown) {
      setIsDown(true);
    }

    // Detect if the user is at the top of the push-up
    if (leftElbowAngle > elbowThreshold && rightElbowAngle > elbowThreshold && isDown) {
      setIsDown(false);
      setPushUpCount((prev) => prev + 1); // Increment push-up count
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
    </div>
  );
};

PushUpDetector.propTypes = {
  landmarks: PropTypes.array,
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default PushUpDetector;