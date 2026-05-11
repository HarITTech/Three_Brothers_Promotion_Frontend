import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function ContactSectionAdmin() {
  const [data, setData] = useState({
    contactTag: '',
    heading1: '',
    heading2: '',
    desc1: '',
    desc2: ''
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('contact-section');
      if (res && res._id) {
        setDocId(res._id);
        setData(res);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch contact section data');
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

      if (docId) {
        await api.updateSectionData('contact-section', docId, payload);
        setSuccess('Contact content updated successfully');
      } else {
        const res = await api.createSectionData('contact-section', payload);
        setDocId(res._id);
        setSuccess('Contact section created successfully');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to update content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!docId) return alert('Please save main content before uploading image.');
    if (!imageFile) return alert('Please select an image file first.');
    
    setSubmitting(true);
    setImageError('');
    try {
      setSuccess('');
      const formData = new FormData();
      formData.append('image', imageFile);
      
      await api.customPost(`/contact-section/${docId}`, formData, true);
      setSuccess('Contact image updated successfully');
      setImageFile(null);
      fetchData(); // refresh to get new image URL
      window.scrollTo(0, 0);
    } catch (err) {
      setImageError(err.message || 'Failed to upload image');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-contact-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Contact & Lead Generation</h1>
        <p>Manage how potential clients reach out to you and customize the final call-to-action.</p>
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
            <i className="fa-solid fa-envelope-open-text" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Messaging Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Section Tagline</label>
              <input className="admin-form-control" placeholder="e.g. GET IN TOUCH" value={data.contactTag || ''} onChange={e => setData({...data, contactTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Headline Part 1</label>
              <input className="admin-form-control" placeholder="e.g. Contact" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Headline Part 2 (Gradient Highlight)</label>
              <input className="admin-form-control" placeholder="e.g. Us Today" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Primary Paragraph</label>
            <textarea className="admin-form-control" rows="3" placeholder="Main contact description..." value={data.desc1 || ''} onChange={e => setData({...data, desc1: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label>Secondary Paragraph</label>
            <textarea className="admin-form-control" rows="3" placeholder="Additional details (e.g. response time)..." value={data.desc2 || ''} onChange={e => setData({...data, desc2: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Content
            </button>
          </div>
        </form>
      </div>

      {docId && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-image" style={{ color: 'var(--admin-primary)' }}></i>
              <span>Section Visual</span>
            </div>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
              {data.image ? (
                <div style={{ flex: '0 0 auto' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '10px', color: 'var(--admin-text-sub)' }}>Current Image</p>
                  <img src={data.image} alt="Contact Visual" style={{ width: '240px', height: '240px', borderRadius: '15px', objectFit: 'cover', border: '1px solid var(--admin-border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                </div>
              ) : (
                <div style={{ flex: '0 0 auto', width: '240px', height: '240px', borderRadius: '15px', background: '#f8fafc', border: '2px dashed var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-sub)' }}>
                  No image uploaded
                </div>
              )}

              <div style={{ flex: '1 1 300px' }}>
                {imageError && (
                  <div className="admin-alert admin-alert-error" style={{ marginBottom: '20px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {imageError}
                  </div>
                )}
                <form onSubmit={handleImageSubmit}>
                  <div className="admin-form-group">
                    <label>Upload New Image</label>
                    <div style={{ marginTop: '10px' }}>
                      <input type="file" className="admin-form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--admin-text-sub)', marginTop: '8px' }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '5px' }}></i>
                      Recommended: High resolution square or portrait image.
                    </p>
                  </div>
                  <button type="submit" className="admin-btn" style={{ marginTop: '10px' }}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    Update Visual
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
