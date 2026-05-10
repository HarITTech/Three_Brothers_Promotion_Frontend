import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function ProtocolSectionAdmin() {
  const [data, setData] = useState({
    protocolTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    protocol: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Protocol
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [isEditingProtocol, setIsEditingProtocol] = useState(false);
  const [currentProtocolId, setCurrentProtocolId] = useState(null);
  const [protocolForm, setProtocolForm] = useState({ 
    heading: '', 
    desc: '', 
    icon: 'fa-solid fa-check' 
  });

  const availableIcons = [
    { label: 'Check', value: 'fa-solid fa-check' },
    { label: 'Video', value: 'fa-solid fa-video' },
    { label: 'File', value: 'fa-solid fa-file-invoice' },
    { label: 'Calendar', value: 'fa-solid fa-calendar-check' },
    { label: 'Users', value: 'fa-solid fa-users-gear' },
    { label: 'Star', value: 'fa-solid fa-star' },
    { label: 'Rocket', value: 'fa-solid fa-rocket' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('protocol-section');
      if (res && res._id) {
        setDocId(res._id);
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const cleanPayload = (obj) => {
        if (Array.isArray(obj)) return obj.map(cleanPayload);
        if (obj && typeof obj === 'object') {
          const newObj = {};
          for (let key in obj) {
            if (['createdAt', 'updatedAt', '_id', '__v'].includes(key)) continue;
            if (obj[key] === '') continue;
            newObj[key] = cleanPayload(obj[key]);
          }
          return newObj;
        }
        return obj;
      };
      
      const payload = cleanPayload(data);
      delete payload.protocol;

      if (docId) {
        await api.updateSectionData('protocol-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('protocol-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddProtocol = () => {
    if (!docId) return alert('Please save the main section first!');
    setProtocolForm({ heading: '', desc: '', icon: 'fa-solid fa-check' });
    setIsEditingProtocol(false);
    setShowProtocolModal(true);
  };

  const openEditProtocol = (p) => {
    setProtocolForm({ 
      heading: p.heading || '', 
      desc: p.desc || '', 
      icon: p.icon || 'fa-solid fa-check' 
    });
    setCurrentProtocolId(p._id);
    setIsEditingProtocol(true);
    setShowProtocolModal(true);
  };

  const handleProtocolSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingProtocol) {
        await api.customPut(`/protocol-section/update-protocol/${docId}/${currentProtocolId}`, protocolForm);
        setSuccess('Protocol step updated');
      } else {
        await api.customPost(`/protocol-section/add-protocol/${docId}`, protocolForm);
        setSuccess('Protocol step added');
      }
      setShowProtocolModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProtocol = async (protocolId) => {
    if (!window.confirm('Are you sure you want to delete this protocol step?')) return;
    try {
      await api.customDelete(`/protocol-section/delete-protocol/${docId}/${protocolId}`);
      setSuccess('Protocol deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Protocol Section Management</h1>
        <p>Define the step-by-step process of your service.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-header">Main Content</div>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Protocol Tag</label>
              <input className="admin-form-control" value={data.protocolTag || ''} onChange={e => setData({...data, protocolTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 1</label>
              <input className="admin-form-control" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 2 (Optional)</label>
              <input className="admin-form-control" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description (Optional)</label>
              <textarea className="admin-form-control" value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="admin-btn">Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Protocol Steps</div>
            <button className="admin-btn" onClick={openAddProtocol}>+ Add Step</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Icon</th>
                <th>Heading</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.protocol || []).map(p => (
                <tr key={p._id}>
                  <td style={{ textAlign: 'center' }}><i className={p.icon}></i></td>
                  <td>{p.heading}</td>
                  <td>{p.desc}</td>
                  <td>
                    <button className="admin-btn admin-btn-edit" style={{ marginRight: '10px' }} onClick={() => openEditProtocol(p)}>Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDeleteProtocol(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProtocolModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3>{isEditingProtocol ? 'Edit Step' : 'Add Step'}</h3>
            <form onSubmit={handleProtocolSubmit}>
              <div className="admin-form-group">
                <label>Step Icon</label>
                <select 
                  className="admin-form-control" 
                  value={protocolForm.icon} 
                  onChange={e => setProtocolForm({...protocolForm, icon: e.target.value})}
                >
                  {availableIcons.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Heading</label>
                <input className="admin-form-control" value={protocolForm.heading} onChange={e => setProtocolForm({...protocolForm, heading: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea className="admin-form-control" value={protocolForm.desc} onChange={e => setProtocolForm({...protocolForm, desc: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowProtocolModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
