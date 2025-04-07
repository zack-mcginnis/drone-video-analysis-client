import React from 'react';
import { FaSignal, FaClock, FaVideo, FaCircle } from 'react-icons/fa';
import './LiveStreamInfo.css';

const LiveStreamInfo = ({ streamState }) => {
    const startTime = new Date().toLocaleTimeString();

    return (
        <div className="live-stream-info">
            <div className="stream-status-card">
                <div className="status-header">
                    <h3>
                        <FaCircle className={`status-indicator ${streamState.isActive ? 'active' : 'inactive'}`} />
                        Stream Status
                    </h3>
                </div>
                <div className="status-details">
                    <div className="status-item">
                        <FaSignal className="status-icon" />
                        <div className="status-text">
                            <span className="label">Status</span>
                            <span className="value">{streamState.isActive ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <FaClock className="status-icon" />
                        <div className="status-text">
                            <span className="label">Start Time</span>
                            <span className="value">{startTime}</span>
                        </div>
                    </div>
                    <div className="status-item">
                        <FaVideo className="status-icon" />
                        <div className="status-text">
                            <span className="label">Stream Quality</span>
                            <span className="value">HD (1080p)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="stream-metrics-card">
                <h3>Stream Metrics</h3>
                <div className="metrics-grid">
                    <div className="metric-item">
                        <span className="metric-value">1080p</span>
                        <span className="metric-label">Resolution</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">30 fps</span>
                        <span className="metric-label">Frame Rate</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">5.2 Mbps</span>
                        <span className="metric-label">Bitrate</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">45ms</span>
                        <span className="metric-label">Latency</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamInfo; 