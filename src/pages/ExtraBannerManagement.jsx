import { useState, useRef, useEffect } from "react";
import "../css/banner.css";
import axios from "axios";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

function ExtraBannerManagement() {
  const [banners, setBanners] = useState([null, null, null, null, null, null, null, null, null]); // 9 slots
  const [bestSellersBanners, setBestSellersBanners] = useState([null, null, null, null, null]); // 5 slots (positions 10-14)
  const [entertainmentBanners, setEntertainmentBanners] = useState([null, null, null, null]); // 4 slots (positions 15-18)
  const [appliancesBanners, setAppliancesBanners] = useState([null, null, null, null]); // 4 slots (positions 19-22)
  const [digitalProductsBanners, setDigitalProductsBanners] = useState([null, null, null, null]); // 4 slots (positions 23-26)
  const [kitchenAppliancesBanners, setKitchenAppliancesBanners] = useState([null, null, null, null, null, null, null, null]); // 8 slots (positions 27-34)
  const [lifestyleProductsBanners, setLifestyleProductsBanners] = useState([null, null, null, null]); // 4 slots (positions 35-38)
  const [popularBrandsBanners, setPopularBrandsBanners] = useState(Array(30).fill(null)); // 30 slots (positions 39-68)
  const [selectedSection, setSelectedSection] = useState("extra"); // "extra", "bestsellers", "entertainment", "appliances", "digitalproducts", "kitchenappliances", "lifestyleproducts", "popularbrands"
  const [editingBannerIndex, setEditingBannerIndex] = useState(null);
  const [editingBannerSection, setEditingBannerSection] = useState(null); // Track which section is being edited
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [editBannerPreview, setEditBannerPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editFormData, setEditFormData] = useState({ description: "", redirecturl: "", text: "" });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null); // Track which section is being deleted
  // Per-slot redirect URL (key: "section_index", e.g. "extra_0") - used when uploading and shown in input
  const [slotRedirectUrls, setSlotRedirectUrls] = useState({});
  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const bestSellersFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const entertainmentFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const appliancesFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const digitalProductsFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const kitchenAppliancesFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const lifestyleProductsFileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const popularBrandsFileInputRefs = Array(30).fill(null).map(() => useRef(null));

  const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
  const tableType = "extrabanners";

  // Define supported positions based on database constraints
  // Update this array based on what the backend database actually supports
  // If all positions 1-68 are supported, you can remove this validation
  const SUPPORTED_POSITIONS = {
    min: 1,
    max: 68, // Update this based on your database constraint
    // You can also specify exact positions if needed:
    // allowed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68]
  };

  // Validate position before sending to API
  const validatePosition = (position) => {
    const pos = typeof position === 'string' ? parseInt(position, 10) : position;

    if (isNaN(pos) || pos < SUPPORTED_POSITIONS.min || pos > SUPPORTED_POSITIONS.max) {
      return {
        valid: false,
        error: `Position ${position} is not supported. Valid range is ${SUPPORTED_POSITIONS.min}-${SUPPORTED_POSITIONS.max}. Please contact backend developer to update the database constraint 'chk_position' if you need to use position ${position}.`
      };
    }

    return { valid: true };
  };

  // FETCH BANNERS FROM DATABASE 
  const fetchBannersFromDatabase = async () => {
    try {
      console.log("Fetching banners from database");

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

      // Initialize arrays for all sections
      const extraBannersArray = [null, null, null, null, null, null, null, null, null]; // 9 slots (positions 1-9)
      const bestSellersArray = [null, null, null, null, null]; // 5 slots (positions 10-14)
      const entertainmentArray = [null, null, null, null]; // 4 slots (positions 15-18)
      const appliancesArray = [null, null, null, null]; // 4 slots (positions 19-22)
      const digitalProductsArray = [null, null, null, null]; // 4 slots (positions 23-26)
      const kitchenAppliancesArray = [null, null, null, null, null, null, null, null]; // 8 slots (positions 27-34)
      const lifestyleProductsArray = [null, null, null, null]; // 4 slots (positions 35-38)
      const popularBrandsArray = Array(30).fill(null); // 30 slots (positions 39-68)

      // Fill in existing banners by position
      bannersData.forEach((banner) => {
        const position = banner.position || banner.index || 0;

        if (position >= 1 && position <= 9) {
          // Extra Banners section (positions 1-9)
          const arrayIndex = position - 1; // Convert position (1-9) to array index (0-8)
          extraBannersArray[arrayIndex] = banner;
        } else if (position >= 10 && position <= 14) {
          // Best Sellers section (positions 10-14)
          const arrayIndex = position - 10; // Convert position (10-14) to array index (0-4)
          bestSellersArray[arrayIndex] = banner;
        } else if (position >= 15 && position <= 18) {
          // Entertainment section (positions 15-18)
          const arrayIndex = position - 15; // Convert position (15-18) to array index (0-3)
          entertainmentArray[arrayIndex] = banner;
        } else if (position >= 19 && position <= 22) {
          // Appliances section (positions 19-22)
          const arrayIndex = position - 19; // Convert position (19-22) to array index (0-3)
          appliancesArray[arrayIndex] = banner;
        } else if (position >= 23 && position <= 26) {
          // Digital Products section (positions 23-26)
          const arrayIndex = position - 23; // Convert position (23-26) to array index (0-3)
          digitalProductsArray[arrayIndex] = banner;
        } else if (position >= 27 && position <= 34) {
          // Kitchen Appliances section (positions 27-34)
          const arrayIndex = position - 27; // Convert position (27-34) to array index (0-7)
          kitchenAppliancesArray[arrayIndex] = banner;
        } else if (position >= 35 && position <= 38) {
          // Lifestyle Products section (positions 35-38)
          const arrayIndex = position - 35; // Convert position (35-38) to array index (0-3)
          lifestyleProductsArray[arrayIndex] = banner;
        } else if (position >= 39 && position <= 68) {
          // Popular Brands section (positions 39-68)
          const arrayIndex = position - 39; // Convert position (39-68) to array index (0-29)
          popularBrandsArray[arrayIndex] = banner;
        }
      });

      setBanners(extraBannersArray);
      setBestSellersBanners(bestSellersArray);
      setEntertainmentBanners(entertainmentArray);
      setAppliancesBanners(appliancesArray);
      setDigitalProductsBanners(digitalProductsArray);
      setKitchenAppliancesBanners(kitchenAppliancesArray);
      setLifestyleProductsBanners(lifestyleProductsArray);
      setPopularBrandsBanners(popularBrandsArray);

    } catch (error) {
      console.error("Error fetching banners from database:", error);
      // Set empty arrays on error
      setBanners([null, null, null, null, null, null, null, null, null]);
      setBestSellersBanners([null, null, null, null, null]);
      setEntertainmentBanners([null, null, null, null]);
      setAppliancesBanners([null, null, null, null]);
      setDigitalProductsBanners([null, null, null, null]);
      setKitchenAppliancesBanners([null, null, null, null, null, null, null, null]);
      setLifestyleProductsBanners([null, null, null, null]);
      setPopularBrandsBanners(Array(30).fill(null));
    }
  };

  // ======== UPSERT BANNER IN DATABASE ========
  const upsertBanner = async (position, fileUrl, description = "", redirecturl = "", text = "") => {
    try {
      console.log("Upserting banner:", { position, fileUrl, description, redirecturl, text });

      // Validate position before sending
      const validation = validatePosition(position);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Ensure position is a number
      const positionNum = typeof position === 'string' ? parseInt(position, 10) : position;

      const response = await axios.post(`${baseUrl}/banners/upsert`, {
        position: positionNum,
        imageurl: fileUrl,
        description: description || "",
        redirecturl: redirecturl || "",
        text: text || ""
      });

      console.log("Banner upserted:", response.data);
      return response.data;

    } catch (error) {
      console.error("Error upserting banner:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Provide more detailed error message
      let errorMessage = `Failed to upsert banner: ${error.message}`;

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage += ` - ${JSON.stringify(errorData)}`;

        // Check for database constraint violation
        if (errorData.error && errorData.error.includes("chk_position")) {
          errorMessage = `Database constraint violation: Position ${position} is not allowed by the database constraint 'chk_position'. `;
          errorMessage += `The backend database only supports positions ${SUPPORTED_POSITIONS.min}-${SUPPORTED_POSITIONS.max}. `;
          errorMessage += `Please contact the backend developer to update the database constraint to allow position ${position}.`;
        }
      }

      if (error.response?.status === 500 && !errorMessage.includes("constraint")) {
        errorMessage += ` - Server error. The backend database constraint 'chk_position' may not allow position ${position}. `;
        errorMessage += `Please verify with backend developer which positions are supported (currently configured: ${SUPPORTED_POSITIONS.min}-${SUPPORTED_POSITIONS.max}).`;
      }

      throw new Error(errorMessage);
    }
  };

  // ======== UPDATE BANNER IN DATABASE ========
  const updateBanner = async (position, imageurl, description, redirecturl, text) => {
    try {
      console.log("Updating banner:", { position, imageurl, description, redirecturl, text });

      // Validate position before sending
      const validation = validatePosition(position);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Ensure position is a number
      const positionNum = typeof position === 'string' ? parseInt(position, 10) : position;

      const response = await axios.put(`${baseUrl}/banners/${positionNum}`, {
        imageurl: imageurl || "",
        description: description || "",
        redirecturl: redirecturl || "",
        text: text || ""
      });

      console.log("Banner updated:", response.data);
      return response.data;

    } catch (error) {
      console.error("Error updating banner:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Provide more detailed error message
      let errorMessage = `Failed to update banner: ${error.message}`;

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage += ` - ${JSON.stringify(errorData)}`;

        // Check for database constraint violation
        if (errorData.error && errorData.error.includes("chk_position")) {
          errorMessage = `Database constraint violation: Position ${position} is not allowed by the database constraint 'chk_position'. `;
          errorMessage += `The backend database only supports positions ${SUPPORTED_POSITIONS.min}-${SUPPORTED_POSITIONS.max}. `;
          errorMessage += `Please contact the backend developer to update the database constraint to allow position ${position}.`;
        }
      }

      if (error.response?.status === 500 && !errorMessage.includes("constraint")) {
        errorMessage += ` - Server error. The backend database constraint 'chk_position' may not allow position ${position}. `;
        errorMessage += `Please verify with backend developer which positions are supported (currently configured: ${SUPPORTED_POSITIONS.min}-${SUPPORTED_POSITIONS.max}).`;
      }

      throw new Error(errorMessage);
    }
  };

  // ======== DELETE BANNER FROM DATABASE ========
  const deleteBanner = async (position) => {
    try {
      console.log("Deleting banner at position:", position);

      // Ensure position is a number
      const positionNum = typeof position === 'string' ? parseInt(position, 10) : position;

      const response = await axios.delete(`${baseUrl}/banners/${positionNum}`);

      console.log("Banner deleted:", response.data);
      return response.data;

    } catch (error) {
      console.error("Error deleting banner:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Provide more detailed error message
      let errorMessage = `Failed to delete banner: ${error.message}`;
      if (error.response?.data) {
        errorMessage += ` - ${JSON.stringify(error.response.data)}`;
      }
      if (error.response?.status === 500) {
        errorMessage += ` - Server error. The backend may not support position ${position} yet.`;
      }

      throw new Error(errorMessage);
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
      setSlotRedirectUrls((prev) => {
        const next = { ...prev };
        if (editingBanner?.index !== undefined) delete next[`extra_${editingBanner.index}`];
        return next;
      });

    } catch (err) {
      console.error("Error updating banner:", err);
      alert(`Failed to update banner: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // =================== HANDLE DELETE BANNER ===================
  const handleDeleteBanner = async (index, section = "extra") => {
    let banner, position;

    if (section === "bestsellers") {
      banner = bestSellersBanners[index];
      position = index + 10; // Positions 10-14
    } else if (section === "entertainment") {
      banner = entertainmentBanners[index];
      position = index + 15; // Positions 15-18
    } else if (section === "appliances") {
      banner = appliancesBanners[index];
      position = index + 19; // Positions 19-22
    } else if (section === "digitalproducts") {
      banner = digitalProductsBanners[index];
      position = index + 23; // Positions 23-26
    } else if (section === "kitchenappliances") {
      banner = kitchenAppliancesBanners[index];
      position = index + 27; // Positions 27-34
    } else if (section === "lifestyleproducts") {
      banner = lifestyleProductsBanners[index];
      position = index + 35; // Positions 35-38
    } else if (section === "popularbrands") {
      banner = popularBrandsBanners[index];
      position = index + 39; // Positions 39-68
    } else {
      banner = banners[index];
      position = index + 1; // Positions 1-9
    }

    if (!banner) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete Banner ${position}? This action cannot be undone.`);

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(position);
      setDeletingSection(section);

      await deleteBanner(position);

      // Refresh banners from API
      await fetchBannersFromDatabase();

      alert("Banner deleted successfully!");

    } catch (err) {
      console.error("Error deleting banner:", err);
      alert(`Failed to delete banner: ${err.message}`);
    } finally {
      setDeleting(null);
      setDeletingSection(null);
    }
  };

  // =================== HANDLE IMAGE SELECTION ===================
  const handleImageChange = async (index, event, section = "extra") => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setEditingBannerIndex(index);
      setEditingBannerSection(section);

      // Step 1 & 2: Upload file to S3 (gets presigned URL and uploads)
      const uploadResult = await uploadFileToS3(file);

      // Step 3: Upsert banner with position, imageurl, and default metadata
      let position, currentBanner;

      if (section === "bestsellers") {
        position = index + 10; // Positions 10-14
        currentBanner = bestSellersBanners[index];
      } else if (section === "entertainment") {
        position = index + 15; // Positions 15-18
        currentBanner = entertainmentBanners[index];
      } else if (section === "appliances") {
        position = index + 19; // Positions 19-22
        currentBanner = appliancesBanners[index];
      } else if (section === "digitalproducts") {
        position = index + 23; // Positions 23-26
        currentBanner = digitalProductsBanners[index];
      } else if (section === "kitchenappliances") {
        position = index + 27; // Positions 27-34
        currentBanner = kitchenAppliancesBanners[index];
      } else if (section === "lifestyleproducts") {
        position = index + 35; // Positions 35-38
        currentBanner = lifestyleProductsBanners[index];
      } else if (section === "popularbrands") {
        position = index + 39; // Positions 39-68
        currentBanner = popularBrandsBanners[index];
      } else {
        position = index + 1; // Positions 1-9
        currentBanner = banners[index];
      }

      // Use slot input value first, then existing banner metadata, then empty
      const slotKey = `${section}_${index}`;
      const description = currentBanner?.description || "";
      const redirecturl = (slotRedirectUrls[slotKey] !== undefined ? slotRedirectUrls[slotKey] : (currentBanner?.redirecturl || "")) || "";
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
      setEditingBannerSection(null);
      // Reset file input
      if (section === "bestsellers") {
        if (bestSellersFileInputRefs[index].current) {
          bestSellersFileInputRefs[index].current.value = "";
        }
      } else if (section === "entertainment") {
        if (entertainmentFileInputRefs[index].current) {
          entertainmentFileInputRefs[index].current.value = "";
        }
      } else if (section === "appliances") {
        if (appliancesFileInputRefs[index].current) {
          appliancesFileInputRefs[index].current.value = "";
        }
      } else if (section === "digitalproducts") {
        if (digitalProductsFileInputRefs[index].current) {
          digitalProductsFileInputRefs[index].current.value = "";
        }
      } else if (section === "kitchenappliances") {
        if (kitchenAppliancesFileInputRefs[index].current) {
          kitchenAppliancesFileInputRefs[index].current.value = "";
        }
      } else if (section === "lifestyleproducts") {
        if (lifestyleProductsFileInputRefs[index].current) {
          lifestyleProductsFileInputRefs[index].current.value = "";
        }
      } else if (section === "popularbrands") {
        if (popularBrandsFileInputRefs[index].current) {
          popularBrandsFileInputRefs[index].current.value = "";
        }
      } else {
        if (fileInputRefs[index].current) {
          fileInputRefs[index].current.value = "";
        }
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

      {/* Section Selector Dropdown */}
      <div style={{
        marginBottom: "20px",
        padding: "15px 0",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <label style={{
          marginRight: "10px",
          fontSize: "16px",
          fontWeight: "600"
        }}>
          Select Section:
        </label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          style={{
            padding: "10px 15px",
            fontSize: "14px",
            border: "1px solid #000",
            borderRadius: "6px",
            backgroundColor: "white",
            cursor: "pointer",
            minWidth: "300px",
            fontWeight: "500"
          }}
        >
          <option value="extra">Extra Banners (9 Slots)</option>
          <option value="bestsellers">Khosla Electronics Best Sellers (5 Slots)</option>
          <option value="entertainment">ENTERTAINMENT (4 Slots)</option>
          <option value="appliances">APPLIANCES (4 Slots)</option>
          <option value="digitalproducts">DIGITAL PRODUCTS (4 Slots)</option>
          <option value="kitchenappliances">KITCHEN APPLIANCES (8 Slots)</option>
          <option value="lifestyleproducts">LIFESTYLE PRODUCTS (4 Slots)</option>
          <option value="popularbrands">POPULAR BRANDS (30 Slots)</option>
        </select>
      </div>

      {/* Extra Banners Section */}
      {selectedSection === "extra" && (
        <>
          <div className="banners-page-subheader">
            <h2>EXTRA BANNERS (9 Slots)</h2>
          </div>

          {/* Banner Display - 9 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
              const banner = banners[index];
              // Handle both new API format (imageurl) and old format (largeImageURL, url)
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const bannerId = banner?.id || banner?.sliderId;

              return (
                <div key={index} className="banners-page-banner-container" style={{ position: "relative", minHeight: "200px" }}>
                  <div style={{ position: "relative" }}>
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
                        onChange={(e) => handleImageChange(index, e, "extra")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "extra")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => fileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "extra")}
                        sx={{
                          backgroundColor: "#000",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#333" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "extra" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => handleDeleteBanner(index, "extra")}
                            disabled={uploading || (editingBannerIndex === index && editingBannerSection === "extra") || (deleting === index + 1 && deletingSection === "extra")}
                            sx={{
                              backgroundColor: "#d32f2f",
                              color: "white",
                              fontSize: "12px",
                              padding: "6px 16px",
                              "&:hover": { backgroundColor: "#c62828" },
                              "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                            }}
                          >
                            {(deleting === index + 1 && deletingSection === "extra") ? "Deleting..." : "Delete"}
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
                  <div style={{ padding: "8px", backgroundColor: "#fafafa", borderTop: "1px solid #eee" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`extra_${index}`] !== undefined ? slotRedirectUrls[`extra_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`extra_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Best Sellers Section */}
      {selectedSection === "bestsellers" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#1976d2" }}>
            <h2 style={{ color: "#1976d2" }}>Khosla Electronics Best Sellers (5 Slots)</h2>
          </div>

          {/* Best Sellers Banner Display - 5 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#1976d2"
          }}>
            {[0, 1, 2, 3, 4].map((index) => {
              const banner = bestSellersBanners[index];
              // Handle both new API format (imageurl) and old format (largeImageURL, url)
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const bannerId = banner?.id || banner?.sliderId;
              const position = index + 10; // Positions 10-14

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #1976d2",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Best Seller Banner ${position}`}
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
                        backgroundColor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #1976d2"
                      }}>
                        <p style={{ color: "#1976d2", fontWeight: "500" }}>No Banner</p>
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
                        ref={bestSellersFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "bestsellers")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "bestsellers")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => bestSellersFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "bestsellers")}
                        sx={{
                          backgroundColor: "#1976d2",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#1565c0" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "bestsellers" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "bestsellers")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "bestsellers") || (deleting === position && deletingSection === "bestsellers")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "bestsellers") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(25, 118, 210, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#e3f2fd", borderTop: "1px solid #1976d2" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`bestsellers_${index}`] !== undefined ? slotRedirectUrls[`bestsellers_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`bestsellers_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Entertainment Section */}
      {selectedSection === "entertainment" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#9c27b0" }}>
            <h2 style={{ color: "#9c27b0" }}>ENTERTAINMENT (4 Slots)</h2>
          </div>

          {/* Entertainment Banner Display - 4 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#9c27b0"
          }}>
            {[0, 1, 2, 3].map((index) => {
              const banner = entertainmentBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 15; // Positions 15-18

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #9c27b0",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Entertainment Banner ${position}`}
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
                        backgroundColor: "#f3e5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #9c27b0"
                      }}>
                        <p style={{ color: "#9c27b0", fontWeight: "500" }}>No Banner</p>
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
                        ref={entertainmentFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "entertainment")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "entertainment")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => entertainmentFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "entertainment")}
                        sx={{
                          backgroundColor: "#9c27b0",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#7b1fa2" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "entertainment" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "entertainment")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "entertainment") || (deleting === position && deletingSection === "entertainment")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "entertainment") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(156, 39, 176, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#f3e5f5", borderTop: "1px solid #9c27b0" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`entertainment_${index}`] !== undefined ? slotRedirectUrls[`entertainment_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`entertainment_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Appliances Section */}
      {selectedSection === "appliances" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#2e7d32" }}>
            <h2 style={{ color: "#2e7d32" }}>APPLIANCES (4 Slots)</h2>
          </div>

          {/* Appliances Banner Display - 4 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#2e7d32"
          }}>
            {[0, 1, 2, 3].map((index) => {
              const banner = appliancesBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 19; // Positions 19-22

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #2e7d32",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Appliances Banner ${position}`}
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
                        backgroundColor: "#e8f5e9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #2e7d32"
                      }}>
                        <p style={{ color: "#2e7d32", fontWeight: "500" }}>No Banner</p>
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
                        ref={appliancesFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "appliances")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "appliances")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => appliancesFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "appliances")}
                        sx={{
                          backgroundColor: "#2e7d32",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#1b5e20" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "appliances" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "appliances")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "appliances") || (deleting === position && deletingSection === "appliances")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "appliances") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(46, 125, 50, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#e8f5e9", borderTop: "1px solid #2e7d32" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`appliances_${index}`] !== undefined ? slotRedirectUrls[`appliances_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`appliances_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Digital Products Section */}
      {selectedSection === "digitalproducts" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#f57c00" }}>
            <h2 style={{ color: "#f57c00" }}>DIGITAL PRODUCTS (4 Slots)</h2>
          </div>

          {/* Digital Products Banner Display - 4 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#f57c00"
          }}>
            {[0, 1, 2, 3].map((index) => {
              const banner = digitalProductsBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 23; // Positions 23-26

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #f57c00",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Digital Products Banner ${position}`}
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
                        backgroundColor: "#fff3e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #f57c00"
                      }}>
                        <p style={{ color: "#f57c00", fontWeight: "500" }}>No Banner</p>
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
                        ref={digitalProductsFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "digitalproducts")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "digitalproducts")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => digitalProductsFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "digitalproducts")}
                        sx={{
                          backgroundColor: "#f57c00",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#e65100" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "digitalproducts" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "digitalproducts")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "digitalproducts") || (deleting === position && deletingSection === "digitalproducts")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "digitalproducts") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(245, 124, 0, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#fff3e0", borderTop: "1px solid #f57c00" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`digitalproducts_${index}`] !== undefined ? slotRedirectUrls[`digitalproducts_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`digitalproducts_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Kitchen Appliances Section */}
      {selectedSection === "kitchenappliances" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#d32f2f" }}>
            <h2 style={{ color: "#d32f2f" }}>KITCHEN APPLIANCES (8 Slots)</h2>
          </div>

          {/* Kitchen Appliances Banner Display - 8 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#d32f2f"
          }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
              const banner = kitchenAppliancesBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 27; // Positions 27-34

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #d32f2f",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Kitchen Appliances Banner ${position}`}
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
                        backgroundColor: "#ffebee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #d32f2f"
                      }}>
                        <p style={{ color: "#d32f2f", fontWeight: "500" }}>No Banner</p>
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
                        ref={kitchenAppliancesFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "kitchenappliances")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "kitchenappliances")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => kitchenAppliancesFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "kitchenappliances")}
                        sx={{
                          backgroundColor: "#d32f2f",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#b71c1c" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "kitchenappliances" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "kitchenappliances")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "kitchenappliances") || (deleting === position && deletingSection === "kitchenappliances")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#b71c1c" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "kitchenappliances") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(211, 47, 47, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#ffebee", borderTop: "1px solid #d32f2f" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`kitchenappliances_${index}`] !== undefined ? slotRedirectUrls[`kitchenappliances_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`kitchenappliances_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Lifestyle Products Section */}
      {selectedSection === "lifestyleproducts" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#00acc1" }}>
            <h2 style={{ color: "#00acc1" }}>LIFESTYLE PRODUCTS (4 Slots)</h2>
          </div>

          {/* Lifestyle Products Banner Display - 4 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            borderBottomColor: "#00acc1"
          }}>
            {[0, 1, 2, 3].map((index) => {
              const banner = lifestyleProductsBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 35; // Positions 35-38

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "200px",
                    border: "2px solid #00acc1",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Lifestyle Products Banner ${position}`}
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
                        backgroundColor: "#e0f7fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #00acc1"
                      }}>
                        <p style={{ color: "#00acc1", fontWeight: "500" }}>No Banner</p>
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
                        ref={lifestyleProductsFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "lifestyleproducts")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "lifestyleproducts")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => lifestyleProductsFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "lifestyleproducts")}
                        sx={{
                          backgroundColor: "#00acc1",
                          color: "white",
                          fontSize: "12px",
                          padding: "6px 16px",
                          "&:hover": { backgroundColor: "#00838f" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "lifestyleproducts" ? "Uploading..." : "Browse Image"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "lifestyleproducts")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "lifestyleproducts") || (deleting === position && deletingSection === "lifestyleproducts")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "12px",
                            padding: "6px 16px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "lifestyleproducts") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(0, 172, 193, 0.9)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      Banner {position}
                    </div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "#e0f7fa", borderTop: "1px solid #00acc1" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`lifestyleproducts_${index}`] !== undefined ? slotRedirectUrls[`lifestyleproducts_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`lifestyleproducts_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "12px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Popular Brands Section */}
      {selectedSection === "popularbrands" && (
        <>
          <div className="banners-page-subheader" style={{ borderBottomColor: "#5e35b1" }}>
            <h2 style={{ color: "#5e35b1" }}>POPULAR BRANDS (30 Slots)</h2>
          </div>

          {/* Popular Brands Banner Display - 30 Fixed Slots */}
          <div className="banners-page-top-banners-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            borderBottomColor: "#5e35b1"
          }}>
            {Array.from({ length: 30 }, (_, index) => {
              const banner = popularBrandsBanners[index];
              const imageUrl = banner?.imageurl || banner?.largeImageURL || banner?.url || null;
              const position = index + 39; // Positions 39-68

              return (
                <div
                  key={index}
                  className="banners-page-banner-container"
                  style={{
                    position: "relative",
                    minHeight: "180px",
                    border: "2px solid #5e35b1",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Popular Brands Banner ${position}`}
                        style={{ width: "100%", height: "auto", display: "block" }}
                        onError={(e) => {
                          console.error(`Failed to load image: ${imageUrl}`);
                          e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "180px",
                        backgroundColor: "#ede7f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed #5e35b1"
                      }}>
                        <p style={{ color: "#5e35b1", fontWeight: "500", fontSize: "12px" }}>No Banner</p>
                      </div>
                    )}
                    <div className="banner-hover-buttons" style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "center"
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={popularBrandsFileInputRefs[index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(index, e, "popularbrands")}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "popularbrands")}
                      />
                      <Button
                        variant="contained"
                        onClick={() => popularBrandsFileInputRefs[index].current?.click()}
                        disabled={uploading || (editingBannerIndex === index && editingBannerSection === "popularbrands")}
                        sx={{
                          backgroundColor: "#5e35b1",
                          color: "white",
                          fontSize: "11px",
                          padding: "5px 12px",
                          "&:hover": { backgroundColor: "#4527a0" },
                          "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                        }}
                      >
                        {uploading && editingBannerIndex === index && editingBannerSection === "popularbrands" ? "Uploading..." : "Browse"}
                      </Button>
                      {banner && (
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteBanner(index, "popularbrands")}
                          disabled={uploading || (editingBannerIndex === index && editingBannerSection === "popularbrands") || (deleting === position && deletingSection === "popularbrands")}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontSize: "11px",
                            padding: "5px 12px",
                            "&:hover": { backgroundColor: "#c62828" },
                            "&:disabled": { backgroundColor: "#ccc", color: "#666" }
                          }}
                        >
                          {(deleting === position && deletingSection === "popularbrands") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backgroundColor: "rgba(94, 53, 177, 0.9)",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}>
                      {position}
                    </div>
                  </div>
                  <div style={{ padding: "6px 8px", backgroundColor: "#ede7f6", borderTop: "1px solid #5e35b1" }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Redirect URL"
                      placeholder="https://..."
                      value={slotRedirectUrls[`popularbrands_${index}`] !== undefined ? slotRedirectUrls[`popularbrands_${index}`] : (banner?.redirecturl || "")}
                      onChange={(e) => setSlotRedirectUrls((prev) => ({ ...prev, [`popularbrands_${index}`]: e.target.value }))}
                      sx={{ "& .MuiInputBase-root": { fontSize: "11px" }, "zIndex": "1000" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

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
