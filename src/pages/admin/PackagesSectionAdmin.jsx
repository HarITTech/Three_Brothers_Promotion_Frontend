import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';

export default function PackagesSectionAdmin() {
  const [data, setData] = useState({
    packTag: '',
    heading1: '',
    heading2: '',
    desc: '',
    packData: []
  });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Package
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({
    heading: '', price: '', desc: '', tag1: '', tag2: '', btnName: '', badge: '', features: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSectionData('packages-section');
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
        await api.updateSectionData('packages-section', docId, payload);
        setSuccess('Section updated successfully');
      } else {
        const res = await api.createSectionData('packages-section', payload);
        setDocId(res._id);
        setSuccess('Section created successfully');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddPackage = () => {
    if (!docId) return alert('Please save the main section first!');
    setPackageForm({ heading: '', price: '', desc: '', tag1: '', tag2: '', btnName: '', badge: '', features: '' });
    setIsEditingPackage(false);
    setShowPackageModal(true);
  };

  const openEditPackage = (pkg) => {
    setPackageForm({
      heading: pkg.heading || '',
      price: pkg.price || '',
      desc: pkg.desc || '',
      tag1: pkg.tag1 || '',
      tag2: pkg.tag2 || '',
      btnName: pkg.btnName || '',
      badge: pkg.badge || '',
      features: (pkg.packData || []).join('\n')
    });
    setCurrentPackageId(pkg._id);
    setIsEditingPackage(true);
    setShowPackageModal(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const payload = {
        heading: packageForm.heading,
        price: packageForm.price,
        desc: packageForm.desc,
        tag1: packageForm.tag1,
        tag2: packageForm.tag2,
        btnName: packageForm.btnName,
        badge: packageForm.badge,
        packData: packageForm.features.split('\n').filter(s => s.trim() !== '')
      };

      if (isEditingPackage) {
        await api.updateSectionData(`packages-section/${docId}`, currentPackageId, payload);
        setSuccess('Package updated');
      } else {
        await api.createSectionData(`packages-section/${docId}`, payload);
        setSuccess('Package added');
      }
      setShowPackageModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.deleteSectionData(`packages-section/${docId}`, packageId);
      setSuccess('Package deleted');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Packages Section Management</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <div className="admin-card">
        <h3>Main Content</h3>
        <form onSubmit={handleMainSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label>Pack Tag</label>
              <input className="admin-form-control" value={data.packTag || ''} onChange={e => setData({...data, packTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 1</label>
              <input className="admin-form-control" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Heading 2 (Optional)</label>
              <input className="admin-form-control" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
            <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description (Optional)</label>
              <textarea className="admin-form-control" value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="admin-btn" style={{ marginTop: '15px' }}>Save Main Content</button>
        </form>
      </div>

      {docId && (
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Packages</h3>
            <button className="admin-btn" onClick={openAddPackage}>Add Package</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Heading</th>
                <th>Price</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.packData || []).map(p => (
                <tr key={p._id}>
                  <td>{p.heading}</td>
                  <td>{p.price}</td>
                  <td>{p.badge}</td>
                  <td>
                    <button className="admin-btn" style={{ marginRight: '10px' }} onClick={() => openEditPackage(p)}>Edit</button>
                    <button className="admin-btn" style={{ background: '#e74c3c' }} onClick={() => handleDeletePackage(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {(!data.packData || data.packData.length === 0) && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No packages found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showPackageModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{isEditingPackage ? 'Edit Package' : 'Add Package'}</h3>
            <form onSubmit={handlePackageSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Heading</label>
                  <input className="admin-form-control" value={packageForm.heading} onChange={e => setPackageForm({...packageForm, heading: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Price</label>
                  <input className="admin-form-control" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} required />
                </div>
                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description</label>
                  <input className="admin-form-control" value={packageForm.desc} onChange={e => setPackageForm({...packageForm, desc: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Tag 1 (e.g. 'with Vibhav Raj')</label>
                  <input className="admin-form-control" value={packageForm.tag1} onChange={e => setPackageForm({...packageForm, tag1: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Tag 2 (Footer text)</label>
                  <input className="admin-form-control" value={packageForm.tag2} onChange={e => setPackageForm({...packageForm, tag2: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Button Name</label>
                  <input className="admin-form-control" value={packageForm.btnName} onChange={e => setPackageForm({...packageForm, btnName: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Badge (e.g. 'Most Popular')</label>
                  <input className="admin-form-control" value={packageForm.badge} onChange={e => setPackageForm({...packageForm, badge: e.target.value})} />
                </div>
                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Features (One per line)</label>
                  <textarea className="admin-form-control" style={{ minHeight: '100px' }} value={packageForm.features} onChange={e => setPackageForm({...packageForm, features: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save</button>
                <button type="button" className="admin-btn" style={{ flex: 1, background: '#95a5a6' }} onClick={() => setShowPackageModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
