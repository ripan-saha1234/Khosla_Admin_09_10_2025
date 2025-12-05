import React, { useState } from 'react';
import './StoreLocator.css';

function StoreLocator() {
  const [stores, setStores] = useState([
    { id: 1, state: 'Maharashtra', district: 'Mumbai', storeName: 'Downtown Store', pincode: '400001' },
    { id: 2, state: 'Karnataka', district: 'Bangalore', storeName: 'MG Road Store', pincode: '560001' }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    storeName: '',
    pincode: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (editingId) {
      setStores(stores.map(store => 
        store.id === editingId ? { ...formData, id: editingId } : store
      ));
    } else {
      setStores([...stores, { ...formData, id: Date.now() }]);
    }
    resetForm();
  };

  const handleEdit = (store) => {
    setFormData(store);
    setEditingId(store.id);
    setShowForm(true);
    setCurrentStep(1);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      setStores(stores.filter(store => store.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ state: '', district: '', storeName: '', pincode: '' });
    setEditingId(null);
    setShowForm(false);
    setCurrentStep(1);
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.state.trim() !== '';
      case 2: return formData.district.trim() !== '';
      case 3: return formData.storeName.trim() !== '';
      case 4: return formData.pincode.trim() !== '' && /^\d{6}$/.test(formData.pincode);
      default: return false;
    }
  };

  return (
    <div className="store-locator-container">
      <div className="header">
        <h1>Store Location Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Store Location'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-card">
            <h2>{editingId ? 'Edit Store Location' : 'Add New Store Location'}</h2>
            
            <div className="step-indicator">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && 'State'}
                    {step === 2 && 'District'}
                    {step === 3 && 'Store Name'}
                    {step === 4 && 'Pincode'}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-content">
              {currentStep === 1 && (
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state name"
                    className="form-input"
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter district name"
                    className="form-input"
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="Enter store name"
                    className="form-input"
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    className="form-input"
                  />
                  {formData.pincode && !/^\d{6}$/.test(formData.pincode) && (
                    <span className="error-text">Please enter a valid 6-digit pincode</span>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              {currentStep > 1 && (
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button 
                  onClick={nextStep} 
                  className="btn-primary"
                  disabled={!isStepValid()}
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  className="btn-success"
                  disabled={!isStepValid()}
                >
                  {editingId ? 'Update Store' : 'Add Store'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="stores-list">
        <h2>Store Locations ({stores.length})</h2>
        
        {stores.length === 0 ? (
          <div className="empty-state">
            <p>No stores added yet. Click "Add Store Location" to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="stores-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>District</th>
                  <th>Store Name</th>
                  <th>Pincode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.state}</td>
                    <td>{store.district}</td>
                    <td>{store.storeName}</td>
                    <td>{store.pincode}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(store)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(store.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreLocator;