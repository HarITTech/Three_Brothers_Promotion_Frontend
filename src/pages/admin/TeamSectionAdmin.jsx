import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function TeamSectionAdmin() {
  const bioEditorRef = useRef(null);
  const [data, setData] = useState({});
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Toolbar active states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

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
  const [modalError, setModalError] = useState('');

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
      setError('Failed to fetch team data');
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
    setModalError('');
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
    setModalError('');
    setCurrentMemberId(member._id);
    setIsEditingMember(true);
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      // Ensure we get the HTML from the editor
      const finalDesc = bioEditorRef.current ? bioEditorRef.current.innerHTML : memberForm.desc;
      const updatedForm = { ...memberForm, desc: finalDesc };

      if (isEditingMember) {
        await api.customPut(`/hero-section/update-member/${docId}/${currentMemberId}`, updatedForm);
        if (memberImage) {
          const formData = new FormData();
          formData.append('image', memberImage);
          await api.customPost(`/hero-section/update-image/${docId}/${currentMemberId}`, formData, true);
        }
        setSuccess('Member updated successfully');
      } else {
        if (!memberImage) throw new Error('Profile image is required for new members');
        const formData = new FormData();
        formData.append('image', memberImage);
        Object.keys(updatedForm).forEach(key => {
          formData.append(key, updatedForm[key]);
        });
        await api.customPost(`/hero-section/add-member/${docId}`, formData, true);
        setSuccess('Member added successfully');
      }
      setShowMemberModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    setSubmitting(true);
    try {
      await api.customDelete(`/hero-section/delete-member/${docId}/${memberId}`);
      setSuccess('Member deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (showMemberModal && bioEditorRef.current) {
      // Only set innerHTML if it's different to avoid cursor jumps
      // But since we removed dangerouslySetInnerHTML, we set it once when opening
      bioEditorRef.current.innerHTML = memberForm.desc || '';
    }
  }, [showMemberModal]);

  const updateToolbarStates = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      setIsHighlighted(node ? !!node.closest('.bio-highlight') : false);
    }
  };

  const formatText = (e, command) => {
    e.preventDefault();
    document.execCommand(command, false, null);
    if (bioEditorRef.current) {
      setMemberForm(prev => ({ ...prev, desc: bioEditorRef.current.innerHTML }));
    }
    updateToolbarStates();
  };

  const formatHighlight = (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentNode;
    
    const existingHighlight = container.closest('.bio-highlight');

    if (existingHighlight) {
      // Toggle OFF: Remove the span but keep content
      const parent = existingHighlight.parentNode;
      const fragment = document.createDocumentFragment();
      while (existingHighlight.firstChild) {
        fragment.appendChild(existingHighlight.firstChild);
      }
      parent.replaceChild(fragment, existingHighlight);
    } else {
      // Toggle ON: Wrap selection in span
      const span = document.createElement('span');
      span.className = 'bio-highlight';
      span.appendChild(range.extractContents());
      range.insertNode(span);
      
      // Maintain selection on the new span
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }
    
    if (bioEditorRef.current) {
      setMemberForm(prev => ({ ...prev, desc: bioEditorRef.current.innerHTML }));
    }
    updateToolbarStates();
  };

  const allMembers = data.teamMember || [];
  const admins = allMembers.filter(m => !m.mainRole || m.mainRole === 'admin');
  const teamOnly = allMembers.filter(m => m.mainRole === 'team-member');

  if (loading) return <Loader fullPage={true} />;

  const MemberTable = ({ members, label, icon }) => (
    <div className="admin-card">
      <div className="admin-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className={`fa-solid ${icon}`} style={{ color: 'var(--admin-primary)' }}></i>
          <span>{label}</span>
        </div>
        <button className="admin-btn" onClick={openAddModal}>
          <i className="fa-solid fa-plus"></i>
          Add New
        </button>
      </div>
      <div className="admin-card-body" style={{ padding: 0 }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-sub)', padding: '40px' }}>
                    No members found in this category.
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={member.image} alt={member.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700' }}>{member.name}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-sub)' }}>
                            <span dangerouslySetInnerHTML={{ __html: member.desc ? member.desc.substring(0, 50) + '...' : 'No bio' }} />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{member.role}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: member.mainRole === 'team-member' ? '#eff6ff' : '#ecfdf5',
                        color: member.mainRole === 'team-member' ? '#2563eb' : '#059669'
                      }}>
                        {member.mainRole === 'team-member' ? 'Team Member' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditModal(member)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => deleteMember(member._id)}>
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
  );

  return (
    <div className="admin-team-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Team Management</h1>
        <p>Manage all team members. Admins appear in the Hero slider, everyone appears in the Team section.</p>
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

      <div style={{ 
        padding: '16px 24px', 
        background: 'rgba(99, 102, 241, 0.08)', 
        borderRadius: '16px', 
        border: '1px solid rgba(99, 102, 241, 0.2)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          backgroundColor: 'var(--admin-primary)', 
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--admin-text-main)', fontWeight: '500' }}>
          <strong>Pro Tip:</strong> Members set as <strong>Admin</strong> will be featured in the Hero Section slider. 
          Use <strong>Team Member</strong> for everyone else.
        </p>
      </div>

      <MemberTable members={admins} label="Admins / Founders" icon="fa-crown" />
      <div style={{ height: '40px' }}></div>
      <MemberTable members={teamOnly} label="Team Members" icon="fa-users" />

      {showMemberModal && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingMember ? 'Edit Member' : 'Add New Member'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowMemberModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleMemberSubmit} style={{ padding: '0 40px 40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input className="admin-form-control" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required />
                </div>
                <div className="admin-form-group">
                  <label>Role / Position</label>
                  <input className="admin-form-control" placeholder="e.g. Lead Designer" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Account Type</label>
                  <select className="admin-form-control" value={memberForm.mainRole} onChange={e => setMemberForm({ ...memberForm, mainRole: e.target.value })}>
                    <option value="admin">Admin (Hero + Team Section)</option>
                    <option value="team-member">Team Member (Team Section only)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Expertise Badge</label>
                  <input className="admin-form-control" placeholder="e.g. Strategy Guru" value={memberForm.badge} onChange={e => setMemberForm({ ...memberForm, badge: e.target.value })} />
                </div>
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <label style={{ marginBottom: 0 }}>Member Bio</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-secondary" 
                      style={{ 
                        padding: '4px 8px', fontSize: '11px', height: '28px',
                        backgroundColor: isBold ? 'var(--admin-primary)' : '',
                        color: isBold ? '#fff' : ''
                      }} 
                      onMouseDown={(e) => formatText(e, 'bold')}
                    >
                      <i className="fa-solid fa-bold"></i>
                    </button>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-secondary" 
                      style={{ 
                        padding: '4px 8px', fontSize: '11px', height: '28px',
                        backgroundColor: isItalic ? 'var(--admin-primary)' : '',
                        color: isItalic ? '#fff' : ''
                      }} 
                      onMouseDown={(e) => formatText(e, 'italic')}
                    >
                      <i className="fa-solid fa-italic"></i>
                    </button>
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-secondary" 
                      style={{ 
                        padding: '4px 8px', fontSize: '11px', height: '28px',
                        backgroundColor: isHighlighted ? '#a78bfa' : '#fffbeb',
                        color: isHighlighted ? '#fff' : '#d97706',
                        border: isHighlighted ? '1px solid #8b5cf6' : '1px solid #fcd34d'
                      }} 
                      onMouseDown={formatHighlight}
                    >
                      <i className="fa-solid fa-highlighter"></i>
                    </button>
                  </div>
                </div>
                <div 
                  ref={bioEditorRef}
                  contentEditable
                  className="admin-form-control" 
                  style={{ 
                    minHeight: '120px', 
                    fontSize: '0.9rem', 
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    whiteSpace: 'pre-wrap'
                  }} 
                  onInput={() => {
                    if (bioEditorRef.current) {
                      setMemberForm(prev => ({ ...prev, desc: bioEditorRef.current.innerHTML }));
                    }
                  }}
                  onSelect={updateToolbarStates}
                  onKeyUp={updateToolbarStates}
                  onClick={updateToolbarStates}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label><i className="fa-brands fa-instagram" style={{ marginRight: '8px' }}></i>Instagram URL</label>
                  <input className="admin-form-control" value={memberForm.instagramId} onChange={e => setMemberForm({ ...memberForm, instagramId: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label><i className="fa-brands fa-linkedin" style={{ marginRight: '8px' }}></i>LinkedIn URL</label>
                  <input className="admin-form-control" value={memberForm.linkedInId} onChange={e => setMemberForm({ ...memberForm, linkedInId: e.target.value })} />
                </div>
              </div>

              {memberForm.mainRole === 'admin' && (
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '16px', 
                  marginBottom: '20px',
                  border: '1px dashed var(--admin-border)'
                }}>
                  <p style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '15px', textTransform: 'uppercase', color: 'var(--admin-text-sub)' }}>
                    Hero Card Stats (Admin Only)
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Stat 1 Heading</label>
                      <input className="admin-form-control" placeholder="e.g. 50+" value={memberForm.card1Heading} onChange={e => setMemberForm({ ...memberForm, card1Heading: e.target.value })} />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Stat 1 Label</label>
                      <input className="admin-form-control" placeholder="e.g. Projects" value={memberForm.card1Text} onChange={e => setMemberForm({ ...memberForm, card1Text: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Stat 2 Heading</label>
                      <input className="admin-form-control" placeholder="e.g. 99%" value={memberForm.card2Heading} onChange={e => setMemberForm({ ...memberForm, card2Heading: e.target.value })} />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Stat 2 Label</label>
                      <input className="admin-form-control" placeholder="e.g. Satisfaction" value={memberForm.card2Text} onChange={e => setMemberForm({ ...memberForm, card2Text: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-form-group">
                <label>Profile Image {isEditingMember ? '(Upload new to replace)' : ''}</label>
                <input type="file" className="admin-form-control" onChange={e => setMemberImage(e.target.files[0])} accept="image/*" />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingMember ? 'Update Member' : 'Save Member'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1 }} onClick={() => setShowMemberModal(false)}>
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
