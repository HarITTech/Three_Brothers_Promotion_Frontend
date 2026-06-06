import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/admin/Loader';

export default function TopBannerAdmin() {
  const [data, setData] = useState({});
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Service
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', subtitle: '', description: '', iconName: '', ctaText: ''
  });
  const [serviceImage, setServiceImage] = useState(null);
  const [modalError, setModalError] = useState('');

  // Modal states for Social Media
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [currentSocialIndex, setCurrentSocialIndex] = useState(null);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getSectionData('top-banner');
      if (res) {
        setData(res);
        setDocId(res._id);
      }
    } catch (err) {
      setError('Failed to fetch data');
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
            newObj[key] = cleanPayload(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      const payload = cleanPayload(data);
      delete payload.services;
      delete payload.facebookUrl;
      delete payload.instagramUrl;
      delete payload.twitterUrl;

      if (payload.socials && (payload.socials.length < 2 || payload.socials.length > 4)) {
        throw new Error('Please ensure you have between 2 and 4 social media links before saving.');
      }
      
      if (docId) {
        await api.updateSectionData('top-banner', docId, payload);
        setSuccess('Main content updated successfully');
      } else {
        const res = await api.createSectionData('top-banner', payload);
        if (res && res._id) {
          setDocId(res._id);
        } else if (res && res.data && res.data._id) {
          setDocId(res.data._id);
        }
        setSuccess('Main content created successfully');
        fetchData();
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setServiceForm({
      title: '', subtitle: '', description: '', iconName: '', ctaText: ''
    });
    setServiceImage(null);
    setModalError('');
    setIsEditingService(false);
    setShowServiceModal(true);
  };

  const openEditModal = (service) => {
    setServiceForm({
      title: service.title || '',
      subtitle: service.subtitle || '',
      description: service.description || '',
      iconName: service.iconName || '',
      ctaText: service.ctaText || ''
    });
    setServiceImage(null);
    setModalError('');
    setCurrentServiceId(service._id);
    setIsEditingService(true);
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (!docId) {
        throw new Error('Please save the Main Content first before adding a service.');
      }

      if (isEditingService) {
        await api.customPut(`/top-banner/update-service/${docId}/${currentServiceId}`, serviceForm);
        if (serviceImage) {
          const formData = new FormData();
          formData.append('image', serviceImage);
          await api.customPost(`/top-banner/update-image/${docId}/${currentServiceId}`, formData, true);
        }
        setSuccess('Service updated successfully');
      } else {
        if (!serviceImage) throw new Error('Background image is required');
        const formData = new FormData();
        formData.append('image', serviceImage);
        Object.keys(serviceForm).forEach(key => {
          formData.append(key, serviceForm[key]);
        });
        await api.customPost(`/top-banner/add-service/${docId}`, formData, true);
        setSuccess('Service added successfully');
      }
      setShowServiceModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setSubmitting(true);
    try {
      await api.customDelete(`/top-banner/delete-service/${docId}/${serviceId}`);
      setSuccess('Service deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddSocialModal = () => {
    if (data.socials?.length >= 4) {
      setError('You can add a maximum of 4 social media links.');
      return;
    }
    setSocialForm({ platform: '', url: '' });
    setModalError('');
    setIsEditingSocial(false);
    setShowSocialModal(true);
  };

  const openEditSocialModal = (social, index) => {
    setSocialForm({ platform: social.platform, url: social.url });
    setCurrentSocialIndex(index);
    setModalError('');
    setIsEditingSocial(true);
    setShowSocialModal(true);
  };

  const handleSocialSubmit = (e) => {
    e.preventDefault();
    const newSocials = [...(data.socials || [])];
    if (isEditingSocial) {
      newSocials[currentSocialIndex] = socialForm;
    } else {
      newSocials.push(socialForm);
    }
    setData({ ...data, socials: newSocials });
    setShowSocialModal(false);
    setSuccess('Social link updated locally. Please click "Save Main Content" to apply changes.');
  };

  const deleteSocial = (index) => {
    if (!window.confirm('Delete this social link?')) return;
    const newSocials = [...(data.socials || [])];
    newSocials.splice(index, 1);
    setData({ ...data, socials: newSocials });
    setSuccess('Social link removed locally. Please click "Save Main Content" to apply changes.');
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-hero-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Top Banner Section</h1>
        <p>Manage top banner announcement, social links, headers, and service cards.</p>
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
            <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div className="admin-form-group">
            <label>Announcement Text (Marquee)</label>
            <input 
              className="admin-form-control" 
              placeholder="e.g. We help brands grow with transparency..."
              value={data.announcementText || ''} 
              onChange={e => setData({...data, announcementText: e.target.value})} 
            />
          </div>

          <div className="admin-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ margin: 0 }}>Social Media Links (Min: 2, Max: 4)</label>
              <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={openAddSocialModal}>
                <i className="fa-solid fa-plus"></i> Add Social
              </button>
            </div>
            {(!data.socials || data.socials.length === 0) ? (
              <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                No social links added yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {data.socials.map((social, index) => (
                  <div key={index} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', textTransform: 'capitalize' }}>{social.platform}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{social.url}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="button" className="admin-btn admin-btn-secondary" style={{ padding: '5px 8px' }} onClick={() => openEditSocialModal(social, index)}>
                        <i className="fa-solid fa-pen" style={{ fontSize: '11px' }}></i>
                      </button>
                      <button type="button" className="admin-btn admin-btn-delete" style={{ padding: '5px 8px' }} onClick={() => deleteSocial(index)}>
                        <i className="fa-solid fa-trash-can" style={{ fontSize: '11px' }}></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label>Subtitle (e.g., WHAT WE DO)</label>
            <input 
              className="admin-form-control" 
              placeholder="WHAT WE DO"
              value={data.subtitle || ''} 
              onChange={e => setData({...data, subtitle: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Title Text (Use \n for line breaks)</label>
              <textarea 
                className="admin-form-control" 
                rows="2"
                placeholder="Solutions That\nDrive"
                value={data.title1 || ''} 
                onChange={e => setData({...data, title1: e.target.value})} 
              />
            </div>
            <div className="admin-form-group">
              <label>Title Highlight Text</label>
              <input 
                className="admin-form-control" 
                placeholder="e.g. Real Growth"
                value={data.titleHighlight || ''} 
                onChange={e => setData({...data, titleHighlight: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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
            <i className="fa-solid fa-layer-group" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Services Banner Cards</span>
          </div>
          <button className="admin-btn" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add New Service
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Icon</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.services?.map((service, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={service.bgImage} alt={service.title} style={{ width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '600' }}>{service.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{service.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td>{service.iconName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditModal(service)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => deleteService(service._id)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showServiceModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingService ? 'Edit Service' : 'Add Service'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowServiceModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleServiceSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Title</label>
                  <input className="admin-form-control" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Subtitle (e.g. PERFORMANCE MARKETING)</label>
                  <input className="admin-form-control" value={serviceForm.subtitle} onChange={e => setServiceForm({...serviceForm, subtitle: e.target.value})} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Icon Identifier</label>
                  <select className="admin-form-control" value={serviceForm.iconName} onChange={e => setServiceForm({...serviceForm, iconName: e.target.value})} required>
                    <option value="" disabled>Select Icon</option>
                    <option value="meta">Meta Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="web">Web Development</option>
                    <option value="app">App Development</option>
                    <option value="code">Code</option>
                    <option value="megaphone">Megaphone</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>CTA Button Text</label>
                  <input className="admin-form-control" value={serviceForm.ctaText} onChange={e => setServiceForm({...serviceForm, ctaText: e.target.value})} required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea className="admin-form-control" rows="3" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} required />
              </div>

              <div className="admin-form-group">
                <label>Background Image {isEditingService ? '(Optional: Upload new to replace)' : ''}</label>
                <input type="file" className="admin-form-control" onChange={e => setServiceImage(e.target.files[0])} accept="image/*" />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingService ? 'Update Service' : 'Save Service'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSocialModal && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingSocial ? 'Edit Social Link' : 'Add Social Link'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowSocialModal(false)}></i>
            </div>

            <form onSubmit={handleSocialSubmit}>
              <div className="admin-form-group" style={{ padding: '0 40px' }}>
                <label>Platform Icon</label>
                <select className="admin-form-control" value={socialForm.platform} onChange={e => setSocialForm({...socialForm, platform: e.target.value})} required>
                  <option value="" disabled>Select Platform</option>
                  <option value="website">Website (Browser)</option>
                  <option value="insta">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="git">GitHub</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ padding: '0 40px' }}>
                <label>URL</label>
                <input className="admin-form-control" value={socialForm.url} onChange={e => setSocialForm({...socialForm, url: e.target.value})} placeholder="https://..." required />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px', padding: '0 40px 30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingSocial ? 'Update' : 'Add'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowSocialModal(false)}>
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
