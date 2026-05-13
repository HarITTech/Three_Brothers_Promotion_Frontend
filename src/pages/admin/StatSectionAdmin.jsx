import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function StatSectionAdmin() {
  const [data, setData] = useState({
    statTag: '',
    statIcon: '',
    heading: '',
    subHeading1: '',
    subHeading2: '',
    desc: '',
    card1: { field1: '', field2: '', field3: '' },
    card2: { field1: '', field2: '' },
    card3: { field1: '', field2: '', field3: '' }
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('stat-section');
      if (res && res._id) {
        setDocId(res._id);
        setData({
          ...res,
          card1: res.card1 || { field1: '', field2: '', field3: '' },
          card2: res.card2 || { field1: '', field2: '' },
          card3: res.card3 || { field1: '', field2: '', field3: '' }
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load stat section data');
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
            if (['createdAt', 'updatedAt', '_id', '__v', 'goals'].includes(key)) continue;
            newObj[key] = cleanPayload(obj[key]);
          }
          return newObj;
        }
        return obj;
      };
      
      const payload = cleanPayload(data);

      if (docId) {
        await api.updateSectionData('stat-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('stat-section', payload);
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

  const handleCardChange = (cardId, field, value) => {
    setData({
      ...data,
      [cardId]: {
        ...data[cardId],
        [field]: value
      }
    });
  };

  const availableIcons = [
    { label: 'Chart Line', value: 'fa-solid fa-chart-line' },
    { label: 'Rocket', value: 'fa-solid fa-rocket' },
    { label: 'Eye', value: 'fa-solid fa-eye' },
    { label: 'Users', value: 'fa-solid fa-users' },
    { label: 'Dollar', value: 'fa-solid fa-dollar-sign' },
    { label: 'Bullhorn', value: 'fa-solid fa-bullhorn' },
    { label: 'Trophy', value: 'fa-solid fa-trophy' }
  ];

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-stat-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Stat Section</h1>
        <p>Manage the performance statistics and growth numbers shown on your site.</p>
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
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content & Statistics</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Section Tagline</label>
              <input className="admin-form-control" value={data.statTag || ''} onChange={e => setData({...data, statTag: e.target.value})} placeholder="e.g. OUR IMPACT" />
            </div>
            <div className="admin-form-group">
              <label>Section Icon</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--admin-primary)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  <i className={data.statIcon || 'fa-solid fa-rocket'}></i>
                </div>
                <select 
                  className="admin-form-control" 
                  value={data.statIcon || 'fa-solid fa-rocket'} 
                  onChange={e => setData({...data, statIcon: e.target.value})}
                  style={{ flex: 1 }}
                >
                  {availableIcons.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Main Headline</label>
            <input className="admin-form-control" value={data.heading || ''} onChange={e => setData({...data, heading: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Secondary Headline Part 1 (Regular)</label>
              <input className="admin-form-control" value={data.subHeading1 || ''} onChange={e => setData({...data, subHeading1: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Secondary Headline Part 2 (Gradient)</label>
              <input className="admin-form-control" value={data.subHeading2 || ''} onChange={e => setData({...data, subHeading2: e.target.value})} />
            </div>
          </div>

          <div style={{ marginTop: '30px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--admin-text-main)', marginBottom: '20px' }}>Statistics Cards</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {['card2', 'card1', 'card3'].map((card, idx) => (
              <div key={card} style={{ 
                padding: '24px', 
                borderRadius: '16px', 
                backgroundColor: '#f8fafc', 
                border: '1px solid var(--admin-border)',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '20px', 
                  background: 'var(--admin-primary)', 
                  color: '#fff', 
                  padding: '2px 12px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem', 
                  fontWeight: '800' 
                }}>
                  {card === 'card2' ? 'MAIN CARD (CENTER)' : `STAT CARD ${card === 'card1' ? '1' : '2'}`}
                </div>
                
                <div className="admin-form-group" style={{ marginTop: '10px' }}>
                  <label>Value</label>
                  <input className="admin-form-control" value={data[card].field1 || ''} onChange={e => handleCardChange(card, 'field1', e.target.value)} placeholder="e.g. 100M+" />
                </div>
                <div className="admin-form-group">
                  <label>Label</label>
                  <input className="admin-form-control" value={data[card].field2 || ''} onChange={e => handleCardChange(card, 'field2', e.target.value)} placeholder="e.g. Organic Views" />
                </div>
                {card !== 'card2' && (
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Card Icon</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                        <i className={data[card].field3 || 'fa-solid fa-chart-line'}></i>
                      </div>
                      <select 
                        className="admin-form-control" 
                        value={data[card].field3 || 'fa-solid fa-chart-line'} 
                        onChange={e => handleCardChange(card, 'field3', e.target.value)}
                        style={{ flex: 1 }}
                      >
                        {availableIcons.map(icon => (
                          <option key={icon.value} value={icon.value}>{icon.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Stat Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
