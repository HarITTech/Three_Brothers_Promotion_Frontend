import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function ResultSectionAdmin() {
  const [data, setData] = useState({
    resultTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    clients: [],
    endText: ''
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Client
  const [showClientModal, setShowClientModal] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    instagramId: ''
  });
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
      delete payload.clients;

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
    setClientForm({
      name: '',
      instagramId: ''
    });
    setClientImage(null);
    setIsEditingClient(false);
    setShowClientModal(true);
  };

  const openEditClient = (cli) => {
    setClientForm({
      name: cli.name || '',
      instagramId: cli.instagramId || ''
    });
    setClientImage(null);
    setCurrentClientId(cli._id);
    setIsEditingClient(true);
    setShowClientModal(true);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingClient) {
        await api.customPut(`/result-section/update-client/${docId}/${currentClientId}`, clientForm);
        if (clientImage) {
          const formData = new FormData();
          formData.append('image', clientImage);
          await api.customPost(`/result-section/update-image/${docId}/${currentClientId}`, formData, true);
        }
        setSuccess('Client updated');
      } else {
        if (!clientImage) throw new Error('Image is required');
        const formData = new FormData();
        formData.append('image', clientImage);
        Object.keys(clientForm).forEach(key => {
          formData.append(key, clientForm[key]);
        });
        await api.customPost(`/result-section/add-client/${docId}`, formData, true);
        setSuccess('Client added');
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
      <div className="admin-header">
        <h1>Result Section Management</h1>
        <p>Showcase your clients impact and success stories.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-header">Main Content</div>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Result Badge (e.g., OUR IMPACT)</label>
              <input className="admin-form-control" value={data.resultTag || ''} onChange={e => setData({...data, resultTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Primary Heading (e.g., Numbers That)</label>
              <input className="admin-form-control" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Gradient Heading (e.g., Speak For Themselves)</label>
              <input className="admin-form-control" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} required />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea className="admin-form-control" value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>End Text (e.g., Many more)</label>
              <input className="admin-form-control" value={data.endText || ''} onChange={e => setData({...data, endText: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="admin-btn">Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Client Case Studies</div>
            <button className="admin-btn" onClick={openAddClient}>+ Add Client</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Niche</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.clients || []).map(cli => (
                <tr key={cli._id}>
                  <td><img src={cli.image} alt={cli.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /></td>
                  <td>{cli.name}</td>
                  <td>{cli.instagramId}</td>
                  <td>
                    <button className="admin-btn admin-btn-edit" style={{ marginRight: '10px' }} onClick={() => openEditClient(cli)}>Edit</button>
                    <button className="admin-btn admin-btn-delete" onClick={() => handleDeleteClient(cli._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showClientModal && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{ maxWidth: '700px' }}>
            <h3>{isEditingClient ? 'Edit Client' : 'Add Client'}</h3>
            <form onSubmit={handleClientSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Card Tag (e.g. Months Working with us)</label>
                  <input className="admin-form-control" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Instagram Link (e.g. https://instagram.com/user)</label>
                  <input className="admin-form-control" value={clientForm.instagramId} onChange={e => setClientForm({...clientForm, instagramId: e.target.value})} required />
                </div>
                
                <div className="admin-form-group">
                  <label>Client Image {isEditingClient ? '(Leave blank to keep existing)' : ''}</label>
                  <input type="file" className="admin-form-control" onChange={e => setClientImage(e.target.files[0])} accept="image/*" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save Client</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowClientModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
