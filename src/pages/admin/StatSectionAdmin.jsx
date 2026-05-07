import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function StatSectionAdmin() {
  const [data, setData] = useState({
    statTag: '',
    heading: '',
    desc: '',
    goals: '',
    card1: { field1: '', field2: '' },
    card2: { field1: '', field2: '' },
    card3: { field1: '', field2: '' }
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
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
          card1: res.card1 || { field1: '', field2: '' },
          card2: res.card2 || { field1: '', field2: '' },
          card3: res.card3 || { field1: '', field2: '' }
        });
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
        await api.updateSectionData('stat-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('stat-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Stat Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content & Cards</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Stat Tag</label>
              <input className="admin-form-control" value={data.statTag || ''} onChange={e => setData({...data, statTag: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Heading</label>
              <input className="admin-form-control" value={data.heading || ''} onChange={e => setData({...data, heading: e.target.value})} required />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea className="admin-form-control" value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Goals</label>
              <input className="admin-form-control" value={data.goals || ''} onChange={e => setData({...data, goals: e.target.value})} />
            </div>

            {/* Cards */}
            {['card1', 'card2', 'card3'].map((card, i) => (
              <div key={card} style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                <h4 style={{ gridColumn: 'span 2' }}>Card {i + 1}</h4>
                <div className="admin-form-group">
                  <label>Field 1 (e.g. Value)</label>
                  <input className="admin-form-control" value={data[card].field1 || ''} onChange={e => handleCardChange(card, 'field1', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>Field 2 (e.g. Label)</label>
                  <input className="admin-form-control" value={data[card].field2 || ''} onChange={e => handleCardChange(card, 'field2', e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="admin-btn" style={{ marginTop: '20px' }}>Save Stat Section</button>
        </form>
      </div>
    </div>
  );
}
