import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function useMouthDetection() {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [mouthBox, setMouthBox] = useState(null);

  const landmarkerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const modelLoadedRef = useRef(false);

  // 🔥 Carrega modelo UMA VEZ
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const detector = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (isMounted) {
          landmarkerRef.current = detector;
          modelLoadedRef.current = true;
          console.log("✅ Modelo MediaPipe carregado");
        }
      } catch (error) {
        console.error("Erro ao carregar modelo:", error);
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🎯 Detectar boca por frame
  function detect(video) {
    if (!modelLoadedRef.current) return;
    if (!video || video.readyState !== 4) return;
    if (!landmarkerRef.current) return;

    // evita detectar mesmo frame
    if (video.currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = video.currentTime;

    const result = landmarkerRef.current.detectForVideo(
      video,
      performance.now()
    );

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      setMouthOpen(false);
      setMouthBox(null);
      return;
    }

    const landmarks = result.faceLandmarks[0];

    // Pontos da boca
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const leftMouth = landmarks[78];
    const rightMouth = landmarks[308];

    // 📏 Calcular proporção
    const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
    const mouthWidth = Math.abs(leftMouth.x - rightMouth.x);

    const ratio = mouthHeight / mouthWidth;

    // 🎯 Threshold calibrado
    const isOpen = ratio > 0.28;

    // 🔄 Pequena suavização para evitar flicker
    setMouthOpen(prev => {
      if (isOpen && !prev) return true;
      if (!isOpen && prev) return false;
      return prev;
    });

    // 📦 Box da boca (em pixels)
    const width = video.videoWidth;
    const height = video.videoHeight;

    setMouthBox({
      left: leftMouth.x * width,
      right: rightMouth.x * width,
      top: upperLip.y * height,
      bottom: lowerLip.y * height,
    });

    // DEBUG opcional
    console.log("Ratio:", ratio);
  }

  return { mouthOpen, mouthBox, detect };
}