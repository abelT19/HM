"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  imageUrl?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

export default function AnimatedBackground({ 
  imageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
  overlayOpacity = 0.7,
  children,
  className = ""
}: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate static positions for particles to prevent hydration mismatch
  const [particlePositions] = useState(() => 
    [...Array(6)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      xMovement: Math.random() * 100 - 50
    }))
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          backgroundPosition: [
            "0% 0%",
            "100% 100%",
            "0% 0%"
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "110% 110%",
          backgroundPosition: "center",
          filter: "brightness(0.9) contrast(1.1)"
        }}
      />

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(135deg, 
            rgba(0,0,0,${overlayOpacity}) 0%, 
            rgba(0,0,0,${overlayOpacity * 0.6}) 40%, 
            rgba(0,0,0,${overlayOpacity * 0.3}) 70%, 
            rgba(0,0,0,${overlayOpacity * 0.1}) 100%)`
        }}
      />

      {/* Interactive Mouse-Following Gradient */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(251, 191, 36, 0.1) 0%, 
            transparent 40%)`
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.5
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-15 pointer-events-none">
        {particlePositions.map((position) => (
          <motion.div
            key={position.id}
            className="absolute w-2 h-2 bg-amber-400/20 rounded-full"
            style={{
              left: position.left,
              top: position.top
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, position.xMovement, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: position.duration,
              repeat: Infinity,
              delay: position.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-30">
        {children}
      </div>
    </div>
  );
}
