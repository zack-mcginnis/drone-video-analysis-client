import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import VideoPlayer from './components/VideoPlayer';
import RecordingsList from './components/RecordingsList';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import LiveStreamInfo from './components/LiveStreamInfo';
import { setupApiAuth } from './services/api';
import './App.css';
import { FaVideo } from 'react-icons/fa';

function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [activeSection, setActiveSection] = useState('live');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [streamState, setStreamState] = useState({
    isActive: false,
    lastUpdate: Date.now()
  });

  // Initialize API authentication when the app loads
  useEffect(() => {
    if (isAuthenticated) {
      setupApiAuth(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleRecordingSelect = (recording) => {
    setSelectedRecording(recording);
    setIsLiveMode(false);
    setActiveSection('recordings');
    setStreamState(prev => ({
      ...prev,
      lastUpdate: Date.now()
    }));
  };

  const handleSwitchToLive = () => {
    setSelectedRecording(null);
    setIsLiveMode(true);
    setActiveSection('live');
    setStreamState(prev => ({
      ...prev,
      lastUpdate: Date.now()
    }));
  };

  const handleStreamStateChange = (isActive) => {
    setStreamState(prev => ({
      isActive,
      lastUpdate: Date.now()
    }));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'live' && !isLiveMode) {
      handleSwitchToLive();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'live':
        return (
          <div className="live-section">
            <div className="live-content">
              <div className="video-container">
                <VideoPlayer 
                  isLiveMode={true}
                  selectedRecording={null}
                  onSwitchToLive={handleSwitchToLive}
                  onStreamStateChange={handleStreamStateChange}
                />
              </div>
              <LiveStreamInfo streamState={streamState} />
            </div>
          </div>
        );
      case 'recordings':
        return (
          <div className="recordings-section">
            {selectedRecording ? (
              <div className="video-container">
                <VideoPlayer 
                  isLiveMode={isLiveMode}
                  selectedRecording={selectedRecording}
                  onSwitchToLive={handleSwitchToLive}
                  onStreamStateChange={handleStreamStateChange}
                />
              </div>
            ) : (
              <div className="no-recording-selected">
                <FaVideo size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No Recording Selected</h3>
                <p>Select a recording from the list below to start playback</p>
              </div>
            )}
            <RecordingsList 
              onSelectRecording={handleRecordingSelect}
              streamState={streamState}
            />
          </div>
        );
      case 'user':
        return <div className="section-content">User Profile Coming Soon</div>;
      case 'settings':
        return <div className="section-content">Settings Coming Soon</div>;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navigation 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <main className="main-content">
        {renderContent()}
      </main>
      <footer>
        <p>Drone Video Streaming Demo</p>
      </footer>
    </div>
  );
}

export default App; 