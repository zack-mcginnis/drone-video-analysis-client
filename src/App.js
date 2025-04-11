import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import VideoPlayer from './components/VideoPlayer';
import RecordingsList from './components/RecordingsList';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import LiveStreamInfo from './components/LiveStreamInfo';
import Devices from './components/Devices';
import DeviceSelector from './components/DeviceSelector';
import { setupApiAuth, postLogin } from './services/api';
import './App.css';
import { FaVideo } from 'react-icons/fa';

function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [activeSection, setActiveSection] = useState('live');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [streamState, setStreamState] = useState({
    isActive: false,
    lastUpdate: Date.now()
  });

  // Initialize API authentication and handle post-login
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && user) {
        // Setup API authentication
        await setupApiAuth(getAccessTokenSilently);
        
        // Make post-login API call
        try {
          const response = await postLogin(user.email, user.sub);
          if (response.data && response.data.devices) {
            setDevices(response.data.devices);
            // Set the first device as selected by default
            if (response.data.devices.length > 0) {
              setSelectedDevice(response.data.devices[0]);
            }
          }
        } catch (error) {
          console.error('Error in post-login:', error);
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, getAccessTokenSilently, user]);

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

  const handleDeviceAdded = (newDevice) => {
    setDevices(prevDevices => {
      const updatedDevices = [...prevDevices, newDevice];
      // If this is the first device, set it as selected
      if (updatedDevices.length === 1) {
        setSelectedDevice(newDevice);
      }
      return updatedDevices;
    });
  };

  const handleDeviceDeleted = (deviceId) => {
    setDevices(prevDevices => {
      const updatedDevices = prevDevices.filter(device => device.id !== deviceId);
      // If the deleted device was selected, select the first available device
      if (selectedDevice?.id === deviceId && updatedDevices.length > 0) {
        setSelectedDevice(updatedDevices[0]);
      } else if (updatedDevices.length === 0) {
        setSelectedDevice(null);
      }
      return updatedDevices;
    });
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setStreamState(prev => ({
      ...prev,
      lastUpdate: Date.now()
    }));
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
              <DeviceSelector
                devices={devices}
                selectedDevice={selectedDevice}
                onDeviceSelect={handleDeviceSelect}
              />
              <div className="video-container">
                <VideoPlayer 
                  isLiveMode={true}
                  selectedRecording={null}
                  selectedDevice={selectedDevice}
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
                  selectedDevice={selectedDevice}
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
      case 'devices':
        return (
          <Devices
            devices={devices}
            onDeviceAdded={handleDeviceAdded}
            onDeviceDeleted={handleDeviceDeleted}
          />
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