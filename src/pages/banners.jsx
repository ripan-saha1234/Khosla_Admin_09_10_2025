// import { useState, useRef } from "react";
// import "../css/banner.css"
// import { Plus } from "lucide-react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button
// } from "@mui/material";

// function Banners() {
//   const [activeTab, setActiveTab] = useState("desktop");
//   const [desktopBanners, setDesktopBanners] = useState(["https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png", "https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png", "https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png"]);
//   const [mobileBanners, setMobileBanners] = useState(["https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png", "https://staging.du888chceaq3h.amplifyapp.com/3rd-Banner-1065456-3.png"]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);

//   // Image upload states
//   const [showImageUpload, setShowImageUpload] = useState(false);
//   const [uploadedImages, setUploadedImages] = useState([null, null, null, null, null, null]);
//   const [imagePreviewUrls, setImagePreviewUrls] = useState(["", "", "", "", "", ""]);
//   const [isImagesSubmitted, setIsImagesSubmitted] = useState(false);
//   const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
//   // Edit banner states
//   const [editingBannerIndex, setEditingBannerIndex] = useState(null);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [editBannerImage, setEditBannerImage] = useState(null);
//   const [editBannerPreview, setEditBannerPreview] = useState("");
//   const editFileInputRef = useRef(null);
  
//   // Ref for upload section to scroll to
//   const uploadSectionRef = useRef(null);

//   function handleSave() {
//     if (!selectedFile) return;

//     const reader = new FileReader();

//     reader.onloadend = () => {
//       if (activeTab === "desktop") {
//         setDesktopBanners((prevBanners) => [...prevBanners, reader.result]);
//       } else {
//         setMobileBanners((prevBanners) => [...prevBanners, reader.result]);
//       }
//       setDialogOpen(false);
//       setSelectedFile(null);
//     };

//     reader.readAsDataURL(selectedFile);
//   }

//   function handleDeleteBanner(index) {
//     // Show confirmation dialog
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this banner?\n\nThis action cannot be undone."
//     );
    
//     if (!confirmDelete) {
//       return; // User clicked "No" or "Cancel"
//     }
    
//     // User clicked "Yes" - proceed with deletion
//     if (activeTab === "desktop") {
//       setDesktopBanners(desktopBanners.filter((_, i) => i !== index));
//     } else {
//       setMobileBanners(mobileBanners.filter((_, i) => i !== index));
//     }
    
//     // ====== FUTURE: API DELETE CALL WILL GO HERE ======
//     // const response = await fetch(`YOUR_API_ENDPOINT/banners/${index}`, {
//     //   method: 'DELETE',
//     //   body: JSON.stringify({ bannerType: activeTab, bannerIndex: index })
//     // });
//     // ====================================================
    
//     alert("Banner deleted successfully!");
//   }

//   // Handle image file selection
//   const handleImageChange = (index, event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const newUploadedImages = [...uploadedImages];
//       newUploadedImages[index] = file;
//       setUploadedImages(newUploadedImages);

//       // Create preview URL
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const newPreviewUrls = [...imagePreviewUrls];
//         newPreviewUrls[index] = reader.result;
//         setImagePreviewUrls(newPreviewUrls);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Remove image
//   const handleRemoveImage = (index) => {
//     const newUploadedImages = [...uploadedImages];
//     newUploadedImages[index] = null;
//     setUploadedImages(newUploadedImages);

//     const newPreviewUrls = [...imagePreviewUrls];
//     newPreviewUrls[index] = "";
//     setImagePreviewUrls(newPreviewUrls);
    
//     setIsImagesSubmitted(false);
//   };

//   // Submit images
//   const handleSubmitImages = async () => {
//     try {
//       // Create FormData object
//       const formData = new FormData();
      
//       // Add banner type to FormData
//       formData.append('bannerType', activeTab); // 'desktop' or 'mobile'
      
//       // Append all uploaded images to FormData
//       uploadedImages.forEach((image, index) => {
//         if (image) {
//           formData.append(`image${index}`, image);
//         }
//       });
      
