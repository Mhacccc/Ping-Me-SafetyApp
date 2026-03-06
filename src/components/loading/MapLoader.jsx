import React from 'react';
import './MapLoader.css';

const MapLoader = ({ size = 220 }) => {
    return (
        <div className="loader-container">
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* The Grid Base */}
                <path
                    className="grid-base"
                    d="M20 50 L50 35 L80 50 L50 65 Z"
                    stroke="#8B0000"
                    strokeWidth="2"
                    fill="white"
                />
                <path
                    d="M35 42.5 L65 57.5 M35 57.5 L65 42.5"
                    stroke="#8B0000"
                    strokeWidth="1"
                    opacity="0.5"
                />

                {/* The Location Pin */}
                <g className="pin-wrap">
                    <path
                        className="pin"
                        d="M50 48 C45 40 42 35 42 30 C42 25 45.5 22 50 22 C54.5 22 58 25 58 30 C58 35 55 40 50 48 Z"
                        fill="#8B0000"
                    />
                    <circle cx="50" cy="30" r="3" fill="white" />
                </g>

                {/* Pulse/Signal Effect */}
                <ellipse
                    className="pulse"
                    cx="50"
                    cy="50"
                    rx="15"
                    ry="8"
                    stroke="#8B0000"
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
};

export default MapLoader;