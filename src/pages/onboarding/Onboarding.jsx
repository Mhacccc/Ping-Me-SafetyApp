import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

import onboarding1 from '../../assets/onboarding/onb1.png';
import onboarding2 from '../../assets/onboarding/onb2.png';
import onboarding3 from '../../assets/onboarding/onb3.png';
import onboarding4 from '../../assets/onboarding/onb4.png';

const SLIDES = [
    {
        id: 1,
        title: "Personal Safety Hub",
        description: "PingMe connects you with your loved ones and their safety bracelets, providing real-time location and total peace of mind.",
        image: onboarding1
    },
    {
        id: 2,
        title: "Instant SOS Response",
        description: "After the alert is triggered, the app sends emergency messages every 5 minutes until you mark yourself safe.",
        image: onboarding4
    },
    {
        id: 3,
        title: "Intelligent Boundaries",
        description: "Create geofences for homes or schools. Get notified immediately the moment someone enters or leaves a set area.",
        image: onboarding3
    },
    {
        id: 4,
        title: "Real-time Monitoring",
        description: "Monitor heart rate, battery levels, and signal strength directly from your dashboard to ensure constant protection.",
        image: onboarding2
    }
];

export default function Onboarding() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    const completeOnboarding = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        navigate('/login', { replace: true });
    };

    return (
        <div className="onboarding-page">
            {/* Subtle Circular Top Accent */}

            <div className="onboarding-wrapper">
                <div
                    className="onboarding-slider"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {SLIDES.map((slide, index) => (
                        <div key={slide.id} className="onboarding-slide">
                            <div className="onboarding-visual">
                                <div className="tech-decor-container">
                                    <div className="tech-ring ring-main"></div>
                                    <div className="tech-ring ring-inner"></div>
                                    <div className="tech-glow"></div>
                                    <div className="tech-particle p-1"></div>
                                    <div className="tech-particle p-2"></div>
                                    <div className="tech-particle p-3"></div>
                                </div>
                                <img src={slide.image} alt={slide.title} className="floating-illustration" />
                            </div>

                            <div className="onboarding-content">
                                <h1 className="onboarding-title">{slide.title}</h1>
                                <p className="onboarding-description">{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="onboarding-footer">
                    <div className="onboarding-pagination">
                        {SLIDES.map((_, index) => (
                            <div
                                key={index}
                                className={`pagination-dot ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></div>
                        ))}
                    </div>

                    <button className="onboarding-btn-next" onClick={handleNext}>
                        {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </button>

                    <button className="onboarding-btn-skip" onClick={handleSkip}>
                        Skip Introduction
                    </button>
                </div>
            </div>
        </div>
    );
}
