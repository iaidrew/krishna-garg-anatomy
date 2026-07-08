import React, { useState } from "react";
import { motion } from "motion/react";

// Handcrafted SVG: DNA Double Helix with revolving nodes
export function DNAModel({ className = "w-48 h-48" }: { className?: string }) {
  const pairs = 10;
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 220" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">
        {/* Back strands */}
        <path
          d="M 20 20 Q 60 110 20 200"
          fill="none"
          stroke="rgba(20, 184, 166, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 100 20 Q 60 110 100 200"
          fill="none"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Connecting base pairs with animation */}
        {Array.from({ length: pairs }).map((_, i) => {
          const y = 20 + i * 20;
          const delay = i * 0.15;
          // Calculate sinusoidal width to represent rotation
          return (
            <g key={i}>
              <motion.line
                x1="20"
                y1={y}
                x2="100"
                y2={y}
                stroke="url(#dna-gradient)"
                strokeWidth="1.5"
                initial={{ opacity: 0.2, scaleX: 0 }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scaleX: [0.1, 1, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
                style={{ originX: 0.5 }}
              />
              {/* Left node */}
              <motion.circle
                cx="20"
                cy={y}
                r="4"
                fill="#14B8A6"
                animate={{
                  cx: [20, 100, 20],
                  r: [3, 5, 3],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
              {/* Right node */}
              <motion.circle
                cx="100"
                cy={y}
                r="4"
                fill="#06B6D4"
                animate={{
                  cx: [100, 20, 100],
                  r: [5, 3, 5],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}

        {/* Strands definitions */}
        <defs>
          <linearGradient id="dna-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Handcrafted SVG: Beating Anatomical Heart with pulse ripples
export function HeartModel({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulse ripples */}
      <motion.div
        className="absolute w-24 h-24 border border-rose-400/20 rounded-full"
        animate={{
          scale: [1, 1.8, 2.2],
          opacity: [0.6, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute w-24 h-24 border border-rose-500/10 rounded-full"
        animate={{
          scale: [1, 1.4, 1.8],
          opacity: [0.8, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.6,
          ease: "easeOut",
        }}
      />

      <svg viewBox="0 0 100 100" className="w-24 h-24 z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]">
        <motion.g
          animate={{
            scale: [1, 1.08, 0.98, 1.08, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center" }}
        >
          {/* Abstract elegant anatomical heart paths */}
          {/* Main Body */}
          <path
            d="M50,85 C30,70 15,50 15,35 C15,22 25,12 38,12 C44,12 48,15 50,18 C52,15 56,12 62,12 C75,12 85,22 85,35 C85,50 70,70 50,85 Z"
            fill="url(#heart-grad)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />
          {/* Aorta wireframe */}
          <path
            d="M44,18 C44,8 56,8 56,18"
            fill="none"
            stroke="#FF8E53"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left Pulmonary Artery */}
          <path
            d="M38,15 Q30,5 24,14"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right Pulmonary Artery */}
          <path
            d="M62,15 Q70,5 76,14"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Vascular internal mesh lines */}
          <path
            d="M50,18 Q45,45 28,52 M50,18 Q55,42 70,48 M50,18 Q50,60 42,75 M50,18 Q48,50 58,70"
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        </motion.g>

        <defs>
          <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FF8E53" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Handcrafted SVG: Brain Synaptic Model with pulsing neural synapses
export function BrainModel({ className = "w-48 h-48" }: { className?: string }) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Nodes for brain synapse positions
  const synapses = [
    { x: 30, y: 35, area: "Frontal" },
    { x: 45, y: 25, area: "Prefrontal" },
    { x: 65, y: 22, area: "Motor Cortex" },
    { x: 78, y: 32, area: "Parietal" },
    { x: 82, y: 50, area: "Occipital" },
    { x: 72, y: 68, area: "Cerebellum" },
    { x: 50, y: 78, area: "Brainstem" },
    { x: 42, y: 55, area: "Temporal" },
    { x: 55, y: 40, area: "Limbic" },
  ];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 110 110" className="w-full h-full drop-shadow-[0_0_20px_rgba(147,51,234,0.18)]">
        {/* Brain outline background */}
        <motion.path
          d="M 50 15 
             C 25 15, 10 30, 10 50 
             C 10 65, 20 75, 35 78 
             C 40 85, 45 95, 55 95 
             C 65 95, 70 90, 75 88 
             C 90 85, 100 70, 100 52 
             C 100 30, 85 15, 50 15 Z"
          fill="none"
          stroke="url(#brain-outline-gradient)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Interactive Neural Net lines */}
        {synapses.map((start, idx) => {
          return synapses.slice(idx + 1).map((end, eIdx) => {
            // Only connect nodes close to each other for biological net appearance
            const dist = Math.hypot(start.x - end.x, start.y - end.y);
            if (dist > 35) return null;

            const isHighlighted = hoveredNode === idx || hoveredNode === (idx + 1 + eIdx);

            return (
              <line
                key={`${idx}-${eIdx}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isHighlighted ? "#A78BFA" : "rgba(124, 58, 237, 0.12)"}
                strokeWidth={isHighlighted ? "1.5" : "0.75"}
                className="transition-all duration-300"
              />
            );
          });
        })}

        {/* Pulsing Synapse Nodes */}
        {synapses.map((node, i) => {
          const isHovered = hoveredNode === i;
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 6 : 3}
                fill={isHovered ? "#9333EA" : "#7C3AED"}
                animate={{
                  r: isHovered ? [6, 8, 6] : [3, 4.5, 3],
                }}
                transition={{
                  duration: isHovered ? 1 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="transition-all duration-200"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 12 : 7}
                fill="none"
                stroke={isHovered ? "#C084FC" : "rgba(124, 58, 237, 0.3)"}
                strokeWidth="0.5"
                className="opacity-60"
              />
              {isHovered && (
                <foreignObject x={node.x - 40} y={node.y - 20} width="80" height="20">
                  <div className="text-[6px] font-mono bg-white/95 text-purple-900 border border-purple-200 rounded px-1 text-center shadow-sm backdrop-blur-sm truncate">
                    {node.area}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        <defs>
          <linearGradient id="brain-outline-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Handcrafted SVG: Medical geometry system coordinate wireframe
export function MedicalGeometry({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
        {/* Rotating outer rings */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(124, 58, 237, 0.25)"
          strokeWidth="0.75"
          strokeDasharray="5 5"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="rgba(20, 184, 166, 0.2)"
          strokeWidth="0.5"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />

        {/* Coordinate lines */}
        <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(107, 114, 128, 0.15)" strokeWidth="0.5" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(107, 114, 128, 0.15)" strokeWidth="0.5" />

        {/* Tech Target grid mark */}
        <path d="M 50 15 L 45 10 M 50 15 L 55 10" stroke="rgba(124, 58, 237, 0.4)" strokeWidth="0.75" fill="none" />
        <path d="M 50 85 L 45 90 M 50 85 L 55 90" stroke="rgba(124, 58, 237, 0.4)" strokeWidth="0.75" fill="none" />

        {/* Geometric connections */}
        <polygon
          points="50,20 80,50 50,80 20,50"
          fill="none"
          stroke="url(#geom-gradient)"
          strokeWidth="0.75"
        />
        <polygon
          points="50,10 90,50 50,90 10,50"
          fill="none"
          stroke="rgba(124, 58, 237, 0.1)"
          strokeWidth="0.5"
        />

        <defs>
          <linearGradient id="geom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.4)" />
            <stop offset="100%" stopColor="rgba(20, 184, 166, 0.4)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
