import React, { useState, useEffect } from 'react';
import { Search, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import './StoreLocator.css';

function StoreLocator() {
  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
  
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    storename: '',
    pincode: '',
    corporate_number: '',
    address: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [originalStoreData, setOriginalStoreData] = useState(null);

  // Transform nested API response to flat array
  const transformStoresData = (apiResponse) => {
    const storesArray = [];
    
    if (!apiResponse || !apiResponse.Response) {
      return storesArray;
    }

    const response = apiResponse.Response;
    
    // Iterate through states
    Object.keys(response).forEach(state => {
      const districts = response[state];
      
      // Iterate through districts
      Object.keys(districts).forEach(district => {
        const pincodes = districts[district];
        
        // Iterate through pincodes
        Object.keys(pincodes).forEach(pincode => {
          const storeNames = pincodes[pincode];
          
          // Iterate through store names
          Object.keys(storeNames).forEach(storeName => {
            const storeData = storeNames[storeName];
            
            // Transform to our format
            storesArray.push({
              id: storeData.id,
              state: state,
              district: district,
              pincode: pincode,
              storename: storeData.name || storeName,
              corporate_number: storeData.phone || '',
              address: storeData.address || '',
              image_url: storeData.storeimage || '',
              google_location: storeData.google_location || ''
            });
          });
        });
      });
    });
    
    return storesArray;
  };

  // Fetch stores from API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stores?operation=read`);
      const data = await response.json();
      
      // Handle the response structure - API returns { statusCode, headers, body: "stringified JSON" }
      let storesData = null;
      
      if (data.body) {
        // Parse the stringified body
        if (typeof data.body === 'string') {
          storesData = JSON.parse(data.body);
        } else {
          storesData = data.body;
        }
      } else if (data.Response) {
        // Direct Response object
        storesData = data;
      } else {
        // Try using data directly
        storesData = data;
      }
      
      // Transform the nested structure to flat array
      const transformedStores = transformStoresData(storesData);
      setStores(transformedStores);
      setFilteredStores(transformedStores);
      
      console.log('Fetched stores:', transformedStores.length);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedPincode('');
  };

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  // Filter stores whenever stores, searchQuery, or filters change
  useEffect(() => {
    let filtered = [...stores];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(store => {
        const storename = (store.storename || '').toLowerCase();
        const state = (store.state || '').toLowerCase();
        const district = (store.district || '').toLowerCase();
        const pincode = (store.pincode || '').toString();
        const address = (store.address || '').toLowerCase();
        const corporateNumber = (store.corporate_number || '').toString();
        
        return storename.includes(query) ||
               state.includes(query) ||
               district.includes(query) ||
               pincode.includes(query) ||
               address.includes(query) ||
               corporateNumber.includes(query);
      });
    }

    if (selectedState) {
      filtered = filtered.filter(store => store.state === selectedState);
    }

    if (selectedDistrict) {
      filtered = filtered.filter(store => store.district === selectedDistrict);
    }

    if (selectedPincode) {
      filtered = filtered.filter(store => store.pincode === selectedPincode);
    }

    setFilteredStores(filtered);
  }, [stores, searchQuery, selectedState, selectedDistrict, selectedPincode]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ======== HANDLE UPLOAD FILE LOGIC (Presigned URL) ========
  const uploadFileToS3 = async (file, storename) => {
    try {
      console.log("Starting upload for file:", file.name);
      
      const fileExtension = file.name.split(".").pop().toLowerCase();
      console.log("File extension:", fileExtension);
      
      // Determine content type based on file extension
      const contentTypeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      const contentType = contentTypeMap[fileExtension] || file.type || 'image/jpeg';
      
      // Step 1: Get pre-signed URL from API
      const presignRes = await axios.post(`${API_BASE_URL}/stores`, {
        operation: "generate_upload_url",
        data: {
          storename: storename || formData.storename || "store",
          file_extension: fileExtension,
          content_type: contentType
        }
      });

      console.log("Pre-signed URL response:", presignRes.data);
      
      // Handle response structure - could be direct data or wrapped in body
      let responseData = presignRes.data;
      if (responseData.body && typeof responseData.body === 'string') {
        responseData = JSON.parse(responseData.body);
      } else if (responseData.body && typeof responseData.body === 'object') {
        responseData = responseData.body;
      }
      
      // Extract upload URL and file URL from response
      const uploadUrl = responseData.data?.uploadUrl || responseData.uploadUrl || responseData.data?.upload_url;
      const fileUrl = responseData.data?.fileUrl || responseData.fileUrl || responseData.data?.file_url;
      
      if (!uploadUrl) {
        throw new Error("Invalid response from upload-url API: Missing uploadUrl");
      }

      console.log("Upload URL:", uploadUrl);
      console.log("File URL:", fileUrl);

      // Step 2: Upload file to S3 using pre-signed URL
      console.log("Uploading file to S3...");
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", uploadResponse.status, errorText);
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${errorText}`);
      }

      console.log("S3 upload successful:", uploadResponse.status);
      
      // Return fileUrl
      return fileUrl || uploadUrl.split('?')[0]; // Fallback to uploadUrl without query params
      
    } catch (err) {
      console.error("Error uploading file:", err);
      
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      
      if (err.response?.status === 403) {
        throw new Error("Access denied. Please check your permissions or try again.");
      } else if (err.response?.status === 400) {
        throw new Error("Invalid file or request. Please check your file format.");
      } else {
        throw new Error(`Upload failed: ${err.message}`);
      }
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUploading(true);
      
      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      try {
        // Upload to S3 using presigned URL
        const fileUrl = await uploadFileToS3(file, formData.storename);
        console.log("Image uploaded successfully:", fileUrl);
        
        // Update form data with the S3 URL
        setFormData({ ...formData, image_url: fileUrl });
        setUploading(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Upload Error: ${error.message}`);
        setImageFile(null);
        setImagePreview(null);
        setUploading(false);
        // Reset file input
        e.target.value = '';
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      if (editingId && originalStoreData) {
        // Update existing store
        const updateData = {
          operation: "update",
          data: {
            district: formData.district,
            pincode: formData.pincode,
            storename: formData.storename,
            corporate_number: formData.corporate_number,
            address: formData.address,
            image_url: formData.image_url || ''
          }
        };
        
        console.log("Updating store data:", updateData);
        
        // Call API to update store using PUT method
        const response = await axios.put(`${API_BASE_URL}/stores`, updateData);
        
        console.log("Store updated successfully:", response.data);
        
        // Refresh the stores list
        await fetchStores();
        
        // Show success message
        alert('Store updated successfully!');
      } else {
        // Create new store
        const storeData = {
          operation: "create",
          data: {
            state: formData.state,
            district: formData.district,
            pincode: formData.pincode,
            storename: formData.storename,
            corporate_number: formData.corporate_number,
            address: formData.address,
            image_url: formData.image_url || ''
          }
        };
        
        console.log("Submitting store data:", storeData);
        
        // Call API to create store using POST method
        const response = await axios.post(`${API_BASE_URL}/stores`, storeData);
        
        console.log("Store created successfully:", response.data);
        
        // Refresh the stores list
        await fetchStores();
        
        // Show success message
        alert('Store created successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving store:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${editingId ? 'update' : 'create'} store. Please try again.`;
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (store) => {
    setFormData(store);
    setEditingId(store.id);
    // Store original data for update/delete operations
    setOriginalStoreData({
      district: store.district,
      pincode: store.pincode,
      storename: store.storename
    });
    setShowForm(true);
    setCurrentStep(1);
    // Set image preview if image_url exists
    if (store.image_url) {
      setImagePreview(store.image_url);
    }
  };

  const handleDelete = async (store) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        // Prepare delete data
        const deleteData = {
          operation: "delete",
          data: {
            district: store.district,
            pincode: store.pincode,
            storename: store.storename
          }
        };
        
        console.log("Deleting store data:", deleteData);
        
        // Call API to delete store using DELETE method
        const response = await axios.delete(`${API_BASE_URL}/stores`, {
          data: deleteData
        });
        
        console.log("Store deleted successfully:", response.data);
        
        // Refresh the stores list
        await fetchStores();
        
        // Show success message
        alert('Store deleted successfully!');
      } catch (error) {
        console.error('Error deleting store:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete store. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ state: '', district: '', storename: '', pincode: '', corporate_number: '', address: '', image_url: '' });
    setEditingId(null);
    setOriginalStoreData(null);
    setShowForm(false);
    setCurrentStep(1);
    setImageFile(null);
    setImagePreview(null);
    setUploading(false);
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1: return formData.state.trim() !== '';
      case 2: return formData.district.trim() !== '';
      case 3: return formData.storename.trim() !== '';
      case 4: return formData.pincode.trim() !== '' && /^\d{6}$/.test(formData.pincode);
      case 5: return formData.corporate_number.trim() !== '';
      case 6: return formData.address.trim() !== '';
      case 7: return true; // Image is optional
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
      <div className="stores-search-section">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by store name, state, district, pincode, address, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        {(searchQuery || selectedState || selectedDistrict || selectedPincode) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>
      {showForm && (
        <div className="form-container">
          <div className="form-card">
            <h2>{editingId ? 'Edit Store Location' : 'Add New Store Location'}</h2>
            
            <div className="step-indicator">
              {[1, 2, 3, 4, 5, 6, 7].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && 'State'}
                    {step === 2 && 'District'}
                    {step === 3 && 'Store Name'}
                    {step === 4 && 'Pincode'}
                    {step === 5 && 'Corporate Number'}
                    {step === 6 && 'Address'}
                    {step === 7 && 'Image'}
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
                    name="storename"
                    value={formData.storename}
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

              {currentStep === 5 && (
                <div className="form-group">
                  <label>Corporate Number</label>
                  <input
                    type="text"
                    name="corporate_number"
                    value={formData.corporate_number}
                    onChange={handleInputChange}
                    placeholder="Enter corporate number (e.g., +91-9876543210)"
                    className="form-input"
                  />
                </div>
              )}

              {currentStep === 6 && (
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="form-input"
                    rows="4"
                  />
                </div>
              )}

              {currentStep === 7 && (
                <div className="form-group">
                  <label>Store Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                    style={{ padding: '0.5rem' }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div style={{ marginTop: '0.5rem', color: '#ED1B24', fontSize: '0.875rem' }}>
                      Uploading image...
                    </div>
                  )}
                  {imagePreview && !uploading && (
                    <div style={{ marginTop: '1rem' }}>
                      <img 
                        src={imagePreview} 
                        alt="Store preview" 
                        style={{ 
                          maxWidth: '300px', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          border: '2px solid #e9ecef',
                          objectFit: 'cover'
                        }} 
                      />
                      {formData.image_url && (
                        <p style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '0.875rem' }}>
                          ✓ Image uploaded successfully
                        </p>
                      )}
                    </div>
                  )}
                  <p style={{ marginTop: '0.5rem', color: '#868e96', fontSize: '0.875rem' }}>
                    Select an image for the store location (optional - you can skip this step)
                  </p>
                </div>
              )}
            </div>

            <div className="form-actions">
              {currentStep > 1 && (
                <button onClick={prevStep} className="btn-secondary">
                  Previous
                </button>
              )}
              
              {currentStep < 7 ? (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Store Locations ({filteredStores.length} {searchQuery || selectedState || selectedDistrict || selectedPincode ? `of ${stores.length}` : ''})</h2>
          <button 
            onClick={fetchStores}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {/* 🔄 Refresh */}
            <RefreshCcw className="refresh-icon" size={20} />
          </button>
        </div>
        
        {loading ? (
          <div className="empty-state">
            <p>Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="empty-state">
            <p>{stores.length === 0 ? 'No stores found. Click "Add Store Location" to get started.' : 'No stores match your search criteria.'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>State</th>
                  <th>District</th>
                  <th>Store Name</th>
                  <th>Pincode</th>
                  <th>Corporate Number</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map(store => (
                  <tr key={store.id}>
                    <td>
                      {store.image_url ? (
                        <img 
                          src={store.image_url} 
                          alt={store.storename || 'Store'} 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '2px solid #e9ecef'
                          }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: '#f1f3f5',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#868e96',
                          fontSize: '0.75rem'
                        }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>{store.state}</td>
                    <td>{store.district}</td>
                    <td>{store.storename || store.storeName}</td>
                    <td>{store.pincode}</td>
                    <td>{store.corporate_number || '-'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store.address || '-'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(store)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(store)}
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