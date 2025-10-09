import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import '../css/orders.css'
function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("phone_no");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleExportOrders = () => {
    console.log("Exporting orders");
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
        <button className="export-button" onClick={handleExportOrders}>Export Orders</button>
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
                  <p>{order.created_at}</p>
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
                  <div><strong>Created At:</strong> {selectedOrder.created_at}</div>
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