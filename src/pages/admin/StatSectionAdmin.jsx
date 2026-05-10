import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

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
      <div className="admin-header">
        <h1>Stat Section Management</h1>
        <p>Manage the performance statistics and growth numbers.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <div className="admin-card">
        <div className="admin-card-header">Main Content & Cards</div>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Stat Icon (FontAwesome class)</label>
              <input className="admin-form-control" value={data.statIcon || ''} onChange={e => setData({...data, statIcon: e.target.value})} placeholder="fa-solid fa-rocket" />
            </div>
            <div className="admin-form-group">
              <label>Stat Tag (Badge text)</label>
              <input className="admin-form-control" value={data.statTag || ''} onChange={e => setData({...data, statTag: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Main Heading</label>
              <input className="admin-form-control" value={data.heading || ''} onChange={e => setData({...data, heading: e.target.value})} required />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Sub Heading 1 (Light text)</label>
              <input className="admin-form-control" value={data.subHeading1 || ''} onChange={e => setData({...data, subHeading1: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Sub Heading 2 (Gradient text)</label>
              <input className="admin-form-control" value={data.subHeading2 || ''} onChange={e => setData({...data, subHeading2: e.target.value})} />
            </div>

            {/* Cards */}
            {['card2', 'card1', 'card3'].map((card) => (
              <div key={card} style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', borderTop: '1px solid #edf2f7', paddingTop: '20px', marginTop: '10px' }}>
                <h4 style={{ gridColumn: 'span 3', fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                  {card === 'card2' ? 'Card 1 (Center Card - No Icon)' : card === 'card1' ? 'Card 2' : 'Card 3'}
                </h4>
                <div className="admin-form-group">
                  <label>Value (e.g. 10M+)</label>
                  <input className="admin-form-control" value={data[card].field1 || ''} onChange={e => handleCardChange(card, 'field1', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>Label (e.g. Revenue)</label>
                  <input className="admin-form-control" value={data[card].field2 || ''} onChange={e => handleCardChange(card, 'field2', e.target.value)} />
                </div>
                {card !== 'card2' && (
                  <div className="admin-form-group">
                    <label>Icon Class</label>
                    <input className="admin-form-control" value={data[card].field3 || ''} onChange={e => handleCardChange(card, 'field3', e.target.value)} placeholder="fa-solid fa-eye" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="admin-btn" style={{ marginTop: '20px' }}>Save Stat Section</button>
        </form>
      </div>
    </div>
  );
}
