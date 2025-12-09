import { useState, useRef, useEffect } from "react";
import "../css/banner.css";
import axios from "axios";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

function ExtraBannerManagement() {
  const [banners, setBanners] = useState([null, null, null, null, null, null, null]); // 7 slots
  const [editingBannerIndex, setEditingBannerIndex] = useState(null);
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editFormData, setEditFormData] = useState({ description: "", redirecturl: "", text: "" });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
  const tableType = "extrabanners"; 

  // FETCH BANNERS FROM DATABASE 
  const fetchBannersFromDatabase = async () => {
    try {
      console.log("Fetching extra banners from database");
      
      // Try new /banners endpoint first, fallback to old endpoint if needed
      let response;
      try {
        response = await axios.get(`${baseUrl}/banners`);
        console.log("Fetched from /banners endpoint:", response.data);
      } catch (err) {
        console.log("New endpoint failed, trying old endpoint:", err);
        response = await axios.get(`${baseUrl}/slider?tableType=${tableType}`);
        console.log("Fetched from old endpoint:", response.data);
      }
      
      const bannersData = response.data.data || response.data || [];
      
      // Initialize banners array with 7 slots, sorted by position
      const bannersArray = [null, null, null, null, null, null, null];
      
      // Fill in existing banners by position
      bannersData.forEach((banner) => {
        // New API uses position (1-7), old API uses index
        const position = banner.position || banner.index || 0;
        const arrayIndex = position - 1; // Convert position (1-7) to array index (0-6)
        
        if (arrayIndex >= 0 && arrayIndex < 7) {
          bannersArray[arrayIndex] = banner;
        }
      });
      
      setBanners(bannersArray);
      
    } catch (error) {
      console.error("Error fetching extra banners from database:", error);
      // Set empty array on error
      setBanners([null, null, null, null, null, null, null]);
    }
  };

  // ======== UPSERT BANNER IN DATABASE ========
  const upsertBanner = async (position, fileUrl, description = "", redirecturl = "", text = "") => {
    try {
      console.log("Upserting banner:", { position, fileUrl, description, redirecturl, text });
      
      const response = await axios.post(`${baseUrl}/banners/upsert`, {
        position,
        imageurl: fileUrl,
        description,
        redirecturl,
        text
      });
      
      console.log("Banner upserted:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error upserting banner:", error);
      throw new Error(`Failed to upsert banner: ${error.message}`);
    }
  };

  // ======== UPDATE BANNER IN DATABASE ========
  const updateBanner = async (position, imageurl, description, redirecturl, text) => {
    try {
      console.log("Updating banner:", { position, imageurl, description, redirecturl, text });
      
      const response = await axios.put(`${baseUrl}/banners/${position}`, {
        imageurl,
        description,
        redirecturl,
        text
      });
      
      console.log("Banner updated:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error updating banner:", error);
      throw new Error(`Failed to update banner: ${error.message}`);
    }
  };

  // ======== DELETE BANNER FROM DATABASE ========
  const deleteBanner = async (position) => {
    try {
      console.log("Deleting banner at position:", position);
      
      const response = await axios.delete(`${baseUrl}/banners/${position}`);
      
      console.log("Banner deleted:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error deleting banner:", error);
      throw new Error(`Failed to delete banner: ${error.message}`);
    }
  };

  // ======== HANDLE UPLOAD FILE LOGIC (Presigned URL) ========
  const uploadFileToS3 = async (file) => {
    try {
      console.log("Starting upload for file:", file.name);
      
      const fileExtension = file.name.split(".").pop().toLowerCase();
      console.log("File extension:", fileExtension);
      
      // Step 1: Get pre-signed URL from API
      const presignRes = await axios.post(`${baseUrl}/banners/upload-url`, {
        fileExtension
      });

      console.log("Pre-signed URL response:", presignRes.data);
      
      if (!presignRes.data || !presignRes.data.data) {
        throw new Error("Invalid response from upload-url API");
      }

      const { uploadUrl, fileUrl, contentType } = presignRes.data.data;
      console.log("Upload URL:", uploadUrl);
      console.log("File URL:", fileUrl);
      console.log("Content Type:", contentType);

      // Step 2: Upload file to S3 using pre-signed URL
      console.log("Uploading file to S3...");
      
      // Use fetch for S3 upload as it handles presigned URLs better
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType || file.type
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("S3 upload failed:", uploadResponse.status, errorText);
        throw new Error(`S3 upload failed: ${uploadResponse.status} ${errorText}`);
      }

      console.log("S3 upload successful:", uploadResponse.status);
      
      // Return fileUrl for next step
      return { fileUrl };
      
    } catch (err) {
      console.error("Error uploading file:", err);
      
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        console.error("Response headers:", err.response.headers);
      }
      
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

  // =================== HANDLE EDIT BANNER ===================
  const handleEditBanner = (index) => {
    const banner = banners[index];
    if (!banner) return;
    
    setEditingBanner({ index, position: index + 1, ...banner });
    setEditFormData({
      description: banner.description || "",
      redirecturl: banner.redirecturl || "",
      text: banner.text || ""
    });
    setEditDialogOpen(true);
  };

  // =================== HANDLE UPDATE BANNER ===================
  const handleUpdateBanner = async () => {
    if (!editingBanner) return;

    try {
      setUpdating(true);
      const position = editingBanner.position;
      const imageurl = editingBanner.imageurl || editingBanner.largeImageURL || editingBanner.url || "";
      
      await updateBanner(
        position,
        imageurl,
        editFormData.description,
        editFormData.redirecturl,
        editFormData.text
      );

      // Refresh banners from API
      await fetchBannersFromDatabase();
      
      alert("Banner updated successfully!");
      setEditDialogOpen(false);
      setEditingBanner(null);
      setEditFormData({ description: "", redirecturl: "", text: "" });
      
    } catch (err) {
      console.error("Error updating banner:", err);
      alert(`Failed to update banner: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // =================== HANDLE DELETE BANNER ===================
  const handleDeleteBanner = async (index) => {
    const banner = banners[index];
    if (!banner) return;

    const position = index + 1;
    const confirmDelete = window.confirm(`Are you sure you want to delete Banner ${position}? This action cannot be undone.`);
    
    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(position);
      
      await deleteBanner(position);

      // Refresh banners from API
      await fetchBannersFromDatabase();
      
      alert("Banner deleted successfully!");
      
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert(`Failed to delete banner: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // =================== HANDLE IMAGE SELECTION ===================
  const handleImageChange = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setEditingBannerIndex(index);

      // Step 1 & 2: Upload file to S3 (gets presigned URL and uploads)
      const uploadResult = await uploadFileToS3(file);

      // Step 3: Upsert banner with position, imageurl, and default metadata
      const position = index + 1; // Banner positions start at 1
      const currentBanner = banners[index];
      
      // Use existing banner metadata if available, otherwise use defaults
      const description = currentBanner?.description || "";
      const redirecturl = currentBanner?.redirecturl || "";
      const text = currentBanner?.text || "";

      await upsertBanner(position, uploadResult.fileUrl, description, redirecturl, text);

      // Refresh banners from API
      await fetchBannersFromDatabase();
      
      alert("Banner updated successfully!");
      
    } catch (err) {
      console.error("Error updating banner:", err);
      alert(`Failed to update banner: ${err.message}`);
    } finally {
      setUploading(false);
      setEditingBannerIndex(null);
      // Reset file input
      if (fileInputRefs[index].current) {
        fileInputRefs[index].current.value = "";
      }
    }
  };

  // =================== FETCH BANNERS ON LOAD ===================
  useEffect(() => {
    fetchBannersFromDatabase();
  }, []);

  return (
    <div className="banners-page-container">
      <h1 className="banners-page-header">EXTRA BANNER MANAGEMENT</h1>

      <div className="banners-page-subheader">
        <h2>EXTRA BANNERS (7 Slots)</h2>
      </div>

      {/* Banner Display - 7 Fixed Slots */}
      <div className="banners-page-top-banners-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => {
          const banner = banners[index];
          // Handle both new API format (imageurl) and old format (largeImageURL, url)
          const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
          const bannerId = banner?.id || banner?.sliderId;
          
          return (
            <div key={index} className="banners-page-banner-container" style={{ position: "relative", minHeight: "200px" }}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`Extra Banner ${index + 1}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${imageUrl}`);
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "200px", 
                  backgroundColor: "#f5f5f5", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  border: "2px dashed #ddd"
                }}>
                  <p style={{ color: "#999" }}>No Banner</p>
                </div>
              )}
              
              <div className="banner-hover-buttons" style={{ 
                position: "absolute", 
                bottom: "10px", 
                left: "50%", 
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center"
              }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRefs[index]}
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(index, e)}
                  disabled={uploading || editingBannerIndex === index}
                />
                <Button
                  variant="contained"
                  onClick={() => fileInputRefs[index].current?.click()}
                  disabled={uploading || editingBannerIndex === index}
                  sx={{
                    backgroundColor: "#000",
                    color: "white",
                    fontSize: "12px",
                    padding: "6px 16px",
                    "&:hover": { backgroundColor: "#333" },
                    "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                  }}
                >
                  {uploading && editingBannerIndex === index ? "Uploading..." : "Browse Image"}
                </Button>
                {banner && (
                  <>
                    {/* <Button
                      variant="contained"
                      onClick={() => handleEditBanner(index)}
                      disabled={uploading || editingBannerIndex === index || updating}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        fontSize: "12px",
                        padding: "6px 16px",
                        "&:hover": { backgroundColor: "#1565c0" },
                        "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                      }}
                    >
                      Update
                    </Button> */}
                    <Button
                      variant="contained"
                      onClick={() => handleDeleteBanner(index)}
                      disabled={uploading || editingBannerIndex === index || deleting === index + 1}
                      sx={{
                        backgroundColor: "#d32f2f",
                        color: "white",
                        fontSize: "12px",
                        padding: "6px 16px",
                        "&:hover": { backgroundColor: "#c62828" },
                        "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                      }}
                    >
                      {deleting === index + 1 ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                )}
              </div>
              
              <div style={{ 
                position: "absolute", 
                top: "10px", 
                left: "10px", 
                backgroundColor: "rgba(0,0,0,0.7)", 
                color: "white", 
                padding: "4px 8px", 
                borderRadius: "4px",
                fontSize: "12px"
              }}>
                Banner {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Banner Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Banner {editingBanner?.position}</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            placeholder="Enter banner description"
          />
          <TextField
            margin="normal"
            label="Redirect URL"
            fullWidth
            value={editFormData.redirecturl}
            onChange={(e) => setEditFormData({ ...editFormData, redirecturl: e.target.value })}
            placeholder="https://example.com"
          />
          <TextField
            margin="normal"
            label="Text"
            fullWidth
            value={editFormData.text}
            onChange={(e) => setEditFormData({ ...editFormData, text: e.target.value })}
            placeholder="Button text or banner text"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setEditingBanner(null);
            setEditFormData({ description: "", redirecturl: "", text: "" });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateBanner} 
            variant="contained"
            disabled={updating}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" }
            }}
          >
            {updating ? "Updating..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ExtraBannerManagement;
