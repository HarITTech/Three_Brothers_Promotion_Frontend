import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register({ email, password });
      navigate('/tbp-admin/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            <i className="fa-solid fa-user-plus"></i>
          </div>
          <h2>Create Account</h2>
          <p>Join the TBP admin panel to manage your site</p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
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
              placeholder="Min. 6 characters"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>
          <button type="submit" className="admin-btn" style={{ width: '100%', marginTop: '8px' }}>
            Create Admin
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--admin-text-sub)' }}>
          Already have an account? <Link to="/tbp-admin/login" style={{ color: 'var(--admin-primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
