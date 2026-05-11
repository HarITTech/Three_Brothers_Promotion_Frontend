import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

export default function GenericAdminSection({ sectionName, endpoint }) {
  const [data, setData] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await api.getSectionData(endpoint);
      if (result) {
        setData(result);
        setJsonData(JSON.stringify(result, null, 2));
      } else {
        setData(null);
        setJsonData('{\n  // Enter JSON data here\n}');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        throw new Error('Invalid JSON format. Please ensure your JSON is valid.');
      }

      const cleanData = { ...parsedData };
      delete cleanData._id;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      delete cleanData.__v;

      if (data && data._id) {
        const updated = await api.updateSectionData(endpoint, data._id, cleanData);
        setMessage('Changes saved successfully!');
        setData(updated);
        setJsonData(JSON.stringify(updated, null, 2));
      } else {
        const created = await api.createSectionData(endpoint, cleanData);
        setMessage('Section created successfully!');
        setData(created);
        setJsonData(JSON.stringify(created, null, 2));
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-generic-section">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Manage {sectionName}</h1>
        <p>Edit the raw data for the {sectionName} section. Use valid JSON format.</p>
      </div>

      {message && (
        <div className="admin-alert admin-alert-success">
          <i className="fa-solid fa-circle-check"></i>
          {message}
        </div>
      )}
      {error && (
        <div className="admin-alert admin-alert-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}
      
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-code" style={{ color: 'var(--admin-primary)' }}></i>
            <span>JSON Editor</span>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-group">
            <label>Data Structure</label>
            <textarea
              className="admin-form-control"
              rows="22"
              style={{ 
                fontFamily: 'Fira Code, monospace', 
                fontSize: '14px',
                lineHeight: '1.5',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                padding: '20px',
                border: 'none',
                borderRadius: '12px'
              }}
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              spellCheck="false"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="admin-btn admin-btn-secondary" onClick={fetchData}>
              <i className="fa-solid fa-rotate"></i>
              Reset
            </button>
            <button className="admin-btn" onClick={handleSave}>
              <i className="fa-solid fa-floppy-disk"></i>
              {data && data._id ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
