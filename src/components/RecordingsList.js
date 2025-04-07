import React, { useState, useEffect } from 'react';
import { FaPlay, FaClock, FaCalendarAlt, FaVideo, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RecordingsList.css';

const RecordingsList = ({ onSelectRecording, streamState }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [expandedDates, setExpandedDates] = useState(new Set());

  const fetchRecordings = async () => {
    try {
      const response = await api.get('/recordings');
      setRecordings(response.data.recordings);
      // Initially expand today's recordings
      const today = new Date().toLocaleDateString();
      setExpandedDates(new Set([today]));
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching recordings:', err);
      setError('Failed to fetch recordings');
      setLoading(false);
    }
  };

  // Group recordings by date
  const groupRecordingsByDate = () => {
    const groups = {};
    recordings.forEach(recording => {
      const date = new Date(recording.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(recording);
    });
    
    // Sort recordings within each group by time (newest first)
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    
    return groups;
  };

  const toggleDateExpansion = (date) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  // Initial fetch
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Update recordings when stream state changes
  useEffect(() => {
    if (streamState.lastUpdate > lastUpdate) {
      setLastUpdate(streamState.lastUpdate);
      fetchRecordings();
    }
  }, [streamState.lastUpdate]);

  // Poll for updates when stream is active
  useEffect(() => {
    let pollInterval;
    if (streamState.isActive) {
      // Poll every 5 seconds when stream is active
      pollInterval = setInterval(fetchRecordings, 5000);
    }
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [streamState.isActive]);

  const handlePlayRecording = async (recording) => {
    try {
      console.log('Fetching stream for recording:', recording);
      const response = await api.get(`/recordings/stream/${recording.id}`);
      console.log('Stream response:', response.data);
      
      const recordingWithStream = {
        ...recording,
        streamUrl: response.data.stream_url,
        format: response.data.format,
        mimeType: response.data.mime_type
      };
      
      console.log('Passing recording to player:', recordingWithStream);
      onSelectRecording(recordingWithStream);
    } catch (err) {
      console.error('Error fetching video stream:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Failed to load video stream: ${err.response?.data?.detail || err.message}`);
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toLocaleDateString() === today.toLocaleDateString()) {
      return 'Today';
    } else if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return (
    <div className="recordings-loading">
      Loading recordings...
    </div>
  );

  if (error) return (
    <div className="recordings-error">
      {error}
    </div>
  );

  const groupedRecordings = groupRecordingsByDate();
  const dates = Object.keys(groupedRecordings).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="recordings-container">
      <h2>
        <FaVideo style={{ marginRight: '0.5rem' }} />
        Recorded Streams
      </h2>
      <div className="recordings-list">
        {dates.length === 0 ? (
          <div className="recordings-empty">
            <FaVideo size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No recordings available</p>
          </div>
        ) : (
          dates.map(date => (
            <div key={date} className="recordings-date-group">
              <div 
                className="date-header"
                onClick={() => toggleDateExpansion(date)}
              >
                <h3>
                  <FaCalendarAlt style={{ marginRight: '0.75rem' }} />
                  {formatDate(date)}
                </h3>
                {expandedDates.has(date) ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedDates.has(date) && (
                <div className="date-recordings">
                  {groupedRecordings[date].map((recording) => (
                    <div key={recording.id} className="recording-item">
                      <div className="recording-info">
                        <div className="recording-header">
                          <h4>{recording.stream_name}</h4>
                          <span className="recording-time">{formatTime(recording.created_at)}</span>
                        </div>
                        {recording.duration && (
                          <p className="recording-duration">
                            <FaClock style={{ marginRight: '0.5rem' }} />
                            Duration: {formatDuration(recording.duration)}
                          </p>
                        )}
                      </div>
                      <div className="recording-actions">
                        <button 
                          onClick={() => handlePlayRecording(recording)}
                          className="view-button"
                        >
                          <FaPlay />
                          Play Recording
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecordingsList; 