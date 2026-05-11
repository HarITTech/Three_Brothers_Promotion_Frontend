import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isEditingFaq, setIsEditingFaq] = useState(false);
  const [currentFaqId, setCurrentFaqId] = useState(null);
  const [faqForm, setFaqForm] = useState({ que: '', ans: '' });
  const [modalError, setModalError] = useState('');

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
      setError('Failed to fetch FAQs section data');
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
      // specific deletes for components that shouldn't send certain arrays in main submit
      delete payload.faqData;

      if (docId) {
        await api.updateSectionData('faqs-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('faqs-section', payload);
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

  const openAddFaq = () => {
    if (!docId) return alert('Please save the main section first!');
    setFaqForm({ que: '', ans: '' });
    setModalError('');
    setIsEditingFaq(false);
    setShowFaqModal(true);
  };

  const openEditFaq = (faq) => {
    setFaqForm({ que: faq.que || '', ans: faq.ans || '' });
    setModalError('');
    setCurrentFaqId(faq._id);
    setIsEditingFaq(true);
    setShowFaqModal(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (isEditingFaq) {
        await api.updateSectionData(`faqs-section/${docId}`, currentFaqId, faqForm);
        setSuccess('FAQ updated successfully');
      } else {
        await api.createSectionData(`faqs-section/${docId}`, faqForm);
        setSuccess('FAQ added successfully');
      }
      setShowFaqModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    setSubmitting(true);
    try {
      await api.deleteSectionData(`faqs-section/${docId}`, faqId);
      setSuccess('FAQ deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to delete FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-faqs-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>FAQs & Questions</h1>
        <p>Manage common inquiries and provide clear answers to prospective clients.</p>
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
            <i className="fa-solid fa-circle-question" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>FAQ Section Tag</label>
              <input className="admin-form-control" placeholder="e.g. QUESTIONS" value={data.faqTag || ''} onChange={e => setData({...data, faqTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Headline Part 1</label>
              <input className="admin-form-control" placeholder="e.g. Frequently Asked" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Headline Part 2 (Gradient Highlight)</label>
              <input className="admin-form-control" placeholder="e.g. Questions" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Section Description</label>
            <textarea className="admin-form-control" rows="3" placeholder="Helpful subtext for the FAQ section..." value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Content
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-list-ul" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Questions & Answers</span>
          </div>
          <button className="admin-btn" onClick={openAddFaq}>
            <i className="fa-solid fa-plus"></i>
            Add New FAQ
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer Summary</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.faqData || []).length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                      No FAQs found. Add some questions to assist your visitors.
                    </td>
                  </tr>
                ) : (
                  (data.faqData || []).map(f => (
                    <tr key={f._id}>
                      <td style={{ fontWeight: '700', width: '35%' }}>{f.que}</td>
                      <td style={{ color: 'var(--admin-text-sub)', fontSize: '0.85rem' }}>
                        {f.ans.length > 100 ? f.ans.substring(0, 100) + '...' : f.ans}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditFaq(f)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => handleDeleteFaq(f._id)}>
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

      {showFaqModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowFaqModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleFaqSubmit}>
              <div className="admin-form-group">
                <label>Question</label>
                <input className="admin-form-control" placeholder="Enter question..." value={faqForm.que} onChange={e => setFaqForm({...faqForm, que: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Detailed Answer</label>
                <textarea className="admin-form-control" rows="6" placeholder="Provide a helpful answer..." value={faqForm.ans} onChange={e => setFaqForm({...faqForm, ans: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingFaq ? 'Update FAQ' : 'Save FAQ'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowFaqModal(false)}>
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
