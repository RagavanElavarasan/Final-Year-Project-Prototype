import { useState, useEffect } from 'react';
import axios from 'axios';
import { useData } from '../contexts/DataContext';
import './Dashboard.css';

function Dashboard() {
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTourist, setSelectedTourist] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        newRegistrations: 0
    });

    const { refreshTrigger, isNewRegistration } = useData();

    // Fetch tourists data
    const fetchTourists = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tourists`);
            const touristsData = response.data;
            setTourists(touristsData);
            calculateStats(touristsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching tourists:', err);
            setError('Failed to load tourist data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const calculateStats = (touristsData) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const oneDayAgo = currentTime - (24 * 60 * 60); // 24 hours ago
        
        let activeCount = 0;
        let pendingCount = 0;
        let newRegistrationsCount = 0;

        touristsData.forEach(tourist => {
            // Count active tourists (within return date and isActive)
            if (tourist.isActive && currentTime <= tourist.returnDate) {
                activeCount++;
            }
            
            // Count pending (expired but marked as active)
            if (tourist.isActive && currentTime > tourist.returnDate) {
                pendingCount++;
            }
            
            // Count new registrations in last 24 hours
            if (tourist.issuedAt >= oneDayAgo) {
                newRegistrationsCount++;
            }
        });

        setStats({
            total: touristsData.length,
            pending: pendingCount,
            active: activeCount,
            newRegistrations: newRegistrationsCount
        });
    };

    // Determine tourist status
    const getTouristStatus = (tourist) => {
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (!tourist.isActive) {
            return 'return'; // Tourist has returned/inactive
        }
        
        if (currentTime > tourist.returnDate) {
            return 'missing'; // Past return date but still marked active
        }
        
        // Check if return date is within next 24 hours
        const oneDayFromNow = currentTime + (24 * 60 * 60);
        if (tourist.returnDate <= oneDayFromNow) {
            return 'not-return'; // Due to return soon
        }
        
        return 'active'; // Currently active and within expected time
    };

    // Format date for display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle view tourist details
    const handleViewTourist = (tourist) => {
        setSelectedTourist(tourist);
    };

    const closeModal = () => {
        setSelectedTourist(null);
    };

    useEffect(() => {
        fetchTourists();
        
        // Set up polling for real-time updates every 30 seconds
        const interval = setInterval(fetchTourists, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Listen for data changes from context
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchTourists();
        }
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <h3>Loading Dashboard...</h3>
                    <p>Please wait while we fetch the tourist data.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Dashboard</h3>
                    <p>{error}</p>
                    <button onClick={fetchTourists} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">
                        <span className="title-icon">📊</span>
                        Tourist Safety Dashboard
                    </h1>
                    <p className="dashboard-subtitle">Monitor and manage registered tourist records</p>
                </div>
            </div>

            <div className="dashboard-main">
                {/* New Registration Notification */}
                {isNewRegistration && (
                    <div className="notification-banner">
                        <div className="notification-content">
                            <span className="notification-icon">🎉</span>
                            <span>New tourist registration completed! Dashboard updated with latest data.</span>
                        </div>
                    </div>
                )}

                {/* Statistics Widgets */}
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Total Tourists</div>
                        </div>
                    </div>
                    
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <div className="stat-number">{stats.pending}</div>
                            <div className="stat-label">Pending Verifications</div>
                        </div>
                    </div>
                    
                    <div className="stat-card active">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-number">{stats.active}</div>
                            <div className="stat-label">Active Tourists</div>
                        </div>
                    </div>
                    
                    <div className="stat-card new">
                        <div className="stat-icon">🆕</div>
                        <div className="stat-info">
                            <div className="stat-number">{stats.newRegistrations}</div>
                            <div className="stat-label">New Registrations</div>
                        </div>
                    </div>
                </div>

                {/* Tourist Records Table */}
                <div className="table-container">
                    <div className="table-header">
                        <h2>Registered Tourist Records</h2>
                        <button onClick={fetchTourists} className="refresh-button">
                            🔄 Refresh
                        </button>
                    </div>

                    {tourists.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No Tourist Records Found</h3>
                            <p>No tourists have been registered yet. Register new tourists to see them here.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="tourists-table">
                                <thead>
                                    <tr>
                                        <th>Digital ID</th>
                                        <th>Name</th>
                                        <th>Destination</th>
                                        <th>Check-in Date</th>
                                        <th>Check-out Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tourists.map((tourist, index) => {
                                        const status = getTouristStatus(tourist);
                                        return (
                                            <tr key={tourist.dtid} className="table-row">
                                                <td className="digital-id">
                                                    <div className="id-cell">
                                                        <span className="id-prefix">DTID-</span>
                                                        <span className="id-value">{tourist.dtid.split('-')[0]}</span>
                                                    </div>
                                                </td>
                                                <td className="name-cell">
                                                    <div className="tourist-name">
                                                        <div className="name">{tourist.fullName}</div>
                                                        <div className="travellers-count">
                                                            {tourist.numberOfTravellers} traveller{tourist.numberOfTravellers > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="destination-cell">
                                                    {tourist.tripDetails?.destination || 'N/A'}
                                                </td>
                                                <td className="date-cell">
                                                    {formatDate(tourist.issuedAt)}
                                                </td>
                                                <td className="date-cell">
                                                    {formatDate(tourist.returnDate)}
                                                </td>
                                                <td className="status-cell">
                                                    <span className={`status-badge ${status.replace(' ', '-')}`}>
                                                        {status === 'return' && '🏠'}
                                                        {status === 'not-return' && '⚠️'}
                                                        {status === 'missing' && '🚨'}
                                                        {status === 'active' && '✅'}
                                                        {status.replace(/^\w/, c => c.toUpperCase()).replace('-', ' ')}
                                                    </span>
                                                </td>
                                                <td className="action-cell">
                                                    <button 
                                                        className="view-button"
                                                        onClick={() => handleViewTourist(tourist)}
                                                    >
                                                        👁️ View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Tourist Detail Modal */}
            {selectedTourist && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tourist Details</h2>
                            <button className="close-button" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Personal Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Full Name:</label>
                                        <span>{selectedTourist.fullName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Digital ID:</label>
                                        <span className="digital-id">{selectedTourist.dtid}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Age:</label>
                                        <span>{selectedTourist.age}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Gender:</label>
                                        <span>{selectedTourist.gender}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedTourist.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Mobile:</label>
                                        <span>{selectedTourist.mobileNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Trip Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Destination:</label>
                                        <span>{selectedTourist.tripDetails?.destination || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Start Date:</label>
                                        <span>{selectedTourist.tripDetails?.startDate || formatDate(selectedTourist.issuedAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Return Date:</label>
                                        <span>{formatDate(selectedTourist.returnDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Total Travellers:</label>
                                        <span>{selectedTourist.numberOfTravellers}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Status:</label>
                                        <span className={`status-badge ${getTouristStatus(selectedTourist).replace(' ', '-')}`}>
                                            {getTouristStatus(selectedTourist).replace(/^\w/, c => c.toUpperCase()).replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedTourist.familyMembers && selectedTourist.familyMembers.length > 0 && (
                                <div className="detail-section">
                                    <h3>Family Members</h3>
                                    <div className="family-members-list">
                                        {selectedTourist.familyMembers.map((member, index) => (
                                            <div key={index} className="family-member">
                                                <span className="member-name">{member.fullName}</span>
                                                <span className="member-details">{member.age} years, {member.gender}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTourist.emergencyContacts && selectedTourist.emergencyContacts.length > 0 && (
                                <div className="detail-section">
                                    <h3>Emergency Contacts</h3>
                                    <div className="emergency-contacts-list">
                                        {selectedTourist.emergencyContacts.map((contact, index) => (
                                            <div key={index} className="emergency-contact">
                                                <span className="contact-name">{contact.name}</span>
                                                <span className="contact-phone">{contact.phone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;