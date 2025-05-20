import { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

const PoseTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pushupCount, setPushupCount] = useState(0);
  const [squatCount, setSquatCount] = useState(0);
  const [isPushupDown, setIsPushupDown] = useState(false);
  const [isSquatDown, setIsSquatDown] = useState(false);

  useEffect(() => {
    const setupCamera = async () => {
      const video = videoRef.current;
      if (!video) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      video.srcObject = stream;

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
    };

    const detectPose = async () => {
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );

      const video = await setupCamera();
      video.play();

      const detect = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const poses = await detector.estimatePoses(videoRef.current);

        if (poses.length > 0) {
          drawSkeleton(poses[0].keypoints);
          countPushups(poses[0].keypoints);
          countSquats(poses[0].keypoints);
        }

        requestAnimationFrame(detect);
      };

      detect();
    };

    detectPose();
  }, []);

  const drawSkeleton = (keypoints) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "yellow";
    
    keypoints.forEach((point) => {
      if (point.score > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    const connect = (a, b) => {
      if (keypoints[a].score > 0.5 && keypoints[b].score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(keypoints[a].x, keypoints[a].y);
        ctx.lineTo(keypoints[b].x, keypoints[b].y);
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    const connections = [
      [5, 7], [7, 9], // Left arm
      [6, 8], [8, 10], // Right arm
      [5, 6], // Shoulders
      [5, 11], [6, 12], // Body
      [11, 13], [13, 15], // Left leg
      [12, 14], [14, 16], // Right leg
    ];

    connections.forEach(([a, b]) => connect(a, b));
  };

  const countPushups = (keypoints) => {
    const leftShoulder = keypoints[5].y;
    const leftElbow = keypoints[7].y;
    const leftWrist = keypoints[9].y;

    if (leftElbow > leftShoulder && leftWrist > leftElbow) {
      setIsPushupDown(true);
    } else if (isPushupDown && leftShoulder > leftElbow) {
      setPushupCount((count) => count + 1);
      setIsPushupDown(false);
    }
  };

  const countSquats = (keypoints) => {
    const leftHip = keypoints[11].y;
    const leftKnee = keypoints[13].y;
    const leftAnkle = keypoints[15].y;

    if (leftKnee > leftHip && leftAnkle > leftKnee) {
      setIsSquatDown(true);
    } else if (isSquatDown && leftHip > leftKnee) {
      setSquatCount((count) => count + 1);
      setIsSquatDown(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Pose Tracker</h1>
      <div className="relative">
        <video ref={videoRef} className="absolute w-[640px] h-[480px]" autoPlay playsInline />
        <canvas ref={canvasRef} className="absolute w-[640px] h-[480px]" />
      </div>
      <div className="flex gap-10 mt-4 text-xl font-semibold">
        <p>Push-ups: {pushupCount}</p>
        <p>Squats: {squatCount}</p>
      </div>
    </div>
  );
};

export default PoseTracker;