//       // ====== FUTURE: API INTEGRATION WILL GO HERE ======
//       // const response = await fetch('YOUR_API_ENDPOINT/banners', {
//       //   method: 'POST',
//       //   body: formData
//       // });
//       // const data = await response.json();
//       // ====================================================
      
//       // Mock demo - log FormData contents
//       console.log('FormData contents:');
//       console.log('Banner Type:', activeTab);
//       for (let pair of formData.entries()) {
//         console.log(pair[0], pair[1]);
//       }
      
//       // Add uploaded images to the banner list
//       const newBanners = imagePreviewUrls.filter(url => url !== "");
//       if (activeTab === "desktop") {
//         setDesktopBanners([...desktopBanners, ...newBanners]);
//       } else {
//         setMobileBanners([...mobileBanners, ...newBanners]);
//       }
      
//       setIsImagesSubmitted(true);
//       alert(`${activeTab === 'desktop' ? 'Desktop' : 'Mobile'} banners uploaded successfully!`);
      
//       // Reset upload section after 2 seconds
//       setTimeout(() => {
//         setShowImageUpload(false);
//         setUploadedImages([null, null, null, null, null, null]);
//         setImagePreviewUrls(["", "", "", "", "", ""]);
//         setIsImagesSubmitted(false);
//       }, 2000);
      
//     } catch (error) {
//       console.error('Error uploading banners:', error);
//       alert('Failed to upload banners. Please try again.');
//     }
//   };

//   // Handle edit banner
//   const handleEditBanner = (index) => {
//     setEditingBannerIndex(index);
//     const currentBanner = activeTab === "desktop" ? desktopBanners[index] : mobileBanners[index];
//     setEditBannerPreview(currentBanner);
//     setShowEditDialog(true);
//   };

//   // Handle edit image change
//   const handleEditImageChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setEditBannerImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setEditBannerPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Save edited banner
//   const handleSaveEditedBanner = () => {
//     if (editingBannerIndex === null) return;
    
//     // ====== FUTURE: API UPDATE CALL WILL GO HERE ======
//     // const formData = new FormData();
//     // formData.append('bannerType', activeTab);
//     // formData.append('bannerIndex', editingBannerIndex);
//     // formData.append('image', editBannerImage);
//     // const response = await fetch('YOUR_API_ENDPOINT/banners/update', {
//     //   method: 'PUT',
//     //   body: formData
//     // });
//     // ====================================================
    
//     if (activeTab === "desktop") {
//       const updatedBanners = [...desktopBanners];
//       updatedBanners[editingBannerIndex] = editBannerPreview;
//       setDesktopBanners(updatedBanners);
//     } else {
//       const updatedBanners = [...mobileBanners];
//       updatedBanners[editingBannerIndex] = editBannerPreview;
//       setMobileBanners(updatedBanners);
//     }
    
//     alert("Banner updated successfully!");
//     setShowEditDialog(false);
//     setEditingBannerIndex(null);
//     setEditBannerImage(null);
//     setEditBannerPreview("");
//   };

//   const currentBanners = activeTab === "desktop" ? desktopBanners : mobileBanners;

//   // Reset image uploads when switching tabs
//   const handleTabSwitch = (tabName) => {
//     setActiveTab(tabName);
//     setUploadedImages([null, null, null, null, null, null]);
//     setImagePreviewUrls(["", "", "", "", "", ""]);
//     setIsImagesSubmitted(false);
//   };

//   // Handle Add Banner button click with auto-scroll
//   const handleAddBannerClick = () => {
//     setShowImageUpload(!showImageUpload);
    
//     // Scroll to upload section after a short delay to ensure it's rendered
//     setTimeout(() => {
//       if (!showImageUpload && uploadSectionRef.current) {
//         uploadSectionRef.current.scrollIntoView({ 
//           behavior: 'smooth', 
//           block: 'start' 
//         });
//       }
//     }, 100);
//   };

//   return (
//     <>
//       <div className="banners-page-container">
//         <h1 className="banners-page-header">BANNERS</h1>
        
