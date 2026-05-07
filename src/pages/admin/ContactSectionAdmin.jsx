import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);

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
        await api.updateSectionData('contact-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('contact-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!docId) return alert('Please save main content before uploading image.');
    if (!imageFile) return alert('Please select an image file first.');
    
    try {
      setError('');
      setSuccess('');
      const formData = new FormData();
      formData.append('image', imageFile);
      
      await api.customPost(`/contact-section/${docId}`, formData, true);
      setSuccess('Image updated successfully');
      setImageFile(null);
      fetchData(); // refresh to get new image URL
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Contact Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Contact Badge (e.g., GET IN TOUCH)</label>
              <input className="admin-form-control" value={data.contactTag || ''} onChange={e => setData({...data, contactTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Primary Heading (e.g., Contact)</label>
              <input className="admin-form-control" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Gradient Heading (e.g., Us)</label>
              <input className="admin-form-control" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Main Paragraph Text</label>
              <textarea className="admin-form-control" value={data.desc1 || ''} onChange={e => setData({...data, desc1: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Secondary Paragraph Text</label>
              <textarea className="admin-form-control" value={data.desc2 || ''} onChange={e => setData({...data, desc2: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="admin-btn" style={{ marginTop: '15px' }}>Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <h3>Contact Image</h3>
          {data.image && (
            <div style={{ marginBottom: '15px' }}>
              <img src={data.image} alt="Contact" style={{ maxWidth: '200px', borderRadius: '8px' }} />
            </div>
          )}
          <form onSubmit={handleImageSubmit}>
            <div className="admin-form-group">
              <label>Update Image</label>
              <input type="file" className="admin-form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required />
            </div>
            <button type="submit" className="admin-btn" style={{ marginTop: '15px' }}>Upload Image</button>
          </form>
        </div>
      )}
    </div>
  );
}
