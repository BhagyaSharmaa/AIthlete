import { useState, useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const PushUpTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const { user } = useUser();

  const [pushUpCount, setPushUpCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load recent activities on component mount
    const savedReps = JSON.parse(localStorage.getItem("pushupReps")) || [];
    setRecentActivities(savedReps.reverse()); // Most recent first
  }, []);

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
        drawSkeleton(results.poseLandmarks);
      }
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

    return () => camera.stop();
  }, [isWorkoutActive]);

  useEffect(() => {
    if (!landmarks || landmarks.length < 17) return;

    const calculateAngle = (p1, p2, p3) => {
      const dx1 = p1.x - p2.x,
        dy1 = p1.y - p2.y;
      const dx2 = p3.x - p2.x,
        dy2 = p3.y - p2.y;
      const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
      return Math.abs((angle * 180) / Math.PI);
    };

    const lS = landmarks[11],
      lE = landmarks[13],
      lW = landmarks[15];
    const rS = landmarks[12],
      rE = landmarks[14],
      rW = landmarks[16];

    const lAngle = calculateAngle(lS, lE, lW);
    const rAngle = calculateAngle(rS, rE, rW);

    if (lAngle < 90 && rAngle < 90 && !isDown) {
      setIsDown(true);
    } else if (lAngle > 150 && rAngle > 150 && isDown) {
      setIsDown(false);
      setPushUpCount((prev) => prev + 1);
    }
  }, [landmarks, isDown]);

  const drawSkeleton = (landmarks) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;

    const skeleton = [
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 12],
      [23, 24],
      [11, 23],
      [12, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ];

    skeleton.forEach(([a, b]) => {
      const p1 = landmarks[a];
      const p2 = landmarks[b];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((point) => {
      if (point) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
      }
    });
  };

  const handleStart = () => {
    setPushUpCount(0);
    setIsWorkoutActive(true);
    setShowSavedMessage(false);
  };

  const handleStop = () => {
    setIsWorkoutActive(false);
    if (cameraRef.current) cameraRef.current.stop();

    const newEntry = {
      timestamp: new Date().toISOString(),
      workout: "Push-ups",
      reps: pushUpCount,
    };

    const previousReps = JSON.parse(localStorage.getItem("pushupReps")) || [];
    const updatedReps = [...previousReps, newEntry];
    localStorage.setItem("pushupReps", JSON.stringify(updatedReps));
    setRecentActivities(updatedReps.reverse()); // update display
    setShowSavedMessage(true);
    toast.success("Push-ups saved successfully!");
  };

  const handleReset = () => {
    setPushUpCount(0);
    setIsDown(false);
    setShowSavedMessage(false);
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center bg-black">
      <video ref={videoRef} autoPlay playsInline className="absolute w-[640px] h-[480px] z-1" />
      <canvas ref={canvasRef} width="640" height="480" className="absolute z-2" />

      <div className="absolute top-5 left-5 bg-gray-900 text-white p-3 rounded text-lg font-bold">
        Push-ups: {pushUpCount}
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

      {showSavedMessage && (
        <div className="absolute top-20 left-5 bg-green-800 text-white px-4 py-2 rounded">
          Push-ups saved to history!
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="absolute right-5 top-5 w-[300px] bg-gray-800 text-white p-4 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-2">Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-gray-300">No records found.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivities.slice(0, 5).map((entry, index) => (
              <li key={index} className="border-b border-gray-600 pb-2">
                <div className="text-sm">🕒 {new Date(entry.timestamp).toLocaleString()}</div>
                <div className="text-sm font-medium">💪 {entry.reps} Push-ups</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PushUpTracker;
