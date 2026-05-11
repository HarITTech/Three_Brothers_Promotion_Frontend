import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function ClientsSectionAdmin() {
  const [data, setData] = useState({
    cliTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    endText: '',
    video: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Video
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({ link: '', badge: '' });
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('clients-section');
      if (res && res._id) {
        setDocId(res._id);
        setData(res);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch client data');
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
      delete payload.video;

      if (docId) {
        await api.updateSectionData('clients-section', docId, payload);
        setSuccess('Main content updated successfully');
      } else {
        const res = await api.createSectionData('clients-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddVideo = () => {
    if (!docId) return alert('Please save the main section first!');
    setVideoForm({ link: '', badge: '' });
    setModalError('');
    setIsEditingVideo(false);
    setShowVideoModal(true);
  };

  const openEditVideo = (vid) => {
    setVideoForm({ link: vid.link || '', badge: vid.badge || '' });
    setModalError('');
    setCurrentVideoId(vid._id);
    setIsEditingVideo(true);
    setShowVideoModal(true);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      if (isEditingVideo) {
        await api.updateSectionData(`clients-section/${docId}`, currentVideoId, videoForm);
        setSuccess('Video updated successfully');
      } else {
        await api.createSectionData(`clients-section/${docId}`, videoForm);
        setSuccess('Video added successfully');
      }
      setShowVideoModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    setSubmitting(true);
    try {
      await api.deleteSectionData(`clients-section/${docId}`, videoId);
      setSuccess('Video deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-clients-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Clients Portfolio</h1>
        <p>Manage your client success stories, videos, and portfolio headers.</p>
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
              <label>Section Tag</label>
              <input className="admin-form-control" placeholder="e.g. OUR CLIENTS" value={data.cliTag || ''} onChange={e => setData({...data, cliTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Main Heading</label>
              <input className="admin-form-control" placeholder="e.g. Clients Who Trust Us" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Secondary Heading (Gradient)</label>
              <input className="admin-form-control" placeholder="e.g. To Scale Their Brand" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Footer Text</label>
              <input className="admin-form-control" placeholder="e.g. Join them today" value={data.endText || ''} onChange={e => setData({...data, endText: e.target.value})} />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea className="admin-form-control" rows="3" placeholder="Tell more about your clients..." value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
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
              <i className="fa-solid fa-video" style={{ color: 'var(--admin-primary)' }}></i>
              <span>Client Video Portfolio</span>
            </div>
            <button className="admin-btn" onClick={openAddVideo}>
              <i className="fa-solid fa-plus"></i>
              Add New Video
            </button>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Link / Source</th>
                    <th>Badge</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.video || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                        No videos added yet.
                      </td>
                    </tr>
                  ) : (
                    (data.video || []).map(v => {
                      const url = v.link || '';
                      let preview = null;
                      let icon = <i className="fa-solid fa-link"></i>;
                      
                      if (url.includes('youtube.com') || url.includes('youtu.be')) {
                        let id = '';
                        if (url.includes('shorts/')) id = url.split('shorts/')[1]?.split('?')[0];
                        else if (url.includes('v=')) id = url.split('v=')[1]?.split('&')[0];
                        else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
                        preview = <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="YT" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />;
                        icon = <i className="fa-brands fa-youtube" style={{ color: '#ff0000' }}></i>;
                      } else if (url.includes('instagram.com')) {
                        preview = <div style={{ width: '100px', height: '60px', borderRadius: '8px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}><i className="fa-brands fa-instagram"></i></div>;
                        icon = <i className="fa-brands fa-instagram" style={{ color: '#e1306c' }}></i>;
                      } else {
                        preview = <div style={{ width: '100px', height: '60px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><i className="fa-solid fa-clapperboard"></i></div>;
                      }

                      return (
                        <tr key={v._id}>
                          <td>{preview}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {icon}
                              <span style={{ fontSize: '0.85rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.link}</span>
                            </div>
                          </td>
                          <td>
                            {v.badge ? (
                              <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0' }}>
                                {v.badge}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditVideo(v)}>
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => handleDeleteVideo(v._id)}>
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingVideo ? 'Edit Client Video' : 'Add New Video'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowVideoModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleVideoSubmit}>
              <div className="admin-form-group">
                <label>Video URL (YouTube / Instagram / Reels)</label>
                <input className="admin-form-control" placeholder="Paste link here..." value={videoForm.link} onChange={e => setVideoForm({...videoForm, link: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Category / Badge (Optional)</label>
                <input className="admin-form-control" placeholder="e.g. Case Study, Podcasting" value={videoForm.badge} onChange={e => setVideoForm({...videoForm, badge: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingVideo ? 'Update Video' : 'Add Video'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowVideoModal(false)}>
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
