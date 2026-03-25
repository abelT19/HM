"use client";

import { motion } from "framer-motion";
import { useEffect, useState, forwardRef } from "react";

interface AnimatedBackgroundProps {
  imageUrl?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

const AnimatedBackground = forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  (props, ref) => {
    const { 
      imageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
      overlayOpacity = 0.7,
      children,
      className = ""
    } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        setMousePosition({ x: clientX, y: clientY });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

  return (
      <div ref={ref} className={`relative overflow-hidden ${className}`}>
        {/* Static Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: "cover",
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

        {/* Content */}
        <div className="relative z-30">
          {children}
        </div>
      </div>
    );
  }
);

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
