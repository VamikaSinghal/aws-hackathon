"use client";
import { useEffect, useRef, useState } from "react";

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const blobsRef = useRef<Blob[]>([]);
  const animationRef = useRef<number>();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Detect theme
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      detectTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize blobs if canvas was resized
      if (blobsRef.current.length === 0) {
        initializeBlobs();
      }
    };

    const initializeBlobs = () => {
      // Dark mode colors
      const darkColors = ["#7fee64", "#9cbf93", "#aed2a4", "#18b759"];
      // Light mode colors
      const lightColors = ["#22c55e", "#16a34a", "#4ade80", "#10b981"];
      const colors = isDark ? darkColors : lightColors;

      blobsRef.current = [];

      for (let i = 0; i < 6; i++) {
        blobsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 100 + Math.random() * 120,
          color: colors[i % colors.length],
          opacity: isDark ? 0.08 + Math.random() * 0.06 : 0.04 + Math.random() * 0.04,
        });
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      // Clear canvas based on theme
      const bgColor = isDark ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enable blur filter
      ctx.filter = "blur(40px)";

      blobsRef.current.forEach((blob) => {
        // Update velocity with mouse interaction
        const dx = mouseRef.current.x - blob.x;
        const dy = mouseRef.current.y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 400 && distance > 0) {
          blob.vx += (dx / distance) * 0.08;
          blob.vy += (dy / distance) * 0.08;
        }

        // Move blob
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges
        const padding = blob.radius + 20;
        if (blob.x < padding) {
          blob.x = padding;
          blob.vx = Math.abs(blob.vx);
        } else if (blob.x > canvas.width - padding) {
          blob.x = canvas.width - padding;
          blob.vx = -Math.abs(blob.vx);
        }

        if (blob.y < padding) {
          blob.y = padding;
          blob.vy = Math.abs(blob.vy);
        } else if (blob.y > canvas.height - padding) {
          blob.y = canvas.height - padding;
          blob.vy = -Math.abs(blob.vy);
        }

        // Apply friction
        blob.vx *= 0.98;
        blob.vy *= 0.98;

        // Draw blob
        ctx.fillStyle = blob.color;
        ctx.globalAlpha = blob.opacity;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.filter = "none";
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDark]);

  const bgColor = isDark ? "#000000" : "#f8f8f8";

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        display: "block",
        backgroundColor: bgColor,
      }}
    />
  );
}
