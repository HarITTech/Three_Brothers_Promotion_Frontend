import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

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
  const [submitting, setSubmitting] = useState(false);
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
  const [modalError, setModalError] = useState('');

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
      setError('Failed to fetch result section data');
    } finally {
      setLoading(false);
    }
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to update section');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddClient = () => {
    if (!docId) return alert('Please save the main section first!');
    setClientForm({
      name: '',
      instagramId: ''
    });
    setClientImage(null);
    setModalError('');
    setIsEditingClient(false);
    setShowClientModal(true);
  };

  const openEditClient = (cli) => {
    setClientForm({
      name: cli.name || '',
      instagramId: cli.instagramId || ''
    });
    setClientImage(null);
    setModalError('');
    setCurrentClientId(cli._id);
    setIsEditingClient(true);
    setShowClientModal(true);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (isEditingClient) {
        await api.customPut(`/result-section/update-client/${docId}/${currentClientId}`, clientForm);
        if (clientImage) {
          const formData = new FormData();
          formData.append('image', clientImage);
          await api.customPost(`/result-section/update-image/${docId}/${currentClientId}`, formData, true);
        }
        setSuccess('Client case study updated successfully');
      } else {
        if (!clientImage) throw new Error('Image is required for new case studies');
        const formData = new FormData();
        formData.append('image', clientImage);
        Object.keys(clientForm).forEach(key => {
          formData.append(key, clientForm[key]);
        });
        await api.customPost(`/result-section/add-client/${docId}`, formData, true);
        setSuccess('Client case study added successfully');
      }
      setShowClientModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Failed to save client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this case study?')) return;
    setSubmitting(true);
    try {
      await api.customDelete(`/result-section/delete-client/${docId}/${clientId}`);
      setSuccess('Case study deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-results-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Results & Case Studies</h1>
        <p>Showcase the impact and success stories of your clients with data-driven proof.</p>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="fa-solid fa-circle-check"></i>
          {success}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-file-invoice" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Section Tagline</label>
              <input className="admin-form-control" placeholder="e.g. OUR IMPACT" value={data.resultTag || ''} onChange={e => setData({...data, resultTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Main Headline Part 1</label>
              <input className="admin-form-control" placeholder="e.g. Numbers That" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Main Headline Part 2 (Gradient)</label>
              <input className="admin-form-control" placeholder="e.g. Speak For Themselves" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Footer End Text</label>
              <input className="admin-form-control" placeholder="e.g. & many more..." value={data.endText || ''} onChange={e => setData({...data, endText: e.target.value})} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Description</label>
            <textarea className="admin-form-control" rows="3" placeholder="Explain the results in detail..." value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Main Content
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Client Case Studies</span>
          </div>
          <button className="admin-btn" onClick={openAddClient}>
            <i className="fa-solid fa-plus"></i>
            Add Case Study
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Niche / Account</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.clients || []).length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                      No case studies found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  (data.clients || []).map(cli => (
                    <tr key={cli._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={cli.image} alt={cli.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                          <span style={{ fontWeight: '700' }}>{cli.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e1306c' }}>
                          <i className="fa-brands fa-instagram"></i>
                          <span style={{ fontSize: '0.9rem' }}>{cli.instagramId}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditClient(cli)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => handleDeleteClient(cli._id)}>
                            <i className="fa-solid fa-trash-can"></i>
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

      {showClientModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingClient ? 'Edit Case Study' : 'Add New Case Study'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowClientModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleClientSubmit}>
              <div className="admin-form-group">
                <label>Case Study Title (e.g. 12 Months Results)</label>
                <input className="admin-form-control" placeholder="Enter title..." value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Instagram Username / Link</label>
                <input className="admin-form-control" placeholder="e.g. @username" value={clientForm.instagramId} onChange={e => setClientForm({...clientForm, instagramId: e.target.value})} required />
              </div>
              
              <div className="admin-form-group">
                <label>Result Image {isEditingClient ? '(Optional: Upload new to replace)' : ''}</label>
                <input type="file" className="admin-form-control" onChange={e => setClientImage(e.target.files[0])} accept="image/*" />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingClient ? 'Update Case Study' : 'Save Case Study'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowClientModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
