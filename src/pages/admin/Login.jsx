import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ email, password });
      if (data.access_token) {
        localStorage.setItem('adminToken', data.access_token);
        navigate('/tbp-admin');
      } else {
        setError('Login failed, no token received');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      {loading && <Loader fullPage={true} />}
      <div className="admin-auth-box">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--admin-primary)', 
            borderRadius: '16px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            marginBottom: '16px',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
          }}>
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="admin-form-control" 
              placeholder="admin@tbp.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="admin-form-control" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="admin-btn" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </form>

        {/* <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--admin-text-sub)' }}>
          Don't have an account? <Link to="/tbp-admin/register" style={{ color: 'var(--admin-primary)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
        </div> */}
      </div>
    </div>
  );
}
