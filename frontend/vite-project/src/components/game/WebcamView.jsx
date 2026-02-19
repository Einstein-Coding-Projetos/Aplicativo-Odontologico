import { useEffect, useRef } from "react";

export default function WebcamView({ onFrame }) {
  const videoRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let stream;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };

        const loop = () => {
          if (video && onFrame) {
            onFrame(video);
          }
          animationRef.current = requestAnimationFrame(loop);
        };

        loop();
      } catch (err) {
        console.error("Erro ao acessar a webcam:", err);
      }
    }

    setupCamera();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{
        position: "absolute",
        width: "640px",
        height: "480px",
        transform: "scaleX(-1)"
      }}
    />
  );
}