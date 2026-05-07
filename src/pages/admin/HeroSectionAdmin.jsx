import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function HeroSectionAdmin() {
  const [data, setData] = useState({
    heroTag: '',
    heroHeading1: '',
    heroHeading2: '',
    heroDesc1: '',
    heroDesc2: '',
    heroBadge1: '',
    heroBadge2: '',
    heroBadge3: '',
    heroBadge4: '',
    teamMember: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Team Member
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '', role: '', desc: '', badge: '', instagramId: '', linkedInId: ''
  });
  const [memberImage, setMemberImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('hero-section');
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
      // We only want to send the main fields, not the teamMember array via PUT/POST main
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
        await api.updateSectionData('hero-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('hero-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddMember = () => {
    if (!docId) return alert('Please save the main section first!');
    setMemberForm({ name: '', role: '', desc: '', badge: '', instagramId: '', linkedInId: '' });
    setMemberImage(null);
    setIsEditingMember(false);
    setShowMemberModal(true);
  };

  const openEditMember = (member) => {
    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      desc: member.desc || '',
      badge: member.badge || '',
      instagramId: member.instagramId || '',
      linkedInId: member.linkedInId || ''
    });
    setMemberImage(null);
    setCurrentMemberId(member._id);
    setIsEditingMember(true);
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (isEditingMember) {
        // Update text
        await api.customPut(`/hero-section/update-member/${docId}/${currentMemberId}`, memberForm);
        // Update image if selected
        if (memberImage) {
          const formData = new FormData();
          formData.append('image', memberImage);
          await api.customPost(`/hero-section/update-image/${docId}/${currentMemberId}`, formData, true);
        }
        setSuccess('Team member updated');
      } else {
        // Add member
        if (!memberImage) throw new Error('Image is required to add a team member');
        const formData = new FormData();
        formData.append('image', memberImage);
        Object.keys(memberForm).forEach(key => {
          if (memberForm[key]) formData.append(key, memberForm[key]);
        });
        await api.customPost(`/hero-section/add-member/${docId}`, formData, true);
        setSuccess('Team member added');
      }
      setShowMemberModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.customDelete(`/hero-section/delete-member/${docId}/${memberId}`);
      setSuccess('Member deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Hero Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Hero Tag (e.g., THE NO.1 PERSONAL BRANDING AGENCY)</label>
              <input className="admin-form-control" value={data.heroTag || ''} onChange={e => setData({...data, heroTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Primary Heading (e.g., Build an Icon.)</label>
              <input className="admin-form-control" value={data.heroHeading1 || ''} onChange={e => setData({...data, heroHeading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Gradient Heading (e.g., Leave a Legacy.)</label>
              <input className="admin-form-control" value={data.heroHeading2 || ''} onChange={e => setData({...data, heroHeading2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Main Paragraph Text</label>
              <textarea className="admin-form-control" value={data.heroDesc1 || ''} onChange={e => setData({...data, heroDesc1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Secondary Paragraph Text</label>
              <textarea className="admin-form-control" value={data.heroDesc2 || ''} onChange={e => setData({...data, heroDesc2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Bottom Badge 1 (e.g., 50M+ Views)</label>
              <input className="admin-form-control" value={data.heroBadge1 || ''} onChange={e => setData({...data, heroBadge1: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Bottom Badge 2 (e.g., 10+ Creators)</label>
              <input className="admin-form-control" value={data.heroBadge2 || ''} onChange={e => setData({...data, heroBadge2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Bottom Badge 3</label>
              <input className="admin-form-control" value={data.heroBadge3 || ''} onChange={e => setData({...data, heroBadge3: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Bottom Badge 4</label>
              <input className="admin-form-control" value={data.heroBadge4 || ''} onChange={e => setData({...data, heroBadge4: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="admin-btn" style={{ marginTop: '15px' }}>Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Team Members</h3>
            <button className="admin-btn" onClick={openAddMember}>Add Member</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Role</th>
                <th>Instagram</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.teamMember || []).map(m => (
                <tr key={m._id}>
                  <td>{m.image && <img src={m.image} alt={m.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />}</td>
                  <td>{m.name}</td>
                  <td>{m.role}</td>
                  <td>{m.instagramId}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditMember(m)}>Edit</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeleteMember(m._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.teamMember || data.teamMember.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No team members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showMemberModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{isEditingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
            <form onSubmit={handleMemberSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input className="admin-form-control" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Role</label>
                <input className="admin-form-control" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label>Description (Optional)</label>
                <input className="admin-form-control" value={memberForm.desc} onChange={e => setMemberForm({...memberForm, desc: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Badge (Optional)</label>
                <input className="admin-form-control" value={memberForm.badge} onChange={e => setMemberForm({...memberForm, badge: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Instagram ID (Optional)</label>
                <input className="admin-form-control" value={memberForm.instagramId} onChange={e => setMemberForm({...memberForm, instagramId: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>LinkedIn ID (Optional)</label>
                <input className="admin-form-control" value={memberForm.linkedInId} onChange={e => setMemberForm({...memberForm, linkedInId: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label>Image {isEditingMember ? '(Leave blank to keep existing)' : ''}</label>
                <input type="file" className="admin-form-control" onChange={e => setMemberImage(e.target.files[0])} accept="image/*" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowMemberModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
