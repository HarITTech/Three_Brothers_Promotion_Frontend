import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

const PROTOCOL_ICONS = [
  { label: 'Microscope (Research)', value: 'fa-solid fa-microscope' },
  { label: 'Pen Nib (Scripting)', value: 'fa-solid fa-pen-nib' },
  { label: 'Video (Shooting)', value: 'fa-solid fa-video' },
  { label: 'Magic Sparkles (Editing)', value: 'fa-solid fa-wand-magic-sparkles' },
  { label: 'Rocket (Posting)', value: 'fa-solid fa-rocket' },
  { label: 'Users Gear (Growth)', value: 'fa-solid fa-users-gear' },
];

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
  const [protocolForm, setProtocolForm] = useState({ heading: '', desc: '', icon: PROTOCOL_ICONS[0].value });
  const [protocolImage, setProtocolImage] = useState(null);

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
      // specific deletes for components that shouldn't send certain arrays in main submit
      delete payload.teamMember;
      delete payload.protocol;
      delete payload.packData;
      delete payload.faqData;
      delete payload.video;
      delete payload.client;
      delete payload.image;
      delete payload.imagePublicId;

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
    setProtocolForm({ heading: '', desc: '', icon: PROTOCOL_ICONS[0].value });
    setProtocolImage(null);
    setIsEditingProtocol(false);
    setShowProtocolModal(true);
  };

  const openEditProtocol = (protocol) => {
    setProtocolForm({ 
      heading: protocol.heading || '', 
      desc: protocol.desc || '', 
      icon: protocol.icon || PROTOCOL_ICONS[0].value 
    });
    setProtocolImage(null);
    setCurrentProtocolId(protocol._id);
    setIsEditingProtocol(true);
    setShowProtocolModal(true);
  };

  const handleProtocolSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingProtocol) {
        // Update text
        await api.customPut(`/protocol-section/update-protocol-text/${docId}/${currentProtocolId}`, protocolForm);
        
        // Update image if selected
        if (protocolImage) {
          const formData = new FormData();
          formData.append('image', protocolImage);
          await api.customPost(`/protocol-section/update-protocol/${docId}/${currentProtocolId}`, formData, true);
        }
        setSuccess('Protocol updated successfully');
      } else {
        if (!protocolImage) throw new Error('Image is required to add a protocol step');
        const formData = new FormData();
        formData.append('image', protocolImage);
        formData.append('heading', protocolForm.heading);
        formData.append('desc', protocolForm.desc);
        formData.append('icon', protocolForm.icon);
        await api.customPost(`/protocol-section/add-protocol/${docId}`, formData, true);
        setSuccess('Protocol added successfully');
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
      <h2 style={{ marginBottom: '20px' }}>Protocol Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
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
          <button type="submit" className="admin-btn" style={{ marginTop: '15px' }}>Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Protocol Steps</h3>
            <button className="admin-btn" onClick={openAddProtocol}>Add Protocol</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Heading</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.protocol || []).map(p => (
                <tr key={p._id}>
                  <td>{p.image && <img src={p.image} alt={p.heading} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}</td>
                  <td>{p.heading}</td>
                  <td>{p.desc}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditProtocol(p)}>Edit</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeleteProtocol(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.protocol || data.protocol.length === 0) && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No protocol steps found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showProtocolModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '500px' }}>
            <h3>{isEditingProtocol ? 'Edit Protocol Step' : 'Add Protocol'}</h3>
            <form onSubmit={handleProtocolSubmit}>
              <div className="admin-form-group">
                <label>Heading</label>
                <input className="admin-form-control" value={protocolForm.heading} onChange={e => setProtocolForm({...protocolForm, heading: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea className="admin-form-control" value={protocolForm.desc} onChange={e => setProtocolForm({...protocolForm, desc: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Icon <i className={protocolForm.icon} style={{ marginLeft: '10px', color: '#ff86c7' }} /></label>
                <select 
                  className="admin-form-control" 
                  value={protocolForm.icon} 
                  onChange={e => setProtocolForm({...protocolForm, icon: e.target.value})}
                  required
                >
                  {PROTOCOL_ICONS.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Image {isEditingProtocol ? '(Leave blank to keep existing)' : ''}</label>
                <input type="file" className="admin-form-control" onChange={e => setProtocolImage(e.target.files[0])} accept="image/*" required={!isEditingProtocol} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
