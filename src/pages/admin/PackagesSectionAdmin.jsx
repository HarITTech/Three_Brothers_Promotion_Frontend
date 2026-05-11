import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../admin.css';
import Loader from '../../components/admin/Loader';

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states for Package
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({
    heading: '',
    price: '',
    desc: '',
    tag1: '',
    tag2: '',
    btnName: 'Get Started',
    badge: '',
    guaranteeTitle: '',
    guaranteeText: '',
    points: ''
  });
  const [modalError, setModalError] = useState('');

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
      setError('Failed to fetch packages section data');
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
            if (obj[key] === '') continue;
            newObj[key] = cleanPayload(obj[key]);
          }
          return newObj;
        }
        return obj;
      };
      
      const payload = cleanPayload(data);
      delete payload.packData;

      if (docId) {
        await api.updateSectionData('packages-section', docId, payload);
        setSuccess('Packages section updated successfully');
      } else {
        const res = await api.createSectionData('packages-section', payload);
        setDocId(res._id);
        setSuccess('Packages section created successfully');
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to update section');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddPackage = () => {
    if (!docId) return alert('Please save the main section first!');
    setPackageForm({
      heading: '', price: '', desc: '', tag1: '', tag2: '', btnName: 'Get Started',
      badge: '', guaranteeTitle: '', guaranteeText: '', points: ''
    });
    setModalError('');
    setIsEditingPackage(false);
    setShowPackageModal(true);
  };

  const openEditPackage = (p) => {
    setPackageForm({
      heading: p.heading || '',
      price: p.price || '',
      desc: p.desc || '',
      tag1: p.tag1 || '',
      tag2: p.tag2 || '',
      btnName: p.btnName || 'Get Started',
      badge: p.badge || '',
      guaranteeTitle: p.guaranteeTitle || '',
      guaranteeText: p.guaranteeText || '',
      points: (p.points || []).join('\n')
    });
    setModalError('');
    setCurrentPackageId(p._id);
    setIsEditingPackage(true);
    setShowPackageModal(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const pointsArray = packageForm.points.split('\n').filter(f => f.trim() !== '');
      const payload = { 
        heading: packageForm.heading,
        price: packageForm.price,
        desc: packageForm.desc,
        tag1: packageForm.tag1,
        tag2: packageForm.tag2,
        btnName: packageForm.btnName,
        badge: packageForm.badge,
        guaranteeTitle: packageForm.guaranteeTitle,
        guaranteeText: packageForm.guaranteeText,
        points: pointsArray 
      };

      if (isEditingPackage) {
        await api.updateSectionData(`packages-section/${docId}`, currentPackageId, payload);
        setSuccess('Package updated successfully');
      } else {
        await api.createSectionData(`packages-section/${docId}`, payload);
        setSuccess('Package added successfully');
      }
      setShowPackageModal(false);
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setModalError(err.message || 'Failed to save package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    setSubmitting(true);
    try {
      await api.deleteSectionData(`packages-section/${docId}`, packageId);
      setSuccess('Package deleted successfully');
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to delete package');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="admin-packages-management">
      {submitting && <Loader fullPage={true} />}
      
      <div className="admin-header">
        <h1>Service Packages</h1>
        <p>Manage your elite service offerings, tiered pricing, and exclusive features.</p>
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
            <i className="fa-solid fa-boxes-stacked" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Main Content</span>
          </div>
        </div>
        <form onSubmit={handleMainSubmit} className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Section Tagline</label>
              <input className="admin-form-control" placeholder="e.g. PACKAGES" value={data.packTag || ''} onChange={e => setData({...data, packTag: e.target.value})} required />
            </div>
            <div className="admin-form-group">
              <label>Headline Part 1</label>
              <input className="admin-form-control" placeholder="e.g. Choose Your" value={data.heading1 || ''} onChange={e => setData({...data, heading1: e.target.value})} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div className="admin-form-group">
              <label>Headline Part 2 (Gradient Highlight)</label>
              <input className="admin-form-control" placeholder="e.g. Level of Impact" value={data.heading2 || ''} onChange={e => setData({...data, heading2: e.target.value})} />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Section Description</label>
            <textarea className="admin-form-control" rows="3" placeholder="Overview of the pricing tiers..." value={data.desc || ''} onChange={e => setData({...data, desc: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Section Content
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fa-solid fa-tags" style={{ color: 'var(--admin-primary)' }}></i>
            <span>Pricing Tiers</span>
          </div>
          <button className="admin-btn" onClick={openAddPackage}>
            <i className="fa-solid fa-plus"></i>
            Add New Package
          </button>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Package Name</th>
                  <th>Price Point</th>
                  <th>Badge</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.packData || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                      No packages found. Define your first tier to show it on the site.
                    </td>
                  </tr>
                ) : (
                  (data.packData || []).map(p => (
                    <tr key={p._id}>
                      <td><span style={{ fontWeight: '700' }}>{p.heading}</span></td>
                      <td><span style={{ color: 'var(--admin-primary)', fontWeight: '700' }}>{p.price}</span></td>
                      <td>
                        {p.badge ? (
                          <span style={{ 
                            padding: '4px 10px', 
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                            borderRadius: '20px', 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: '#fff',
                            textTransform: 'uppercase'
                          }}>
                            {p.badge}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="admin-btn admin-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => openEditPackage(p)}>
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="admin-btn admin-btn-delete" style={{ padding: '8px 12px' }} onClick={() => handleDeletePackage(p._id)}>
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

      {showPackageModal && (
        <div className="admin-modal">
          <div className="admin-modal-content" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '30px 40px 0' }}>
              <h3 style={{ margin: 0, padding: 0 }}>{isEditingPackage ? 'Edit Package Tier' : 'Add New Tier'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '1.2rem', color: 'var(--admin-text-sub)' }} onClick={() => setShowPackageModal(false)}></i>
            </div>
            
            {modalError && (
              <div className="admin-alert admin-alert-error" style={{ margin: '0 40px 20px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handlePackageSubmit} style={{ padding: '0 40px 40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label>Package Title</label>
                  <input className="admin-form-control" placeholder="e.g. Elite Growth" value={packageForm.heading} onChange={e => setPackageForm({...packageForm, heading: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Pricing Display</label>
                  <input className="admin-form-control" placeholder="e.g. $2,000/mo" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Package Description</label>
                <input className="admin-form-control" placeholder="Brief tagline for this tier..." value={packageForm.desc} onChange={e => setPackageForm({...packageForm, desc: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label>Top Tag (e.g. 'with Vibhav Raj')</label>
                  <input className="admin-form-control" value={packageForm.tag1} onChange={e => setPackageForm({...packageForm, tag1: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Bottom Tag (e.g. 'Customized Strategy')</label>
                  <input className="admin-form-control" value={packageForm.tag2} onChange={e => setPackageForm({...packageForm, tag2: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label>CTA Button Text</label>
                  <input className="admin-form-control" placeholder="Get Started" value={packageForm.btnName} onChange={e => setPackageForm({...packageForm, btnName: e.target.value})} required />
                </div>
                <div className="admin-form-group">
                  <label>Special Badge (e.g. MOST POPULAR)</label>
                  <input className="admin-form-control" placeholder="Leave empty for none" value={packageForm.badge} onChange={e => setPackageForm({...packageForm, badge: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Guarantee Label</label>
                  <input className="admin-form-control" placeholder="e.g. Result Guarantee" value={packageForm.guaranteeTitle} onChange={e => setPackageForm({...packageForm, guaranteeTitle: e.target.value})} />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Guarantee Subtext</label>
                  <input className="admin-form-control" placeholder="e.g. or we work for free" value={packageForm.guaranteeText} onChange={e => setPackageForm({...packageForm, guaranteeText: e.target.value})} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Key Features & Benefits (One per line)</label>
                <p style={{ fontSize: '11px', color: 'var(--admin-text-sub)', marginTop: '-8px', marginBottom: '8px' }}>
                  Use <code>&lt;strong&gt;Text&lt;/strong&gt;</code> for bold emphasis.
                </p>
                <textarea className="admin-form-control" style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.9rem' }} placeholder="Feature 1&#10;Feature 2&#10;..." value={packageForm.points} onChange={e => setPackageForm({...packageForm, points: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1, height: '48px' }}>
                  <i className="fa-solid fa-check"></i>
                  {isEditingPackage ? 'Update Package' : 'Create Package'}
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" style={{ flex: 1, height: '48px' }} onClick={() => setShowPackageModal(false)}>
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
