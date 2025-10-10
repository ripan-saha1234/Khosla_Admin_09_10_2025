import { useState, useEffect, useRef } from "react";
import { Search, Plus } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import "../css/products.css";

function Products() {

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const observerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // You can change this
  const [totalPages, setTotalPages] = useState(0);
  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";


  async function fetchSearchResults(){
    setLoading(true);
    try {
      // Search by model using API endpoint
      const res = await fetch(`${API_BASE_URL}/products/${searchTerm}`);
      
      console.log('=== Search API Response ===');
      console.log('Search term (model):', searchTerm);
      console.log('Search URL:', `${API_BASE_URL}/products/${searchTerm}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          console.log('Product not found');
          setProducts([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to search product");
      }
      
      const data = await res.json();
      console.log('Search Response:', data);
      console.log('==========================');
      
      // Check if single product or array of products is returned
      let productsArray = [];
      
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data.product) {
        productsArray = [data.product];
      } else if (data.products) {
        productsArray = data.products;
      } else {
        // If single product object is returned directly
        productsArray = [data];
      }
      
      // Transform products
      const transformedProducts = productsArray.map(product => ({
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
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert('Failed to search product. Please try again.');
      setProducts([]);
    }
    setLoading(false);
  };

  function handleSearch(){
    if (searchTerm.trim() !== "") {
      // Enter search mode
      setIsSearchMode(true);
      setCurrentPage(1); // Reset to first page when searching
      // Clear current list before search
      setProducts([]);
      fetchSearchResults();
    } else {
      // If search term is empty, exit search mode and reset product list with pagination
      setIsSearchMode(false);
      setProducts([]);
      setCurrentPage(1);
      fetchProducts();
    }
  };

  // Dialog states
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [openSingleProductDialog, setOpenSingleProductDialog] = useState(false);
  const [openBulkProductDialog, setOpenBulkProductDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  async function fetchProducts(pageNum = currentPage){
    setLoading(true);
    try {
      const offset = (pageNum - 1) * itemsPerPage;
      const res = await fetch(`${API_BASE_URL}/products?limit=${itemsPerPage}&offset=${offset}`);
      const data = await res.json();

      console.log('=== API Response ===');
      console.log('Complete API Response:', data);
      console.log('Total products:', data.total);
      console.log('Products count:', data.count);
      console.log('Current page:', pageNum);
      console.log('Items per page:', itemsPerPage);
      console.log('Offset:', offset);
      console.log('First product raw data:', data.products?.[0]);
      console.log('==================');

      if (data.products && data.products.length > 0) {
        // Transform API data to match our component structure
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
            // Add base URL if image path is relative
            const trimmedImg = img.trim();
            if (trimmedImg.startsWith('/uploads')) {
              return `https://khoslaslider.s3.ap-south-1.amazonaws.com${trimmedImg}`;
            }
            return trimmedImg;
          }) : []
        }));

        setProducts(transformedProducts); // Replace instead of append for pagination
        setTotalProducts(data.total);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        setCurrentPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert('Failed to fetch products. Please try again.');
    }
    setLoading(false);
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
    if (!isSearchMode) {
      fetchProducts();
    }
  }, [isSearchMode]);

  // Removed infinite scroll logic - now using pagination


  // dialog handlers
  function handleOpenAddProductDialog(){
    setOpenAddProductDialog(true);
  };

  function handleSelectAddOption(option){
    setOpenAddProductDialog(false);
    if (option === "single") {
      setEditProduct(null); // In add mode, no product to edit.
      setOpenSingleProductDialog(true);
    } else if (option === "bulk") {
      setOpenBulkProductDialog(true);
    }
  };

  function handleEditProduct(product){
    setEditProduct(product);
    setOpenSingleProductDialog(true);
  };

  // Callback when a new or updated product is submitted from the single product dialog.
  async function handleSubmitSingleProduct(newProduct){
    if (editProduct) {
      // Edit mode: update the product in the backend
      try {
        // Map form data to API structure
        const apiBody = {
          Model: newProduct.model || "",
          PID: newProduct.id || "",
          Type: newProduct.type || "simple",
          Name: newProduct.name || "",
          GTIN: "",
          Keyword: newProduct.categories?.join(", ") || "",
          Published: "1",
          Is_featured: "0",
          Visibility_in_catalog: "visible",
          Short_description: newProduct.shortDesc || "",
          Description: newProduct.description || "",
          Tax_status: "taxable",
          Tax_class: "standard",
          In_stock: newProduct.inStock || "1",
          Stock: "100",
          Low_stock_amount: "10",
          Backorders_allowed: "0",
          Sold_individually: "0",
          Weight: "",
          Length: "",
          Width: "",
          Height: "",
          Allow_customer_reviews: "1",
          Sale_price: newProduct.salePrice || "0",
          Regular_price: newProduct.regularPrice || "0",
          Categories: newProduct.categories?.join(", ") || "",
          Tags: "",
          Shipping_class: "standard",
          Images: newProduct.images?.join(", ") || "",
          Brands: newProduct.brand || "",
          Attribute_1_name: "",
          Attribute_1_value: "",
          Attribute_1_visible: "1",
          Attribute_1_global: "0"
        };

        // Use model in the URL path
        const productModel = editProduct.model || newProduct.model;
        const response = await fetch(`${API_BASE_URL}/products/${productModel}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody)
        });
        
        if (!response.ok) {
          throw new Error("Failed to update product");
        }
        
        const updatedProduct = await response.json();
        console.log("Product updated:", updatedProduct);
        
        alert("Product updated successfully!");
        
        // Refresh the product list from API to show updated data
        fetchProducts(currentPage);
      } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product. Please try again.");
      }
    } else {
      // Add mode: create a new product in the backend
      try {
        // Map form data to API structure
        const apiBody = {
          Model: newProduct.model || "",
          PID: newProduct.id || "",
          Type: newProduct.type || "simple",
          Name: newProduct.name || "",
          GTIN: "",
          Keyword: newProduct.categories?.join(", ") || "",
          Published: "1",
          Is_featured: "0",
          Visibility_in_catalog: "visible",
          Short_description: newProduct.shortDesc || "",
          Description: newProduct.description || "",
          Tax_status: "taxable",
          Tax_class: "standard",
          In_stock: newProduct.inStock || "1",
          Stock: "100",
          Low_stock_amount: "10",
          Backorders_allowed: "0",
          Sold_individually: "0",
          Weight: "",
          Length: "",
          Width: "",
          Height: "",
          Allow_customer_reviews: "1",
          Sale_price: newProduct.salePrice || "0",
          Regular_price: newProduct.regularPrice || "0",
          Categories: newProduct.categories?.join(", ") || "",
          Tags: "",
          Shipping_class: "standard",
          Images: newProduct.images?.join(", ") || "",
          Brands: newProduct.brand || "",
          Attribute_1_name: "",
          Attribute_1_value: "",
          Attribute_1_visible: "1",
          Attribute_1_global: "0"
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody)
        });
        
        if (!response.ok) {
          throw new Error("Failed to create product");
        }
        
        const createdProduct = await response.json();
        console.log("Product created:", createdProduct);
        
        alert("Product added successfully!");
        
        // Refresh the product list from API
        fetchProducts(currentPage);
      } catch (error) {
        console.error("Error creating product:", error);
        alert("Failed to add product. Please try again.");
      }
    }
    // Close the dialog and reset the edit state
    setOpenSingleProductDialog(false);
    setEditProduct(null);
  };
  

  // Callback for bulk product addition (you can implement file upload logic here)
  function handleSubmitBulkProduct(file){
    // Here you would process the file and add products accordingly.
    console.log("Bulk file:", file);
    setOpenBulkProductDialog(false);
  };

  async function handleDeleteProduct(product){
    // Confirm before deleting
    const confirmDelete = window.confirm(`Are you sure you want to delete "${product.name}"?`);
    if (!confirmDelete) {
      return;
    }

    try {
      // Use model in the URL path for DELETE request
      const productModel = product.model;
      const response = await fetch(`${API_BASE_URL}/products/${productModel}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      
      console.log("Product deleted:", product.name);
      
      alert("Product deleted successfully!");
      
      // Refresh the product list from API
      fetchProducts(currentPage);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };


  return (
    <>
      <div className="products-page-product-container">
        <div className="products-page-product-container-header">
          <h1>PRODUCTS ({totalProducts})</h1>
          <div className="products-page-product-search-add-container">
            <div className="products-page-product-search">
              <input 
                type="text" 
                placeholder="Search by model" 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Auto-reset when search is cleared
                  if (e.target.value.trim() === "" && isSearchMode) {
                    setIsSearchMode(false);
                    setProducts([]);
                    setCurrentPage(1);
                    fetchProducts();
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}><Search size={24} color="white" /></button>
            </div>
            <button className="products-page-product-add-button" onClick={handleOpenAddProductDialog}><Plus size={24} color="white" />ADD</button>
          </div>
        </div>

        <div className="products-page-product-list">
          {
            products?.map((product) => (
              <div key={product?.id} className="products-page-product">
                <div className="products-page-product-image-name-container">
                  <img 
                    src={product?.images[0] || 'https://via.placeholder.com/150'} 
                    alt={product?.name}
                    onError={(e) => {

                      
                      // console.log('Product name:', product?.name);
                      // console.log('Product images:', product?.images);
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                    onLoad={(e) => {
                      console.log('✅ Image Loaded:', e.target.src);
                    }}
                  />
                  <h2>{product?.name}</h2>
                </div>
                <div className="products-page-product-info-container">
                  <div>
                    {product?.salePrice && parseFloat(product?.salePrice) > 0 ? (
                      <>
                        <p>Regular Price: ₹{parseFloat(product?.regularPrice).toFixed(2)}</p>
                        <p style={{color: '#ED1B24', fontWeight: 'bold'}}>Sale Price: ₹{parseFloat(product?.salePrice).toFixed(2)}</p>
                      </>
                    ) : (
                      <p>Price: ₹{parseFloat(product?.regularPrice).toFixed(2)}</p>
                    )}
                    {/* <p style={{fontSize: '0.9rem', color: '#666'}}>
                      {product?.inStock === "1" ? '✓ In Stock' : '✗ Out of Stock'}
                    </p> */}
                  </div>
                  <div className="products-page-product-button-container">
                    <button onClick={() => handleEditProduct(product)}>EDIT</button>
                    <button onClick={() => handleDeleteProduct(product)}>DELETE</button>
                  </div>
                </div>
              </div>
            ))
          }
          {!loading && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No products found. {isSearchMode ? 'Try a different search term.' : 'Add your first product!'}</p>
            </div>
          )}
        </div>
        {
          loading && <CircularProgress className="products-page-circular-progress" />
        }
        
        {/* Pagination */}
        {!loading && !isSearchMode && totalPages > 1 && (
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

      {/* Add Product Options Dialog */}
      <AddProductDialog
        open={openAddProductDialog}
        onClose={() => setOpenAddProductDialog(false)}
        onSelect={handleSelectAddOption}
      />

      {/* Add Single Product / Edit Product Dialog */}
      <AddSingleProductDialog
        open={openSingleProductDialog}
        onClose={() => {
          setOpenSingleProductDialog(false);
          setEditProduct(null);
        }}
        product={editProduct}
        onSubmit={handleSubmitSingleProduct}
      />

      {/* Add Bulk Product Dialog */}
      <AddBulkProductDialog
        open={openBulkProductDialog}
        onClose={() => setOpenBulkProductDialog(false)}
        onSubmit={handleSubmitBulkProduct}
      />
    </>

  );
}


// 1) AddProductDialog: Offers the two options.
function AddProductDialog({ open, onClose, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Product</DialogTitle>
      <DialogContent dividers>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSelect("single")}
          style={{ marginBottom: "10px", backgroundColor: "black" }}
          fullWidth
        >
          Add Single Product
        </Button>
        {/* <Button
          variant="contained"
          color="secondary"
          onClick={() => onSelect("bulk")}
          fullWidth
          sx={{ backgroundColor: "black" }}
        >
          Add Product in Bulk
        </Button> */}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

// 2) AddSingleProductDialog: Used both for adding and editing a product.
function AddSingleProductDialog({ open, onClose, product, onSubmit }) {
  const [id, setId] = useState(product ? product?.id : "");
  const [name, setName] = useState(product ? product?.name : "");
  const [type, setType] = useState(product ? product?.type : "");
  const [model, setModel] = useState(product ? product?.model : "");
  const [shortDesc, setShortDesc] = useState(product ? product?.shortDesc : "");
  const [description, setDescription] = useState(product ? product?.description : "");
  const [inStock, setInStock] = useState(product ? product?.inStock : "");
  const [salePrice, setSalePrice] = useState(product ? product?.salePrice : "");
  const [regularPrice, setRegularPrice] = useState(product ? product?.regularPrice : "");
  const [categories, setCategories] = useState(product && product?.categories ? product?.categories?.join(", ") : "");
  const [brand, setBrand] = useState(product ? product?.brand : "");
  const [images, setImages] = useState(product && product?.images ? product?.images?.join(", ") : "");
  const [currentUrl, setCurrentUrl] = useState(product ? product?.images[0] : "");

  // New image upload states
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([null, null, null, null, null, null]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState(["", "", "", "", "", ""]);
  const [isImagesSubmitted, setIsImagesSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiReturnedImageUrls, setApiReturnedImageUrls] = useState([]); // URLs returned from API
  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  
  const baseUrl = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";

  // ======== HANDLE UPLOAD FILE LOGIC (Presigned URL) ========
  const uploadFileToS3 = async (file) => {
    try {
      console.log("Starting upload for file:", file.name);
      
      const fileExtension = file.name.split(".").pop();
      console.log("File extension:", fileExtension);
      
      // Get pre-signed URL from your API
      const presignRes = await axios.post(`${baseUrl}/upload-url`, {
        tableType: 'products',
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
      
      return fileUrl;
      
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

  // Update form fields if the "product" prop changes
  useEffect(() => {
    if (product) {
      setId(product?.id || "");
      setName(product?.name || "");
      setType(product?.type || "");
      setModel(product?.model || "");
      setShortDesc(product?.shortDesc || "");
      setDescription(product?.description || "");
      setInStock(product?.inStock || "");
      setSalePrice(product?.salePrice || "");
      setRegularPrice(product?.regularPrice || "");
      setCategories(product?.categories ? product?.categories?.join(", ") : "");
      setBrand(product?.brand || "");
      setImages(product?.images ? product?.images?.join(", ") : "");
    } else {
      // Reset for add mode
      setId("");
      setName("");
      setType("");
      setModel("");
      setShortDesc("");
      setDescription("");
      setInStock("");
      setSalePrice("");
      setRegularPrice("");
      setCategories("");
      setBrand("");
      setImages("");
    }
  }, [product]);

  // Handle image file selection
  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const newUploadedImages = [...uploadedImages];
      newUploadedImages[index] = file;
      setUploadedImages(newUploadedImages);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviewUrls = [...imagePreviewUrls];
        newPreviewUrls[index] = reader.result;
        setImagePreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages[index] = null;
    setUploadedImages(newUploadedImages);

    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls[index] = "";
    setImagePreviewUrls(newPreviewUrls);
    
    setIsImagesSubmitted(false);
  };

  // Submit images
  const handleSubmitImages = async () => {
    try {
      setUploading(true);
      
      // Filter out null images and separate existing vs new uploads
      const imagesToUpload = uploadedImages.filter(img => img !== null);
      
      if (imagesToUpload.length === 0) {
        alert("Please select at least one image before uploading!");
        setUploading(false);
        return;
      }

      const uploadedUrls = [];
      
      for (const image of imagesToUpload) {
        if (image.isExisting) {
          // If it's an existing image, just use the URL
          uploadedUrls.push(image.url);
          console.log("Using existing image:", image.url);
        } else {
          // Upload new image to S3
          console.log("Uploading new image:", image.name);
          const fileUrl = await uploadFileToS3(image);
          uploadedUrls.push(fileUrl);
          console.log("Image uploaded successfully:", fileUrl);
        }
      }
      
      setApiReturnedImageUrls(uploadedUrls);
      setIsImagesSubmitted(true);
      alert(`Product images uploaded successfully!`);
      
      console.log("All uploaded image URLs:", uploadedUrls);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error.message || "Failed to upload images. Please try again.";
      alert(`Upload Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    // Check if images were uploaded but not submitted yet
    if (showImageUpload && uploadedImages.some(img => img !== null) && !isImagesSubmitted) {
      alert("Please submit the images before saving the product!");
      return;
    }
    
    const newProduct = {
      id,
      name,
      type,
      model,
      shortDesc,
      description,
      inStock,
      salePrice,
      regularPrice,
      categories: categories?.split(",").map((cat) => cat?.trim()).filter(Boolean),
      brand,
      images: showImageUpload && apiReturnedImageUrls.length > 0
        ? apiReturnedImageUrls  // Use S3 uploaded URLs from API
        : images?.split(",").map((img) => img?.trim()).filter(Boolean), // Use existing URL images
    };
    onSubmit(newProduct);
  };

  const handleOnClose = () => {
    setCurrentUrl("");
    setShowImageUpload(false);
    setUploadedImages([null, null, null, null, null, null]);
    setImagePreviewUrls(["", "", "", "", "", ""]);
    setIsImagesSubmitted(false);
    setUploading(false);
    setApiReturnedImageUrls([]);
    onClose();
  }
  return (
    <Dialog open={open} onClose={handleOnClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? "Edit Product" : "Add Single Product"}</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="normal"
          label="ID"
          fullWidth
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Type"
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Model"
          fullWidth
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Short Description"
          fullWidth
          multiline
          rows={2}
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="normal"
          label="In Stock"
          fullWidth
          value={inStock}
          onChange={(e) => setInStock(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Sale Price"
          fullWidth
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Regular Price"
          fullWidth
          value={regularPrice}
          onChange={(e) => setRegularPrice(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Categories (comma separated)"
          fullWidth
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Brand"
          fullWidth
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        
        {/* Commented out for image upload feature */}
        {/* <TextField
          margin="normal"
          label="Images URLs (comma separated)"
          fullWidth
          value={images}
          onChange={(e) => setImages(e.target.value)}
        /> */}

        {/* New Image Upload Section */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Button 
            variant="contained" 
            onClick={() => {
              const newShowState = !showImageUpload;
              setShowImageUpload(newShowState);
              
              // If opening image upload and we have a product with images, populate the boxes
              if (newShowState && product && product.images && product.images.length > 0) {
                const existingImages = product.images.slice(0, 6); // Take first 6 images
                const newPreviewUrls = [...imagePreviewUrls];
                const newUploadedImages = [...uploadedImages];
                
                // Fill the arrays with existing images
                existingImages.forEach((imageUrl, index) => {
                  newPreviewUrls[index] = imageUrl;
                  // Store existing image info
                  newUploadedImages[index] = { 
                    isExisting: true, 
                    url: imageUrl, 
                    name: `existing-image-${index + 1}.jpg` 
                  };
                });
                
                setImagePreviewUrls(newPreviewUrls);
                setUploadedImages(newUploadedImages);
              } else if (!newShowState) {
                // Reset when closing
                setImagePreviewUrls(["", "", "", "", "", ""]);
                setUploadedImages([null, null, null, null, null, null]);
                setIsImagesSubmitted(false);
                setUploading(false);
                setApiReturnedImageUrls([]);
              }
            }}
            sx={{ 
              backgroundColor: "#ED1B24", 
              '&:hover': { backgroundColor: "#c41620" },
              marginBottom: '15px'
            }}
          >
            {showImageUpload ? "Hide Image Upload" : "Add Image"}
          </Button>

          {showImageUpload && (
            <div className="image-upload-container">
              <div className="image-upload-grid">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className={`image-upload-item ${index === 0 ? 'cover-image-item' : ''}`}>
                    <div className={`image-upload-number ${index === 0 ? 'cover-image-label' : ''}`}>
                      {index === 0 ? '📷 Cover Image' : `Image ${index + 1}`}
                    </div>
                    
                    {imagePreviewUrls[index] ? (
                      <div className="image-preview-wrapper">
                        <img 
                          src={imagePreviewUrls[index]} 
                          alt={index === 0 ? 'Cover Image Preview' : `Preview ${index + 1}`}
                          className="image-preview"
                        />
                        <button 
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage(index)}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-placeholder">
                        <p>{index === 0 ? 'Select Cover Image' : 'No image selected'}</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRefs[index]}
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageChange(index, e)}
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={() => fileInputRefs[index].current.click()}
                      sx={{ 
                        marginTop: '10px',
                        color: '#ED1B24',
                        borderColor: '#ED1B24',
                        '&:hover': { 
                          borderColor: '#c41620',
                          backgroundColor: 'rgba(237, 27, 36, 0.04)'
                        }
                      }}
                      fullWidth
                    >
                      Browse Image
                    </Button>

                    {/* Show file name after submission */}
                    {isImagesSubmitted && uploadedImages[index] && (
                      <div className="uploaded-image-name">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{uploadedImages[index].name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Images Button */}
              <div className="submit-images-container">
                <Button
                  variant="contained"
                  onClick={handleSubmitImages}
                  disabled={uploading || !uploadedImages.some(img => img !== null) || isImagesSubmitted}
                  sx={{
                    backgroundColor: '#ED1B24',
                    color: 'white',
                    padding: '12px 40px',
                    fontSize: '16px',
                    fontWeight: '600',
                    '&:hover': {
                      backgroundColor: '#c41620',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666',
                    }
                  }}
                >
                  {uploading ? 'Uploading...' : (isImagesSubmitted ? '✓ Images Submitted' : 'Submit Images')}
                </Button>
                
                {isImagesSubmitted && (
                  <div className="api-response-container">
                    <p className="submission-success-message">
                      ✓ Images submitted successfully!
                    </p>
                    
                    {/* Display API returned image URLs */}
                    {apiReturnedImageUrls.length > 0 && (
                      <div className="api-urls-container">
                        <h4 className="api-urls-title">📎 API Returned Image URLs:</h4>
                        <div className="api-urls-box">
                          <p className="api-urls-text">
                            {apiReturnedImageUrls.join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            navigator.clipboard.writeText(apiReturnedImageUrls.join(', '));
                            alert('URLs copied to clipboard!');
                          }}
                          sx={{
                            marginTop: '10px',
                            color: '#ED1B24',
                            borderColor: '#ED1B24',
                            '&:hover': {
                              borderColor: '#c41620',
                              backgroundColor: 'rgba(237, 27, 36, 0.04)'
                            }
                          }}
                          size="small"
                        >
                          📋 Copy URLs
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Old image display (for URL-based images) */}
        {!showImageUpload && images && (
        <div className="products-page-add-edit-product-images">
          <div className="products-page-add-edit-product-images-grid">
            {
              images?.split(',').map((image, index) => {
                return (
                  <div key={index}>
                    <img src={image} alt="" onClick={() => setCurrentUrl(image)} />
                  </div>
                )
              })
            }
          </div>
          <div className="products-page-add-edit-product-images-preview">
            <img src={currentUrl} alt="" />
          </div>
        </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ backgroundColor: "black" }}>
          {product ? "Edit" : "Add"}
        </Button>
        <Button onClick={handleOnClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

// 3) AddBulkProductDialog: For bulk product addition.
function AddBulkProductDialog({ open, onClose, onSubmit }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    onSubmit(file);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Bulk Product</DialogTitle>
      <DialogContent dividers>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ backgroundColor: "black" }}>
          Add
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}





export default Products;