import React from 'react';
import './MapLoader.css';

const MapLoader = ({ size = 260, text = "Loading...", progress = null, fullScreen = true }) => {
    // Math for the Outer Progress Ring
    const strokeWidth = 4;
    const center = size / 2;
    const outerRadius = center - strokeWidth - 10; // 10px padding for glow/orbs
    const circumference = outerRadius * 2 * Math.PI;

    // Dash offset for outer ring progress
    const strokeDashoffset = progress !== null
        ? circumference - (progress / 100) * circumference
        : circumference * 0.75; // Spinner gap

    // Inner ring radii
    const middleRadius = outerRadius - 16;
    const innerRadius = middleRadius - 12;

    const basePositionClass = fullScreen ? 'loader-container-fullscreen' : 'loader-container-local';
    const containerClass = `loader-container-base ${basePositionClass}`.trim();

    return (
        <div className={containerClass}>
            <div className="circular-wrapper" style={{ width: size, height: size }}>

                {/* ─── High-Tech Concentric Rings ─── */}
                <svg
                    width={size}
                    height={size}
                    className="progress-ring-svg"
                    style={{ position: 'absolute' }}
                >
                    {/* 1. Outer Ring Background */}
                    <circle
                        className="progress-ring progress-ring-outer"
                        cx={center}
                        cy={center}
                        r={outerRadius}
                    />

                    {/* 2. Middle Dashed Ring (Reverse Spin) */}
                    <circle
                        className="progress-ring progress-ring-middle"
                        cx={center}
                        cy={center}
                        r={middleRadius}
                    />

                    {/* 3. Inner Dotted Ring (Fast Spin) */}
                    <circle
                        className="progress-ring progress-ring-inner"
                        cx={center}
                        cy={center}
                        r={innerRadius}
                    />

                    {/* 4. Orbiting Data Nodes Group */}
                    {/* Rotates the entire group to make nodes orbit the center */}
                    <g className="orbit-group">
                        {/* Primary white/gray orbit node tracking the outer ring */}
                        <circle cx={center} cy={center - outerRadius} r={4} className="orbit-node" />
                        {/* Secondary trailing node */}
                        <circle cx={center + outerRadius * 0.4} cy={center - outerRadius * 0.91} r={2} className="orbit-node-trailing" />

                        {/* Red orbit node tracking the middle ring */}
                        <circle cx={center} cy={center + middleRadius} r={3} className="orbit-node-secondary" />
                    </g>
                </svg>

                {/* ─── Outer Colored Progress Ring ─── */}
                <svg
                    width={size}
                    height={size}
                    className={progress === null ? "progress-ring-spinner" : ""}
                    style={{
                        transform: progress !== null ? "rotate(-90deg)" : "none",
                        position: 'absolute'
                    }} // Start top
                >
                    <circle
                        className="progress-ring progress-ring-fg"
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>

                {/* ─── Inner Logo (Bouncing Pin + Double Pulse) ─── */}
                <div className="inner-logo">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Double Pulse/Ripple Effect behind the pin */}
                        <ellipse className="pulse-base pulse-1" cx="50" cy="50" rx="15" ry="8" />
                        <ellipse className="pulse-base pulse-2" cx="50" cy="50" rx="15" ry="8" />

                        {/* The Isometic Grid Base */}
                        <path
                            className="grid-base"
                            d="M20 50 L50 35 L80 50 L50 65 Z"
                            stroke="#A4262C"
                            strokeWidth="2"
                            fill="transparent" /* Makes the dark background show through the grid */
                        />
                        <path
                            className="grid-base"
                            d="M35 42.5 L65 57.5 M35 57.5 L65 42.5"
                            stroke="#A4262C"
                            strokeWidth="1"
                            opacity="0.8"
                        />

                        {/* The Location Pin Object */}
                        <g className="pin-wrap">
                            <path
                                className="pin"
                                d="M50 48 C45 40 42 35 42 30 C42 25 45.5 22 50 22 C54.5 22 58 25 58 30 C58 35 55 40 50 48 Z"
                                fill="#A4262C"
                            />
                            <circle cx="50" cy="30" r="4.5" fill="rgba(10,10,12,0.9)" /> {/* Punch hole matching BG */}
                        </g>
                    </svg>
                </div>
            </div>

            {/* ─── Dynamic Typography ─── */}
            <div className="loader-text-wrapper">
                <span className="loader-text">{text}</span>
                {progress !== null && (
                    <span className="loader-progress-text">{progress.toFixed(0)}%</span>
                )}
            </div>
        </div>
    );
};

export default MapLoader;