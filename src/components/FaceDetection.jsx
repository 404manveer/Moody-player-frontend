// src/components/FaceDetection.jsx
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceDetection({ setmood }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState("Idle");
  const intervalRef = useRef(null);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      setStatus("Webcam Error");
      console.error('Error accessing webcam:', error);
    }
  };

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  };

  const detectFace = async () => {
    if (detecting) return;
    setDetecting(true);
    setStatus("Detecting...");
    const canvas = canvasRef.current;
    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resized = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const topExpression = sorted[0];
        const mood = topExpression[0];
        setmood(mood);
        setStatus(`Detected: ${mood.charAt(0).toUpperCase() + mood.slice(1)}`);
      } else {
        setStatus("No Face Detected");
      }
    }, 1000);
  };

  // Cleanup interval on unmount or when detection stops
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Load models and start video on mount
  useEffect(() => {
    (async () => {
      setStatus("Loading models...");
      await loadModels();
      await startVideo();
      setStatus("Ready");
    })();
  }, []);

  // Stop detection
  const stopDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDetecting(false);
    setStatus("Idle");
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-10">
      <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-8 flex flex-col items-center max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-l from-red-400 to-blue-400 bg-clip-text text-transparent text-center">
          Live Mood Dedication
        </h1>
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="relative size-72 overflow-hidden rounded-2xl border-4 border-blue-200 shadow-lg bg-gray-100">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover rounded-2xl"
            />
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              className="absolute  hidden top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 2 }}
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={detectFace}
              disabled={detecting}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold shadow transition-all duration-200
                ${detecting
                  ? "bg-blue-200 text-blue-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}
              `}
            >
              <span>
                <i className="ri-emotion-happy-line text-2xl"></i>
              </span>
              {detecting ? "Detecting..." : "Start Detection"}
            </button>
            {detecting && (
              <button
                onClick={stopDetection}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow transition-all duration-200"
              >
                <i className="ri-close-circle-line text-2xl"></i>
                Stop
              </button>
            )}
          </div>
          <div className="mt-2 text-base font-medium text-gray-700">
            Status: <span className="font-bold">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
