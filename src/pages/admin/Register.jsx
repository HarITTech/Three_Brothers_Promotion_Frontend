import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import '../../admin.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.register({ email, password });
      navigate('/tbp-admin/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-auth-container ">
      <div className="admin-auth-box">
        <h2>Admin Register</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="admin-form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="admin-form-control" 
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
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>
          <button type="submit" className="admin-btn" style={{ width: '100%' }}>Register</button>
        </form>
      </div>
    </div>
  );
}
