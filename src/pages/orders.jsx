import { useEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import '../css/orders.css'
function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("phone_no");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev/retrieveAllOrder");
      const data = await response.json();
      const parsedData = JSON.parse(data.body);
      console.log("parsedData", parsedData);
      return parsedData;
    } catch (error) {
      console.log("error in fetching orders", error);
    }
  };

  useEffect(() => {
    const fetchingOrders = async () => {
      const orders = await fetchOrders();
      const parsedOrders = parseOrderAttributes(orders);
      setOrders(parsedOrders);
      setFilteredOrders(parsedOrders);
    };
    fetchingOrders();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        if (searchType === "phone_no") {
          return order.phone_no.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return order.order_id.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      setFilteredOrders(filtered);
    }
  }, [searchTerm, searchType, orders]);

  function parseOrderAttributes(orders) {
    return orders.map(order => {
      const parsedOrder = { ...order };

      if (parsedOrder.billing_address && typeof parsedOrder.billing_address === 'string') {
        try {
          parsedOrder.billing_address = JSON.parse(parsedOrder.billing_address);
        } catch (error) {
          console.warn('Failed to parse billing_address:', error);
        }
      }

      if (parsedOrder.cart && typeof parsedOrder.cart === 'string') {
        try {
          parsedOrder.cart = JSON.parse(parsedOrder.cart);
        } catch (error) {
          console.warn('Failed to parse cart:', error);
        }
      }

      if (parsedOrder.shipping_address && typeof parsedOrder.shipping_address === 'string') {
        try {
          parsedOrder.shipping_address = JSON.parse(parsedOrder.shipping_address);
        } catch (error) {
          console.warn('Failed to parse shipping_address:', error);
        }
      }

      return parsedOrder;
    });
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()  ) {
      case "order initiated" || "order unsuccessful":
        return { backgroundColor: "red", color: "white" };
      case "order placed":
        return { backgroundColor: "orange", color: "white" };
      case "accepted":
        return { backgroundColor: "green", color: "white" };
      case "rejected":
        return { backgroundColor: "black", color: "white" };
      case "shipped":
        return { backgroundColor: "blue", color: "white" };
      default:
        return { backgroundColor: "gray", color: "white" };
    }
  };

  const handleStatusChange = async (orderId, phoneNo, newStatus) => {
    try {
      // Send update to backend
      const response = await fetch("https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev/editOrderData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          phone_number: phoneNo,
          status: newStatus
        })
      });

      // if (!response.ok) {
      //   throw new Error("Failed to update status");
      // }

      const data = await response.json();
      console.log("updated status", data);
      if (data.statusCode === 200 || data.statusCode === 201 || data.success === true || data.message === "Order status updated successfully") {
        // Update local state again to reflect the change
        const updatedOrders2 = orders.map(order =>
          order.order_id === orderId ? { ...order, order_status: newStatus } : order
        );
        setOrders(updatedOrders2);
        setFilteredOrders(updatedOrders2.filter(order => {
          if (searchTerm === "") return true;
          if (searchType === "phone_no") {
            return order.phone_no.toLowerCase().includes(searchTerm.toLowerCase());
          } else {
            return order.order_id.toLowerCase().includes(searchTerm.toLowerCase());
          }
        }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const calculateTotalPrice = (cart) => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to format date as dd/mm/yy
  const formatDate = (date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  // Helper function to format datetime string as dd/mm/yy HH:MM AM/PM
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString; // Return original if invalid date
    
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  // Helper function to get current month start date
  const getCurrentMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  // Helper function to get current month end date
  const getCurrentMonthEnd = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0);
  };

  // Helper function to get date N days ago
  const getDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // Helper function to get today's date
  const getToday = () => {
    return new Date();
  };

  // Helper function to get yesterday's date
  const getYesterday = () => {
    return getDaysAgo(1);
  };

  const downloadFile = (base64Data, filename) => {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and download
      const blob = new Blob([bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleExport = async (exportType) => {
    try {
      setExportDropdownOpen(false);
      const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";
      let endpoint = `${API_BASE_URL}/orders/export`;
      const params = new URLSearchParams();
      
      switch(exportType) {
        case 'all':
          // No params needed - exports all orders
          break;
          
        case 'dateRange':
          const startDate = prompt('Enter start date (dd/mm/yy):', formatDate(getDaysAgo(30)));
          const endDate = prompt('Enter end date (dd/mm/yy):', formatDate(getToday()));
          if (!startDate || !endDate) {
            return; // User cancelled
          }
          params.append('start_date', startDate);
          params.append('end_date', endDate);
          break;
          
        case 'fromDate':
          const fromDate = prompt('Enter start date (dd/mm/yy):', formatDate(getDaysAgo(30)));
          if (!fromDate) {
            return; // User cancelled
          }
          params.append('start_date', fromDate);
          break;
          
        case 'untilDate':
          const untilDate = prompt('Enter end date (dd/mm/yy):', formatDate(getToday()));
          if (!untilDate) {
            return; // User cancelled
          }
          params.append('end_date', untilDate);
          break;
          
        case 'currentMonth':
          params.append('start_date', formatDate(getCurrentMonthStart()));
          params.append('end_date', formatDate(getCurrentMonthEnd()));
          break;
          
        case 'last30Days':
          params.append('start_date', formatDate(getDaysAgo(30)));
          params.append('end_date', formatDate(getToday()));
          break;
          
        case 'yesterday':
          const yesterday = formatDate(getYesterday());
          params.append('start_date', yesterday);
          params.append('end_date', yesterday);
          break;
          
        case 'today':
          const today = formatDate(getToday());
          params.append('start_date', today);
          params.append('end_date', today);
          break;
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.statusCode === 200 && data.body && data.isBase64Encoded) {
        // Extract filename from Content-Disposition header if available
        let filename = 'orders_export.xlsx';
        if (data.headers && data.headers['Content-Disposition']) {
          const filenameMatch = data.headers['Content-Disposition'].match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        downloadFile(data.body, filename);
      } else {
        console.error('Export failed:', data);
        alert('Failed to export orders. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Error exporting orders. Please try again.');
    }
  };

  return (
    <div className="orders-container">
      {/* Top Bar */}
      <div className="orders-top-bar">
        <div className="search-container">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="phone_no">Phone Number</option>
            <option value="order_id">Order ID</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchType === "phone_no" ? "Phone Number" : "Order ID"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="export-dropdown-container" ref={exportDropdownRef}>
          <button 
            className="export-button" 
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
          >
            Export Orders
            <span className="dropdown-arrow">▼</span>
          </button>
          {exportDropdownOpen && (
            <div className="export-dropdown-menu">
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('all')}
              >
                Export All Orders
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('dateRange')}
              >
                Export Orders by Date Range
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('fromDate')}
              >
                Export Orders From Specific Date
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('untilDate')}
              >
                Export Orders Until Specific Date
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('currentMonth')}
              >
                Export Current Month Orders
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('last30Days')}
              >
                Export Last 30 Days Orders
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('yesterday')}
              >
                Export Yesterday's Orders
              </div>
              <div 
                className="export-dropdown-item" 
                onClick={() => handleExport('today')}
              >
                Export Today's Orders
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-page-order-container">
        {filteredOrders
          .slice()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((order) => {
            return (
              <div className="orders-page-order-item" key={order.order_id}>
                <div className="orders-page-order-item-details">
                  <h1>{order.phone_no}</h1>
                  <p>{order.order_id}</p>
                  <p>Total : ₹{calculateTotalPrice(order.cart)}</p>
                  <p>{formatDateTime(order.created_at)}</p>
                  <div
                    className="order-status-badge"
                    style={getStatusColor(order.order_status)}
                  >
                    {order.order_status}
                  </div>
                </div>
                <div className="orders-page-order-item-controls">
                  <select
                    className="status-select"
                    onChange={(e) => handleStatusChange(order.order_id, order.phone_no, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Change Status</option>
                    <option value="Order initiated">Order initiated</option>
                    <option value="Order successfully placed">Order successfully placed</option>
                    <option value="Order out for delivery">Order out for delivery</option>
                    <option value="Order successfully delivered">Order successfully delivered</option>
                    <option value="Refund processing">Refund processing</option>
                    <option value="Refund successfully">Refund successfully</option>
                    <option value="Order unsuccessful">Order unsuccessful</option>
                    {/* <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Shipped">Shipped</option> */}
                  </select>
                  <button
                    className="view-button"
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Order Details Dialog */}
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
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div className="order-details-container">
              {/* Order Information */}
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div><strong>Order ID:</strong> {selectedOrder.order_id}</div>
                  <div><strong>Phone Number:</strong> {selectedOrder.phone_no}</div>
                  <div><strong>Created At:</strong> {formatDateTime(selectedOrder.created_at)}</div>
                  <div><strong>Status:</strong>
                    <span
                      className="status-inline"
                      style={getStatusColor(selectedOrder.order_status)}
                    >
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  {selectedOrder.order_notes && (
                    <div><strong>Notes:</strong> {selectedOrder.order_notes}</div>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="address-section">
                <h3>Billing Address</h3>
                <div className="address-details">
                  <p><strong>Name:</strong> {selectedOrder.billing_address?.first_name} {selectedOrder.billing_address?.last_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.billing_address?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.billing_address?.phone}</p>
                  <p><strong>Address:</strong> {selectedOrder.billing_address?.street_address}</p>
                  {selectedOrder.billing_address?.apartment && (
                    <p><strong>Apartment:</strong> {selectedOrder.billing_address.apartment}</p>
                  )}
                  {selectedOrder.billing_address?.landmark && (
                    <p><strong>Landmark:</strong> {selectedOrder.billing_address.landmark}</p>
                  )}
                  <p><strong>City:</strong> {selectedOrder.billing_address?.city}</p>
                  <p><strong>State:</strong> {selectedOrder.billing_address?.state}</p>
                  <p><strong>Pincode:</strong> {selectedOrder.billing_address?.pincode}</p>
                  <p><strong>Country:</strong> {selectedOrder.billing_address?.country_region}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="address-section">
                <h3>Shipping Address</h3>
                <div className="address-details">
                  <p><strong>Name:</strong> {selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                  <p><strong>Address:</strong> {selectedOrder.shipping_address?.street_address}</p>
                  {selectedOrder.shipping_address?.apartment && (
                    <p><strong>Apartment:</strong> {selectedOrder.shipping_address.apartment}</p>
                  )}
                  <p><strong>City:</strong> {selectedOrder.shipping_address?.city}</p>
                  <p><strong>State:</strong> {selectedOrder.shipping_address?.state}</p>
                  <p><strong>Pincode:</strong> {selectedOrder.shipping_address?.pincode}</p>
                  <p><strong>Country:</strong> {selectedOrder.shipping_address?.country_region}</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="cart-section">
                <h3>Cart Items</h3>
                {selectedOrder.cart?.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.url} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p><strong>Model:</strong> {item.model}</p>
                      <p><strong>Price:</strong> ₹{parseFloat(item.price).toLocaleString()}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Total:</strong> ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
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

export default Orders;