//         {/* Tabs */}
//         <div className="banners-tabs-container">
//           <button 
//             className={`banner-tab ${activeTab === "desktop" ? "active" : ""}`}
//             onClick={() => handleTabSwitch("desktop")}
//           >
//             Desktop Banners
//           </button>
//           <button 
//             className={`banner-tab ${activeTab === "mobile" ? "active" : ""}`}
//             onClick={() => handleTabSwitch("mobile")}
//           >
//             Mobile Banners
//           </button>
//         </div>

//         <div className="banners-page-subheader">
//           <h2>{activeTab === "desktop" ? "DESKTOP BANNERS" : "MOBILE BANNERS"}</h2>
//           <button 
//             className="banners-page-add-banner-button" 
//             onClick={handleAddBannerClick}
//           >
//             <Plus />ADD BANNER
//           </button>
//         </div>
        
//         {/* Existing Banners Display */}
//         <div className="banners-page-top-banners-container">
//           {
//             currentBanners.map((banner, index) => {
//               return (
//                 <div key={index} className="banners-page-banner-container">
//                   <img src={banner} alt="" />
//                   <div className="banner-hover-buttons">
//                     <button 
//                       className="banner-update-btn"
//                       onClick={() => handleEditBanner(index)}
//                     >
//                       UPDATE BANNER
//                     </button>
//                     <button 
//                       className="banner-delete-btn"
//                       onClick={() => handleDeleteBanner(index)}
//                     >
//                       DELETE BANNER
//                     </button>
//                   </div>
//                 </div>
//               )
//             })
//           }
//         </div>

//         {/* Image Upload Section - Only show when Add Banner is clicked */}
//         {showImageUpload && (
//         <div className="banner-upload-section" ref={uploadSectionRef}>
//           <h2 className="upload-section-title">Upload {activeTab === "desktop" ? "Desktop" : "Mobile"} Banners</h2>
          
//           <div className="banner-image-upload-grid">
//             {[0, 1, 2, 3, 4, 5].map((index) => (
//               <div key={index} className="banner-image-upload-item">
//                 <div className="banner-image-upload-number">
//                   Banner {index + 1}
//                 </div>
                
//                 {imagePreviewUrls[index] ? (
//                   <div className="banner-image-preview-wrapper">
//                     <img 
//                       src={imagePreviewUrls[index]} 
//                       alt={`Banner Preview ${index + 1}`}
//                       className="banner-image-preview"
//                     />
//                     <button 
//                       className="banner-remove-image-btn"
//                       onClick={() => handleRemoveImage(index)}
//                       type="button"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="banner-image-upload-placeholder">
//                     <p>No image selected</p>
//                   </div>
//                 )}
                
//                 <input
//                   type="file"
//                   accept="image/*"
//                   ref={fileInputRefs[index]}
//                   style={{ display: 'none' }}
//                   onChange={(e) => handleImageChange(index, e)}
//                 />
                
//                 <Button
//                   variant="outlined"
//                   onClick={() => fileInputRefs[index].current.click()}
//                   sx={{ 
//                     marginTop: '10px',
//                     color: '#ED1B24',
//                     borderColor: '#ED1B24',
//                     '&:hover': { 
//                       borderColor: '#c41620',
//                       backgroundColor: 'rgba(237, 27, 36, 0.04)'
//                     }
//                   }}
//                   fullWidth
//                 >
//                   Browse Image
//                 </Button>

//                 {isImagesSubmitted && uploadedImages[index] && (
//                   <div className="banner-uploaded-image-name">
//                     <span className="file-icon">📄</span>
//                     <span className="file-name">{uploadedImages[index].name}</span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Upload Button */}
//           <div className="banner-submit-images-container">
//             <Button
//               variant="contained"
//               onClick={handleSubmitImages}
//               disabled={!uploadedImages.some(img => img !== null) || isImagesSubmitted}
//               sx={{
//                 backgroundColor: '#000',
//                 color: 'white',
//                 padding: '12px 40px',
//                 fontSize: '16px',
//                 fontWeight: '600',
//                 '&:hover': {
//                   backgroundColor: '#333',
//                 },
//                 '&:disabled': {
//                   backgroundColor: '#ccc',
//                   color: '#666',
//                 }
//               }}
//             >
//               {isImagesSubmitted ? '✓ Images Uploaded' : 'Upload Images'}
//             </Button>
            
