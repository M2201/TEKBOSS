import React, { useState, useEffect, useMemo, useRef } from 'react';

const DEFAULT_LOADING_TEXTS = [
  "Initializing Architecture...",
  "Scanning Digital Footprint...",
  "Mapping Operational Friction...",
  "Calculating Revenue Leakage...",
  "Drafting Orchestration Logic...",
  "Synthesizing Blueprint Phase I...",
  "Synthesizing Blueprint Phase II...",
  "Assembling Action Plan...",
  "Optimizing Output Matrix...",
  "Finalizing Playbook..."
];

const IntelligenceEngineLoader = ({ 
  isCompleting, 
  onAnimationComplete,
  headline = "Building Blueprint",
  subLabels = DEFAULT_LOADING_TEXTS,
  completionText = "Synthesis Operations Complete",
  activeText = "Orchestration Pipeline Active - Do Not Close Window"
}) => {
  const [traceProgress, setTraceProgress] = useState(0); 
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const completedRef = useRef(false);

  // Define the skyline profile with relative width and absolute heights
  const CITY_COLUMNS = useMemo(() => [
    {w: 10, h: 0}, {w: 30, h: 40}, {w: 20, h: 80}, {w: 30, h: 40}, {w: 15, h: 0},
    {w: 20, h: 70}, {w: 5, h: 120}, {w: 20, h: 70}, {w: 15, h: 0},
    {w: 60, h: 30}, {w: 15, h: 0},
    {w: 25, h: 90}, {w: 30, h: 110}, {w: 25, h: 90}, {w: 15, h: 0},
    {w: 30, h: 60}, {w: 15, h: 80}, {w: 30, h: 60}, {w: 15, h: 0},
    {w: 40, h: 40}, {w: 15, h: 0},
    {w: 20, h: 90}, {w: 5, h: 140}, {w: 20, h: 90}, {w: 15, h: 0},
    {w: 30, h: 65}, {w: 15, h: 0},
    {w: 15, h: 50}, {w: 20, h: 80}, {w: 15, h: 50}, {w: 15, h: 0},
    {w: 35, h: 100}, {w: 10, h: 120}, {w: 35, h: 100}, {w: 15, h: 0},
    {w: 40, h: 55}, {w: 15, h: 0},
    {w: 25, h: 70}, {w: 25, h: 100}, {w: 25, h: 70}, {w: 15, h: 0},
    {w: 30, h: 30}, {w: 20, h: 0}
  ], []);

  // Compute total width, SVG path, and window locations
  const { pathD, totalLength, totalWidth, windows } = useMemo(() => {
     let d = "M 0 150 ";
     let curX = 0;
     let curY = 150;
     let length = 0;
     let windowsArr = [];
     
     CITY_COLUMNS.forEach(col => {
       const targetY = 150 - col.h;
       
       // Vertical line
       if (targetY !== curY) {
           d += `L ${curX} ${targetY} `;
           length += Math.abs(curY - targetY);
           curY = targetY;
       }
       
       // Generate randomized inset "windows" for this building block
       if (col.h > 15 && col.w > 15) {
          const numWindows = Math.floor((col.w * col.h) / 300);
          for (let i = 0; i < numWindows; i++) {
             // Keep windows away from the exact edges
             const wx = curX + 3 + Math.random() * (col.w - 6);
             const wy = 150 - (3 + Math.random() * (col.h - 6));
             windowsArr.push({ id: Math.random(), x: wx, y: wy });
          }
       }
       
       // Horizontal line
       curX += col.w;
       length += col.w;
       d += `L ${curX} ${curY} `;
     });
     
     // Close out path to right bounding edge and bottom
     d += `L ${curX} 150 Z`;
     length += Math.abs(150 - curY) + curX; 
     
     return { pathD: d, totalLength: length, totalWidth: curX, windows: windowsArr };
  }, [CITY_COLUMNS]);

  // Handle the tracing progress — LOOPS continuously until isCompleting
  useEffect(() => {
    if (isCompleting) {
      completedRef.current = true;
      setTraceProgress(100);
      setCurrentTextIndex(subLabels.length - 1);
      const timer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Continuous looping trace
    const interval = setInterval(() => {
      setTraceProgress(prev => {
        if (prev >= 100) {
          // Reset for next loop — the city fades and retraces
          setLoopCount(c => c + 1);
          return 0;
        }
        // First pass is slower (0.15), subsequent passes accelerate slightly
        const speed = loopCount === 0 ? 0.15 : 0.25;
        return Math.min(prev + speed, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isCompleting, onAnimationComplete, loopCount, subLabels.length]);

  // Cycle through text labels continuously on a timer
  useEffect(() => {
    if (isCompleting || completedRef.current) return;
    
    const textInterval = setInterval(() => {
      // Sequential only — never loop back. Hold on final label until complete.
      setCurrentTextIndex(prev => Math.min(prev + 1, subLabels.length - 1));
    }, 3200);

    return () => clearInterval(textInterval);
  }, [isCompleting, subLabels.length]);

  // Calculate rendering variables
  const isCompleted = isCompleting && traceProgress === 100;
  const traceRatio = traceProgress / 100;
  const offset = totalLength - (totalLength * traceRatio);
  const currentX = traceRatio * totalWidth;

  // Pulsing scanner beam X position (sweeps independently of trace on loops > 0)
  const scannerX = loopCount > 0 && !isCompleted
    ? (traceProgress / 100) * totalWidth
    : -999; // off-screen during first trace

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-[#030712] relative overflow-hidden min-h-[600px] w-full">
      {/* Cityscape Engine */}
      <div className="relative w-full max-w-4xl h-[200px] mb-12 flex justify-center z-10 transition-transform duration-[1500ms] transform scale-100">
         <svg viewBox={`0 -20 ${totalWidth} 180`} className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Ground Line */}
            <line x1="0" y1="150" x2={totalWidth} y2="150" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />
            
            {/* Massive Glowing Aura behind City when Completed */}
            <path 
              d={pathD}
              fill="rgba(59, 130, 246, 0.3)"
              className={`transition-opacity duration-1000 ${isCompleted ? 'opacity-100 blur-xl' : 'opacity-0'}`}
            />

            {/* The Main Skyline Path Trace */}
            <path 
              d={pathD}
              fill={isCompleted ? "rgba(15, 23, 42, 0.8)" : (loopCount > 0 && traceProgress > 95 ? "rgba(15, 23, 42, 0.15)" : "transparent")}
              stroke={isCompleted ? "rgba(96, 165, 250, 1)" : "rgba(59, 130, 246, 0.8)"}
              strokeWidth={isCompleted ? "2.5" : "1.5"}
              strokeLinejoin="round"
              className={`transition-all ${isCompleting ? 'duration-[1000ms] ease-out' : 'duration-75 ease-linear'}`}
              style={{
                strokeDasharray: totalLength,
                strokeDashoffset: isNaN(offset) ? totalLength : offset,
                filter: isCompleted ? 'drop-shadow(0px -5px 20px rgba(96,165,250,0.5))' : 'none'
              }}
            />

            {/* Scanning beam that sweeps across the city during subsequent loops */}
            {loopCount > 0 && !isCompleted && (
              <rect
                x={scannerX - 2}
                y="0"
                width="4"
                height="155"
                fill="url(#scanGradient)"
                style={{ opacity: 0.6 }}
              />
            )}
            
            {/* Scanner gradient definition */}
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(96,165,250,0)" />
                <stop offset="40%" stopColor="rgba(96,165,250,0.6)" />
                <stop offset="60%" stopColor="rgba(96,165,250,0.6)" />
                <stop offset="100%" stopColor="rgba(96,165,250,0)" />
              </linearGradient>
            </defs>

            {/* Glowing Windows inside columns */}
            {windows.map((win) => {
               // A window illuminates once the X coordinate trace line sweeps past it
               const winActive = win.x < (currentX - 5) || isCompleted;
               return (
                 <rect 
                   key={win.id}
                   x={win.x}
                   y={win.y}
                   width="3"
                   height="3"
                   fill={isCompleted ? "#93C5FD" : "#60A5FA"}
                   className={`transition-all duration-1000 ease-in ${winActive && !isCompleted ? 'animate-pulse' : ''}`}
                   style={{
                     opacity: winActive ? (isCompleted ? 0.9 : 0.4 + Math.random() * 0.4) : 0,
                     filter: winActive ? 'drop-shadow(0px 0px 3px rgba(96,165,250,0.8))' : 'none',
                     animationDelay: `${Math.random()}s`,
                     animationDuration: `${1 + Math.random() * 2}s`
                   }}
                 />
               );
            })}
         </svg>
      </div>

      <div className="z-20 relative text-center w-full max-w-2xl mx-auto px-4 mt-8">
        <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6 flex flex-col items-center transition-colors duration-1000 ${isCompleted ? 'text-blue-300 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]' : (!isCompleting ? 'animate-pulse text-white' : 'text-white')}`}>
          {headline}
          {/* Synchronized Loading Bar beneath the Text */}
          <span 
             className={`h-[3px] bg-blue-500 mt-5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all ease-linear ${isCompleting ? 'duration-[1000ms]' : 'duration-75'}`} 
             style={{ width: `${Math.max(5, traceProgress)}%`}}
          ></span>
        </h2>
        
        {/* Dynamic Updating Processing Sublabels */}
        <div className="h-16 relative flex items-center justify-center">
          {subLabels.map((text, idx) => (
             <p 
               key={idx}
               className={`absolute inset-x-0 transition-all duration-1000 ease-in-out text-sm md:text-base text-slate-300 font-medium tracking-wide uppercase ${
                 idx === currentTextIndex 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : (idx < currentTextIndex ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-0 translate-y-4 scale-95')
               }`}
             >
               {text}
             </p>
          ))}
        </div>
        
        <p className="text-[10px] md:text-xs text-slate-600 font-bold mt-4 tracking-[0.2em] uppercase">
          {isCompleted 
            ? completionText
            : activeText
          }
        </p>
      </div>
    </div>
  );
};
export default IntelligenceEngineLoader;
