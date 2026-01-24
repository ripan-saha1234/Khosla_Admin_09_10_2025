import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import '../css/orders.css'

function ContactEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";

  const fetchEnquiries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`);
      const data = await response.json();
      
      // Handle response structure - API may return { statusCode, headers, body: "stringified JSON" }
      let parsedData = null;
      
      if (data.body) {
        // Parse the stringified body
        if (typeof data.body === 'string') {
          parsedData = JSON.parse(data.body);
        } else {
          parsedData = data.body;
        }
      } else if (Array.isArray(data)) {
        parsedData = data;
      } else {
        parsedData = data;
      }
      
      // Handle the data array structure: { data: [...] }
      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        return parsedData.data;
      } else if (Array.isArray(parsedData)) {
        return parsedData;
      } else if (parsedData && parsedData.items && Array.isArray(parsedData.items)) {
        return parsedData.items;
      }
      
      console.log("parsedData", parsedData);
      return [];
    } catch (error) {
      console.log("error in fetching enquiries", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchingEnquiries = async () => {
      setLoading(true);
      const enquiriesData = await fetchEnquiries();
      if (Array.isArray(enquiriesData)) {
        setEnquiries(enquiriesData);
        setFilteredEnquiries(enquiriesData);
      } else {
        setEnquiries([]);
        setFilteredEnquiries([]);
      }
      setLoading(false);
    };
    fetchingEnquiries();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredEnquiries(enquiries);
    } else {
      const filtered = enquiries.filter(enquiry => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (enquiry.first_name && enquiry.first_name.toLowerCase().includes(searchLower)) ||
          (enquiry.email_id && enquiry.email_id.toLowerCase().includes(searchLower)) ||
          (enquiry.phone && enquiry.phone.toLowerCase().includes(searchLower)) ||
          (enquiry.paragraph_text && enquiry.paragraph_text.toLowerCase().includes(searchLower))
        );
      });
      setFilteredEnquiries(filtered);
    }
  }, [searchTerm, enquiries]);

  const handleViewEnquiry = (enquiry) => {
    console.log("Viewing enquiry:", enquiry);
    // Use the enquiry data we already have from the table
    setSelectedEnquiry(enquiry);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEnquiry(null);
  };

  const handleDeleteEnquiry = async (enquiry) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }

    const emailId = enquiry.email_id;
    if (!emailId) {
      alert("Cannot delete: Email ID is missing.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contacts?email_id=${encodeURIComponent(emailId)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();
      console.log("delete response", data);
      
      if (data.statusCode === 200 || data.statusCode === 201 || data.success === true || response.ok) {
        // Remove from local state
        const updatedEnquiries = enquiries.filter(e => e.email_id !== emailId);
        setEnquiries(updatedEnquiries);
        setFilteredEnquiries(updatedEnquiries);
        alert("Enquiry deleted successfully");
      } else {
        alert("Failed to delete enquiry. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      alert("Error deleting enquiry. Please try again.");
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="orders-container">
      {/* Top Bar */}
      <div className="orders-top-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, phone, or message"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <h2>Contact Enquiries</h2>
        </div>
      </div>

      {/* Enquiries Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>Loading enquiries...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>No enquiries found.</p>
          </div>
        ) : (
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table sx={{ minWidth: 650 }} aria-label="contact enquiries table">
              <TableHead>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Message</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnquiries
                  .slice()
                  .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                  .map((enquiry) => {
                    const uniqueKey = enquiry.id || enquiry.email_id;
                    return (
                      <TableRow key={uniqueKey} hover>
                        <TableCell>{enquiry.first_name || 'N/A'}</TableCell>
                        <TableCell>{enquiry.email_id || 'N/A'}</TableCell>
                        <TableCell>{enquiry.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {enquiry.paragraph_text || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(enquiry.created_at)}</TableCell>
                        <TableCell align="center">
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                              className="view-button"
                              onClick={() => handleViewEnquiry(enquiry)}
                              style={{ fontSize: '0.9vw', padding: '0.5% 1.5%' }}
                            >
                              View
                            </button>
                            <button
                              className="view-button"
                              onClick={() => handleDeleteEnquiry(enquiry)}
                              style={{ 
                                fontSize: '0.9vw', 
                                padding: '0.5% 1.5%',
                                backgroundColor: '#dc3545'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Enquiry Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>Enquiry Details</DialogTitle>
        <DialogContent>
          {selectedEnquiry ? (
            <div className="order-details-container">
              <div className="order-info-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  {/* <div><strong>ID:</strong> {selectedEnquiry.id || 'N/A'}</div> */}
                  <div><strong>Name:</strong> {selectedEnquiry.first_name || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedEnquiry.email_id || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedEnquiry.phone || 'N/A'}</div>
                  {/* <div><strong>Checkbox:</strong> {selectedEnquiry.checkbox === 1 ? 'Yes' : 'No'}</div> */}
                  <div><strong>Created At:</strong> {formatDateTime(selectedEnquiry.created_at)}</div>
                  {selectedEnquiry.updated_at && (
                    <div><strong>Updated At:</strong> {formatDateTime(selectedEnquiry.updated_at)}</div>
                  )}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Message</h3>
                <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  <p style={{ marginTop: '5px', marginBottom: '0', whiteSpace: 'pre-wrap' }}>
                    {selectedEnquiry.paragraph_text || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Loading enquiry details...</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ContactEnquiries;