//             {isImagesSubmitted && (
//               <p className="banner-submission-success-message">
//                 ✓ Images uploaded successfully! (Ready for backend integration)
//               </p>
//             )}
//           </div>
//         </div>
//         )}
//       </div>


//       {/* Edit Banner Dialog */}
//       <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
//         <DialogTitle>UPDATE BANNER</DialogTitle>
//         <DialogContent dividers>
//           <div style={{ textAlign: 'center' }}>
//             {editBannerPreview && (
//               <div style={{ marginBottom: '20px' }}>
//                 <img 
//                   src={editBannerPreview} 
//                   alt="Banner Preview" 
//                   style={{ 
//                     width: '100%', 
//                     maxHeight: '300px', 
//                     objectFit: 'contain',
//                     borderRadius: '8px',
//                     border: '2px solid #ddd'
//                   }}
//                 />
//               </div>
//             )}
            
//             <input
//               type="file"
//               accept="image/*"
//               ref={editFileInputRef}
//               style={{ display: 'none' }}
//               onChange={handleEditImageChange}
//             />
            
//             <Button
//               variant="outlined"
//               onClick={() => editFileInputRef.current.click()}
//               sx={{
//                 color: '#ED1B24',
//                 borderColor: '#ED1B24',
//                 '&:hover': {
//                   borderColor: '#c41620',
//                   backgroundColor: 'rgba(237, 27, 36, 0.04)'
//                 }
//               }}
//               fullWidth
//             >
//               Browse New Image
//             </Button>
//           </div>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
//           <Button 
//             onClick={handleSaveEditedBanner}
//             variant="contained"
//             sx={{ 
//               backgroundColor: '#000',
//               '&:hover': { backgroundColor: '#333' }
//             }}
//           >
//             Save Changes
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Old Dialog (kept for legacy support if needed) */}
//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle>ADD {activeTab === "desktop" ? "DESKTOP" : "MOBILE"} BANNER</DialogTitle>
//         <DialogContent dividers>
//           <input
//             type="file"
//             accept=".png, .jpg, .jpeg"
//             onChange={(e) => {
//               if (e.target.files && e.target.files[0]) {
//                 setSelectedFile(e.target.files[0]);
//               }
//             }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogActions>
//       </Dialog>
//     </>

//   );
// }

// export default Banners;
import { useState, useRef, useEffect } from "react";
import "../css/banner.css";
import { Plus } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

