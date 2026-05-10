import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function TeamSectionAdmin() {
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
    name: '', role: '', mainRole: 'team-member', desc: '', badge: '',
    instagramId: '', linkedInId: '',
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

  const openAddModal = () => {
    setMemberForm({
      name: '', role: '', mainRole: 'team-member', desc: '', badge: '',
      instagramId: '', linkedInId: '',
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
        setSuccess('Member updated successfully');
      } else {
        if (!memberImage) throw new Error('Image is required');
        const formData = new FormData();
        formData.append('image', memberImage);
        Object.keys(memberForm).forEach(key => {
          formData.append(key, memberForm[key]);
        });
        await api.customPost(`/hero-section/add-member/${docId}`, formData, true);
        setSuccess('Member added successfully');
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

  const allMembers = data.teamMember || [];
  const admins = allMembers.filter(m => !m.mainRole || m.mainRole === 'admin');
  const teamOnly = allMembers.filter(m => m.mainRole === 'team-member');

  if (loading) return <div>Loading...</div>;

  const MemberTable = ({ members, label }) => (
    <div className="admin-card" style={{ marginTop: '30px' }}>
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <button className="admin-btn" onClick={openAddModal}>+ Add Member</button>
      </div>
      <div className="admin-card-body">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th>Main Role</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No members found</td></tr>
            )}
            {members.map((member, index) => (
              <tr key={index}>
                <td><img src={member.image} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /></td>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    background: member.mainRole === 'team-member' ? '#e8f0fe' : '#e8f4e8',
                    color: member.mainRole === 'team-member' ? '#1a56db' : '#2d7a2d'
                  }}>
                    {member.mainRole === 'team-member' ? 'team-member' : 'admin'}
                  </span>
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.desc || <span style={{ color: '#aaa' }}>—</span>}
                </td>
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
  );

  return (
    <div>
      <div className="admin-header">
        <h1>Team Section Management</h1>
        <p>Manage all team members. Admins appear in the Hero Section slider. All members appear in the Team/About Section.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: '16px 20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#4a5568' }}>
            <strong>📌 How it works:</strong> Members with <strong>Main Role = admin</strong> appear in the <em>Hero Section slider</em> AND the <em>Team Section</em>.
            Members with <strong>Main Role = team-member</strong> appear <em>only in the Team Section</em>.
          </p>
        </div>
      </div>

      <MemberTable members={admins} label="👑 Admins / Founders (Hero Section + Team Section)" />
      <MemberTable members={teamOnly} label="👥 Team Members (Team Section only)" />

      {showMemberModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3>{isEditingMember ? 'Edit Member' : 'Add New Member'}</h3>
            <form onSubmit={handleMemberSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input className="admin-form-control" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Role (e.g. Founder, Designer)</label>
                  <input className="admin-form-control" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Main Role</label>
                  <select className="admin-form-control" value={memberForm.mainRole} onChange={e => setMemberForm({ ...memberForm, mainRole: e.target.value })}>
                    <option value="admin">Admin (Hero Section + Team Section)</option>
                    <option value="team-member">Team Member (Team Section only)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Badge (e.g. Personal Branding Expert)</label>
                  <input className="admin-form-control" value={memberForm.badge} onChange={e => setMemberForm({ ...memberForm, badge: e.target.value })} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Bio / Description (supports HTML like &lt;span class="bio-highlight"&gt;)</label>
                <textarea
                  className="admin-form-control"
                  rows="3"
                  value={memberForm.desc}
                  onChange={e => setMemberForm({ ...memberForm, desc: e.target.value })}
                  placeholder='E.g. The creative force. Riya understands <span class="bio-highlight">audience psychology</span> deeply.'
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="admin-form-group">
                  <label>Instagram URL</label>
                  <input className="admin-form-control" value={memberForm.instagramId} onChange={e => setMemberForm({ ...memberForm, instagramId: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>LinkedIn URL</label>
                  <input className="admin-form-control" value={memberForm.linkedInId} onChange={e => setMemberForm({ ...memberForm, linkedInId: e.target.value })} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '12px', marginTop: '4px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#718096', fontWeight: 600 }}>Hero Slider Cards (for Admin members only)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-form-group">
                    <label>Card 1 Heading (e.g. Mega Creator)</label>
                    <input className="admin-form-control" value={memberForm.card1Heading} onChange={e => setMemberForm({ ...memberForm, card1Heading: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label>Card 1 Text (e.g. 2.5M Followers)</label>
                    <input className="admin-form-control" value={memberForm.card1Text} onChange={e => setMemberForm({ ...memberForm, card1Text: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-form-group">
                    <label>Card 2 Heading (e.g. 100M+)</label>
                    <input className="admin-form-control" value={memberForm.card2Heading} onChange={e => setMemberForm({ ...memberForm, card2Heading: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label>Card 2 Text (e.g. Views)</label>
                    <input className="admin-form-control" value={memberForm.card2Text} onChange={e => setMemberForm({ ...memberForm, card2Text: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Profile Image {isEditingMember ? '(Leave blank to keep existing)' : '*'}</label>
                <input type="file" className="admin-form-control" onChange={e => setMemberImage(e.target.files[0])} accept="image/*" />
                {isEditingMember && <small style={{ color: '#718096' }}>Current image will be kept if no new file is selected.</small>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save Member</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowMemberModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
