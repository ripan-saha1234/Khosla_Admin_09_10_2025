import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  ListSubheader
} from "@mui/material";
import { Edit2, Trash2, Plus } from "lucide-react";
import "../css/products.css";

function SEOManagement() {
  const [selectedPage, setSelectedPage] = useState("/");
  const [seoData, setSeoData] = useState({
    title: "",
    keywords: "",
    description: "",
    page: "/"
  });
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [seoRecords, setSeoRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
  
  // Static Routes
  const staticRoutes = [
    { value: "/", label: "Home" },
    { value: "/about-us", label: "About Us" },
    { value: "/contact-us", label: "Contact Us" },
    { value: "/cart", label: "Shopping Cart" },
    { value: "/checkout", label: "Checkout" },
    { value: "/compare", label: "Compare Products" },
    { value: "/wishlist", label: "My Wishlist" },
    { value: "/hot-deals", label: "Hot Deals" },
    { value: "/store-locator", label: "Store Locator" },
    { value: "/career", label: "Careers" },
    { value: "/register-login", label: "Login | Register" },
    { value: "/terms-and-conditions", label: "Terms and Conditions" },
    { value: "/privacy-policy", label: "Privacy Policy" },
    { value: "/payment-return-policies", label: "Payment & Return Policies" },
    { value: "/shipping-options", label: "Shipping Options" },
    { value: "/success", label: "Payment Success" },
    { value: "/failure", label: "Payment Failed" }
  ];

  // Nested Routes (My Account Section)
  const nestedRoutes = [
    { value: "/my-account", label: "My Account" },
    { value: "/my-account/orders", label: "My Orders" },
    { value: "/my-account/address", label: "My Addresses" },
    { value: "/my-account/edit-billing-address", label: "Edit Billing Address" },
    { value: "/my-account/edit-shipping-address", label: "Edit Shipping Address" },
    { value: "/my-account/account-details", label: "Account Details" }
  ];

  const [nestedRoutesWithCategories, setNestedRoutesWithCategories] = useState([]);

  // All page options combined (static + my-account nested + category routes)
  const allPageOptions = [...staticRoutes, ...nestedRoutes, ...nestedRoutesWithCategories];

  // Parse response body (it's a stringified JSON)
  const parseResponseBody = (response) => {
    if (response.data && response.data.body) {
      try {
        const parsed = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        return parsed;
      } catch (e) {
        console.error("Error parsing response body:", e);
        return response.data.body;
      }
    }
    return response.data;
  };

  // Fetch all SEO records
  const fetchAllRecords = async () => {
    setLoadingRecords(true);
    try {
      // Use READ operation without ID to get all records
      const response = await axios.post(`${baseUrl}/seodata`, {
        operation: "READ"
      });
      
      const parsed = parseResponseBody(response);
      
      let records = [];
      if (parsed.items && Array.isArray(parsed.items)) {
        records = parsed.items;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        records = parsed.data;
      } else if (Array.isArray(parsed)) {
        records = parsed;
      } else if (parsed && typeof parsed === 'object') {
        // If it's a single object, wrap it in an array
        records = [parsed];
      }
      
      setSeoRecords(records);
      return records;
    } catch (error) {
      console.error("Error fetching SEO records:", error);
      console.error("Error response:", error.response?.data);
      // If READ doesn't work, set empty array - user can still create/edit individual records
      setSeoRecords([]);
      return [];
    } finally {
      setLoadingRecords(false);
    }
  };

  // Fetch SEO data for selected page by searching records
  const fetchSEODataByPage = async (page) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    setCurrentRecordId(null);
    
    try {
      // Fetch all records and find the one matching the page
      const records = await fetchAllRecords();
      const record = records.find(r => r.page === page);
      
      if (record) {
        setSeoData({
          title: record.title || "",
          keywords: record.keywords || "",
          description: record.description || "",
          page: record.page || page
        });
        setCurrentRecordId(record.id);
      } else {
        // No record found, reset to empty
        setSeoData({
          title: "",
          keywords: "",
          description: "",
          page: page
        });
        setCurrentRecordId(null);
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      setSeoData({
        title: "",
        keywords: "",
        description: "",
        page: page
      });
      setCurrentRecordId(null);
    } finally {
      setLoading(false);
    }
  };

  // fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/categories`);
      const data = response.data;
      console.log("Categories fetched successfully:", data);
      // Handle the API response structure: { success, count, categories: [...] }
      let categoriesArray = [];
      if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else {
        return [];
      }
      // Transform to dropdown format { value, label } (same as products.jsx)
      const transformedCategories = categoriesArray.map((category) => {
        if (typeof category === "string") {
          return { value: category, label: category };
        }
        const value = category.value || category.id || category.category_id || category.name || category.category || "";
        const label = category.label || category.name || category.category_name || category.category || value;
        return { value: String(value), label: String(label) };
      });
      return transformedCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  // Read SEO data by ID
  const readSEODataById = async (id) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await axios.post(`${baseUrl}/seodata`, {
        operation: "READ",
        id: id
      });
      
      const parsed = parseResponseBody(response);
      
      if (parsed) {
        const data = parsed.data || parsed;
        setSeoData({
          title: data.title || "",
          keywords: data.keywords || "",
          description: data.description || "",
          page: data.page || ""
        });
        setCurrentRecordId(data.id || id);
        setSelectedPage(data.page || "/");
      }
    } catch (error) {
      console.error("Error reading SEO data:", error);
      setMessage({ type: "error", text: "Failed to load SEO data." });
    } finally {
      setLoading(false);
    }
  };

  // Create or Update SEO data
  const saveSEOData = async () => {
    if (!seoData.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      if (currentRecordId) {
        // Update existing record
        const response = await axios.post(`${baseUrl}/seodata`, {
          operation: "UPDATE",
          id: currentRecordId,
          data: {
            title: seoData.title,
            keywords: seoData.keywords || "",
            description: seoData.description || "",
            page: seoData.page
          }
        });
        
        const parsed = parseResponseBody(response);
        setMessage({ type: "success", text: "SEO settings updated successfully!" });
        
        // Refresh records
        await fetchAllRecords();
        setCurrentRecordId(parsed.id || currentRecordId);
      } else {
        // Create new record
        const response = await axios.post(`${baseUrl}/seodata`, {
          operation: "CREATE",
          data: {
            title: seoData.title,
            keywords: seoData.keywords || "",
            description: seoData.description || "",
            page: seoData.page
          }
        });
        
        const parsed = parseResponseBody(response);
        setMessage({ type: "success", text: "SEO settings created successfully!" });
        
        // Set the new record ID
        if (parsed.id) {
          setCurrentRecordId(parsed.id);
        }
        
        // Refresh records
        await fetchAllRecords();
      }
    } catch (error) {
      console.error("Error saving SEO data:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to save SEO settings. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  // Delete SEO record
  const deleteSEOData = async (id) => {
    setDeleting(true);
    setMessage({ type: "", text: "" });
    
    try {
      await axios.post(`${baseUrl}/seodata`, {
        operation: "DELETE",
        id: id
      });
      
      setMessage({ type: "success", text: "SEO record deleted successfully!" });
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      
      // If deleted record was the current one, reset form
      if (currentRecordId === id) {
        setSeoData({
          title: "",
          keywords: "",
          description: "",
          page: selectedPage
        });
        setCurrentRecordId(null);
      }
      
      // Refresh records
      await fetchAllRecords();
    } catch (error) {
      console.error("Error deleting SEO data:", error);
      setMessage({ type: "error", text: "Failed to delete SEO record. Please try again." });
    } finally {
      setDeleting(false);
    }
  };

  // Handle page change
  useEffect(() => {
    if (selectedPage) {
      fetchSEODataByPage(selectedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage]);

  // Load all records on mount; build category nested routes from API
  useEffect(() => {
    const fetching = async () => {
      const [categories, records] = await Promise.all([fetchCategories(), fetchAllRecords()]);
      console.log("Categories fetched successfully:", categories);
      console.log("Records fetched successfully:", records);
      // Form nested routes for categories: { value: path, label } like nestedRoutes (e.g. /category/Electronics)
      const nestedRoutesForCategories = (categories || []).map((cat) => ({
        value: `/category/${encodeURIComponent(cat.value)}`,
        label: cat.label
      }));
      console.log("Nested routes for categories:", nestedRoutesForCategories);
      setNestedRoutesWithCategories(nestedRoutesForCategories);
    };
    fetching();
  }, []);

  const handleFieldChange = (field, value) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditRecord = (record) => {
    setSelectedPage(record.page);
    setSeoData({
      title: record.title || "",
      keywords: record.keywords || "",
      description: record.description || "",
      page: record.page || ""
    });
    setCurrentRecordId(record.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleNewRecord = () => {
    setSelectedPage("/");
    setSeoData({
      title: "",
      keywords: "",
      description: "",
      page: "/"
    });
    setCurrentRecordId(null);
    setMessage({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="30px">
        <Typography variant="h4" style={{ fontWeight: "600" }}>
          SEO Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleNewRecord}
          style={{
            backgroundColor: "#ED1B24",
            color: "white"
          }}
        >
          New SEO Record
        </Button>
      </Box>

      {message.text && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: "", text: "" })}
          style={{ marginBottom: "20px" }}
        >
          {message.text}
        </Alert>
      )}

      {/* SEO Records Table */}
      <Paper elevation={2} style={{ padding: "20px", marginBottom: "30px" }}>
        <Typography variant="h6" gutterBottom style={{ marginBottom: "20px", fontWeight: "600" }}>
          Existing SEO Records
        </Typography>
        
        {loadingRecords ? (
          <Box display="flex" justifyContent="center" padding="40px">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Page</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Keywords</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seoRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" style={{ padding: "40px" }}>
                      <Typography color="textSecondary">
                        No SEO records found. Create a new record to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  seoRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.page || "-"}</TableCell>
                      <TableCell>
                        {record.title ? (
                          record.title.length > 50 
                            ? `${record.title.substring(0, 50)}...` 
                            : record.title
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {record.description ? (
                          record.description.length > 80 
                            ? `${record.description.substring(0, 80)}...` 
                            : record.description
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {record.keywords ? (
                          record.keywords.length > 50 
                            ? `${record.keywords.substring(0, 50)}...` 
                            : record.keywords
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditRecord(record)}
                          color="primary"
                          style={{ marginRight: "8px" }}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(record)}
                          color="error"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* SEO Form */}
      <Paper elevation={2} style={{ padding: "25px", marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom style={{ marginBottom: "20px", fontWeight: "600" }}>
          {currentRecordId ? "Edit SEO Settings" : "Create New SEO Settings"}
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Page</InputLabel>
          <Select
            value={selectedPage}
            onChange={(e) => {
              const newPage = e.target.value;
              setSelectedPage(newPage);
              setSeoData(prev => ({ ...prev, page: newPage }));
            }}
            label="Select Page"
            disabled={loading || saving}
          >
            <ListSubheader>Static Routes</ListSubheader>
            {staticRoutes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
            <ListSubheader>My Account Routes</ListSubheader>
            {nestedRoutes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
            <ListSubheader>Category Routes</ListSubheader>
            {nestedRoutesWithCategories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Title *"
          value={seoData.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          margin="normal"
          placeholder="Enter page title (50-60 characters recommended)"
          helperText={`${seoData.title.length} characters`}
          required
        />
        
        <TextField
          fullWidth
          label="Description"
          value={seoData.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          margin="normal"
          multiline
          rows={3}
          placeholder="Enter page description (150-160 characters recommended)"
          helperText={`${seoData.description.length} characters`}
        />
        
        <TextField
          fullWidth
          label="Keywords"
          value={seoData.keywords}
          onChange={(e) => handleFieldChange("keywords", e.target.value)}
          margin="normal"
          placeholder="Enter keywords separated by commas"
          helperText="Separate keywords with commas"
        />

        <Box display="flex" gap="15px" marginTop="30px">
          <Button
            variant="contained"
            color="primary"
            onClick={saveSEOData}
            disabled={saving || loading || !seoData.title.trim()}
            size="large"
            style={{
              backgroundColor: "#ED1B24",
              padding: "12px 30px",
              fontSize: "16px"
            }}
          >
            {saving ? "Saving..." : currentRecordId ? "Update" : "Create"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => fetchSEODataByPage(selectedPage)}
            disabled={saving || loading}
            size="large"
            style={{
              padding: "12px 30px",
              fontSize: "16px"
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Preview Section */}
      <Paper elevation={2} style={{ padding: "25px", marginTop: "30px" }}>
        <Typography variant="h6" gutterBottom style={{ marginBottom: "20px", fontWeight: "600" }}>
          Search Engine Result Preview
        </Typography>
        <Divider style={{ marginBottom: "20px" }} />
        
        <Box style={{ border: "1px solid #e0e0e0", borderRadius: "4px", padding: "15px", backgroundColor: "#f9f9f9" }}>
          <Typography variant="h6" style={{ color: "#1a0dab", marginBottom: "5px", fontSize: "20px" }}>
            {seoData.title || "Page Title"}
          </Typography>
          <Typography variant="body2" style={{ color: "#006621", marginBottom: "5px", fontSize: "14px" }}>
            {seoData.page || "https://example.com"}
          </Typography>
          <Typography variant="body2" style={{ color: "#545454", fontSize: "14px", lineHeight: "1.4" }}>
            {seoData.description || "Page description will appear here..."}
          </Typography>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete SEO Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the SEO record for <strong>{recordToDelete?.page}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={() => recordToDelete && deleteSEOData(recordToDelete.id)} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SEOManagement;