function Banners() {
  const [activeTab, setActiveTab] = useState("desktop");
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([null, null, null, null, null, null]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState(["", "", "", "", "", ""]);
  const [isImagesSubmitted, setIsImagesSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Field and value for each upload slot
  const [uploadFields, setUploadFields] = useState(["", "", "", "", "", ""]);
  const [uploadValues, setUploadValues] = useState(["", "", "", "", "", ""]);

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
  const [editingBannerIndex, setEditingBannerIndex] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState("");
  const [editBannerField, setEditBannerField] = useState("");
  const [editBannerValue, setEditBannerValue] = useState("");
  const editFileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);

  const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev"; // 🔹 Replace with your actual API base URL

  // ======== SAVE BANNER TO DATABASE ========
  const saveBannerToDatabase = async (fileUrl, tableType, field = "homepage", value = "banner1") => {
    try {
      console.log("Saving banner to database:", fileUrl, tableType, field, value);
      
      const response = await axios.post(`${baseUrl}/slider?tableType=${tableType}`, {
        tableType: tableType,
        largeImageURL: fileUrl,
        field: field || "homepage",
        value: value || "banner1"
      });
      
      console.log("Banner saved to database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error saving banner to database:", error);
      throw new Error(`Failed to save banner to database: ${error.message}`);
    }
  };

  // ======== UPDATE BANNER IN DATABASE ========
  const updateBannerInDatabase = async (fileUrl, tableType, sliderId, field = "homepage", value = "banner1") => {
    try {
      console.log("Updating banner in database:", fileUrl, tableType, sliderId);
      
      const response = await axios.put(`${baseUrl}/slider/${sliderId}?tableType=${tableType}`, {
        tableType: tableType,
        largeImageURL: fileUrl,
        field: field,
        value: value
      });
      
      console.log("Banner updated in database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error updating banner in database:", error);
      throw new Error(`Failed to update banner in database: ${error.message}`);
    }
  };

  // ======== DELETE BANNER FROM DATABASE ========
  const deleteBannerFromDatabase = async (tableType, sliderId) => {
    try {
      console.log("Deleting banner from database:", tableType, sliderId);
      
      const response = await axios.delete(`${baseUrl}/slider/${sliderId}?tableType=${tableType}`);
      
      console.log("Banner deleted from database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error deleting banner from database:", error);
      throw new Error(`Failed to delete banner from database: ${error.message}`);
    }
  };

  // ======== FETCH BANNERS FROM DATABASE ========
  const fetchBannersFromDatabase = async (tableType) => {
    try {
      console.log("Fetching banners from database:", tableType);
      
      const response = await axios.get(`${baseUrl}/slider?tableType=${tableType}`);
      
      console.log("Banners fetched from database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error fetching banners from database:", error);
      throw new Error(`Failed to fetch banners from database: ${error.message}`);
    }
  };

  // ======== HANDLE UPLOAD FILE LOGIC (Presigned URL) ========
  const uploadFileToS3 = async (file, tableType, skipDatabaseSave = false, field = "homepage", value = "banner1") => {
    try {
      console.log("Starting upload for file:", file.name, "Type:", tableType);
      
      const fileExtension = file.name.split(".").pop();
      console.log("File extension:", fileExtension);
      
      // Get pre-signed URL from your API
      const presignRes = await axios.post(`${baseUrl}/upload-url`, {
        tableType,
        fileExtension,
        contentType: 'image/jpg', // Send the actual file content type
        fileName: file.name     // Send the file name
      });

      console.log("Pre-signed URL response:", presignRes.data);
      
      if (!presignRes.data || !presignRes.data.data) {
        throw new Error("Invalid response from upload-url API");
      }

      const { uploadUrl, fileUrl } = presignRes.data.data;
      console.log("Upload URL:", uploadUrl);
      console.log("File URL:", fileUrl);

      // Upload file to S3 using pre-signed URL
      console.log("Uploading file to S3...");
      console.log("File details:", {
        name: file.name,
        type: 'image/jpg',
        size: file.size
      });
      
      // Upload with the exact Content-Type that was sent to backend
      console.log("Uploading with Content-Type:", 'image/jpg');
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'image/jpg'
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", uploadResponse.status, errorText);
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${errorText}`);
      }

      console.log("S3 upload successful:", uploadResponse.status);
      
      // Step 3: Save banner info to database (skip if updating existing banner)
      if (!skipDatabaseSave) {
        const savedBanner = await saveBannerToDatabase(fileUrl, tableType, field, value);
        return { fileUrl, sliderId: savedBanner.sliderId || savedBanner.id };
      }
      
      // For updates, just return the fileUrl
      return { fileUrl };
      
    } catch (err) {
      console.error("Error uploading file:", err);
      
      // More detailed error logging
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        console.error("Response headers:", err.response.headers);
      }
      
      // Provide user-friendly error message
      if (err.response?.status === 403) {
        throw new Error("Access denied. Please check your permissions or try again.");
      } else if (err.response?.status === 400) {
        throw new Error("Invalid file or request. Please check your file format.");
      } else if (err.code === 'ECONNABORTED') {
        throw new Error("Upload timeout. Please try again with a smaller file.");
      } else {
        throw new Error(`Upload failed: ${err.message}`);
      }
    }
  };

  // =================== HANDLE IMAGE SELECTION ===================
  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const newUploadedImages = [...uploadedImages];
      newUploadedImages[index] = file;
      setUploadedImages(newUploadedImages);

    const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewUrls = [...imagePreviewUrls];
        newPreviewUrls[index] = reader.result;
        setImagePreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(file);
    }
  };

  // =================== HANDLE IMAGE REMOVE ===================
  const handleRemoveImage = (index) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages[index] = null;
    setUploadedImages(newUploadedImages);

    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls[index] = "";
    setImagePreviewUrls(newPreviewUrls);
    setIsImagesSubmitted(false);
  };

  // =================== SUBMIT IMAGES ===================
  const handleSubmitImages = async () => {
    try {
      setUploading(true);
      const validFiles = uploadedImages.filter((file) => file !== null);
      if (validFiles.length === 0) {
        alert("Please select at least one image before uploading!");
        return;
      }

      const uploadedBanners = [];
      for (let i = 0; i < uploadedImages.length; i++) {
        const file = uploadedImages[i];
        if (file !== null) {
          const field = uploadFields[i] || "homepage";
          const value = uploadValues[i] || "banner1";
          const result = await uploadFileToS3(file, activeTab, false, field, value);
          uploadedBanners.push({
            id: Date.now() + Math.random(), // Generate unique ID
            url: result.fileUrl,
            sliderId: result.sliderId
          });
        }
      }

      // Banners are now saved to database via API - refresh from API
      alert(`${activeTab === "desktop" ? "Desktop" : "Mobile"} banners uploaded and saved successfully!`);
      setIsImagesSubmitted(true);
      
      // Refresh banners from API
      const banners = await fetchBannersFromDatabase(activeTab);
      if (activeTab === "desktop") {
        setDesktopBanners(banners.data || banners || []);
      } else {
        setMobileBanners(banners.data || banners || []);
      }

      setTimeout(() => {
        setShowImageUpload(false);
        setUploadedImages([null, null, null, null, null, null]);
        setImagePreviewUrls(["", "", "", "", "", ""]);
        setUploadFields(["", "", "", "", "", ""]);
        setUploadValues(["", "", "", "", "", ""]);
        setIsImagesSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      
      // Show specific error message to user
      const errorMessage = error.message || "Failed to upload banners. Please try again.";
      alert(`Upload Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // =================== DELETE BANNER ===================
  const handleDeleteBanner = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this banner?\n\nThis action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const currentBanner = activeTab === "desktop" ? desktopBanners[index] : mobileBanners[index];
      
      // Delete from database using the banner ID
      const bannerId = currentBanner.id || currentBanner.sliderId;
      if (bannerId) {
        await deleteBannerFromDatabase(activeTab, bannerId);
      }

      // Banner deleted from database via API - refresh from API
      alert("Banner deleted successfully!");
      
      // Refresh banners from API
      const banners = await fetchBannersFromDatabase(activeTab);
      if (activeTab === "desktop") {
        setDesktopBanners(banners.data || banners || []);
      } else {
        setMobileBanners(banners.data || banners || []);
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert(`Failed to delete banner: ${error.message}`);
    }
  };

  // =================== EDIT BANNER ===================
  const handleEditBanner = (index) => {
    setEditingBannerIndex(index);
    const currentBanner = activeTab === "desktop" ? desktopBanners[index] : mobileBanners[index];
    const imageUrl = currentBanner.largeImageURL || currentBanner.url || currentBanner;
    setEditBannerPreview(imageUrl);
    setEditBannerField(currentBanner.field || "");
    setEditBannerValue(currentBanner.value || "");
    setShowEditDialog(true);
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditBannerImage(file);
      const reader = new FileReader();
    reader.onloadend = () => {
        setEditBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEditedBanner = async () => {
    if (editingBannerIndex === null) return;
    
    try {
      const currentBanner = activeTab === "desktop" ? desktopBanners[editingBannerIndex] : mobileBanners[editingBannerIndex];
      const bannerId = currentBanner.id || currentBanner.sliderId;
      
      if (!bannerId) {
        alert("Banner ID not found. Cannot update.");
        return;
      }
      
      // Determine the image URL to use
      let imageUrl = currentBanner.largeImageURL || currentBanner.url;
      
      // If a new image was selected, upload it to S3
      if (editBannerImage) {
        const uploadResult = await uploadFileToS3(editBannerImage, activeTab, true);
        imageUrl = uploadResult.fileUrl;
      }
      
      // Get field and value (use updated values or keep existing ones)
      const field = editBannerField || currentBanner.field || "homepage";
      const value = editBannerValue || currentBanner.value || "banner1";
      
      // Update banner in database with new or existing image URL and updated field/value
      await updateBannerInDatabase(imageUrl, activeTab, bannerId, field, value);

      // Banner updated in database via API - refresh from API
      alert("Banner updated successfully!");
      setShowEditDialog(false);
      setEditingBannerIndex(null);
      setEditBannerImage(null);
      setEditBannerPreview("");
      setEditBannerField("");
      setEditBannerValue("");
      
      // Refresh banners from API
      const banners = await fetchBannersFromDatabase(activeTab);
      if (activeTab === "desktop") {
        setDesktopBanners(banners.data || banners || []);
      } else {
        setMobileBanners(banners.data || banners || []);
      }
    } catch (err) {
      console.error("Error updating banner:", err);
      alert(`Failed to update banner: ${err.message}`);
    }
  };

  const currentBanners = activeTab === "desktop" ? desktopBanners : mobileBanners;

  // =================== FETCH BANNERS ON LOAD ===================
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await fetchBannersFromDatabase(activeTab);
        if (activeTab === "desktop") {
          setDesktopBanners(banners.data || banners || []);
        } else {
          setMobileBanners(banners.data || banners || []);
        }
      } catch (error) {
        console.error("Error loading banners:", error);
        // Set empty arrays on error
        if (activeTab === "desktop") {
          setDesktopBanners([]);
        } else {
          setMobileBanners([]);
        }
      }
    };
    
    loadBanners();
  }, [activeTab]);

  // =================== TAB SWITCH ===================
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setUploadedImages([null, null, null, null, null, null]);
    setImagePreviewUrls(["", "", "", "", "", ""]);
    setUploadFields(["", "", "", "", "", ""]);
    setUploadValues(["", "", "", "", "", ""]);
    setIsImagesSubmitted(false);
  };

  // =================== ADD BANNER BUTTON ===================
  const handleAddBannerClick = () => {
    setShowImageUpload(!showImageUpload);
    setTimeout(() => {
      if (!showImageUpload && uploadSectionRef.current) {
        uploadSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <>
      <div className="banners-page-container">
        <h1 className="banners-page-header">BANNERS</h1>

        {/* Tabs */}
        <div className="banners-tabs-container">
          <button
            className={`banner-tab ${activeTab === "desktop" ? "active" : ""}`}
            onClick={() => handleTabSwitch("desktop")}
          >
            Desktop Banners
          </button>
          <button
            className={`banner-tab ${activeTab === "mobile" ? "active" : ""}`}
            onClick={() => handleTabSwitch("mobile")}
          >
            Mobile Banners
          </button>
        </div>

        <div className="banners-page-subheader">
          <h2>{activeTab === "desktop" ? "DESKTOP BANNERS" : "MOBILE BANNERS"}</h2>
          <button className="banners-page-add-banner-button" onClick={handleAddBannerClick}>
            <Plus /> ADD BANNER
          </button>
        </div>

        {/* Banner Display */}
        <div className="banners-page-top-banners-container">
          {currentBanners.map((banner, index) => {
            // Handle different banner data structures
            const imageUrl = banner.largeImageURL || banner.url || banner;
            const bannerId = banner.id || index;
            
            console.log(`Banner ${index}:`, {
              id: bannerId,
              imageUrl: imageUrl,
              bannerObject: banner
            });
            
              return (
              <div key={bannerId} className="banners-page-banner-container">
                <img 
                  src={imageUrl} 
                  alt={`banner-${index}`}
                  onError={(e) => {
                    console.error(`Failed to load image: ${imageUrl}`);
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image: ${imageUrl}`);
                  }}
                />
                <div className="banner-hover-buttons">
                  <button className="banner-update-btn" onClick={() => handleEditBanner(index)}>
                    UPDATE BANNER
                  </button>
                  <button className="banner-delete-btn" onClick={() => handleDeleteBanner(index)}>
                    DELETE BANNER
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload Section */}
        {showImageUpload && (
          <div className="banner-upload-section" ref={uploadSectionRef}>
            <h2 className="upload-section-title">
              Upload {activeTab === "desktop" ? "Desktop" : "Mobile"} Banners
            </h2>

            <div className="banner-image-upload-grid">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="banner-image-upload-item">
                  <div className="banner-image-upload-number">Banner {index + 1}</div>

                  {imagePreviewUrls[index] ? (
                    <div className="banner-image-preview-wrapper">
                      <img src={imagePreviewUrls[index]} alt="" className="banner-image-preview" />
                      <button
                        className="banner-remove-image-btn"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="banner-image-upload-placeholder">
                      <p>No image selected</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRefs[index]}
                    style={{ display: "none" }}
                    onChange={(e) => handleImageChange(index, e)}
                  />

                  <Button
                    variant="outlined"
                    onClick={() => fileInputRefs[index].current.click()}
                    sx={{
                      marginTop: "10px",
                      color: "#ED1B24",
                      borderColor: "#ED1B24",
                      "&:hover": {
                        borderColor: "#c41620",
                        backgroundColor: "rgba(237, 27, 36, 0.04)"
                      }
                    }}
                    fullWidth
                  >
                    Browse Image
                  </Button>

                  {/* Field Dropdown */}
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "500" }}>
                      Field:
                    </label>
                    <select
                      value={uploadFields[index]}
                      onChange={(e) => {
                        const newFields = [...uploadFields];
                        newFields[index] = e.target.value;
                        setUploadFields(newFields);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                    >
                      <option value="">Select Field</option>
                      <option value="category">Category</option>
                      <option value="brands">Brands</option>
                      <option value="null">Null</option>
                    </select>
                  </div>

                  {/* Value Input */}
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "500" }}>
                      Value:
                    </label>
                    <input
                      type="text"
                      value={uploadValues[index]}
                      onChange={(e) => {
                        const newValues = [...uploadValues];
                        newValues[index] = e.target.value;
                        setUploadValues(newValues);
                      }}
                      placeholder="Enter value"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="banner-submit-images-container">
              <Button
                variant="contained"
                onClick={handleSubmitImages}
                disabled={uploading || !uploadedImages.some((img) => img)}
                sx={{
                  backgroundColor: "#000",
                  color: "white",
                  padding: "12px 40px",
                  fontSize: "16px",
                  fontWeight: "600",
                  "&:hover": { backgroundColor: "#333" }
                }}
              >
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
            </div>
        </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>UPDATE BANNER</DialogTitle>
        <DialogContent dividers>
          <div style={{ textAlign: "center" }}>
            {editBannerPreview && (
              <div style={{ marginBottom: "20px" }}>
                <img
                  src={editBannerPreview}
                  alt="Banner Preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    border: "2px solid #ddd"
                  }}
                />
              </div>
            )}

          <input
            type="file"
              accept="image/*"
              ref={editFileInputRef}
              style={{ display: "none" }}
              onChange={handleEditImageChange}
            />

            <Button
              variant="outlined"
              onClick={() => editFileInputRef.current.click()}
              sx={{
                color: "#ED1B24",
                borderColor: "#ED1B24",
                "&:hover": {
                  borderColor: "#c41620",
                  backgroundColor: "rgba(237, 27, 36, 0.04)"
                }
              }}
              fullWidth
            >
              Browse New Image
            </Button>

            {/* Field Dropdown */}
            <div style={{ marginTop: "20px", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                Field:
              </label>
              <select
                value={editBannerField}
                onChange={(e) => setEditBannerField(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              >
                <option value="">Select Field</option>
                <option value="category">Category</option>
                <option value="brands">Brands</option>
                <option value="null">Null</option>
              </select>
            </div>

            {/* Value Input */}
            <div style={{ marginTop: "15px", textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                Value:
              </label>
              <input
                type="text"
                value={editBannerValue}
                onChange={(e) => setEditBannerValue(e.target.value)}
                placeholder="Enter value"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveEditedBanner}
            variant="contained"
            sx={{ backgroundColor: "#000", "&:hover": { backgroundColor: "#333" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Banners;