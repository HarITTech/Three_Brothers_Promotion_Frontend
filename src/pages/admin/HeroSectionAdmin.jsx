import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/admin/Loader';

export default function HeroSectionAdmin() {
  const [data, setData] = useState({});
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const [modalError, setModalError] = useState('');

  // WhatsApp helper states
  const [waCountryCode, setWaCountryCode] = useState('+91');
  const [waRawNumber, setWaRawNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');

  const countryCodes = [
    { code: '+91', label: 'India (+91)' },
    { code: '+1', label: 'USA/Canada (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+65', label: 'Singapore (+65)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+33', label: 'France (+33)' },
    { code: '+81', label: 'Japan (+81)' },
    { code: '+7', label: 'Russia (+7)' }
  ];

  // Helper to sync WhatsApp changes
  const updateWhatsApp = (code, num, msg) => {
    const cleanNum = (code + num).replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(msg);
    const newUrl = `https://wa.me/${cleanNum}?text=${encodedMsg}`;
    const newDisplay = `${code} ${num}`;
    setData(prev => ({
      ...prev,
      whatsappUrl: newUrl,
      whatsappNumber: newDisplay
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.getSectionData('hero-section');
      if (res) {
        setData(res);
        setDocId(res._id);
        
        // Parse WhatsApp data
        if (res.whatsappNumber) {
          const match = res.whatsappNumber.match(/^(\+\d+)\s(.*)$/);
          if (match) {
            setWaCountryCode(match[1]);
            setWaRawNumber(match[2]);
          } else {
            setWaRawNumber(res.whatsappNumber);
          }
        }
        if (res.whatsappUrl) {
          try {
            const url = new URL(res.whatsappUrl);
            const text = url.searchParams.get('text');
            if (text) setWaMessage(text);
          } catch (e) {
            // If not a valid URL, check if it's just the message or ignore
            if (res.whatsappUrl.includes('text=')) {
              const parts = res.whatsappUrl.split('text=');
              setWaMessage(decodeURIComponent(parts[1]));
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
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
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setMemberForm({
      name: '', role: '', mainRole: 'admin', desc: '', badge: '', instagramId: '', linkedInId: '',
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
      if (isEditingMember) {
        await api.customPut(`/hero-section/update-member/${docId}/${currentMemberId}`, memberForm);
        if (memberImage) {
          const formData = new FormData();
          formData.append('image', memberImage);
          await api.customPost(`/hero-section/update-image/${docId}/${currentMemberId}`, formData, true);
        }
        setSuccess('Team member updated successfully');
      } else {
        if (!memberImage) throw new Error('Image is required');
        const formData = new FormData();
        formData.append('image', memberImage);
        Object.keys(memberForm).forEach(key => {
          formData.append(key, memberForm[key]);
        });
        await api.customPost(`/hero-section/add-member/${docId}`, formData, true);
        setSuccess('Team member added successfully');
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

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-hero-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Hero Section</h1>
        <p>Manage your landing page headline, branding, and founder profiles.</p>
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
            <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div className="admin-form-group">
            <label>Hero Badge Tag</label>
            <input 
              className="admin-form-control" 
              placeholder="e.g. THREE BROTHERS PROMOTION"
              value={data.heroTag || ''} 
              onChange={e => setData({...data, heroTag: e.target.value})} 
            />
          </div>

          <div className="admin-form-group">
            <label>Main Headline (Use \n for manual line breaks)</label>
            <textarea 
              className="admin-form-control" 
              rows="3" 
              placeholder="We make your business..."
              value={data.heroHeading1 || ''} 
              onChange={e => setData({...data, heroHeading1: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Gradient Highlight Text</label>
              <input 
                className="admin-form-control" 
                placeholder="e.g. impossible to"
                value={data.heroHeading2 || ''} 
                onChange={e => setData({...data, heroHeading2: e.target.value})} 
              />
            </div>
            <div className="admin-form-group">
              <label>Underlined Highlight Text</label>
              <input 
                className="admin-form-control" 
                placeholder="e.g. ignore."
                value={data.heroHeading3 || ''} 
                onChange={e => setData({...data, heroHeading3: e.target.value})} 
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Primary Description</label>
            <textarea 
              className="admin-form-control" 
              rows="2" 
              placeholder="Done-for-you Personal Branding Agency..."
              value={data.heroDesc1 || ''} 
              onChange={e => setData({...data, heroDesc1: e.target.value})} 
            />
          </div>

          <div className="admin-form-group">
            <label>Secondary Description (HTML allowed)</label>
            <textarea 
              className="admin-form-control" 
              rows="3" 
              placeholder="Supporting details..."
              value={data.heroDesc2 || ''} 
              onChange={e => setData({...data, heroDesc2: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="admin-form-group">
              <label>WhatsApp CTA Message</label>
              <textarea 
                className="admin-form-control" 
                rows="3"
                placeholder="e.g. Hi, I would like to book a discovery call and learn more about your services..."
                value={waMessage} 
                onChange={e => {
                  setWaMessage(e.target.value);
                  updateWhatsApp(waCountryCode, waRawNumber, e.target.value);
                }} 
              />
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'var(--admin-text-sub)', 
                marginTop: '5px',
                wordBreak: 'break-all',
                maxWidth: '100%'
              }}>
                Preview: {data.whatsappUrl || 'None'}
              </p>
            </div>
            <div className="admin-form-group">
              <label>WhatsApp Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  className="admin-form-control" 
                  style={{ width: '100px', flexShrink: 0 }}
                  value={waCountryCode}
                  onChange={e => {
                    setWaCountryCode(e.target.value);
                    updateWhatsApp(e.target.value, waRawNumber, waMessage);
                  }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input 
                  className="admin-form-control" 
                  placeholder="91280 06318"
                  value={waRawNumber} 
                  onChange={e => {
                    setWaRawNumber(e.target.value);
                    updateWhatsApp(waCountryCode, e.target.value, waMessage);
                  }} 
                />
              </div>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'var(--admin-text-sub)', 
                marginTop: '5px',
                wordBreak: 'break-all'
              }}>
                Display: {data.whatsappNumber || 'None'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Main Content
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-users-gear" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Admins / Founders</span>
          </div>
          <button className="admin-btn" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add New Admin
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.teamMember?.filter(m => !m.mainRole || m.mainRole === 'admin').map((member, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={member.image} alt={member.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: '600' }}>{member.name}</span>
                      </div>
                    </td>
                    <td>{member.role}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        background: '#ecfdf5', 
                        color: '#059669', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Admin</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showMemberModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingMember ? 'Edit Admin Member' : 'Add Admin Member'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowMemberModal(false)}></i>
            </div>

            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleMemberSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input className="admin-form-control" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Role</label>
                  <input className="admin-form-control" placeholder="Founder, CEO, etc." value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} required />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Main Role Visibility</label>
                  <select className="admin-form-control" value={memberForm.mainRole} onChange={e => setMemberForm({...memberForm, mainRole: e.target.value})}>
                    <option value="admin">Admin (Hero Section + Team)</option>
                    <option value="team-member">Team Member (Team Section Only)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Special Badge</label>
                  <input className="admin-form-control" placeholder="e.g. Expert" value={memberForm.badge} onChange={e => setMemberForm({...memberForm, badge: e.target.value})} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Bio / Description</label>
                <textarea className="admin-form-control" rows="3" value={memberForm.desc} onChange={e => setMemberForm({...memberForm, desc: e.target.value})} placeholder="Tell something about this member..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label><i className="fa-brands fa-instagram" style={{ marginRight: '8px' }}></i>Instagram Profile URL</label>
                  <input className="admin-form-control" value={memberForm.instagramId} onChange={e => setMemberForm({...memberForm, instagramId: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label><i className="fa-brands fa-linkedin" style={{ marginRight: '8px' }}></i>LinkedIn Profile URL</label>
                  <input className="admin-form-control" value={memberForm.linkedInId} onChange={e => setMemberForm({...memberForm, linkedInId: e.target.value})} />
                </div>
              </div>

              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px', 
                marginBottom: '20px',
                border: '1px dashed var(--admin-border)'
              }}>
                <p style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '15px', textTransform: 'uppercase', color: 'var(--admin-text-sub)' }}>
                  Hero Card Floating Stats
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Card 1 Heading</label>
                    <input className="admin-form-control" placeholder="e.g. 2.5M" value={memberForm.card1Heading} onChange={e => setMemberForm({...memberForm, card1Heading: e.target.value})} />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Card 1 Text</label>
                    <input className="admin-form-control" placeholder="e.g. Followers" value={memberForm.card1Text} onChange={e => setMemberForm({...memberForm, card1Text: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Card 2 Heading</label>
                    <input className="admin-form-control" placeholder="e.g. 100M+" value={memberForm.card2Heading} onChange={e => setMemberForm({...memberForm, card2Heading: e.target.value})} />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Card 2 Text</label>
                    <input className="admin-form-control" placeholder="e.g. Views" value={memberForm.card2Text} onChange={e => setMemberForm({...memberForm, card2Text: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Profile Image {isEditingMember ? '(Optional: Upload new to replace)' : ''}</label>
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
