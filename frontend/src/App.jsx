import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Link2, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Key, 
  Calendar, 
  Clock, 
  Globe, 
  Cpu, 
  Laptop, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  Server,
  QrCode,
  Search
} from 'lucide-react';

export default function App() {
  // Authentication & Session
  const [token, setToken] = useState(localStorage.getItem('sa_token') || '');
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password Recalibration (Temp Pass force change)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data Lists
  const [links, setLinks] = useState([]);
  const [domains, setDomains] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    senderName: '',
    senderEmail: ''
  });

  // Shortener Form States
  const [inputUrl, setInputUrl] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState(1);
  const [shortenLoading, setShortenLoading] = useState(false);

  // Link Detail Modal / Editor States
  const [generatedLink, setGeneratedLink] = useState(null); // When link is newly created
  const [editingLink, setEditingLink] = useState(null);     // When link is edited from list

  // Analytics Filters & States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('week'); // day, week, month, year, all
  const [statsLinkFilter, setStatsLinkFilter] = useState(''); // filter by link ID

  // Users Admin Form States
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [userActionMessage, setUserActionMessage] = useState(null); // Displays temporary password alert

  // Custom Domains Admin States
  const [newDomainName, setNewDomainName] = useState('');
  const [domainError, setDomainError] = useState('');

  // General Notification
  const [alertText, setAlertText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Configure Axios default authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('sa_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('sa_token');
    }
  }, [token]);

  // Boot: Restore session
  useEffect(() => {
    const initSession = async () => {
      if (!token) {
        setAppLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        // Pre-fetch basic app configuration details
        fetchDomains();
        fetchLinks();
        fetchAnalytics();
      } catch (err) {
        console.error('Session restore failed:', err);
        handleLogout();
      } finally {
        setAppLoading(false);
      }
    };
    initSession();
  }, [token]);

  // Monitor tab switches to load appropriate logs
  useEffect(() => {
    if (user && !user.is_temporary) {
      if (activeTab === 'links') fetchLinks();
      if (activeTab === 'analytics') fetchAnalytics();
      if (activeTab === 'users' && user.role === 'admin') fetchUsers();
      if (activeTab === 'smtp' && user.role === 'admin') fetchSMTP();
    }
  }, [activeTab, user]);

  // Monitor analytics filter changes to reload
  useEffect(() => {
    if (user && !user.is_temporary && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [statsPeriod, statsLinkFilter]);

  // Fetching Helpers
  const fetchLinks = async () => {
    try {
      const res = await axios.get('/api/links');
      setLinks(res.data);
    } catch (err) {
      showToast('Failed to fetch link archives.');
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await axios.get('/api/domains');
      setDomains(res.data);
      if (res.data.length > 0) {
        setSelectedDomainId(res.data[0].id);
      }
    } catch (err) {
      showToast('Failed to fetch available domains.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = { period: statsPeriod };
      if (statsLinkFilter) params.linkId = statsLinkFilter;
      const res = await axios.get('/api/analytics', { params });
      setAnalyticsData(res.data);
    } catch (err) {
      showToast('Failed to retrieve telemetry data.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsersList(res.data);
    } catch (err) {
      showToast('Clearance level error. Cannot fetch researchers.');
    }
  };

  const fetchSMTP = async () => {
    try {
      const res = await axios.get('/api/settings/smtp');
      if (res.data.configured) {
        setSmtpConfig({
          host: res.data.host || '',
          port: res.data.port || 587,
          username: res.data.username || '',
          password: '', // do not display actual password
          senderName: res.data.senderName || '',
          senderEmail: res.data.senderEmail || ''
        });
      }
    } catch (err) {
      showToast('Failed to retrieve SMTP configs.');
    }
  };

  // Actions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Complete all coordinate parameters.');
      return;
    }
    try {
      const res = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user.is_temporary) {
        setActiveTab('changepassword');
      } else {
        setActiveTab('dashboard');
      }
      showToast('Terminal session established.');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Authentication sequence failed.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setLinks([]);
    setDomains([]);
    setUsersList([]);
    setAnalyticsData(null);
    setActiveTab('dashboard');
    localStorage.removeItem('sa_token');
  };

  const handleForcePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please provide all password parameters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Warp Code updated successfully.');
      setUser({ ...user, is_temporary: false });
      
      // Load initial lists
      fetchDomains();
      fetchLinks();
      fetchAnalytics();
      
      setTimeout(() => {
        setActiveTab('dashboard');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Recalibration of code failed.');
    }
  };

  // Toast Notifier Helper
  const showToast = (text) => {
    setAlertText(text);
    setTimeout(() => setAlertText(''), 4000);
  };

  // Copy shortened link utility
  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Warp Anchor copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Paste & Shorten Action
  const handleWarpShorten = async (e) => {
    e.preventDefault();
    if (!inputUrl) return;
    setShortenLoading(true);

    try {
      const res = await axios.post('/api/links', {
        original_url: inputUrl,
        description: inputDescription,
        domain_id: selectedDomainId
      });
      
      // Update links list
      setLinks([res.data.link, ...links]);
      // Immediately open the details config popup for this generated link!
      setGeneratedLink(res.data.link);
      
      // Clear main form inputs
      setInputUrl('');
      setInputDescription('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Warp Shortening failed.');
    } finally {
      setShortenLoading(false);
    }
  };

  // Save changes to link details (domain, passcode, expire, max clicks, description)
  const handleSaveDetails = async (linkObj, isGeneratingModal = false) => {
    try {
      const res = await axios.put(`/api/links/${linkObj.id}`, {
        original_url: linkObj.original_url,
        description: linkObj.description,
        domain_id: linkObj.domain_id,
        password: linkObj.password,
        expires_at: linkObj.expires_at,
        max_clicks: linkObj.max_clicks
      });

      // Update link list local state
      setLinks(links.map(l => l.id === linkObj.id ? res.data.link : l));
      showToast('Warp coordinate locked and reconfigured.');

      // Close open modals
      if (isGeneratingModal) {
        setGeneratedLink(null);
      } else {
        setEditingLink(null);
      }
      fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update link configurations.');
    }
  };

  // Delete Link Action
  const handleDeleteLink = async (id) => {
    if (!window.confirm('Dissolve this Space Anchor coordinate permanently?')) return;
    try {
      await axios.delete(`/api/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
      showToast('Warp Anchor coordinate dissolved.');
      if (statsLinkFilter === id.toString()) {
        setStatsLinkFilter('');
      }
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to dissolve link coordinate.');
    }
  };

  // Add Researcher User Action
  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserActionMessage(null);
    if (!newUserEmail || !newUserFirstName || !newUserLastName) {
      showToast('Fill in all researcher parameters.');
      return;
    }
    try {
      const res = await axios.post('/api/users', {
        email: newUserEmail,
        first_name: newUserFirstName,
        last_name: newUserLastName,
        role: newUserRole
      });
      
      setUsersList([res.data.user, ...usersList]);
      
      // Clear inputs
      setNewUserEmail('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserRole('user');

      // Set user temporary password alert
      setUserActionMessage({
        type: 'success',
        title: 'Researcher User Deployed',
        text: `Account created for ${res.data.user.first_name}. ${
          res.data.emailSimulated 
            ? `SMTP SIMULATION MODE: Temporary access password is: ${res.data.simulatedPassword} (This is also logged in the backend console)` 
            : 'Welcome credentials dispatched via Brevo/SMTP.'
        }`
      });
      showToast('User node deployed.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add researcher.');
    }
  };

  // Delete User Action
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Revoke this user\'s access clearance?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsersList(usersList.filter(u => u.id !== id));
      showToast('Clearance revoked. Researcher purged.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete researcher.');
    }
  };

  // Reset Password Action
  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset this user\'s warp passcode and issue a temporary login?')) return;
    setUserActionMessage(null);
    try {
      const res = await axios.put(`/api/users/${id}/reset-password`);
      setUserActionMessage({
        type: 'info',
        title: 'Warp Passcode Reset',
        text: `Temporary passcode reset. ${
          res.data.emailSimulated 
            ? `SMTP SIMULATION MODE: The temporary login code is: ${res.data.simulatedPassword} (Check backend console)` 
            : 'Credentials email sent via SMTP transmitter.'
        }`
      });
      showToast('Passcode reset complete.');
    } catch (err) {
      showToast('Failed to reset password.');
    }
  };

  // Add Custom Domain Action
  const handleAddDomain = async (e) => {
    e.preventDefault();
    setDomainError('');
    if (!newDomainName) return;

    try {
      const res = await axios.post('/api/domains', {
        domain_name: newDomainName
      });
      setDomains([...domains, res.data.domain]);
      setNewDomainName('');
      showToast('Branded domain coordinate added.');
    } catch (err) {
      setDomainError(err.response?.data?.error || 'Failed to whitelist domain.');
    }
  };

  // Delete Custom Domain Action
  const handleDeleteDomain = async (id) => {
    if (!window.confirm('Purge this domain whitelist? Existing links bound to it will fall back to default.')) return;
    try {
      await axios.delete(`/api/domains/${id}`);
      setDomains(domains.filter(d => d.id !== id));
      showToast('Domain coordinate whitelisted code purged.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Cannot delete domain.');
    }
  };

  // Update SMTP Settings Action
  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings/smtp', smtpConfig);
      showToast('SMTP Transmitter coordinates calibrated and saved.');
      fetchSMTP();
    } catch (err) {
      showToast('Failed to update transmitter config.');
    }
  };

  // Helper to compile final short link path url (based on active domain name)
  const getCompiledUrl = (domainName, shortId) => {
    // If domain name matches host, return relative or full host
    if (domainName.includes('localhost')) {
      return `http://${domainName}/${shortId}`;
    }
    // E.g., http://spaceanchor.io/xyz
    return `http://${domainName}/${shortId}`;
  };

  // Render Loader if App is verifying session
  if (appLoading) {
    return (
      <div style={{
        backgroundColor: '#07050d', 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#a78bfa'
      }}>
        <div style={{
          width: '50px', 
          height: '50px', 
          border: '3px solid rgba(139, 92, 246, 0.1)', 
          borderTop: '3px solid #06b6d4', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '12px', fontWeight: '700' }}>
          Initializing SpaceAnchor Routing Node...
        </p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Render Login Card if unauthenticated
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>SpaceAnchor</h1>
            <p>Simulated Universe Warp Control Terminal</p>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            {loginError && (
              <div className="error-alert">
                <ShieldAlert size={18} />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="form-group">
              <label>Access Coordinate (Email)</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="herta@spaceanchor.io"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Passcode (Password)</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Access Station Node
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Force Change Password if temporary
  if (user.is_temporary || activeTab === 'changepassword') {
    return (
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: '480px' }}>
          <div className="login-header">
            <h1 style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Security Protocol Alert
            </h1>
            <p>Temporary Access Passcode Detected</p>
          </div>

          <div className="temp-password-banner">
            <h4>Security Directive #83</h4>
            You are logging in with a default or temporary decryption key. To establish a secure node channel, you must calibrate a custom passcode.
          </div>

          <form className="login-form" onSubmit={handleForcePasswordChange}>
            {passwordError && (
              <div className="error-alert">
                <ShieldAlert size={18} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="error-alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                <CheckCircle2 size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label>Current Passcode</label>
              <input 
                type="password" 
                className="form-control" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Paste temporary password"
                required
              />
            </div>

            <div className="form-group">
              <label>New Passcode</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Passcode</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Verify new passcode"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Calibrate Warp Security Key
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered links list for search
  const filteredLinks = links.filter(l => 
    l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.short_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Alert toast notification */}
      {alertText && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0a0812',
          border: '1px solid #06b6d4',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
          borderRadius: '8px',
          padding: '12px 20px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slide-up 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} className="text-cyan" style={{ color: '#06b6d4' }} />
          {alertText}
        </div>
      )}

      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="node-indicator"></div>
          <h2>SpaceAnchor</h2>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Link2 size={18} />
            <span>Genius Warp Hub</span>
          </button>

          <button 
            className={`sidebar-item ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <Clock size={18} />
            <span>Simulated Storage</span>
          </button>

          <button 
            className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Telemetry Hub</span>
          </button>

          {user.role === 'admin' && (
            <>
              <button 
                className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={18} />
                <span>Access Clearance</span>
              </button>

              <button 
                className={`sidebar-item ${activeTab === 'smtp' ? 'active' : ''}`}
                onClick={() => setActiveTab('smtp')}
              >
                <Server size={18} />
                <span>Transmitter Config</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{user.first_name} {user.last_name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Disconnect Node</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        {/* ========================================== */}
        {/* TAB 1: GENIUS WARP HUB (DASHBOARD SHORTENER) */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="page-header">
              <div>
                <h1>Genius Warp Hub</h1>
                <div className="page-description">Madame Herta's Primary Redirection Core</div>
              </div>
            </div>

            <div className="glass-panel" style={{ maxWidth: '720px', margin: '0 auto 40px auto' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '0.05em', color: '#a78bfa', textTransform: 'uppercase' }}>
                Warp Anchor Generator
              </h2>

              <form onSubmit={handleWarpShorten} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label>Landing Destination URL</label>
                  <input 
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/very-long-coordinate-path"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Brief Curiosity Log (Description)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Optional details or label mapping for this coordinate..."
                    value={inputDescription}
                    onChange={(e) => setInputDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Transmitting Base Domain</label>
                  <div className="domain-select-wrapper">
                    <select 
                      className="form-control"
                      value={selectedDomainId}
                      onChange={(e) => setSelectedDomainId(parseInt(e.target.value))}
                      style={{ flex: 1 }}
                    >
                      {domains.map(d => (
                        <option key={d.id} value={d.id}>{d.domain_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-cyan" 
                  disabled={shortenLoading}
                  style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                >
                  <Link2 size={16} />
                  {shortenLoading ? 'Calibrating Warp Anchor...' : 'Deploy Space Anchor'}
                </button>
              </form>
            </div>

            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.08em', color: '#a1a1aa' }}>
                  Recent Station Warps
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('links')}>
                  View Simulated Storage
                </button>
              </div>

              {links.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                  <Info size={36} style={{ marginBottom: '12px', color: '#71717a' }} />
                  <p>No telemetry warp anchors deployed. Enter a URL above to initialize.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {links.slice(0, 3).map(link => {
                    const finalShortUrl = getCompiledUrl(link.domain_name, link.short_id);
                    return (
                      <div key={link.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', padding: '16px' }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="shortened-badge">{link.short_id}</span>
                            <span style={{ fontSize: '12px', color: '#71717a' }}>({link.domain_name})</span>
                          </div>
                          <div className="link-original" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {link.original_url}
                          </div>
                          {link.description && (
                            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>
                              Log: {link.description}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Copy link"
                            onClick={() => copyToClipboard(finalShortUrl, link.id)}
                          >
                            {copiedId === link.id ? <Check size={14} className="text-cyan" style={{ color: '#06b6d4' }} /> : <Copy size={14} />}
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm btn-icon-only"
                            title="Edit configurations"
                            onClick={() => setEditingLink(link)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm btn-icon-only"
                            title="Purge link"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: STORAGE / LINK LISTING CRUD */}
        {/* ========================================== */}
        {activeTab === 'links' && (
          <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
              <div>
                <h1>Simulated Storage</h1>
                <div className="page-description">Locked Anchor Coordinates and Curio Indexes</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div className="input-with-prefix" style={{ flex: 1, maxWidth: '400px' }}>
                <span className="input-prefix" style={{ padding: '8px 12px', background: 'transparent', borderRight: 'none' }}>
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search archives by slug, target, or log..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '4px' }}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('dashboard')}>
                <Plus size={16} /> Deploy New Anchor
              </button>
            </div>

            <div className="glass-panel" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Shortened Node</th>
                      <th>Landing Target</th>
                      <th>Description Log</th>
                      <th>Visits</th>
                      <th>Access Parameters</th>
                      <th>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                          No matching Space Anchors found in station logs.
                        </td>
                      </tr>
                    ) : (
                      filteredLinks.map(link => {
                        const finalShortUrl = getCompiledUrl(link.domain_name, link.short_id);
                        return (
                          <tr key={link.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '180px' }}>
                                  <a 
                                    href={finalShortUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                      color: 'var(--color-cyan)', 
                                      fontFamily: 'var(--font-mono)', 
                                      fontWeight: '600', 
                                      textDecoration: 'none',
                                      fontSize: '13px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Open link in a new tab"
                                  >
                                    {finalShortUrl}
                                    <span style={{ fontSize: '10px', opacity: 0.6 }}>↗</span>
                                  </a>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Slug: /{link.short_id}</span>
                                </div>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px', height: '24px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => copyToClipboard(finalShortUrl, `tbl-${link.id}`)}
                                >
                                  {copiedId === `tbl-${link.id}` ? <Check size={10} style={{ color: '#06b6d4' }} /> : <Copy size={10} />}
                                  <span>{copiedId === `tbl-${link.id}` ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </td>
                            <td>
                              <div className="link-original" title={link.original_url}>{link.original_url}</div>
                            </td>
                            <td>
                              <div className="link-desc" title={link.description}>{link.description || 'No logs entered.'}</div>
                              {user.role === 'admin' && (
                                <div style={{ fontSize: '10px', color: '#71717a', marginTop: '2px' }}>
                                  Logged by: {link.first_name} {link.last_name}
                                </div>
                              )}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                              {link.click_count}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {link.password && <span style={{ fontSize: '11px', color: '#f59e0b' }}>🔐 Password Protected</span>}
                                {link.expires_at && <span style={{ fontSize: '11px', color: '#f43f5e' }}>⏳ Expire: {new Date(link.expires_at).toLocaleDateString()}</span>}
                                {link.max_clicks && <span style={{ fontSize: '11px', color: '#a78bfa' }}>🎯 Budget: {link.max_clicks} Clicks</span>}
                                {!link.password && !link.expires_at && !link.max_clicks && <span style={{ fontSize: '11px', color: '#71717a' }}>Unrestricted</span>}
                              </div>
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button 
                                  className="btn btn-secondary btn-sm btn-icon-only"
                                  title="Copy short link"
                                  onClick={() => copyToClipboard(finalShortUrl, link.id)}
                                >
                                  {copiedId === link.id ? <Check size={14} style={{ color: '#06b6d4' }} /> : <Copy size={14} />}
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm btn-icon-only"
                                  title="Reconfigure"
                                  onClick={() => setEditingLink(link)}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm btn-icon-only"
                                  title="Dissolve"
                                  onClick={() => handleDeleteLink(link.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: TELEMETRY & STATS HUB */}
        {/* ========================================== */}
        {activeTab === 'analytics' && (
          <div>
            <div className="page-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1>Index of Curiosities (Telemetry)</h1>
                <div className="page-description">Real-time Pathfinding Click logs & Network Analytics</div>
              </div>
            </div>

            <div className="stats-header">
              {/* Period Selectors */}
              <div className="filter-bar">
                <button 
                  className={`filter-button ${statsPeriod === 'day' ? 'active' : ''}`}
                  onClick={() => setStatsPeriod('day')}
                >
                  Day
                </button>
                <button 
                  className={`filter-button ${statsPeriod === 'week' ? 'active' : ''}`}
                  onClick={() => setStatsPeriod('week')}
                >
                  Week
                </button>
                <button 
                  className={`filter-button ${statsPeriod === 'month' ? 'active' : ''}`}
                  onClick={() => setStatsPeriod('month')}
                >
                  Month
                </button>
                <button 
                  className={`filter-button ${statsPeriod === 'year' ? 'active' : ''}`}
                  onClick={() => setStatsPeriod('year')}
                >
                  Year
                </button>
                <button 
                  className={`filter-button ${statsPeriod === 'all' ? 'active' : ''}`}
                  onClick={() => setStatsPeriod('all')}
                >
                  All History
                </button>
              </div>

              {/* Specific Link Telemetry Filter */}
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600', textTransform: 'uppercase' }}>Focus Anchor:</span>
                <select
                  className="form-control"
                  style={{ width: '220px', padding: '8px 12px' }}
                  value={statsLinkFilter}
                  onChange={(e) => setStatsLinkFilter(e.target.value)}
                >
                  <option value="">All Anchors</option>
                  {links.map(l => (
                    <option key={l.id} value={l.id}>/{l.short_id} - {l.description || l.original_url.substring(0, 20)}</option>
                  ))}
                </select>
              </div>
            </div>

            {analyticsData ? (
              <>
                {/* KPIs */}
                <div className="kpi-grid">
                  <div className="glass-panel kpi-card cyan">
                    <div className="kpi-icon-wrapper">
                      <Globe size={22} />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-title">Total Visits</span>
                      <span className="kpi-value">{analyticsData.totalVisits}</span>
                    </div>
                  </div>

                  <div className="glass-panel kpi-card">
                    <div className="kpi-icon-wrapper">
                      <Cpu size={22} />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-title">Top Browser</span>
                      <span className="kpi-value" style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
                        {analyticsData.browsers[0]?.browser || 'Direct/Unknown'} ({analyticsData.browsers[0]?.count || 0})
                      </span>
                    </div>
                  </div>

                  <div className="glass-panel kpi-card amber">
                    <div className="kpi-icon-wrapper">
                      <Laptop size={22} />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-title">Top Device</span>
                      <span className="kpi-value" style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>
                        {analyticsData.devices[0]?.device_type || 'Desktop'} ({analyticsData.devices[0]?.count || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Chart Panel */}
                <div className="glass-panel" style={{ marginBottom: '24px' }}>
                  <div className="chart-header">
                    <span className="chart-title">
                      <Clock size={16} style={{ color: '#06b6d4' }} /> Click Timeline Log
                    </span>
                  </div>
                  
                  {analyticsData.timeline.length === 0 ? (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                      Insufficient chronological telemetry clicks recorded.
                    </div>
                  ) : (
                    <div className="svg-chart-container">
                      {/* Responsive Dynamic Area Chart */}
                      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Render gridlines */}
                        <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" />
                        <line x1="0" y1="190" x2="600" y2="190" stroke="rgba(255,255,255,0.1)" />

                        {(() => {
                          const pts = analyticsData.timeline;
                          const counts = pts.map(p => p.count);
                          const maxCount = Math.max(...counts, 1);
                          const stepX = 600 / Math.max(pts.length - 1, 1);
                          
                          // Build svg coordinates
                          const coords = pts.map((pt, i) => {
                            const x = i * stepX;
                            const y = 190 - (pt.count / maxCount) * 160; // scale between 30 and 190
                            return { x, y, count: pt.count, date: pt.date };
                          });

                          // Generate path string
                          const linePathStr = coords.reduce((acc, c, i) => {
                            return acc + `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y} `;
                          }, '');

                          const areaPathStr = linePathStr + ` L ${coords[coords.length - 1].x} 190 L 0 190 Z`;

                          return (
                            <>
                              {/* Filled Gradient Area */}
                              <path d={areaPathStr} fill="url(#chartGlow)" />
                              {/* Glowing Stroke */}
                              <path d={linePathStr} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                              
                              {/* Anchor Dot Markers */}
                              {coords.map((c, i) => (
                                <g key={i} className="chart-marker-group">
                                  <circle 
                                    cx={c.x} 
                                    cy={c.y} 
                                    r="4" 
                                    fill="#fff" 
                                    stroke="#7c3aed" 
                                    strokeWidth="2" 
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <title>{`Date: ${c.date}\nVisits: ${c.count}`}</title>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                      
                      {/* Timeline Labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#71717a', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                        <span>{analyticsData.timeline[0]?.date}</span>
                        <span>{analyticsData.timeline[Math.floor(analyticsData.timeline.length / 2)]?.date}</span>
                        <span>{analyticsData.timeline[analyticsData.timeline.length - 1]?.date}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-distributions (Referrers, Browser, Country, OS) */}
                <div className="charts-grid">
                  {/* Countries */}
                  <div className="glass-panel chart-card">
                    <div className="chart-header">
                      <span className="chart-title">
                        <Globe size={16} style={{ color: '#06b6d4' }} /> Country Origins
                      </span>
                    </div>
                    <div className="dist-list">
                      {analyticsData.countries.length === 0 ? (
                        <p style={{ color: '#71717a', fontSize: '13px' }}>No geo records logged.</p>
                      ) : (
                        analyticsData.countries.slice(0, 5).map((item, idx) => {
                          const percent = Math.round((item.count / analyticsData.totalVisits) * 100);
                          return (
                            <div key={idx} className="dist-item">
                              <div className="dist-meta">
                                <span className="dist-label">{item.country}</span>
                                <span className="dist-value">{item.count} ({percent}%)</span>
                              </div>
                              <div className="dist-track">
                                <div className="dist-bar" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Referrers */}
                  <div className="glass-panel chart-card">
                    <div className="chart-header">
                      <span className="chart-title">
                        <Link2 size={16} style={{ color: '#a78bfa' }} /> Pathfinding Referrers
                      </span>
                    </div>
                    <div className="dist-list">
                      {analyticsData.referrers.length === 0 ? (
                        <p style={{ color: '#71717a', fontSize: '13px' }}>No referrer logs registered.</p>
                      ) : (
                        analyticsData.referrers.slice(0, 5).map((item, idx) => {
                          const percent = Math.round((item.count / analyticsData.totalVisits) * 100);
                          return (
                            <div key={idx} className="dist-item">
                              <div className="dist-meta">
                                <span className="dist-label">{item.referrer}</span>
                                <span className="dist-value">{item.count} ({percent}%)</span>
                              </div>
                              <div className="dist-track">
                                <div className="dist-bar" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)' }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Browser distribution */}
                  <div className="glass-panel chart-card">
                    <div className="chart-header">
                      <span className="chart-title">
                        <Cpu size={16} style={{ color: '#06b6d4' }} /> Browser Layout Engines
                      </span>
                    </div>
                    <div className="dist-list">
                      {analyticsData.browsers.length === 0 ? (
                        <p style={{ color: '#71717a', fontSize: '13px' }}>No logs registered.</p>
                      ) : (
                        analyticsData.browsers.slice(0, 5).map((item, idx) => {
                          const percent = Math.round((item.count / analyticsData.totalVisits) * 100);
                          return (
                            <div key={idx} className="dist-item">
                              <div className="dist-meta">
                                <span className="dist-label">{item.browser}</span>
                                <span className="dist-value">{item.count} ({percent}%)</span>
                              </div>
                              <div className="dist-track">
                                <div className="dist-bar" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* OS */}
                  <div className="glass-panel chart-card">
                    <div className="chart-header">
                      <span className="chart-title">
                        <Laptop size={16} style={{ color: '#a78bfa' }} /> Operating Systems
                      </span>
                    </div>
                    <div className="dist-list">
                      {analyticsData.os.length === 0 ? (
                        <p style={{ color: '#71717a', fontSize: '13px' }}>No logs registered.</p>
                      ) : (
                        analyticsData.os.slice(0, 5).map((item, idx) => {
                          const percent = Math.round((item.count / analyticsData.totalVisits) * 100);
                          return (
                            <div key={idx} className="dist-item">
                              <div className="dist-meta">
                                <span className="dist-label">{item.os}</span>
                                <span className="dist-value">{item.count} ({percent}%)</span>
                              </div>
                              <div className="dist-track">
                                <div className="dist-bar" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)' }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
                <RefreshCw className="spin" size={32} style={{ marginBottom: '12px' }} />
                <p>Loading analytics stream...</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: ACCESS CLEARANCES (USERS ADMIN) */}
        {/* ========================================== */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div>
            <div className="page-header">
              <div>
                <h1>Access Clearances</h1>
                <div className="page-description">Station Admin User Registry & Verification Codes</div>
              </div>
            </div>

            {userActionMessage && (
              <div className="glass-panel" style={{ 
                borderLeft: '4px solid ' + (userActionMessage.type === 'success' ? '#06b6d4' : '#f59e0b'),
                marginBottom: '24px',
                backgroundColor: 'rgba(10, 8, 18, 0.9)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: userActionMessage.type === 'success' ? '#06b6d4' : '#f59e0b' }}>
                    {userActionMessage.title}
                  </h3>
                  <button className="popup-close" onClick={() => setUserActionMessage(null)}>&times;</button>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#fff', userSelect: 'all' }}>
                  {userActionMessage.text}
                </p>
              </div>
            )}

            <div className="charts-grid" style={{ gridTemplateColumns: '320px 1fr' }}>
              {/* Add User form */}
              <div className="glass-panel" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.08em', marginBottom: '16px' }}>
                  Deploy Researcher Node
                </h3>
                
                <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Gepard"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Landau"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Email ID</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="gepard@herta.station"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Clearance Tier</label>
                    <select 
                      className="form-control"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="user">Researcher (Standard)</option>
                      <option value="admin">Curator (Administrator)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                    <Plus size={14} /> Initialize Credentials
                  </button>
                </form>
              </div>

              {/* Users table list */}
              <div className="glass-panel" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Node Name</th>
                        <th>Coordinate (Email)</th>
                        <th>Clearance Tier</th>
                        <th>Passcode Status</th>
                        <th>Registry Date</th>
                        <th>Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                            Loading user registry logs...
                          </td>
                        </tr>
                      ) : (
                        usersList.map(item => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: '600' }}>
                              {item.first_name} {item.last_name}
                            </td>
                            <td>{item.email}</td>
                            <td>
                              <span className={`badge ${item.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                                {item.role === 'admin' ? 'Curator' : 'Researcher'}
                              </span>
                            </td>
                            <td>
                              {item.is_temporary ? (
                                <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: '500' }}>⚠️ Temporary Key</span>
                              ) : (
                                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>🔒 Calibrated</span>
                              )}
                            </td>
                            <td style={{ color: '#71717a', fontSize: '12px' }}>
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="actions-cell">
                                <button 
                                  className="btn btn-secondary btn-sm" 
                                  title="Force passphrase reset"
                                  onClick={() => handleResetPassword(item.id)}
                                >
                                  Reset Key
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm btn-icon-only"
                                  title="Purge profile"
                                  onClick={() => handleDeleteUser(item.id)}
                                  disabled={item.id === user.id}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: SMTP CONFIG & DOMAIN CONFIG */}
        {/* ========================================== */}
        {activeTab === 'smtp' && user.role === 'admin' && (
          <div>
            <div className="page-header">
              <div>
                <h1>Node Settings (SMTP / Domains)</h1>
                <div className="page-description">Calibrate SMTP mail dispatch coordinates and whitelist custom domains</div>
              </div>
            </div>

            <div className="charts-grid">
              {/* Custom domains whitelist admin */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.08em', marginBottom: '16px' }}>
                  Branded Warp Domain Whitelist
                </h3>

                <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. lnk.herta.station"
                    value={newDomainName}
                    onChange={(e) => setNewDomainName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-cyan btn-sm">Whitelist</button>
                </form>

                {domainError && <p style={{ color: '#f43f5e', fontSize: '12px', marginBottom: '16px' }}>{domainError}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {domains.map(dom => (
                    <div key={dom.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="node-indicator" style={{ width: '6px', height: '6px', backgroundColor: dom.is_active ? '#10b981' : '#71717a', borderRadius: '50%' }}></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{dom.domain_name}</span>
                        {dom.id === 1 && <span style={{ fontSize: '11px', color: '#71717a' }}>(Default System Anchor)</span>}
                      </div>
                      {dom.id !== 1 && (
                        <button 
                          className="btn btn-danger btn-sm btn-icon-only" 
                          onClick={() => handleDeleteDomain(dom.id)}
                          style={{ padding: '4px', height: '24px', width: '24px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SMTP configuration admin */}
              <div className="glass-panel">
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.08em', marginBottom: '16px' }}>
                  SMTP Credentials Config (Brevo / Nodemailer)
                </h3>

                <form onSubmit={handleSaveSMTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label>Transmitter Host Server</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="smtp-relay.brevo.com"
                      value={smtpConfig.host}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Outgoing SMTP Port</label>
                    <input 
                      type="number"
                      className="form-control"
                      placeholder="587"
                      value={smtpConfig.port}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>SMTP Authorizer Username</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="your-email@brevo.com"
                      value={smtpConfig.username}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>SMTP Authorization Password</label>
                    <input 
                      type="password"
                      className="form-control"
                      placeholder="••••••••••••••••••••••••"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                    />
                    <small style={{ fontSize: '11px', color: '#71717a' }}>Leave blank to retain previously stored credentials.</small>
                  </div>

                  <div className="form-group">
                    <label>Sender Label (Display Name)</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Space Station Network"
                      value={smtpConfig.senderName}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, senderName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Sender Address Email (Verified Senders Only)</label>
                    <input 
                      type="email"
                      className="form-control"
                      placeholder="noreply@herta.station"
                      value={smtpConfig.senderEmail}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, senderEmail: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    Save SMTP Configuration
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* RESULT MODAL / POPUP (AFTER WARP GENERATION) */}
      {/* ========================================== */}
      {generatedLink && (
        <div className="popup-overlay">
          <div className="popup-card" style={{ border: '1px solid #06b6d4', boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
            <div className="popup-header">
              <h3><CheckCircle2 size={20} /> Space Anchor Locked!</h3>
              <button className="popup-close" onClick={() => setGeneratedLink(null)} style={{ fontSize: '20px' }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '16px' }}>
              Madame Herta has registered the coordinate. Customize the settings below.
            </p>

            <div className="result-panel">
              <span className="result-url">{getCompiledUrl(generatedLink.domain_name, generatedLink.short_id)}</span>
              <button 
                className="btn btn-cyan btn-sm btn-copy"
                onClick={() => copyToClipboard(getCompiledUrl(generatedLink.domain_name, generatedLink.short_id), 'gen')}
              >
                {copiedId === 'gen' ? <Check size={14} style={{ color: '#fff' }} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Branded QR Code */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(getCompiledUrl(generatedLink.domain_name, generatedLink.short_id))}&color=06b6d4&bgcolor=100d1c`} 
                  alt="Branded QR Code"
                  style={{ borderRadius: '6px', border: '2px solid #06b6d4', display: 'block', margin: '0 auto 6px auto' }}
                />
                <span style={{ fontSize: '10px', color: '#06b6d4', textTransform: 'uppercase', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <QrCode size={10} /> QR Code Dispatch
                </span>
              </div>
            </div>

            {/* Editable config fields inside modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div className="form-group">
                <label>Update Custom Domain</label>
                <select 
                  className="form-control"
                  value={generatedLink.domain_id}
                  onChange={(e) => {
                    const domId = parseInt(e.target.value);
                    const matchedDom = domains.find(d => d.id === domId);
                    setGeneratedLink({
                      ...generatedLink,
                      domain_id: domId,
                      domain_name: matchedDom ? matchedDom.domain_name : generatedLink.domain_name
                    });
                  }}
                >
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>{d.domain_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Curiosity Log (Description)</label>
                <input 
                  type="text"
                  className="form-control"
                  value={generatedLink.description || ''}
                  onChange={(e) => setGeneratedLink({ ...generatedLink, description: e.target.value })}
                  placeholder="e.g. redirect to study materials..."
                />
              </div>

              <div className="form-group">
                <label>Decryption Password (Optional)</label>
                <input 
                  type="password"
                  className="form-control"
                  value={generatedLink.password || ''}
                  onChange={(e) => setGeneratedLink({ ...generatedLink, password: e.target.value })}
                  placeholder="Set lock password key"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={generatedLink.expires_at ? generatedLink.expires_at.split('T')[0] : ''}
                    onChange={(e) => setGeneratedLink({ ...generatedLink, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Clicks Budget</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={generatedLink.max_clicks || ''}
                    onChange={(e) => setGeneratedLink({ ...generatedLink, max_clicks: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setGeneratedLink(null)}>
                Dismiss
              </button>
              <button className="btn btn-cyan" onClick={() => handleSaveDetails(generatedLink, true)}>
                Lock Configurations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EDIT MODAL / POPUP (FROM SIMULATED STORAGE LIST) */}
      {/* ========================================== */}
      {editingLink && (
        <div className="popup-overlay">
          <div className="popup-card">
            <div className="popup-header">
              <h3><Edit3 size={20} /> Reconfigure Space Anchor</h3>
              <button className="popup-close" onClick={() => setEditingLink(null)}>&times;</button>
            </div>

            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '20px' }}>
              Recalibrating coordinate settings for node path [/{editingLink.short_id}].
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div className="form-group">
                <label>Landing Target URL</label>
                <input 
                  type="url"
                  className="form-control"
                  value={editingLink.original_url}
                  onChange={(e) => setEditingLink({ ...editingLink, original_url: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Update Custom Domain</label>
                <select 
                  className="form-control"
                  value={editingLink.domain_id}
                  onChange={(e) => {
                    const domId = parseInt(e.target.value);
                    const matchedDom = domains.find(d => d.id === domId);
                    setEditingLink({
                      ...editingLink,
                      domain_id: domId,
                      domain_name: matchedDom ? matchedDom.domain_name : editingLink.domain_name
                    });
                  }}
                >
                  {domains.map(d => (
                    <option key={d.id} value={d.id}>{d.domain_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Curiosity Log (Description)</label>
                <input 
                  type="text"
                  className="form-control"
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Decryption Password (Optional)</label>
                <input 
                  type="password"
                  className="form-control"
                  value={editingLink.password || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, password: e.target.value })}
                  placeholder="Retain current or set new password"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="date"
                    className="form-control"
                    value={editingLink.expires_at ? editingLink.expires_at.split('T')[0] : ''}
                    onChange={(e) => setEditingLink({ ...editingLink, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Clicks Budget</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={editingLink.max_clicks || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, max_clicks: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingLink(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveDetails(editingLink, false)}>
                Apply Reconfigurations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
