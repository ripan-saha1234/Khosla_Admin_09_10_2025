import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import axios from "axios";
import { Checkbox, CircularProgress } from "@mui/material";
import "../css/products.css";

function OfferManagement() {
  const [buttonText, setButtonText] = useState("");
  const [isEditingButtonText, setIsEditingButtonText] = useState(false);
  const [tempButtonText, setTempButtonText] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [buttonId, setButtonId] = useState(1);
  const [buttonColor, setButtonColor] = useState("blue");
  const [buttonStatus, setButtonStatus] = useState("active");
  const [buttonLoading, setButtonLoading] = useState(false);
  
  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";

  // Helper function to map color string to hex color
  const getColorHex = (color) => {
    const colorMap = {
      "blue": "#ED1B24", // Using red as default since that's the current design
      "red": "#dc3545",
      "green": "#28a745",
      "black": "#000000",
      "white": "#ffffff"
    };
    return colorMap[color?.toLowerCase()] || colorMap["blue"];
  };

  // Fetch products from API
  async function fetchProducts(pageNum = 1) {
    setLoading(true);
    try {
      const offset = (pageNum - 1) * itemsPerPage;
      const res = await fetch(`${API_BASE_URL}/products?limit=${itemsPerPage}&offset=${offset}`);
      const data = await res.json();

      if (data.products && data.products.length > 0) {
        const transformedProducts = data.products.map(product => ({
          id: product.PID,
          name: product.Name,
          regularPrice: product.Regular_price,
          salePrice: product.Sale_price,
          type: product.Type,
          model: product.Model,
          shortDesc: product.Short_description,
          description: product.Description,
          inStock: product.In_stock,
          categories: product.Categories ? product.Categories.split(',').map(cat => cat.trim()) : [],
          brand: product.Brands,
          images: product.Images ? product.Images.split(',').map(img => {
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('/uploads')) {
              return `https://khoslaslider.s3.ap-south-1.amazonaws.com${trimmedImg}`;
            }
            return trimmedImg;
          }) : []
        }));

        setProducts(transformedProducts);
        setTotalProducts(data.total);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        setCurrentPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert('Failed to fetch products. Please try again.');
    }
    setLoading(false);
  }

  // Create button using axios
  const createButton = async (name, color = "blue", status = "active") => {
    try {
      setButtonLoading(true);
      const response = await axios.post(`${API_BASE_URL}/button`, {
        operation: "create",
        data: {
          name: name,
          color: color,
          status: status
        }
      });
      
      if (response.data && response.data.id) {
        setButtonId(response.data.id);
        setButtonText(response.data.data.name);
        setButtonColor(response.data.data.color);
        setButtonStatus(response.data.data.status);
        console.log("Button created successfully:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error creating button:", error);
      throw error;
    } finally {
      setButtonLoading(false);
    }
  };

  // Update button using axios
  const updateButton = async (id, name, color = "blue", status = "active") => {
    try {
      setButtonLoading(true);
      const response = await axios.post(`${API_BASE_URL}/button`, {
        operation: "update",
        id: id,
        data: {
          name: name,
          color: color,
          status: status
        }
      });
      
      if (response.data && response.data.data) {
        setButtonText(response.data.data.name);
        setButtonColor(response.data.data.color);
        setButtonStatus(response.data.data.status);
        console.log("Button updated successfully:", response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error updating button:", error);
      throw error;
    } finally {
      setButtonLoading(false);
    }
  };

  // Fetch existing button data from API
  const fetchButton = async (id = 1) => {
    try {
      // Use POST request with operation "read" to fetch button data (same as Postman)
      const response = await axios.post(`${API_BASE_URL}/button`, {
        operation: "read",
        id: id
      });
      
      // Response structure: { button: { id, name, color, status, ... } }
      if (response.data && response.data.button) {
        const button = response.data.button;
        setButtonId(button.id);
        setButtonText(button.name);
        setButtonColor(button.color);
        setButtonStatus(button.status);
        console.log("Button fetched successfully:", button);
        return button;
      }
      // Fallback: Response is an array, find the button with matching id
      else if (response.data && Array.isArray(response.data)) {
        const button = response.data.find(btn => btn.id === id);
        if (button) {
          setButtonId(button.id);
          setButtonText(button.name);
          setButtonColor(button.color);
          setButtonStatus(button.status);
          console.log("Button fetched successfully:", button);
          return button;
        }
      }
      // Fallback: If response is a single object directly
      else if (response.data && response.data.id) {
        setButtonId(response.data.id);
        setButtonText(response.data.name);
        setButtonColor(response.data.color);
        setButtonStatus(response.data.status);
        console.log("Button fetched successfully:", response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.log("Error fetching button:", error);
      return null;
    }
  };

  // Fetch button data on component mount - only show saved data
  const initializeButton = async () => {
    try {
      // Only fetch existing button data - no creation, no defaults
      const buttonData = await fetchButton(1);
      
      if (buttonData) {
        // Button exists - show the saved data
        console.log("Loaded saved button:", buttonData);
      } else {
        // Button doesn't exist - don't create, just leave empty
        console.log("No button found - will remain empty until created");
      }
    } catch (error) {
      console.error("Error fetching button:", error);
    }
  };

  // Handle button text edit
  const handleEditButtonText = () => {
    setTempButtonText(buttonText);
    setIsEditingButtonText(true);
  };

  const handleSaveButtonText = async () => {
    if (tempButtonText.trim()) {
      try {
        await updateButton(buttonId, tempButtonText.trim(), buttonColor, buttonStatus);
        setButtonText(tempButtonText.trim());
        alert("Button updated successfully!");
      } catch (error) {
        console.error("Error saving button:", error);
        alert("Failed to update button. Please try again.");
      }
    }
    setIsEditingButtonText(false);
  };

  const handleCancelButtonText = () => {
    setIsEditingButtonText(false);
    setTempButtonText("");
  };

  // Handle product selection
  const handleProductToggle = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Handle select all products on current page
  const handleSelectAll = () => {
    const newSelected = new Set(selectedProducts);
    products.forEach(product => {
      newSelected.add(product.id);
    });
    setSelectedProducts(newSelected);
  };

  // Handle deselect all products
  const handleDeselectAll = () => {
    setSelectedProducts(new Set());
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchProducts();
    initializeButton();
  }, []);

  return (
    <div className="products-page-product-container">
      <div className="products-page-product-container-header">
        <h1>OFFER MANAGEMENT</h1>
      </div>

      {/* Button Text Editor Section */}
      <div style={{
        width: "100%",
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e0e0e0"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          justifyContent: "center"
        }}>
          {isEditingButtonText ? (
            <>
              <input
                type="text"
                value={tempButtonText}
                onChange={(e) => setTempButtonText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveButtonText()}
                style={{
                  padding: "10px 15px",
                  fontSize: "16px",
                  border: "2px solid #ED1B24",
                  borderRadius: "6px",
                  outline: "none",
                  minWidth: "200px"
                }}
                autoFocus
              />
              <button
                onClick={handleSaveButtonText}
                disabled={buttonLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: buttonLoading ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: buttonLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: buttonLoading ? 0.7 : 1
                }}
              >
                {buttonLoading ? (
                  <>
                    <CircularProgress size={18} sx={{ color: "white" }} /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancelButtonText}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                <X size={18} /> Cancel
              </button>
            </>
          ) : (
            <>
              <div style={{
                padding: "12px 30px",
                backgroundColor: getColorHex(buttonColor),
                color: "white",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: "600",
                minWidth: "150px",
                textAlign: "center",
                opacity: buttonStatus === "active" ? 1 : 0.6
              }}>
                {buttonText}
                {buttonLoading && <span style={{ marginLeft: "10px", fontSize: "12px" }}>...</span>}
              </div>
              <button
                onClick={handleEditButtonText}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#000",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                <Edit2 size={18} /> Edit Button Text
              </button>
            </>
          )}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
          marginTop: "15px"
        }}>
          <p style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Selected Products: <span style={{ color: "#ED1B24", fontWeight: "600" }}>{selectedProducts.size}</span>
          </p>
          <div style={{
            display: "flex",
            gap: "10px"
          }}>
            <button
              onClick={handleSelectAll}
              disabled={products.length === 0}
              style={{
                padding: "8px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: products.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                opacity: products.length === 0 ? 0.6 : 1,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (products.length > 0) {
                  e.target.style.backgroundColor = "#218838";
                }
              }}
              onMouseLeave={(e) => {
                if (products.length > 0) {
                  e.target.style.backgroundColor = "#28a745";
                }
              }}
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={selectedProducts.size === 0}
              style={{
                padding: "8px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: selectedProducts.size === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                opacity: selectedProducts.size === 0 ? 0.6 : 1,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (selectedProducts.size > 0) {
                  e.target.style.backgroundColor = "#c82333";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProducts.size > 0) {
                  e.target.style.backgroundColor = "#dc3545";
                }
              }}
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="products-page-product-list">
        {products?.map((product) => {
          const isSelected = selectedProducts.has(product.id);
          
          return (
            <div 
              key={product?.id} 
              className="products-page-product"
              style={{
                backgroundColor: isSelected ? "#fff5f5" : "white",
                borderLeft: isSelected ? "4px solid #ED1B24" : "1px solid #e0e0e0",
                transition: "all 0.2s ease"
              }}
            >
              <div className="products-page-product-image-name-container" style={{ flex: "2.5" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px"
                }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleProductToggle(product.id)}
                    sx={{
                      color: "#ED1B24",
                      '&.Mui-checked': {
                        color: "#ED1B24",
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 28
                      }
                    }}
                  />
                  <img 
                    src={product?.images[0] || 'https://via.placeholder.com/150'} 
                    alt={product?.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                    style={{
                      width: "10vw",
                      height: "20vh",
                      objectFit: "cover",
                      borderRadius: "4px"
                    }}
                  />
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: "1.2vw",
                      fontWeight: "600",
                      color: isSelected ? "#ED1B24" : "#000"
                    }}>
                      {product?.name}
                    </h2>
                    {isSelected && (
                      <span style={{
                        display: "inline-block",
                        marginTop: "5px",
                        padding: "4px 12px",
                        backgroundColor: "#ED1B24",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        Selected for {buttonText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="products-page-product-info-container">
                <div>
                  {product?.salePrice && parseFloat(product?.salePrice) > 0 ? (
                    <>
                      <p style={{ margin: "5px 0", fontSize: "0.95vw" }}>
                        Regular: <span style={{ textDecoration: "line-through", color: "#999" }}>
                          ₹{parseFloat(product?.regularPrice).toFixed(2)}
                        </span>
                      </p>
                      <p style={{
                        margin: "5px 0",
                        color: '#ED1B24',
                        fontWeight: 'bold',
                        fontSize: "1.1vw"
                      }}>
                        Sale: ₹{parseFloat(product?.salePrice).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: "5px 0", fontSize: "1vw" }}>
                      Price: ₹{parseFloat(product?.regularPrice).toFixed(2)}
                    </p>
                  )}
                  <p style={{
                    fontSize: "0.85rem",
                    color: product?.inStock === "1" ? '#28a745' : '#dc3545',
                    margin: "5px 0",
                    fontWeight: "500"
                  }}>
                    {product?.inStock === "1" ? '✓ In Stock' : '✗ Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {!loading && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No products found. Please add products first.</p>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <CircularProgress />
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
          </div>
          <div className="pagination-controls">
            <button 
              onClick={handlePreviousPage} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferManagement;
