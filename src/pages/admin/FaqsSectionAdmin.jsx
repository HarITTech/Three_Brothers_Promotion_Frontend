import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function FaqsSectionAdmin() {
  const [data, setData] = useState({
    faqTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    faqData: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isEditingFaq, setIsEditingFaq] = useState(false);
  const [currentFaqId, setCurrentFaqId] = useState(null);
  const [faqForm, setFaqForm] = useState({ que: '', ans: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('faqs-section');
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
        await api.updateSectionData('faqs-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('faqs-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddFaq = () => {
    if (!docId) return alert('Please save the main section first!');
    setFaqForm({ que: '', ans: '' });
    setIsEditingFaq(false);
    setShowFaqModal(true);
  };

  const openEditFaq = (faq) => {
    setFaqForm({ que: faq.que || '', ans: faq.ans || '' });
    setCurrentFaqId(faq._id);
    setIsEditingFaq(true);
    setShowFaqModal(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingFaq) {
        await api.updateSectionData(`faqs-section/${docId}`, currentFaqId, faqForm);
        setSuccess('FAQ updated');
      } else {
        await api.createSectionData(`faqs-section/${docId}`, faqForm);
        setSuccess('FAQ added');
      }
      setShowFaqModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteSectionData(`faqs-section/${docId}`, faqId);
      setSuccess('FAQ deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>FAQs Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>FAQ Tag</label>
              <input className="admin-form-control" value={data.faqTag || ''} onChange={e => setData({...data, faqTag: e.target.value})} required />
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
            <h3>FAQs</h3>
            <button className="admin-btn" onClick={openAddFaq}>Add FAQ</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Answer</th>
                <th style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.faqData || []).map(f => (
                <tr key={f._id}>
                  <td>{f.que}</td>
                  <td>{f.ans}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditFaq(f)}>Edit</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeleteFaq(f._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.faqData || data.faqData.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No FAQs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showFaqModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '600px' }}>
            <h3>{isEditingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
            <form onSubmit={handleFaqSubmit}>
              <div className="admin-form-group">
                <label>Question</label>
                <input className="admin-form-control" value={faqForm.que} onChange={e => setFaqForm({...faqForm, que: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Answer</label>
                <textarea className="admin-form-control" style={{ minHeight: '100px' }} value={faqForm.ans} onChange={e => setFaqForm({...faqForm, ans: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowFaqModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
