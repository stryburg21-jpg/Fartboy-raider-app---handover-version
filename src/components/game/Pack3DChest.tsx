import React from "react";
import type { Rarity } from "@/types/game";

export interface Pack3DChestProps {
  packId?: string;
  rarity?: Rarity | string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  floating?: boolean;
}

export function Pack3DChest({
  packId = "",
  rarity = "common",
  className = "",
  size = "md",
  floating = true,
}: Pack3DChestProps) {
  const isLegendary =
    packId === "shop_pack_legendary_raider" ||
    packId.includes("legendary") ||
    rarity === "legendary" ||
    rarity === "mythic";
  const isSpecialist =
    !isLegendary &&
    (packId === "shop_pack_specialist" || packId.includes("specialist") || rarity === "epic");
  const isRaider =
    !isLegendary &&
    !isSpecialist &&
    (packId === "shop_pack_raider" || packId.includes("raider") || rarity === "common");

  // Size scaling with exact 200x220 aspect ratio alignment
  const sizeMap = {
    sm: "w-28 h-32",
    md: "w-40 h-44",
    lg: "w-52 h-58",
    xl: "w-64 h-70",
  };

  const containerSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${containerSize} ${className}`}
    >
      {/* 1. RAIDER PACK - Ancient Runic Vault Sealed Foil Booster Pack */}
      {(isRaider || (!isSpecialist && !isLegendary)) && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Glowing cyan floor aura */}
          <div className="absolute bottom-0 w-3/4 h-5 bg-cyan-500/25 rounded-[100%] blur-md animate-pulse pointer-events-none" />
          <svg
            className="absolute bottom-0.5 w-4/5 h-8 opacity-70 animate-[spin_20s_linear_infinite] pointer-events-none"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#22d3ee" strokeWidth="1" />
            <path d="M50 6 L50 94 M6 50 L94 50" stroke="#06b6d4" strokeWidth="0.8" opacity="0.6" />
          </svg>

          {/* Sealed Foil Booster Pack SVG */}
          <div
            className={`relative z-10 w-full h-full flex items-center justify-center ${floating ? "animate-pack-idle" : ""}`}
          >
            <svg
              viewBox="0 0 200 220"
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(6,182,212,0.45)]"
            >
              <defs>
                <linearGradient id="raiderFoilBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="35%" stopColor="#0f172a" />
                  <stop offset="70%" stopColor="#083344" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                <linearGradient id="raiderCrimp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="30%" stopColor="#0e7490" />
                  <stop offset="70%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                <linearGradient id="raiderSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.1" />
                  <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>

                <filter id="raiderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Foil Pack Body */}
              <rect
                x="25"
                y="12"
                width="150"
                height="196"
                rx="8"
                fill="url(#raiderFoilBg)"
                stroke="#0e7490"
                strokeWidth="2"
              />

              {/* Left & Right Side Foil Seam Borders */}
              <line x1="28" y1="12" x2="28" y2="208" stroke="#164e63" strokeWidth="1.5" />
              <line x1="172" y1="12" x2="172" y2="208" stroke="#164e63" strokeWidth="1.5" />

              {/* Side Tear Notches */}
              <polygon
                points="25,40 31,44 25,48"
                fill="#020617"
                stroke="#06b6d4"
                strokeWidth="0.8"
              />
              <polygon
                points="175,40 169,44 175,48"
                fill="#020617"
                stroke="#06b6d4"
                strokeWidth="0.8"
              />

              {/* Glossy Metallic Sheen Overlay */}
              <path
                d="M25,12 L120,12 L50,208 L25,208 Z"
                fill="url(#raiderSheen)"
                pointerEvents="none"
              />

              {/* TOP CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,12 L175,12 L175,30 L25,30 Z"
                fill="url(#raiderCrimp)"
                stroke="#22d3ee"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="15"
                x2="175"
                y2="15"
                stroke="#020617"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="25"
                y1="18"
                x2="175"
                y2="18"
                stroke="#22d3ee"
                strokeWidth="0.8"
                opacity="0.8"
              />
              <line
                x1="25"
                y1="21"
                x2="175"
                y2="21"
                stroke="#020617"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="25"
                y1="24"
                x2="175"
                y2="24"
                stroke="#22d3ee"
                strokeWidth="0.8"
                opacity="0.8"
              />
              <line
                x1="25"
                y1="27"
                x2="175"
                y2="27"
                stroke="#020617"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Top Hanging Slot */}
              <rect
                x="88"
                y="17"
                width="24"
                height="6"
                rx="3"
                fill="#020617"
                stroke="#67e8f9"
                strokeWidth="1"
              />

              {/* BOTTOM CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,190 L175,190 L175,208 L25,208 Z"
                fill="url(#raiderCrimp)"
                stroke="#22d3ee"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="193"
                x2="175"
                y2="193"
                stroke="#020617"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="25"
                y1="196"
                x2="175"
                y2="196"
                stroke="#22d3ee"
                strokeWidth="0.8"
                opacity="0.8"
              />
              <line
                x1="25"
                y1="199"
                x2="175"
                y2="199"
                stroke="#020617"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="25"
                y1="202"
                x2="175"
                y2="202"
                stroke="#22d3ee"
                strokeWidth="0.8"
                opacity="0.8"
              />

              {/* TOP BRANDING HEADER BANNER */}
              <rect
                x="32"
                y="36"
                width="136"
                height="22"
                rx="4"
                fill="#083344"
                stroke="#22d3ee"
                strokeWidth="1"
              />
              <text
                x="100"
                y="51"
                textAnchor="middle"
                fill="#a5f3fc"
                fontSize="9"
                fontWeight="900"
                letterSpacing="0.5"
                fontFamily="sans-serif"
                textLength="124"
                lengthAdjust="spacingAndGlyphs"
              >
                RAIDER PACK
              </text>

              {/* CENTER ARTWORK: ANCIENT RUNIC VAULT COFFER EMBLEM */}
              <g transform="translate(100, 110)">
                {/* Outer Runic Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="38"
                  fill="#020617"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  filter="url(#raiderGlow)"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="32"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Ancient Runic Coffer Chest Art */}
                <rect
                  x="-22"
                  y="-14"
                  width="44"
                  height="28"
                  rx="3"
                  fill="#0f172a"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
                <path d="M-22,-14 L-15,-14 L-15,14 L-22,14 Z" fill="#083344" />
                <path d="M15,-14 L22,-14 L22,14 L15,14 Z" fill="#083344" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#22d3ee" strokeWidth="1.5" />

                {/* Glowing Cyan Keyhole Emblem */}
                <circle cx="0" cy="0" r="7" fill="#083344" stroke="#a5f3fc" strokeWidth="1.5" />
                <polygon points="0,-4 3,2 -3,2" fill="#22d3ee" />
                <circle cx="0" cy="0" r="2" fill="#ffffff" />

                {/* Corner Rivets */}
                <circle cx="-18.5" cy="-10.5" r="1" fill="#67e8f9" />
                <circle cx="-18.5" cy="10.5" r="1" fill="#67e8f9" />
                <circle cx="18.5" cy="-10.5" r="1" fill="#67e8f9" />
                <circle cx="18.5" cy="10.5" r="1" fill="#67e8f9" />
              </g>

              {/* BOTTOM FOIL INFO STRIP */}
              <rect
                x="35"
                y="164"
                width="130"
                height="18"
                rx="4"
                fill="#042f2e"
                stroke="#0d9488"
                strokeWidth="1"
              />
              <text
                x="100"
                y="176"
                textAnchor="middle"
                fill="#5eead4"
                fontSize="8"
                fontWeight="800"
                letterSpacing="0.5"
                fontFamily="sans-serif"
                textLength="118"
                lengthAdjust="spacingAndGlyphs"
              >
                SEASON 1 • 3 ITEMS
              </text>

              {/* Metallic Corner Accent Pins */}
              <circle cx="32" cy="20" r="2" fill="#67e8f9" />
              <circle cx="168" cy="20" r="2" fill="#67e8f9" />
              <circle cx="32" cy="200" r="2" fill="#67e8f9" />
              <circle cx="168" cy="200" r="2" fill="#67e8f9" />
            </svg>
          </div>
        </div>
      )}

      {/* 2. SPECIALIST PACK - Arcane Summoning Crystal Holographic Foil Booster Pack */}
      {isSpecialist && !isLegendary && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Swirling Violet/Magenta Void Aura */}
          <div className="absolute bottom-0 w-4/5 h-6 bg-purple-600/35 rounded-[100%] blur-lg animate-pulse pointer-events-none" />
          <svg
            className="absolute bottom-0.5 w-full h-8 opacity-80 animate-[spin_15s_linear_infinite] pointer-events-none"
            viewBox="0 0 100 100"
          >
            <ellipse
              cx="50"
              cy="50"
              rx="45"
              ry="25"
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <ellipse cx="50" cy="50" rx="32" ry="18" fill="none" stroke="#a855f7" strokeWidth="1" />
          </svg>

          {/* Floating Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-fuchsia-300 rounded-full animate-[ping_2s_infinite]" />
            <div className="absolute bottom-6 right-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            <div className="absolute top-10 right-6 w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
          </div>

          {/* Holographic Sealed Booster Pack SVG */}
          <div
            className={`relative z-10 w-full h-full flex items-center justify-center ${floating ? "animate-pack-idle" : ""}`}
          >
            <svg
              viewBox="0 0 200 220"
              className="w-full h-full drop-shadow-[0_0_28px_rgba(168,85,247,0.65)]"
            >
              <defs>
                <linearGradient id="specialistFoilBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b0764" />
                  <stop offset="35%" stopColor="#1e1b4b" />
                  <stop offset="70%" stopColor="#581c87" />
                  <stop offset="100%" stopColor="#090514" />
                </linearGradient>

                <linearGradient id="specialistCrimp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7e22ce" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>

                <linearGradient id="specialistHolo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.5" />
                  <stop offset="33%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="66%" stopColor="#e879f9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>

                <linearGradient id="magentaCrystal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0abfc" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#a21caf" />
                </linearGradient>

                <filter id="specialistGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Foil Pack Body */}
              <rect
                x="25"
                y="12"
                width="150"
                height="196"
                rx="8"
                fill="url(#specialistFoilBg)"
                stroke="#c084fc"
                strokeWidth="2"
              />

              {/* Holographic Iridescent Sheen Overlay */}
              <path
                d="M25,12 L140,12 L60,208 L25,208 Z"
                fill="url(#specialistHolo)"
                pointerEvents="none"
              />

              {/* Side Tear Notches */}
              <polygon
                points="25,40 31,44 25,48"
                fill="#090514"
                stroke="#e879f9"
                strokeWidth="0.8"
              />
              <polygon
                points="175,40 169,44 175,48"
                fill="#090514"
                stroke="#e879f9"
                strokeWidth="0.8"
              />

              {/* TOP CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,12 L175,12 L175,30 L25,30 Z"
                fill="url(#specialistCrimp)"
                stroke="#e879f9"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="15"
                x2="175"
                y2="15"
                stroke="#3b0764"
                strokeWidth="1"
                opacity="0.7"
              />
              <line x1="25" y1="18" x2="175" y2="18" stroke="#f0abfc" strokeWidth="0.8" />
              <line
                x1="25"
                y1="21"
                x2="175"
                y2="21"
                stroke="#3b0764"
                strokeWidth="1"
                opacity="0.7"
              />
              <line x1="25" y1="24" x2="175" y2="24" stroke="#f0abfc" strokeWidth="0.8" />
              <line
                x1="25"
                y1="27"
                x2="175"
                y2="27"
                stroke="#3b0764"
                strokeWidth="1"
                opacity="0.7"
              />

              {/* Top Hanging Slot */}
              <rect
                x="88"
                y="17"
                width="24"
                height="6"
                rx="3"
                fill="#090514"
                stroke="#f0abfc"
                strokeWidth="1"
              />

              {/* BOTTOM CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,190 L175,190 L175,208 L25,208 Z"
                fill="url(#specialistCrimp)"
                stroke="#e879f9"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="193"
                x2="175"
                y2="193"
                stroke="#3b0764"
                strokeWidth="1"
                opacity="0.7"
              />
              <line x1="25" y1="196" x2="175" y2="196" stroke="#f0abfc" strokeWidth="0.8" />
              <line
                x1="25"
                y1="199"
                x2="175"
                y2="199"
                stroke="#3b0764"
                strokeWidth="1"
                opacity="0.7"
              />
              <line x1="25" y1="202" x2="175" y2="202" stroke="#f0abfc" strokeWidth="0.8" />

              {/* TOP HEADER RIBBON */}
              <rect
                x="32"
                y="36"
                width="136"
                height="22"
                rx="4"
                fill="#701a75"
                stroke="#f0abfc"
                strokeWidth="1.2"
              />
              <text
                x="100"
                y="51"
                textAnchor="middle"
                fill="#fdf4ff"
                fontSize="10"
                fontWeight="900"
                letterSpacing="1"
                fontFamily="sans-serif"
                filter="url(#specialistGlow)"
              >
                +150% SET BOOST
              </text>

              {/* CENTER ARTWORK: ARCANE SUMMONING CRYSTAL ORB */}
              <g transform="translate(100, 110)">
                {/* Orbiting Ring 1 */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="42"
                  ry="18"
                  fill="none"
                  stroke="#e879f9"
                  strokeWidth="1.8"
                  strokeDasharray="12 6"
                  className="animate-[spin_10s_linear_infinite]"
                  filter="url(#specialistGlow)"
                />

                {/* Inner Arcane Circle Frame */}
                <circle cx="0" cy="0" r="32" fill="#090514" stroke="#c084fc" strokeWidth="2" />
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill="none"
                  stroke="#e879f9"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />

                {/* Multi-faceted Crystal Cluster */}
                <polygon
                  points="0,-22 14,-6 0,22 -14,-6"
                  fill="url(#magentaCrystal)"
                  filter="url(#specialistGlow)"
                />
                <polygon points="0,-22 0,22 14,-6" fill="#f0abfc" opacity="0.4" />
                <polygon points="-8,-12 0,-22 8,-12 0,0" fill="#f472b6" opacity="0.8" />

                {/* Orbiting Crystal Nodes */}
                <circle cx="-28" cy="-8" r="3" fill="#f472b6" filter="url(#specialistGlow)" />
                <circle cx="28" cy="8" r="3" fill="#f472b6" filter="url(#specialistGlow)" />
              </g>

              {/* BOTTOM FOIL INFO STRIP */}
              <rect
                x="35"
                y="164"
                width="130"
                height="18"
                rx="4"
                fill="#4c1d95"
                stroke="#a855f7"
                strokeWidth="1"
              />
              <text
                x="100"
                y="176"
                textAnchor="middle"
                fill="#e9d5ff"
                fontSize="8"
                fontWeight="800"
                letterSpacing="0.5"
                fontFamily="sans-serif"
                textLength="118"
                lengthAdjust="spacingAndGlyphs"
              >
                SPECIALIST PACK
              </text>

              {/* Corner Gems */}
              <circle cx="32" cy="20" r="2.5" fill="#f0abfc" />
              <circle cx="168" cy="20" r="2.5" fill="#f0abfc" />
              <circle cx="32" cy="200" r="2.5" fill="#f0abfc" />
              <circle cx="168" cy="200" r="2.5" fill="#f0abfc" />
            </svg>
          </div>
        </div>
      )}

      {/* 3. LEGENDARY PACK - Dragon Sovereign Royal Gold Foil Booster Pack */}
      {isLegendary && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Golden Sunburst Aura rays background */}
          <div className="absolute -inset-6 bg-amber-500/25 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <svg
            className="absolute inset-0 w-full h-full opacity-40 animate-[spin_25s_linear_infinite] pointer-events-none"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            <path
              d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M15 85 L85 15"
              stroke="#fbbf24"
              strokeWidth="1"
            />
          </svg>

          {/* Pedestal Base Glow */}
          <div className="absolute bottom-0 w-5/6 h-6 bg-amber-500/35 rounded-[100%] blur-md shadow-[0_0_30px_rgba(245,158,11,0.8)] pointer-events-none" />

          {/* Royal Gold Sealed Booster Pack SVG */}
          <div
            className={`relative z-10 w-full h-full flex items-center justify-center ${floating ? "animate-pack-idle" : ""}`}
          >
            <svg
              viewBox="0 0 200 220"
              className="w-full h-full drop-shadow-[0_0_35px_rgba(245,158,11,0.75)]"
            >
              <defs>
                <linearGradient id="legendaryFoilBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="30%" stopColor="#78350f" />
                  <stop offset="65%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>

                <linearGradient id="legendaryCrimp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>

                <linearGradient id="legendaryGoldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
                  <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="legendaryRuby" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>

                <filter id="legendaryGlow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Foil Pack Body */}
              <rect
                x="25"
                y="12"
                width="150"
                height="196"
                rx="8"
                fill="url(#legendaryFoilBg)"
                stroke="#f59e0b"
                strokeWidth="2.5"
                filter="url(#legendaryGlow)"
              />

              {/* Glossy Metallic Gold Sheen Overlay */}
              <path
                d="M25,12 L145,12 L65,208 L25,208 Z"
                fill="url(#legendaryGoldSheen)"
                pointerEvents="none"
              />

              {/* Side Tear Notches */}
              <polygon
                points="25,40 31,44 25,48"
                fill="#18181b"
                stroke="#fbbf24"
                strokeWidth="0.8"
              />
              <polygon
                points="175,40 169,44 175,48"
                fill="#18181b"
                stroke="#fbbf24"
                strokeWidth="0.8"
              />

              {/* TOP CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,12 L175,12 L175,30 L25,30 Z"
                fill="url(#legendaryCrimp)"
                stroke="#fef08a"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="15"
                x2="175"
                y2="15"
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.8"
              />
              <line x1="25" y1="18" x2="175" y2="18" stroke="#fef08a" strokeWidth="0.8" />
              <line
                x1="25"
                y1="21"
                x2="175"
                y2="21"
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.8"
              />
              <line x1="25" y1="24" x2="175" y2="24" stroke="#fef08a" strokeWidth="0.8" />
              <line
                x1="25"
                y1="27"
                x2="175"
                y2="27"
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.8"
              />

              {/* Top Hanging Slot */}
              <rect
                x="88"
                y="17"
                width="24"
                height="6"
                rx="3"
                fill="#18181b"
                stroke="#fef08a"
                strokeWidth="1.2"
              />

              {/* BOTTOM CRIMPED HEAT-SEAL STRIP */}
              <path
                d="M25,190 L175,190 L175,208 L25,208 Z"
                fill="url(#legendaryCrimp)"
                stroke="#fef08a"
                strokeWidth="1"
              />
              <line
                x1="25"
                y1="193"
                x2="175"
                y2="193"
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.8"
              />
              <line x1="25" y1="196" x2="175" y2="196" stroke="#fef08a" strokeWidth="0.8" />
              <line
                x1="25"
                y1="199"
                x2="175"
                y2="199"
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.8"
              />
              <line x1="25" y1="202" x2="175" y2="202" stroke="#fef08a" strokeWidth="0.8" />

              {/* TOP HEADER RIBBON */}
              <rect
                x="32"
                y="36"
                width="136"
                height="22"
                rx="4"
                fill="#78350f"
                stroke="#fef08a"
                strokeWidth="1.5"
              />
              <text
                x="100"
                y="51"
                textAnchor="middle"
                fill="#fef08a"
                fontSize="9"
                fontWeight="900"
                letterSpacing="0.5"
                fontFamily="sans-serif"
                filter="url(#legendaryGlow)"
                textLength="124"
                lengthAdjust="spacingAndGlyphs"
              >
                NO COMMON DROPS
              </text>

              {/* CENTER ARTWORK: DRAGON SOVEREIGN RELIQUARY EMBLEM */}
              <g transform="translate(100, 110)">
                {/* Outer Golden Dragon Sunburst Shield */}
                <circle
                  cx="0"
                  cy="0"
                  r="36"
                  fill="#18181b"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  filter="url(#legendaryGlow)"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="30"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />

                {/* Dragon Crown Top Crest */}
                <path
                  d="M-16,-18 L-8,-30 L0,-20 L8,-30 L16,-18 Z"
                  fill="url(#legendaryCrimp)"
                  stroke="#78350f"
                  strokeWidth="1"
                />

                {/* Center Glowing Ruby Gem */}
                <polygon
                  points="0,-16 12,0 0,16 -12,0"
                  fill="url(#legendaryRuby)"
                  filter="url(#legendaryGlow)"
                />
                <polygon points="0,-16 0,16 12,0" fill="#fca5a5" opacity="0.5" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />

                {/* Gold Wings Frame */}
                <path
                  d="M-30,0 C-22,-14 -12,-10 -12,0"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <path d="M30,0 C22,-14 12,-10 12,0" fill="none" stroke="#fbbf24" strokeWidth="2" />
              </g>

              {/* BOTTOM FOIL INFO STRIP */}
              <rect
                x="35"
                y="164"
                width="130"
                height="18"
                rx="4"
                fill="#451a03"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <text
                x="100"
                y="176"
                textAnchor="middle"
                fill="#fef08a"
                fontSize="8"
                fontWeight="800"
                letterSpacing="0.5"
                fontFamily="sans-serif"
                textLength="118"
                lengthAdjust="spacingAndGlyphs"
              >
                LEGENDARY PACK
              </text>

              {/* Corner Ruby Jewels */}
              <circle
                cx="32"
                cy="20"
                r="3"
                fill="url(#legendaryRuby)"
                filter="url(#legendaryGlow)"
              />
              <circle
                cx="168"
                cy="20"
                r="3"
                fill="url(#legendaryRuby)"
                filter="url(#legendaryGlow)"
              />
              <circle
                cx="32"
                cy="200"
                r="3"
                fill="url(#legendaryRuby)"
                filter="url(#legendaryGlow)"
              />
              <circle
                cx="168"
                cy="200"
                r="3"
                fill="url(#legendaryRuby)"
                filter="url(#legendaryGlow)"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
