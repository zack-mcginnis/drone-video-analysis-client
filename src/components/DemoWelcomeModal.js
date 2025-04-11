import React from 'react';
import { FaInfoCircle, FaGithub, FaLock, FaVideo } from 'react-icons/fa';
import './DemoWelcomeModal.css';

const DemoWelcomeModal = ({ onClose }) => {
  return (
    <div className="demo-welcome-modal">
      <div className="demo-welcome-content">
        <div className="demo-welcome-header">
          <FaInfoCircle className="info-icon" />
          <h2>Welcome to DroneHub Demo</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="demo-welcome-body">
          <div className="demo-section">
            <h3>About This Demo</h3>
            <p>This is a demonstration instance of DroneHub, a drone video streaming and analysis platform. 
            As a demo user, you have limited access to explore the application's features.</p>
          </div>

          <div className="demo-section features-grid">
            <div className="feature-card">
              <FaLock className="feature-icon" />
              <div className="feature-text">
                <h4>Limited Access</h4>
                <p>Live streaming features are disabled for demo users</p>
              </div>
            </div>

            <div className="feature-card">
              <FaVideo className="feature-icon" />
              <div className="feature-text">
                <h4>Available Features</h4>
                <p>Browse interface, manage devices, view recordings</p>
              </div>
            </div>
          </div>

          <div className="demo-section">
            <h3>Want to Deploy Your Own?</h3>
            <p>Clone and deploy your own instance with full functionality:</p>
            <div className="github-links">
              <a href="https://github.com/zack-mcginnis/drone-video-analysis-client" target="_blank" rel="noopener noreferrer">
                <FaGithub /> Client Repository
              </a>
              <a href="https://github.com/zack-mcginnis/drone-video-analysis-server" target="_blank" rel="noopener noreferrer">
                <FaGithub /> Server Repository
              </a>
            </div>
          </div>
        </div>

        <div className="demo-welcome-footer">
          <button onClick={onClose} className="start-button">
            Got it, let's explore!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoWelcomeModal; 