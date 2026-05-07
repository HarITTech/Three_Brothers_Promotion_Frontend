import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function ResultSectionAdmin() {
  const [data, setData] = useState({
    resultTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    endText: '',
    clients: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Client
  const [showClientModal, setShowClientModal] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [clientForm, setClientForm] = useState({ name: '', instagramId: '' });
  const [clientImage, setClientImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('result-section');
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
        await api.updateSectionData('result-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('result-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddClient = () => {
    if (!docId) return alert('Please save the main section first!');
    setClientForm({ name: '', instagramId: '' });
    setClientImage(null);
    setIsEditingClient(false);
    setShowClientModal(true);
  };

  const openEditClient = (client) => {
    setClientForm({ name: client.name || '', instagramId: client.instagramId || '' });
    setClientImage(null);
    setCurrentClientId(client._id);
    setIsEditingClient(true);
    setShowClientModal(true);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingClient) {
        if (!clientImage) throw new Error('Please select an image to update');
        const formData = new FormData();
        formData.append('image', clientImage);
        await api.customPost(`/result-section/update-client/${docId}/${currentClientId}`, formData, true);
        setSuccess('Client image updated (Note: Backend does not support updating text fields)');
      } else {
        if (!clientImage) throw new Error('Image is required to add a client');
        const formData = new FormData();
        formData.append('image', clientImage);
        formData.append('name', clientForm.name);
        formData.append('instagramId', clientForm.instagramId);
        await api.customPost(`/result-section/add-client/${docId}`, formData, true);
        setSuccess('Client added successfully');
      }
      setShowClientModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.customDelete(`/result-section/delete-client/${docId}/${clientId}`);
      setSuccess('Client deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Result Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Result Tag</label>
              <input className="admin-form-control" value={data.resultTag || ''} onChange={e => setData({...data, resultTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 1</label>
              <input className="admin-form-control" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 2 (Optional)</label>
              <input className="admin-form-control" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>End Text (Optional)</label>
              <input className="admin-form-control" value={data.endText || ''} onChange={e => setData({...data, endText: e.target.value})} />
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
            <h3>Clients</h3>
            <button className="admin-btn" onClick={openAddClient}>Add Client</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Instagram</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.clients || []).map(c => (
                <tr key={c._id}>
                  <td>{c.image && <img src={c.image} alt={c.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}</td>
                  <td>{c.name}</td>
                  <td>{c.instagramId}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditClient(c)}>Edit Image</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeleteClient(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.clients || data.clients.length === 0) && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showClientModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '500px' }}>
            <h3>{isEditingClient ? 'Update Client Image' : 'Add Client'}</h3>
            <form onSubmit={handleClientSubmit}>
              {!isEditingClient && (
                <>
                  <div className="admin-form-group">
                    <label>Name</label>
                    <input className="admin-form-control" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Instagram ID</label>
                    <input className="admin-form-control" value={clientForm.instagramId} onChange={e => setClientForm({...clientForm, instagramId: e.target.value})} required />
                  </div>
                </>
              )}
              {isEditingClient && (
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Note: Backend API only allows updating the image for an existing client. To change text, delete and recreate the client.
                </p>
              )}
              <div className="admin-form-group">
                <label>Image</label>
                <input type="file" className="admin-form-control" onChange={e => setClientImage(e.target.files[0])} accept="image/*" required={!isEditingClient} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowClientModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
