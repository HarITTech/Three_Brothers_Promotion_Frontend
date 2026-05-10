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
      delete payload.video;

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
      <div className="admin-header">
        <h1>Clients Section Management</h1>
        <p>Manage your client video portfolio and headers.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-header">Main Content</div>
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
          <button type="submit" className="admin-btn">Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="admin-card-header" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Client Videos</div>
            <button className="admin-btn" onClick={openAddVideo}>+ Add Video</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Video Link</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.video || []).map(v => {
                const url = v.link || '';
                let preview = null;
                if (url.includes('youtube.com') || url.includes('youtu.be')) {
                  let id = '';
                  if (url.includes('shorts/')) id = url.split('shorts/')[1]?.split('?')[0];
                  else if (url.includes('v=')) id = url.split('v=')[1]?.split('&')[0];
                  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
                  preview = <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="YT Preview" style={{ width: '80px', borderRadius: '4px' }} />;
                } else if (url.includes('instagram.com')) {
                  preview = <div style={{ fontSize: '20px' }}><i className="fa-brands fa-instagram"></i></div>;
                } else {
                  preview = <video src={url} style={{ width: '80px', borderRadius: '4px' }} />;
                }

                return (
                  <tr key={v._id}>
                    <td>{preview}</td>
                    <td style={{ wordBreak: 'break-all' }}>{v.link}</td>
                    <td>{v.badge}</td>
                    <td>
                      <button className="admin-btn admin-btn-edit" style={{ marginRight: '10px' }} onClick={() => openEditVideo(v)}>Edit</button>
                      <button className="admin-btn admin-btn-delete" onClick={() => handleDeleteVideo(v._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showVideoModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
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
