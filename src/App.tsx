import { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import GlobalStyles from './styles/GlobalStyles';
import { getData, RTMPStreamViewer } from './services/api';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 1rem;
  background-color: #121212;
  color: #e0e0e0;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;

  h1 {
    font-size: 2rem;
    font-weight: 500;
    color: #fff;
    margin: 0;
    letter-spacing: 0.5px;
  }
`;

const Main = styled.main`
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 768px;
  }

  @media (min-width: 1024px) {
    max-width: 1024px;
  }
`;

const VideoFrame = styled.div`
  width: 640px;
  height: 480px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background-color: #000;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);

  &.fullscreen {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  padding: 0.5rem;
  text-align: center;
  background-color: ${(props) =>
    props.connected ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)'};
  color: ${(props) => (props.connected ? '#81c784' : '#ef5350')};
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.875rem;
  flex: 1;
`;

const VideoControls = styled.div<{ isFullScreen: boolean }>`
  margin-top: ${(props) => (props.isFullScreen ? '0' : '0')};
  padding: 0.75rem;
  background-color: ${(props) => (props.isFullScreen ? 'rgba(18, 18, 18, 0.85)' : '#1e1e1e')};
  border-radius: ${(props) => (props.isFullScreen ? '0' : '0 0 8px 8px')};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: ${(props) => (props.isFullScreen ? '100%' : '640px')};
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;

  ${(props) =>
    !props.isFullScreen &&
    `
    border-top: 1px solid #333;
    margin-top: -8px;
  `}

  ${(props) =>
    props.isFullScreen &&
    `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    transition: opacity 0.3s;
    opacity: 0;
    
    &:hover {
      opacity: 1;
    }
  `}
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ControlButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #1976d2;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background-color: #424242;
    color: #757575;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const SeekBar = styled.input`
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: #424242;
  border-radius: 3px;
  outline: none;
  position: relative;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  &:hover::-webkit-slider-thumb {
    transform: scale(1.2);
    background: #42a5f5;
  }

  &:hover::-moz-range-thumb {
    transform: scale(1.2);
    background: #42a5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlaybackRateSelect = styled.select`
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #424242;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #424242;
  }

  option {
    background-color: #333;
    color: #e0e0e0;
  }
`;

const BufferInfo = styled.div`
  font-size: 0.75rem;
  color: #9e9e9e;
  text-align: right;
  min-width: 120px;
`;

const PlayerContainer = styled.div`
  position: relative;
  width: 640px;
  margin: 0 auto;
`;

const LiveButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;

  &:hover {
    background-color: #d32f2f;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

function App() {
  const streamViewerRef = useRef<RTMPStreamViewer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoFrameRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seekPosition, setSeekPosition] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [bufferInfo, setBufferInfo] = useState({ current: 0, total: 0 });
  const [isDraggingSeekBar, setIsDraggingSeekBar] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const response = await getData<{ message: string }>('/api/stream-info');
        console.log('API Response:', response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Initialize the stream viewer with the canvas - only once
    if (canvasRef.current && !streamViewerRef.current) {
      try {
        console.log('Initializing RTMPStreamViewer');
        // Initialize the stream viewer
        streamViewerRef.current = new RTMPStreamViewer(canvasRef.current.id);

        // Set up playback state change listener
        streamViewerRef.current.setPlaybackStateChangeListener((playing) => {
          console.log('Playback state changed to:', playing);
          setIsPlaying(playing);

          // If playback starts and we're connected, set to live mode
          if (playing && isConnected) {
            setIsLiveMode(true);
            setSeekPosition(1.0); // Move to end of progress bar
          }
        });

        // Set up buffer update listener
        streamViewerRef.current.setBufferUpdateListener((info) => {
          setBufferInfo(info);

          // Only update seek position if not dragging and not in live mode
          if (!isDraggingSeekBar && !isLiveMode) {
            const position = info.current / Math.max(1, info.total - 1);
            setSeekPosition(position);

            // If we reach the end of the buffer and we're connected, switch to live mode
            if (position > 0.99 && isConnected && isPlaying) {
              setIsLiveMode(true);
              setSeekPosition(1.0);
            }
          } else if (isLiveMode && isPlaying && isConnected) {
            // In live mode, keep the seek position at the end
            setSeekPosition(1.0);
          }
        });

        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing stream viewer:', error);
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (streamViewerRef.current && canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          // Maintain aspect ratio while fitting in container
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          // Target aspect ratio is 16:9
          const aspectRatio = 16 / 9;

          let width, height;
          if (containerWidth / containerHeight > aspectRatio) {
            // Container is wider than needed
            height = containerHeight;
            width = height * aspectRatio;
          } else {
            // Container is taller than needed
            width = containerWidth;
            height = width / aspectRatio;
          }

          streamViewerRef.current.resize(width, height);
        }
      }
    };

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      const isDocFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullScreen(isDocFullScreen);

      // Resize canvas after fullscreen change
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial resize
    handleResize();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      if (streamViewerRef.current) {
        streamViewerRef.current.destroy();
        streamViewerRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  // Separate effect for handling buffer updates based on state changes
  useEffect(() => {
    // Skip if no stream viewer
    if (!streamViewerRef.current) return;

    // Update live mode status when connection changes
    if (isConnected && isPlaying && !isDraggingSeekBar) {
      // When connected and playing, we might want to switch to live mode
      if (seekPosition > 0.99) {
        setIsLiveMode(true);
      }
    }
  }, [isConnected, isPlaying, isDraggingSeekBar, seekPosition]);

  const handlePlayPause = () => {
    if (streamViewerRef.current) {
      console.log('Toggling play/pause, current state:', isPlaying);
      streamViewerRef.current.togglePlayPause();
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value);
    setSeekPosition(position);
  };

  const handleSeekStart = () => {
    console.log('Seek started');
    setIsDraggingSeekBar(true);
    // Exit live mode when user starts seeking
    setIsLiveMode(false);
  };

  const handleSeekEnd = () => {
    console.log('Seek ended, seeking to position:', seekPosition);
    if (streamViewerRef.current) {
      // Force pause if not already paused to ensure we can see the frame we're seeking to
      const wasPaused = !isPlaying;
      if (!wasPaused) {
        streamViewerRef.current.pause();
      }

      // Perform the seek operation
      streamViewerRef.current.seekToPosition(seekPosition);

      // Resume playback if it was playing before
      if (!wasPaused) {
        setTimeout(() => {
          if (streamViewerRef.current) {
            streamViewerRef.current.play();
          }
        }, 100); // Small delay to ensure the seek completes first
      }

      // If user seeks to the end and we're connected, re-enter live mode
      if (seekPosition > 0.99 && isConnected) {
        setIsLiveMode(true);
        setSeekPosition(1.0);
      }
    }
    setIsDraggingSeekBar(false);
  };

  // Function to return to live mode
  const handleReturnToLive = () => {
    console.log('Returning to live mode');
    if (streamViewerRef.current && isConnected) {
      setIsLiveMode(true);
      setSeekPosition(1.0);

      // Force pause first to ensure clean seek
      const wasPaused = !isPlaying;
      if (!wasPaused) {
        streamViewerRef.current.pause();
      }

      // Seek to the end
      streamViewerRef.current.seekToPosition(1.0);

      // Always play when returning to live
      setTimeout(() => {
        if (streamViewerRef.current) {
          streamViewerRef.current.play();
        }
      }, 100);
    }
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (streamViewerRef.current) {
      streamViewerRef.current.setPlaybackRate(rate);
    }
  };

  const toggleFullScreen = () => {
    if (!videoFrameRef.current) return;

    if (!isFullScreen) {
      // Enter fullscreen
      if (videoFrameRef.current.requestFullscreen) {
        videoFrameRef.current.requestFullscreen();
      } else if ((videoFrameRef.current as any).webkitRequestFullscreen) {
        (videoFrameRef.current as any).webkitRequestFullscreen();
      } else if ((videoFrameRef.current as any).mozRequestFullScreen) {
        (videoFrameRef.current as any).mozRequestFullScreen();
      } else if ((videoFrameRef.current as any).msRequestFullscreen) {
        (videoFrameRef.current as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <h1>RTMP Stream Viewer</h1>
        </Header>
        <Main>
          <PlayerContainer>
            <VideoFrame ref={videoFrameRef} className={isFullScreen ? 'fullscreen' : ''}>
              <CanvasContainer>
                <StyledCanvas id="stream-canvas" ref={canvasRef} width={640} height={360} />
              </CanvasContainer>

              {isFullScreen && (
                <VideoControls isFullScreen={isFullScreen}>
                  <ControlsRow>
                    <ControlButton
                      onClick={handlePlayPause}
                      disabled={!isConnected && bufferInfo.total === 0}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? '❚❚' : '▶'}
                    </ControlButton>
                    <SeekBar
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={seekPosition}
                      onChange={handleSeekChange}
                      onMouseDown={handleSeekStart}
                      onMouseUp={handleSeekEnd}
                      onTouchStart={handleSeekStart}
                      onTouchEnd={handleSeekEnd}
                      disabled={bufferInfo.total <= 1}
                      aria-label="Seek"
                    />
                    {!isLiveMode && isConnected && (
                      <LiveButton onClick={handleReturnToLive} aria-label="Return to live">
                        LIVE
                      </LiveButton>
                    )}
                    <PlaybackRateSelect
                      value={playbackRate}
                      onChange={handlePlaybackRateChange}
                      aria-label="Playback speed"
                      disabled={isLiveMode}
                    >
                      <option value="0.25">0.25x</option>
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </PlaybackRateSelect>
                    <ControlButton onClick={toggleFullScreen} aria-label="Exit fullscreen">
                      ⤦
                    </ControlButton>
                  </ControlsRow>
                  <ControlsRow>
                    <ConnectionStatus connected={isConnected}>
                      {isConnected ? 'Connected to RTMP stream' : 'Connecting to RTMP stream...'}
                    </ConnectionStatus>
                    <BufferInfo>
                      {isLiveMode
                        ? 'LIVE'
                        : `Buffer: ${bufferInfo.current}/${bufferInfo.total} frames`}
                    </BufferInfo>
                  </ControlsRow>
                </VideoControls>
              )}
            </VideoFrame>

            {!isFullScreen && (
              <VideoControls isFullScreen={isFullScreen}>
                <ControlsRow>
                  <ControlButton
                    onClick={handlePlayPause}
                    disabled={!isConnected && bufferInfo.total === 0}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '❚❚' : '▶'}
                  </ControlButton>
                  <SeekBar
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={seekPosition}
                    onChange={handleSeekChange}
                    onMouseDown={handleSeekStart}
                    onMouseUp={handleSeekEnd}
                    onTouchStart={handleSeekStart}
                    onTouchEnd={handleSeekEnd}
                    disabled={bufferInfo.total <= 1}
                    aria-label="Seek"
                  />
                  {!isLiveMode && isConnected && (
                    <LiveButton onClick={handleReturnToLive} aria-label="Return to live">
                      LIVE
                    </LiveButton>
                  )}
                  <PlaybackRateSelect
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    aria-label="Playback speed"
                    disabled={isLiveMode}
                  >
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </PlaybackRateSelect>
                  <ControlButton onClick={toggleFullScreen} aria-label="Enter fullscreen">
                    ⤢
                  </ControlButton>
                </ControlsRow>
                <ControlsRow>
                  <ConnectionStatus connected={isConnected}>
                    {isConnected ? 'Connected to RTMP stream' : 'Connecting to RTMP stream...'}
                  </ConnectionStatus>
                  <BufferInfo>
                    {isLiveMode
                      ? 'LIVE'
                      : `Buffer: ${bufferInfo.current}/${bufferInfo.total} frames`}
                  </BufferInfo>
                </ControlsRow>
              </VideoControls>
            )}
          </PlayerContainer>
        </Main>
      </AppContainer>
    </>
  );
}

export default App;
