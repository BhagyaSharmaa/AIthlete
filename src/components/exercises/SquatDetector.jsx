import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook

const SquatDetector = ({ videoRef: externalVideoRef, canvasRef: externalCanvasRef }) => {
  const internalVideoRef = useRef(null);
  const internalCanvasRef = useRef(null);

  const videoRef = externalVideoRef ?? internalVideoRef;
  const canvasRef = externalCanvasRef ?? internalCanvasRef;

  const [squatCount, setSquatCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [isActive, setIsActive] = useState(true); // For controlling the detection

  const { user } = useUser(); // Fetch user data from Clerk

  useEffect(() => {
    if (!videoRef.current || !isActive) return;

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
  }, [isActive]);

  const detectSquat = (landmarks) => {
    if (landmarks.length < 33) return;

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

  const calculateAngle = (p1, p2, p3) => {
    const dx1 = p1.x - p2.x;
    const dy1 = p1.y - p2.y;
    const dx2 = p3.x - p2.x;
    const dy2 = p3.y - p2.y;
    const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    return Math.abs((angle * 180) / Math.PI);
  };

  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const skeletonPairs = [
      [11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [23, 24], [11, 23], [12, 24], 
      [23, 25], [25, 27], [24, 26], [26, 28]
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

  const toggleDetection = () => {
    setIsActive((prevState) => !prevState);
  };

  // End workout function to save data to localStorage
  const endWorkout = () => {
    if (user) {
      // Save workout data to localStorage
      const workoutData = {
        workoutName: "Squat Workout",
        squatCount,
        userId: user.id,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("lastWorkout", JSON.stringify(workoutData));
      alert("Workout saved!");
    }
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video ref={videoRef} autoPlay playsInline className="absolute w-[640px] h-[480px] z-1" />
      <canvas ref={canvasRef} width="640" height="480" className="absolute z-2" />
      <div className="absolute top-5 left-5 bg-gray-900 text-white p-3 rounded text-lg font-bold">
        Squats: {squatCount}
      </div>

      {/* Buttons for controlling the squat detection */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 space-x-4 z-10">
        <button
          onClick={toggleDetection}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => setSquatCount(0)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Reset
        </button>
        <button
          onClick={endWorkout}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          End Workout
        </button>
      </div>
    </div>
  );
};

SquatDetector.propTypes = {
  videoRef: PropTypes.object,
  canvasRef: PropTypes.object,
};

export default SquatDetector;
