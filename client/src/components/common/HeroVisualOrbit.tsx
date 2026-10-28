import React, { useState } from 'react';
import { Zap, Code2, Sparkles, Rocket, Globe, ShieldCheck } from 'lucide-react';

interface TelemetryNode {
  id: string;
  name: string;
  category: string;
  metric: string;
  icon: React.ReactNode;
  positionStyle: React.CSSProperties;
  floatClass: string;
  svgTarget: { x: number; y: number };
}

export const HeroVisualOrbit: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes: TelemetryNode[] = [
    {
      id: 'speed',
      name: '99+ Speed Score',
      category: 'Core Web Vitals',
      metric: 'SUB-300MS EDGE LCP • 100/100',
      icon: <Zap className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-1',
      svgTarget: { x: 270, y: 43 },
    },
    {
      id: 'workflows',
      name: 'Autonomous Systems',
      category: 'AI Automations',
      metric: 'EVENT-DRIVEN • N8N & CLOUD WORKFLOWS',
      icon: <Sparkles className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '25%', left: '84%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-2',
      svgTarget: { x: 453, y: 135 },
    },
    {
      id: 'fullstack',
      name: 'React 19 & Next.js',
      category: 'FullStack Architecture',
      metric: 'TYPE-SAFE • EDGE SERVER COMPONENT ENGINE',
      icon: <Code2 className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '75%', left: '84%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-3',
      svgTarget: { x: 453, y: 405 },
    },
    {
      id: 'leads',
      name: 'Lead Machine',
      category: 'Conversion UX',
      metric: '+180% AVG CAPTURE RATE • OPTIMIZED FUNNELS',
      icon: <Rocket className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '92%', left: '50%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-4',
      svgTarget: { x: 270, y: 497 },
    },
    {
      id: 'security',
      name: 'Enterprise Cloud',
      category: 'Zero Vulnerability',
      metric: '99.99% UPTIME • ISOLATED MICROSERVICES',
      icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '75%', left: '16%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-5',
      svgTarget: { x: 86, y: 405 },
    },
    {
      id: 'seo',
      name: 'Search Dominance',
      category: 'Technical SEO',
      metric: 'RANK #1 TARGETING • DYNAMIC JSON-LD & OG',
      icon: <Globe className="h-4 w-4 text-emerald-400" />,
      positionStyle: { top: '25%', left: '16%', transform: 'translate(-50%, -50%)' },
      floatClass: 'float-node-6',
      svgTarget: { x: 86, y: 135 },
    },
  ];

  const activeNodeData = nodes.find((n) => n.id === activeNode);

  return (
    <div className="relative mx-auto flex h-[440px] w-full max-w-[440px] sm:h-[500px] sm:max-w-[500px] lg:h-[540px] lg:max-w-[540px] items-center justify-center select-none">
      {/* Atmospheric Ambient Glow */}
      <div className="absolute h-80 w-80 rounded-full bg-emerald-500/15 blur-[95px] pointer-events-none" />

      {/* SVG Background Telemetry Matrix: Guides, Conic Radar Sweep, and Laser Streams */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none z-0"
        viewBox="0 0 540 540"
        fill="none"
      >
        <defs>
          {/* Neon laser line gradients */}
          <linearGradient id="laserGrad" x1="270" y1="270" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.2" />
          </linearGradient>
          {/* Subtle radar sweep cone */}
          <radialGradient id="radarCone" cx="50%" cy="50%" r="50%">
            <stop stopColor="rgba(34, 197, 94, 0.15)" offset="0%" />
            <stop stopColor="rgba(34, 197, 94, 0.03)" offset="70%" />
            <stop stopColor="transparent" offset="100%" />
          </radialGradient>
        </defs>

        {/* Concentric Telemetry Orbit Rings (Fixed Geometry) */}
        <circle
          cx="270"
          cy="270"
          r="230"
          stroke="rgba(34, 197, 94, 0.12)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <circle
          cx="270"
          cy="270"
          r="160"
          stroke="rgba(34, 197, 94, 0.18)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
        <circle
          cx="270"
          cy="270"
          r="100"
          stroke="rgba(34, 197, 94, 0.25)"
          strokeWidth="1"
        />

        {/* Radar Crosshair Axis Markers */}
        <line x1="270" y1="30" x2="270" y2="70" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1" />
        <line x1="270" y1="470" x2="270" y2="510" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1" />
        <line x1="30" y1="270" x2="70" y2="270" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1" />
        <line x1="470" y1="270" x2="510" y2="270" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1" />

        {/* Laser Data Streams connecting Core (270, 270) to Satellite Nodes */}
        {nodes.map((node) => {
          const isConnected = activeNode === node.id;
          return (
            <g key={node.id}>
              {/* Static faint guide ray */}
              <line
                x1="270"
                y1="270"
                x2={node.svgTarget.x}
                y2={node.svgTarget.y}
                stroke={isConnected ? '#22c55e' : 'rgba(34, 197, 94, 0.15)'}
                strokeWidth={isConnected ? '2' : '1'}
                strokeDasharray={isConnected ? 'none' : '4 6'}
                className="transition-all duration-300"
              />
              {/* Animated photon laser pulse */}
              <line
                x1="270"
                y1="270"
                x2={node.svgTarget.x}
                y2={node.svgTarget.y}
                stroke="#4ade80"
                strokeWidth={isConnected ? '2.5' : '1.5'}
                className="laser-pulse"
                opacity={isConnected ? '1' : '0.4'}
              />
              {/* Photon anchor point */}
              <circle
                cx={node.svgTarget.x}
                cy={node.svgTarget.y}
                r={isConnected ? '4' : '2.5'}
                fill="#22c55e"
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* Telemetry Radar Scanner Line */}
        <g className="radar-sweep origin-[270px_270px]">
          <line
            x1="270"
            y1="270"
            x2="270"
            y2="40"
            stroke="url(#laserGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="270" cy="40" r="3" fill="#4ade80" filter="drop-shadow(0 0 6px #22c55e)" />
        </g>
      </svg>

      {/* CENTRAL DIGITAL CORE (Zero Overlap Guarantee) */}
      <div className="relative z-20 flex h-36 w-36 flex-col items-center justify-center rounded-3xl border border-primary/45 bg-[#0a100b]/95 p-4 text-center shadow-emerald backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-primary">
        <span className="status-beacon mb-2 flex h-3 w-3 rounded-full bg-primary" />
        
        <span className="font-display text-sm font-extrabold tracking-tight text-foreground uppercase">
          {activeNodeData ? activeNodeData.name : 'DIGITAL CORE'}
        </span>

        <span className="mt-1 text-[10px] font-mono uppercase tracking-wider text-primary font-semibold truncate max-w-[120px]">
          {activeNodeData ? activeNodeData.category : 'HIGH PERFORMANCE'}
        </span>

        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground border-t border-border/50 pt-1.5 w-full justify-center">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeNodeData ? 'SYNCED' : 'ACTIVE • 99.9%'}</span>
        </div>
      </div>

      {/* 6 NON-OVERLAPPING SATELLITE NODES */}
      {nodes.map((node) => {
        const isActive = activeNode === node.id;
        return (
          <div
            key={node.id}
            style={node.positionStyle}
            className={`absolute z-30 ${node.floatClass}`}
          >
            <div
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              className={`group/node flex cursor-pointer items-center gap-2.5 rounded-full border px-3.5 py-1.5 backdrop-blur-xl shadow-lg transition-all duration-300 ${
                isActive
                  ? 'scale-110 border-primary bg-primary/20 shadow-glow text-white'
                  : 'border-border/80 bg-card/90 text-foreground hover:border-primary/50 hover:bg-card hover:shadow-emerald'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary text-white shadow-glow' : 'bg-primary/15 text-primary'
                }`}
              >
                {node.icon}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap tracking-tight">
                {node.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Bottom Telemetry HUD Line */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full border border-primary/25 bg-[#0a100b]/90 px-4 py-1 text-[10px] font-mono text-muted-foreground backdrop-blur-md shadow-sm">
        <span className="text-primary font-semibold">TELEMETRY:</span>{' '}
        {activeNodeData ? activeNodeData.metric : 'HOVER NODES TO INSPECT REAL-TIME SYSTEM SPECS'}
      </div>
    </div>
  );
};
