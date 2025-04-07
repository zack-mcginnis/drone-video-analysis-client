import React from 'react';
import LoginButton from './LoginButton';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <div className="landing-content">
                <h1>Drone Video Analysis</h1>
                <p className="subtitle">Real-time streaming and analysis of drone footage</p>
                <div className="features">
                    <div className="feature">
                        <span className="feature-icon">🎥</span>
                        <h3>Live Streaming</h3>
                        <p>Watch your drone's video feed in real-time</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <h3>Analytics</h3>
                        <p>Get insights from your drone footage</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">💾</span>
                        <h3>Recording</h3>
                        <p>Save and review past flights</p>
                    </div>
                </div>
                <div className="cta">
                    <LoginButton />
                    <p className="login-hint">Log in to access your drone video dashboard</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage; 