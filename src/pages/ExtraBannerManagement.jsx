import { useState, useRef, useEffect } from "react";
import "../css/banner.css";
import axios from "axios";
import { Button } from "@mui/material";

function ExtraBannerManagement() {
  const [banners, setBanners] = useState([null, null, null, null, null, null, null]); // 7 slots
  const [editingBannerIndex, setEditingBannerIndex] = useState(null);
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

//   const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
  const tableType = "extrabanners"; // Change this to match your API tableType

  // ======== FETCH BANNERS FROM DATABASE ========
  const fetchBannersFromDatabase = async () => {
    try {
      console.log("Fetching extra banners from database:", tableType);
      
      const response = await axios.get(`${baseUrl}/slider?tableType=${tableType}`);
      
      console.log("Extra banners fetched from database:", response.data);
      const bannersData = response.data.data || response.data || [];
      
      // Initialize banners array with 7 slots
      const bannersArray = [null, null, null, null, null, null, null];
      
      // Fill in existing banners
      bannersData.forEach((banner, index) => {
        if (index < 7) {
          bannersArray[index] = banner;
        }
      });
      
      setBanners(bannersArray);
      
    } catch (error) {
      console.error("Error fetching extra banners from database:", error);
      // Set empty array on error
      setBanners([null, null, null, null, null, null, null]);
    }
  };

  // ======== CREATE BANNER IN DATABASE ========
  const createBannerInDatabase = async (fileUrl, field = "homepage", value = "banner1") => {
    try {
      console.log("Creating extra banner in database:", fileUrl);
      
      const response = await axios.post(`${baseUrl}/slider?tableType=${tableType}`, {
        tableType: tableType,
        largeImageURL: fileUrl,
        field: field || "homepage",
        value: value || "banner1"
      });
      
      console.log("Extra banner created in database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error creating extra banner in database:", error);
      throw new Error(`Failed to create extra banner in database: ${error.message}`);
    }
  };

  // ======== UPDATE BANNER IN DATABASE ========
  const updateBannerInDatabase = async (fileUrl, sliderId, field = "homepage", value = "banner1") => {
    try {
      console.log("Updating extra banner in database:", fileUrl, sliderId);
      
      const response = await axios.put(`${baseUrl}/slider/${sliderId}?tableType=${tableType}`, {
        tableType: tableType,
        largeImageURL: fileUrl,
        field: field,
        value: value
      });
      
      console.log("Extra banner updated in database:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error updating extra banner in database:", error);
      throw new Error(`Failed to update extra banner in database: ${error.message}`);
    }
  };

  // ======== HANDLE UPLOAD FILE LOGIC (Presigned URL) ========
  const uploadFileToS3 = async (file) => {
    try {
      console.log("Starting upload for file:", file.name);
      
      const fileExtension = file.name.split(".").pop();
      console.log("File extension:", fileExtension);
      
      // Get pre-signed URL from your API
      const presignRes = await axios.post(`${baseUrl}/upload-url`, {
        tableType: tableType,
        fileExtension,
        contentType: 'image/jpg',
        fileName: file.name
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
      
      // For updates, just return the fileUrl
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

  // =================== HANDLE IMAGE SELECTION ===================
  const handleImageChange = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setEditingBannerIndex(index);

      // Upload new image to S3
      const uploadResult = await uploadFileToS3(file);

      // Get current banner (if exists)
      const currentBanner = banners[index];
      const bannerId = currentBanner?.id || currentBanner?.sliderId;

      if (bannerId) {
        // Update existing banner
        const field = currentBanner.field || "homepage";
        const value = currentBanner.value || "banner1";
        await updateBannerInDatabase(uploadResult.fileUrl, bannerId, field, value);
      } else {
        // Create new banner for empty slot
        await createBannerInDatabase(uploadResult.fileUrl, "homepage", "banner1");
      }

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
          const imageUrl = banner?.largeImageURL || banner?.url || null;
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
                gap: "10px"
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
    </div>
  );
}

export default ExtraBannerManagement;
