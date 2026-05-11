import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

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
  const [submitting, setSubmitting] = useState(false);
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
  const [protocolImage, setProtocolImage] = useState(null);
  const [modalError, setModalError] = useState('');

  const availableIcons = [
    { label: 'Check', value: 'fa-solid fa-check' },
    { label: 'Video', value: 'fa-solid fa-video' },
    { label: 'File', value: 'fa-solid fa-file-invoice' },
    { label: 'Calendar', value: 'fa-solid fa-calendar-check' },
    { label: 'Users', value: 'fa-solid fa-users-gear' },
    { label: 'Star', value: 'fa-solid fa-star' },
    { label: 'Rocket', value: 'fa-solid fa-rocket' },
    { label: 'Lightbulb', value: 'fa-solid fa-lightbulb' },
    { label: 'Chart', value: 'fa-solid fa-chart-line' }
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
      setError('Failed to fetch protocol section data');
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
      delete payload.protocol;

      if (docId) {
        await api.updateSectionData('protocol-section', docId, payload);
        setSuccess('Protocol section updated successfully');
      } else {
        const res = await api.createSectionData('protocol-section', payload);
        setDocId(res._id);
        setSuccess('Protocol section created successfully');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to update section');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddProtocol = () => {
    if (!docId) return alert('Please save the main section first!');
    setProtocolForm({ heading: '', desc: '', icon: 'fa-solid fa-check' });
    setProtocolImage(null);
    setModalError('');
    setIsEditingProtocol(false);
    setShowProtocolModal(true);
  };

  const openEditProtocol = (p) => {
    setProtocolForm({ 
      heading: p.heading || '', 
      desc: p.desc || '', 
      icon: p.icon || 'fa-solid fa-check' 
    });
    setProtocolImage(null);
    setModalError('');
    setCurrentProtocolId(p._id);
    setIsEditingProtocol(true);
    setShowProtocolModal(true);
  };

  const handleProtocolSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (isEditingProtocol) {
        // Update text data
        await api.customPut(`/protocol-section/update-protocol-text/${docId}/${currentProtocolId}`, protocolForm);
        
        // Update image if selected
        if (protocolImage) {
          const formData = new FormData();
          formData.append('image', protocolImage);
          await api.customPost(`/protocol-section/update-protocol/${docId}/${currentProtocolId}`, formData, true);
        }
        setSuccess('Protocol step updated successfully');
      } else {
        // For new protocols, we MUST have an image according to backend requirements
        if (!protocolImage) {
          throw new Error('Image is required for new protocol steps');
        }
        
        const formData = new FormData();
        formData.append('image', protocolImage);
        Object.keys(protocolForm).forEach(key => {
          formData.append(key, protocolForm[key]);
        });
        
        await api.customPost(`/protocol-section/add-protocol/${docId}`, formData, true);
        setSuccess('Protocol step added successfully');
      }
      setShowProtocolModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Failed to save protocol step');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProtocol = async (protocolId) => {
    if (!window.confirm('Are you sure you want to delete this protocol step?')) return;
    setSubmitting(true);
    try {
      await api.customDelete(`/protocol-section/delete-protocol/${docId}/${protocolId}`);
      setSuccess('Protocol step deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to delete step');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-protocol-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Protocol & Workflow</h1>
        <p>Define and manage the step-by-step process of your elite service delivery.</p>
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
            <i className="fa-solid fa-list-check" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Section Tagline</label>
              <input className="admin-form-control" placeholder="e.g. OUR PROTOCOL" value={data.protocolTag || ''} onChange={e => setData({...data, protocolTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Headline Part 1</label>
              <input className="admin-form-control" placeholder="e.g. The Roadmap to" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Headline Part 2 (Gradient Highlight)</label>
              <input className="admin-form-control" placeholder="e.g. Digital Dominance" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Section Description</label>
            <textarea className="admin-form-control" rows="3" placeholder="Explain the workflow at a high level..." value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Section Content
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-stairs" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Protocol Steps</span>
          </div>
          <button className="admin-btn" onClick={openAddProtocol}>
            <i className="fa-solid fa-plus"></i>
            Add New Step
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Icon</th>
                  <th>Step Title</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.protocol || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                      No protocol steps defined yet.
                    </td>
                  </tr>
                ) : (
                  (data.protocol || []).map(p => (
                    <tr key={p._id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '10px', 
                            backgroundColor: '#f8fafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--admin-primary)',
                            border: '1px solid var(--admin-border)'
                          }}>
                            <i className={p.icon}></i>
                          </div>
                          {p.image && (
                            <img src={p.image} alt="Step" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          )}
                        </div>
                      </td>
                      <td><span style={{ fontWeight: '700' }}>{p.heading}</span></td>
                      <td style={{ maxWidth: '300px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>{p.desc}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditProtocol(p)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => handleDeleteProtocol(p._id)}>
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

      {showProtocolModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingProtocol ? 'Edit Protocol Step' : 'Add New Step'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowProtocolModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleProtocolSubmit}>
              <div className="admin-form-group">
                <label>Step Visual Icon</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--admin-primary)', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    <i className={protocolForm.icon}></i>
                  </div>
                  <select 
                    className="admin-form-control" 
                    value={protocolForm.icon} 
                    onChange={e => setProtocolForm({...protocolForm, icon: e.target.value})}
                    style={{ flex: 1 }}
                  >
                    {availableIcons.map(icon => (
                      <option key={icon.value} value={icon.value}>{icon.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Step Headline</label>
                <input className="admin-form-control" placeholder="e.g. Discovery & Audit" value={protocolForm.heading} onChange={e => setProtocolForm({...protocolForm, heading: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Step Detail</label>
                <textarea className="admin-form-control" rows="4" placeholder="Explain what happens in this step..." value={protocolForm.desc} onChange={e => setProtocolForm({...protocolForm, desc: e.target.value})} required />
              </div>

              <div className="admin-form-group">
                <label>Step Image {isEditingProtocol ? '(Optional: Upload to replace)' : '(Required)'}</label>
                <input type="file" className="admin-form-control" onChange={e => setProtocolImage(e.target.files[0])} accept="image/*" />
                {isEditingProtocol && !protocolImage && (
                  <p style={{ fontSize: '11px', color: 'var(--admin-text-sub)', marginTop: '5px' }}>Leave empty to keep current image</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingProtocol ? 'Update Step' : 'Save Step'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowProtocolModal(false)}>
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
