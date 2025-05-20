import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // ✅ Import PropTypes
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import SquatDetector from "./SquatDetector";

const PoseDetector = ({ onWorkoutStart }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const [detectedPose, setDetectedPose] = useState("Unknown");
  const [isPoseDetectionComplete, setIsPoseDetectionComplete] = useState(false);

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
      if (results.poseLandmarks) {
        setLandmarks(results.poseLandmarks);
        detectPose(results.poseLandmarks);
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
  }, []);

  /**
   * Function to determine the user's pose based on landmarks.
   */
  const detectPose = (landmarks) => {
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftKnee || !rightKnee || !leftHip || !rightHip) {
      setDetectedPose("Unknown");
      return;
    }

    const kneeHeight = (leftKnee.y + rightKnee.y) / 2;
    const hipHeight = (leftHip.y + rightHip.y) / 2;

    if (kneeHeight > hipHeight * 1.2) {
      setDetectedPose("Squatting");
    } else if (kneeHeight < hipHeight * 0.9) {
      setDetectedPose("Standing");
    } else {
      setDetectedPose("Unknown");
    }

    // ✅ Notify parent component and switch to exercise detection after correct pose
    if (detectedPose !== "Unknown") {
      setTimeout(() => {
        setIsPoseDetectionComplete(true);
        if (onWorkoutStart) onWorkoutStart(); // ✅ Call callback when workout starts
      }, 2000);
    }
  };

  return (
    <div>
      {isPoseDetectionComplete ? (
        <SquatDetector landmarks={landmarks} videoRef={videoRef} canvasRef={canvasRef} />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold">Align Yourself Properly</h2>
          <p className="text-gray-500">Make sure your whole body is visible on the camera</p>
          <video ref={videoRef} className="w-96 h-72 mt-4 border rounded-lg shadow-lg" autoPlay />
          <button
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            onClick={() => {
              setIsPoseDetectionComplete(true);
              if (onWorkoutStart) onWorkoutStart();
            }}
          >
            Skip & Start Exercise
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ Add PropTypes validation
PoseDetector.propTypes = {
  onWorkoutStart: PropTypes.func, // Function to notify parent when workout starts
};

export default PoseDetector;
