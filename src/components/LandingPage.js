import React from 'react';
import LoginButton from './LoginButton';
import './LandingPage.css';
import { FaGithub, FaLock, FaShieldAlt, FaDatabase, FaServer, FaCloud, FaCog, FaHome, FaTree, FaRunning } from 'react-icons/fa';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <div className="login-container">
                <LoginButton />
            </div>
            <div className="landing-content">
                <h1>Dronehub</h1>
                <p className="subtitle">Private, secure, and self-hosted solution for your drone footage</p>
                
                <div className="github-links">
                    <a href="https://github.com/zack-mcginnis/drone-video-analysis-client" target="_blank" rel="noopener noreferrer">
                        <FaGithub /> Client Repository
                    </a>
                    <a href="https://github.com/zack-mcginnis/drone-video-analysis-server" target="_blank" rel="noopener noreferrer">
                        <FaGithub /> Server Repository
                    </a>
                </div>

                <div className="how-it-works">
                    <h2>How It Works</h2>
                    <div className="steps">
                        <div className="step">
                            <FaServer className="step-icon" />
                            <h3>1. Deploy</h3>
                            <p>Clone, build and deploy both client and server components to your preferred cloud provider or private infrastructure.</p>
                        </div>
                        <div className="step">
                            <FaCog className="step-icon" />
                            <h3>2. Configure</h3>
                            <p>Enter your RTMP server URL into your streaming device settings (e.g., DJI drone configuration).</p>
                        </div>
                        <div className="step">
                            <FaCloud className="step-icon" />
                            <h3>3. Stream</h3>
                            <p>Your video data streams directly to your backend components, bypassing third-party services.</p>
                        </div>
                    </div>
                    <p className="how-it-works-note">
                        Complete control over your data flow - no intermediaries, no third-party access, just your video streaming directly to your infrastructure.
                    </p>
                </div>

                <div className="use-cases">
                    <h2>Use Cases</h2>
                    <div className="cases">
                        <div className="case">
                            <FaHome className="case-icon" />
                            <h3>Automated Security</h3>
                            <p>Remotely view live streamed drone footage while your drone performs an automated security sweep of your residence.</p>
                        </div>
                        <div className="case">
                            <FaTree className="case-icon" />
                            <h3>Trail Monitoring</h3>
                            <p>Tune in to a live stream trailcam monitoring a particular area of interest.</p>
                        </div>
                        <div className="case">
                            <FaRunning className="case-icon" />
                            <h3>Fitness Analysis</h3>
                            <p>Use a drone to record your workouts and run various analysis on your technique.</p>
                        </div>
                    </div>
                </div>

                <div className="security-highlight">
                    <div className="security-feature">
                        <FaLock className="security-icon" />
                        <h3>Complete Privacy</h3>
                        <p>Your data never leaves your control. No third-party cloud storage or processing.</p>
                    </div>
                    <div className="security-feature">
                        <FaShieldAlt className="security-icon" />
                        <h3>End-to-End Security</h3>
                        <p>All data is encrypted and protected with industry-standard security measures.</p>
                    </div>
                    <div className="security-feature">
                        <FaDatabase className="security-icon" />
                        <h3>Self-Hosted</h3>
                        <p>Host the solution on your own infrastructure for maximum control and security.</p>
                    </div>
                </div>

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
            </div>
        </div>
    );
};

export default LandingPage; 