import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function HeroSectionAdmin() {
  const [data, setData] = useState({});
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Team Member
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '', role: '', mainRole: 'admin', desc: '', badge: '', instagramId: '', linkedInId: '',
    card1Heading: '', card1Text: '', card2Heading: '', card2Text: ''
  });
  const [memberImage, setMemberImage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getSectionData('hero-section');
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
    try {
      setError('');
      setSuccess('');
      
      const cleanPayload = (obj) => {
        if (Array.isArray(obj)) return obj.map(cleanPayload);
        if (obj && typeof obj === 'object') {
          const newObj = {};
          for (let key in obj) {
            if (['createdAt', 'updatedAt', '_id', '__v'].includes(key)) continue;
            // Remove legacy fields
            if (key.startsWith('heroBadge')) continue;
            newObj[key] = cleanPayload(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      const payload = cleanPayload(data);
      delete payload.teamMember;
      
      await api.updateSectionData('hero-section', docId, payload);
      setSuccess('Main content updated successfully');
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const openAddModal = () => {
    setMemberForm({
      name: '', role: '', mainRole: 'admin', desc: '', badge: '', instagramId: '', linkedInId: '',
      card1Heading: '', card1Text: '', card2Heading: '', card2Text: ''
    });
    setMemberImage(null);
    setIsEditingMember(false);
    setShowMemberModal(true);
  };

  const openEditModal = (member) => {
    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      mainRole: member.mainRole || 'admin',
      desc: member.desc || '',
      badge: member.badge || '',
      instagramId: member.instagramId || '',
      linkedInId: member.linkedInId || '',
      card1Heading: member.card1Heading || '',
      card1Text: member.card1Text || '',
      card2Heading: member.card2Heading || '',
      card2Text: member.card2Text || ''
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
        await api.customPut(`/hero-section/update-member/${docId}/${currentMemberId}`, memberForm);
        if (memberImage) {
          const formData = new FormData();
          formData.append('image', memberImage);
          await api.customPost(`/hero-section/update-image/${docId}/${currentMemberId}`, formData, true);
        }
        setSuccess('Team member updated');
      } else {
        if (!memberImage) throw new Error('Image is required');
        const formData = new FormData();
        formData.append('image', memberImage);
        Object.keys(memberForm).forEach(key => {
          formData.append(key, memberForm[key]);
        });
        await api.customPost(`/hero-section/add-member/${docId}`, formData, true);
        setSuccess('Team member added');
      }
      setShowMemberModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await api.customDelete(`/hero-section/delete-member/${docId}/${memberId}`);
      setSuccess('Member deleted');
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Hero Section Management</h1>
        <p>Customize your hero headline, branding, and founder cards.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-header">Main Hero Content</div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div className="admin-form-group">
            <label>Hero Badge Tag (e.g. THREE BROTHERS PROMOTION)</label>
            <input className="admin-form-control" value={data.heroTag || ''} onChange={e => setData({...data, heroTag: e.target.value})} />
          </div>

          <div className="admin-form-group">
            <label>Main Headline (First part, use \n for new line)</label>
            <textarea className="admin-form-control" rows="3" value={data.heroHeading1 || ''} onChange={e => setData({...data, heroHeading1: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Gradient Highlight (e.g. impossible to)</label>
              <input className="admin-form-control" value={data.heroHeading2 || ''} onChange={e => setData({...data, heroHeading2: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Underlined Highlight (e.g. ignore.)</label>
              <input className="admin-form-control" value={data.heroHeading3 || ''} onChange={e => setData({...data, heroHeading3: e.target.value})} />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Description 1</label>
            <textarea className="admin-form-control" rows="2" value={data.heroDesc1 || ''} onChange={e => setData({...data, heroDesc1: e.target.value})} />
          </div>

          <div className="admin-form-group">
            <label>Description 2 (HTML allowed)</label>
            <textarea className="admin-form-control" rows="3" value={data.heroDesc2 || ''} onChange={e => setData({...data, heroDesc2: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>WhatsApp CTA Link</label>
              <input className="admin-form-control" value={data.whatsappUrl || ''} onChange={e => setData({...data, whatsappUrl: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>WhatsApp Display Number</label>
              <input className="admin-form-control" value={data.whatsappNumber || ''} onChange={e => setData({...data, whatsappNumber: e.target.value})} placeholder="+91 91280 06318" />
            </div>
          </div>

          <button type="submit" className="admin-btn">Save Main Content</button>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: '30px' }}>
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Admins / Founders (Hero Section)</span>
          <button className="admin-btn" onClick={openAddModal}>+ Add Admin</button>
        </div>
        <div className="admin-card-body">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Role</th>
                <th>Main Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.teamMember?.filter(m => !m.mainRole || m.mainRole === 'admin').map((member, index) => (
                <tr key={index}>
                  <td><img src={member.image} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /></td>
                  <td>{member.name}</td>
                  <td>{member.role}</td>
                  <td><span style={{ padding: '3px 10px', borderRadius: '12px', background: '#e8f4e8', color: '#2d7a2d', fontSize: '12px', fontWeight: 600 }}>admin</span></td>
                  <td>
                    <button className="admin-btn admin-btn-edit" onClick={() => openEditModal(member)}>Edit</button>
                    <button className="admin-btn admin-btn-delete" style={{ marginLeft: '8px' }} onClick={() => deleteMember(member._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showMemberModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3>{isEditingMember ? 'Edit Admin Member' : 'Add Admin Member'}</h3>
            <form onSubmit={handleMemberSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input className="admin-form-control" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Role (e.g. Founder, Co-Founder)</label>
                  <input className="admin-form-control" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Main Role</label>
                  <select className="admin-form-control" value={memberForm.mainRole} onChange={e => setMemberForm({...memberForm, mainRole: e.target.value})}>
                    <option value="admin">Admin (shown in Hero Section)</option>
                    <option value="team-member">Team Member (shown in Team Section only)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Badge (e.g. Personal Branding Expert)</label>
                  <input className="admin-form-control" value={memberForm.badge} onChange={e => setMemberForm({...memberForm, badge: e.target.value})} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Bio / Description</label>
                <textarea className="admin-form-control" rows="3" value={memberForm.desc} onChange={e => setMemberForm({...memberForm, desc: e.target.value})} placeholder="Short bio shown in the Team Section..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Instagram ID</label>
                  <input className="admin-form-control" value={memberForm.instagramId} onChange={e => setMemberForm({...memberForm, instagramId: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>LinkedIn ID</label>
                  <input className="admin-form-control" value={memberForm.linkedInId} onChange={e => setMemberForm({...memberForm, linkedInId: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Card 1 Heading (e.g. Mega Creator)</label>
                  <input className="admin-form-control" value={memberForm.card1Heading} onChange={e => setMemberForm({...memberForm, card1Heading: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Card 1 Text (e.g. 2.5M Followers)</label>
                  <input className="admin-form-control" value={memberForm.card1Text} onChange={e => setMemberForm({...memberForm, card1Text: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Card 2 Heading (e.g. 100M+)</label>
                  <input className="admin-form-control" value={memberForm.card2Heading} onChange={e => setMemberForm({...memberForm, card2Heading: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Card 2 Text (e.g. Views)</label>
                  <input className="admin-form-control" value={memberForm.card2Text} onChange={e => setMemberForm({...memberForm, card2Text: e.target.value})} />
                </div>
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
