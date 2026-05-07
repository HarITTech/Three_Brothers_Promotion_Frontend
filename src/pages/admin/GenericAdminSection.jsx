import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function GenericAdminSection({ sectionName, endpoint }) {
  const [data, setData] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(true);
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
    setMessage('');
    setError('');
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      if (data && data._id) {
        // Update
        const updated = await api.updateSectionData(endpoint, data._id, parsedData);
        setMessage('Successfully updated!');
        setData(updated);
        setJsonData(JSON.stringify(updated, null, 2));
      } else {
        // Create
        const created = await api.createSectionData(endpoint, parsedData);
        setMessage('Successfully created!');
        setData(created);
        setJsonData(JSON.stringify(created, null, 2));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-card">
      <h2>Manage {sectionName}</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {message && <p style={{ color: 'green', marginBottom: '10px' }}>{message}</p>}
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          
          <div className="admin-form-group">
            <label>JSON Data</label>
            <textarea
              className="admin-form-control"
              rows="20"
              style={{ fontFamily: 'monospace' }}
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
            />
          </div>
          
          <button className="admin-btn" onClick={handleSave}>
            {data && data._id ? 'Update' : 'Create'}
          </button>
        </>
      )}
    </div>
  );
}
