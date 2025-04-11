import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';
import './Navigation.css';
import { FaVideo, FaHistory, FaUser, FaCog, FaBars, FaTimes, FaMicrochip } from 'react-icons/fa';

const Navigation = ({ activeSection, onSectionChange }) => {
    const { user } = useAuth0();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        { id: 'live', label: 'Live Stream', icon: <FaVideo /> },
        { id: 'recordings', label: 'Recorded Streams', icon: <FaHistory /> },
        { id: 'devices', label: 'Devices', icon: <FaMicrochip /> },
        { id: 'user', label: 'User Profile', icon: <FaUser /> },
        { id: 'settings', label: 'Settings', icon: <FaCog /> }
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <h2>Dronehub</h2>
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            <div className={`nav-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <ul className="nav-sections">
                    {sections.map(section => (
                        <li 
                            key={section.id}
                            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => {
                                onSectionChange(section.id);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <span className="nav-icon">{section.icon}</span>
                            <span className="nav-label">{section.label}</span>
                        </li>
                    ))}
                </ul>

                <div className="nav-user">
                    {user && (
                        <div className="user-info">
                            <img 
                                src={user.picture} 
                                alt={user.name} 
                                className="user-avatar"
                            />
                            <span className="user-name">{user.name}</span>
                        </div>
                    )}
                    <LogoutButton />
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 