import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Video
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({ link: '', badge: '' });

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
        await api.updateSectionData('clients-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('clients-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddVideo = () => {
    if (!docId) return alert('Please save the main section first!');
    setVideoForm({ link: '', badge: '' });
    setIsEditingVideo(false);
    setShowVideoModal(true);
  };

  const openEditVideo = (vid) => {
    setVideoForm({ link: vid.link || '', badge: vid.badge || '' });
    setCurrentVideoId(vid._id);
    setIsEditingVideo(true);
    setShowVideoModal(true);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingVideo) {
        await api.updateSectionData(`clients-section/${docId}`, currentVideoId, videoForm);
        setSuccess('Video updated');
      } else {
        await api.createSectionData(`clients-section/${docId}`, videoForm);
        setSuccess('Video added');
      }
      setShowVideoModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.deleteSectionData(`clients-section/${docId}`, videoId);
      setSuccess('Video deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Clients Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Clients Tag</label>
              <input className="admin-form-control" value={data.cliTag || ''} onChange={e => setData({...data, cliTag: e.target.value})} required />
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
            <h3>Client Videos</h3>
            <button className="admin-btn" onClick={openAddVideo}>Add Video</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>YouTube/Vimeo Link</th>
                <th>Badge</th>
                <th style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.video || []).map(v => (
                <tr key={v._id}>
                  <td style={{ wordBreak: 'break-all' }}>{v.link}</td>
                  <td>{v.badge}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditVideo(v)}>Edit</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeleteVideo(v._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.video || data.video.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No client videos found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showVideoModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '500px' }}>
            <h3>{isEditingVideo ? 'Edit Client Video' : 'Add Client Video'}</h3>
            <form onSubmit={handleVideoSubmit}>
              <div className="admin-form-group">
                <label>Video Link (YouTube/Vimeo)</label>
                <input className="admin-form-control" value={videoForm.link} onChange={e => setVideoForm({...videoForm, link: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Badge (Optional)</label>
                <input className="admin-form-control" value={videoForm.badge} onChange={e => setVideoForm({...videoForm, badge: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowVideoModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
