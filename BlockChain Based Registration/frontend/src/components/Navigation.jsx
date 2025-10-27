import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
    const location = useLocation();

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <span className="brand-icon">🆔</span>
                    <span className="brand-text">Digital Tourist Registry</span>
                </div>
                
                <div className="nav-links">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <span className="link-icon">📋</span>
                        Tourist List
                    </Link>
                    <Link 
                        to="/register" 
                        className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                    >
                        <span className="link-icon">📝</span>
                        Register
                    </Link>
                    <Link 
                        to="/dashboard" 
                        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        <span className="link-icon">📊</span>
                        Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;