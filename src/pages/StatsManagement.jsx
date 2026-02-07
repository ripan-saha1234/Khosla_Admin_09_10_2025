import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev"; // Add your API base URL here

const initialFormState = {
  yearsOfExcellence: "",
  stores: "",
  locations: "",
  productsAndTopBrands: "",
};

const initialCheckboxState = {
  showPlusYears: false,
  showPlusStores: false,
  showPlusLocations: false,
  showPlusProducts: false,
};

function StatsManagement() {
  const [statsId, setStatsId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [showPlus, setShowPlus] = useState(initialCheckboxState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchStatManagement = async () => {
    if (!API_BASE_URL) {
      setMessage({ type: "info", text: "API base URL not configured. Add it to submit/fetch data." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/1`);
      let raw = response.data;
      // Handle array response (e.g. [{ id, ... }]) – use first item
      if (Array.isArray(raw) && raw.length > 0) {
        raw = raw[0];
      }
      // Handle wrapped response (e.g. { data: {...} } or { body: {...} })
      const data = raw?.data ?? raw?.body ?? raw ?? {};
      setStatsId(1);
      setFormData({
        yearsOfExcellence: String(data.yearsOfExcellence ?? data.years_of_excellence ?? ""),
        stores: String(data.stores ?? ""),
        locations: String(data.locations ?? ""),
        productsAndTopBrands: String(data.productsAndTopBrands ?? data.products_and_top_brands ?? ""),
      });
      setShowPlus({
        showPlusYears: Boolean(data.showPlusYears ?? data.show_plus_years ?? false),
        showPlusStores: Boolean(data.showPlusStores ?? data.show_plus_stores ?? false),
        showPlusLocations: Boolean(data.showPlusLocations ?? data.show_plus_locations ?? false),
        showPlusProducts: Boolean(data.showPlusProducts ?? data.show_plus_products ?? false),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setMessage({ type: "error", text: "Failed to load stats. You can still edit and save." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChanges = (field, value) => {
    const trimmed = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [field]: trimmed }));
    setMessage({ type: "", text: "" });
  };

  const handleCheckboxChange = (field, checked) => {
    setShowPlus((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async () => {
    const { yearsOfExcellence, stores, locations, productsAndTopBrands } = formData;
    if (
      !yearsOfExcellence.trim() ||
      !stores.trim() ||
      !locations.trim() ||
      !productsAndTopBrands.trim()
    ) {
      setMessage({
        type: "error",
        text: "Please fill all four fields: Years of Excellence, Stores, Locations, and Products and Top Brands.",
      });
      return;
    }

    if (!API_BASE_URL) {
      setMessage({ type: "error", text: "API base URL is not configured. Please add it to save." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = {
        yearsOfExcellence: yearsOfExcellence.trim(),
        stores: stores.trim(),
        locations: locations.trim(),
        productsAndTopBrands: productsAndTopBrands.trim(),
        showPlusYears: showPlus.showPlusYears,
        showPlusStores: showPlus.showPlusStores,
        showPlusLocations: showPlus.showPlusLocations,
        showPlusProducts: showPlus.showPlusProducts,
      };
      await axios.put(`${API_BASE_URL}/stats/1`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage({ type: "success", text: "Stats saved successfully!" });
    } catch (error) {
      console.error("Error saving stats:", error);
      const isNetworkError = error.message === "Network Error" || !error.response;
      const errorMsg = isNetworkError
        ? "Network Error: Check if the API allows PUT from this origin (CORS) and that the server is reachable."
        : error.response?.data?.message || error.message || "Failed to save stats. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchStatManagement();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="20px" marginBottom="30px">

        <Typography variant="h4" style={{ fontWeight: "600" }}>
          Stats Management
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || loading}
          size="large"
          style={{
            backgroundColor: "#ED1B24",
            color: "white",
            padding: "12px 30px",
            fontSize: "16px",
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={20} sx={{ color: "white", marginRight: 1 }} /> Saving...
            </>
          ) : (
            "Save"
          )}
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

      <Paper elevation={2} style={{ padding: "25px", marginBottom: "20px" }}>
        <Typography variant="h6" gutterBottom style={{ marginBottom: "20px", fontWeight: "600" }}>
          Homepage Stats
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" padding="40px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TextField
              fullWidth
              label="Years of Excellence"
              value={formData.yearsOfExcellence}
              onChange={(e) => handleInputChanges("yearsOfExcellence", e.target.value)}
              margin="normal"
              placeholder="Enter number"
              type="text"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPlus.showPlusYears}
                  onChange={(e) => handleCheckboxChange("showPlusYears", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Show '+' symbol on front website for Years of Excellence"
            />

            <TextField
              fullWidth
              label="Stores"
              value={formData.stores}
              onChange={(e) => handleInputChanges("stores", e.target.value)}
              margin="normal"
              placeholder="Enter number"
              type="text"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPlus.showPlusStores}
                  onChange={(e) => handleCheckboxChange("showPlusStores", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Show '+' symbol on front website for Stores"
            />

            <TextField
              fullWidth
              label="Locations"
              value={formData.locations}
              onChange={(e) => handleInputChanges("locations", e.target.value)}
              margin="normal"
              placeholder="Enter number"
              type="text"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPlus.showPlusLocations}
                  onChange={(e) => handleCheckboxChange("showPlusLocations", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Show '+' symbol on front website for Locations"
            />

            <TextField
              fullWidth
              label="Products and Top Brands"
              value={formData.productsAndTopBrands}
              onChange={(e) => handleInputChanges("productsAndTopBrands", e.target.value)}
              margin="normal"
              placeholder="Enter number"
              type="text"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPlus.showPlusProducts}
                  onChange={(e) => handleCheckboxChange("showPlusProducts", e.target.checked)}
                  disabled={loading}
                />
              }
              label="Show '+' symbol on front website for Products and Top Brands"
            />
          </>
        )}
      </Paper>
    </div>
  );
}

export default StatsManagement;
