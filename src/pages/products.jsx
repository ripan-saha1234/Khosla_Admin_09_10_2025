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
  Checkbox,
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
  const FILTER_API_BASE_URL = "https://ub3uejdxxh.execute-api.ap-south-1.amazonaws.com/dev";

  // Category dropdown state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([
    { value: "all", label: "All Categories" }
  ]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Featured products state (desktop and mobile)
  const [featuredProducts, setFeaturedProducts] = useState({
    desktop: new Set(),
    mobile: new Set()
  });
  const [featuredUpdating, setFeaturedUpdating] = useState({});


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
      
      // Fetch specifications and merge with products
      const specificationsMap = await fetchSpecifications();
      
      // Transform products, merging specifications
      const transformedProducts = productsArray.map(product => transformProductData(product, specificationsMap));

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
  const [openSpecificationDialog, setOpenSpecificationDialog] = useState(false);
  const [specificationProduct, setSpecificationProduct] = useState(null);

  // Helper function to transform product data
  const transformProductData = (product, specificationsMap = {}) => ({
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
    // Use specification from specifications API if available, otherwise use product's Specification field
    specification: specificationsMap[product.Model] || product.Specification || "",
    isFeatured: String(product?.is_featured || product?.Is_featured || "false") === "true",
    images: product.Images ? product.Images.split(',').map(img => {
      // Add base URL if image path is relative
      const trimmedImg = img.trim();
      if (trimmedImg.startsWith('/uploads')) {
        return `https://khoslaslider.s3.ap-south-1.amazonaws.com${trimmedImg}`;
      }
      return trimmedImg;
    }) : []
  });

  // Fetch all specifications and create a map by Model_no
  async function fetchSpecifications() {
    try {
      // Try to fetch all specifications - adjust endpoint if needed
      const response = await fetch(`${API_BASE_URL}/specifications`);
      
      if (!response.ok) {
        // If endpoint doesn't exist or returns error, return empty map
        console.warn("Could not fetch specifications:", response.status);
        return {};
      }

      const data = await response.json();
      
      // Handle different response structures
      let specificationsArray = [];
      if (Array.isArray(data)) {
        specificationsArray = data;
      } else if (data.specifications && Array.isArray(data.specifications)) {
        specificationsArray = data.specifications;
      } else if (data.data && Array.isArray(data.data)) {
        specificationsArray = data.data;
      }

      // Create a map: Model_no -> Specification
      const specificationsMap = {};
      specificationsArray.forEach(spec => {
        const modelNo = spec.Model_no || spec.model_no || spec.Model_No;
        const specText = spec.Specification || spec.specification;
        if (modelNo && specText) {
          specificationsMap[modelNo] = specText;
        }
      });

      return specificationsMap;
    } catch (error) {
      console.warn("Error fetching specifications:", error);
      return {};
    }
  }

  // Fetch products filtered by category
  async function fetchProductsByCategory(categoryName, pageNum = 1) {
    setLoading(true);
    try {
      // Use POST method with field and value as query parameters in URL
      const encodedCategory = encodeURIComponent(categoryName);
      const res = await fetch(`${FILTER_API_BASE_URL}/excel-data?field=categories&value=${encodedCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch products by category: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      // Log the response for debugging
      console.log('Raw API Response:', data);

      console.log('=== Category Filter API Response ===');
      console.log('Category:', categoryName);
      console.log('Complete API Response:', data);
      console.log('===================================');

      // Handle different response structures
      let productsArray = [];
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (data.body) {
        // Sometimes API wraps response in body
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        if (Array.isArray(bodyData)) {
          productsArray = bodyData;
        } else if (bodyData.products) {
          productsArray = bodyData.products;
        }
      }

      // Fetch specifications and merge with products
      const specificationsMap = await fetchSpecifications();
      
      // Transform products, merging specifications
      const transformedProducts = productsArray.map(product => transformProductData(product, specificationsMap));

      // Apply pagination to filtered results
      const totalFiltered = transformedProducts.length;
      const offset = (pageNum - 1) * itemsPerPage;
      const paginatedProducts = transformedProducts.slice(offset, offset + itemsPerPage);

      setProducts(paginatedProducts);
      setTotalProducts(totalFiltered);
      setTotalPages(Math.ceil(totalFiltered / itemsPerPage));
      setCurrentPage(pageNum);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      console.error("Error details:", error.message);
      alert(`Failed to fetch products by category: ${error.message}. Please check the console for details.`);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    }
    setLoading(false);
  }

  async function fetchProducts(pageNum = currentPage){
    setLoading(true);
    try {
      const offset = (pageNum - 1) * itemsPerPage;
      
      // Fetch both products and specifications in parallel
      const [productsRes, specificationsMap] = await Promise.all([
        fetch(`${API_BASE_URL}/products?limit=${itemsPerPage}&offset=${offset}`),
        fetchSpecifications()
      ]);
      
      const data = await productsRes.json();

      console.log('=== API Response ===');
      console.log('Complete API Response:', data);
      console.log('Total products:', data.total);
      console.log('Products count:', data.count);
      console.log('Current page:', pageNum);
      console.log('Items per page:', itemsPerPage);
      console.log('Offset:', offset);
      console.log('First product raw data:', data.products?.[0]);
      console.log('Specifications map:', specificationsMap);
      console.log('==================');

      if (data.products && data.products.length > 0) {
        // Transform API data to match our component structure, merging specifications
        const transformedProducts = data.products.map(product => transformProductData(product, specificationsMap));

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
      if (selectedCategory === "all") {
        fetchProducts(newPage);
      } else {
        fetchProductsByCategory(selectedCategory, newPage);
      }
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

  // Handle featured product checkbox changes
  const handleFeaturedDesktopChange = (productId) => {
    setFeaturedProducts(prev => {
      const newDesktop = new Set(prev.desktop);
      if (newDesktop.has(productId)) {
        newDesktop.delete(productId);
      } else {
        newDesktop.add(productId);
      }
      return {
        ...prev,
        desktop: newDesktop
      };
    });
  };

  const handleFeaturedMobileChange = (productId) => {
    setFeaturedProducts(prev => {
      const newMobile = new Set(prev.mobile);
      if (newMobile.has(productId)) {
        newMobile.delete(productId);
      } else {
        newMobile.add(productId);
      }
      return {
        ...prev,
        mobile: newMobile
      };
    });
  };

  // Toggle featured flag for a product
  const handleFeaturedToggle = async (product, checked) => {
    const model = product?.model || product?.Model;
    if (!model) {
      alert("Missing product model. Please try again.");
      return;
    }

    setFeaturedUpdating((prev) => ({ ...prev, [product.id]: true }));

    try {
      console.log('=== Featured Toggle Request ===');
      console.log('Product Model:', model);
      console.log('Product ID:', product.id);
      console.log('New Featured Status:', checked);
      console.log('API URL:', `${API_BASE_URL}/products/${model}/featured`);
      
      const response = await fetch(`${API_BASE_URL}/products/${model}/featured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: checked ? "true" : "false" })
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.error('API Error Response Body:', errorData);
          if (errorData) {
            try {
              const parsedError = JSON.parse(errorData);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } catch {
              errorMessage = errorData || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }

        // Determine if it's a frontend or backend error
        if (response.status >= 500) {
          console.error('❌ BACKEND ERROR: Server error (5xx)');
          throw new Error(`Backend Error: ${errorMessage}`);
        } else if (response.status >= 400 && response.status < 500) {
          console.error('❌ FRONTEND/CLIENT ERROR: Request issue (4xx)');
          throw new Error(`Client Error: ${errorMessage}`);
        } else {
          throw new Error(`Request Failed: ${errorMessage}`);
        }
      }

      // Success - parse response
      let responseData;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.warn('Could not parse response as JSON, but request was successful');
      }

      console.log('✅ Featured status updated successfully');
      console.log('Response Data:', responseData);
      console.log('==============================');

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isFeatured: checked } : p
        )
      );
    } catch (error) {
      console.error("❌ Error updating featured status:", error);
      console.error("Error Type:", error.name);
      console.error("Error Message:", error.message);
      console.error("Full Error:", error);
      
      // Check if it's a network error (frontend connectivity issue)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ FRONTEND ERROR: Network/Connectivity issue');
        alert("Network error: Could not connect to server. Please check your internet connection.");
      } else if (error.message.includes('Backend Error')) {
        alert("Backend Error: Server issue. Please try again later or contact support.");
      } else if (error.message.includes('Client Error')) {
        alert(`Request Error: ${error.message}. Please check the product data and try again.`);
      } else {
        alert(`Could not update featured status: ${error.message}. Please check the console for details.`);
      }
    } finally {
      setFeaturedUpdating((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Fetch categories from API
  async function fetchCategories() {
    setLoadingCategories(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await res.json();
      
      // Handle the API response structure: { success, count, categories: [...] }
      let categoriesArray = [];
      if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else {
        console.warn("Unexpected categories API response structure:", data);
        categoriesArray = [];
      }
      
      // Transform API response to dropdown format
      // Categories are strings, so use each string as both value and label
      const transformedCategories = categoriesArray.map(category => {
        // If category is a string, use it as both value and label
        if (typeof category === 'string') {
          return { value: category, label: category };
        }
        // If category is an object, extract value and label
        const value = category.value || category.id || category.category_id || category.name || category.category || '';
        const label = category.label || category.name || category.category_name || category.category || value;
        return { value: String(value), label: String(label) };
      });
      
      // Add "All Categories" option at the beginning
      setCategories([
        { value: "all", label: "All Categories" },
        ...transformedCategories
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Keep default "All Categories" option on error
      setCategories([{ value: "all", label: "All Categories" }]);
    } finally {
      setLoadingCategories(false);
    }
  }

  // Handle category filter
  const handleCategoryChange = (e) => {
    const categoryValue = e.target.value;
    setSelectedCategory(categoryValue);
    
    // Reset to first page when category changes
    setCurrentPage(1);
    
    // Exit search mode when filtering by category
    setIsSearchMode(false);
    setSearchTerm("");
    
    // Fetch products based on selected category
    if (categoryValue === "all") {
      fetchProducts(1);
    } else {
      fetchProductsByCategory(categoryValue, 1);
    }
  };

  useEffect(() => {
    if (!isSearchMode) {
      fetchProducts();
    }
  }, [isSearchMode]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

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
          Specification: newProduct.specification || "",
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
        
        // Also update the specification in the specifications API if specification is provided
        if (newProduct.specification && newProduct.specification.trim() !== "" && productModel) {
          try {
            const specResponse = await fetch(`${API_BASE_URL}/specifications/${productModel}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                Model_no: productModel,
                Specification: newProduct.specification
              })
            });
            
            if (!specResponse.ok) {
              // If specification doesn't exist, create it
              const createResponse = await fetch(`${API_BASE_URL}/specifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  Model_no: productModel,
                  Specification: newProduct.specification
                })
              });
              
              if (!createResponse.ok) {
                console.warn("Failed to sync specification to specifications API");
              }
            }
          } catch (specError) {
            console.warn("Error syncing specification:", specError);
            // Don't fail the product update if specification sync fails
          }
        }
        
        alert("Product updated successfully!");
        
        // Refresh the product list from API to show updated data
        // Maintain category filter when refreshing
        if (selectedCategory === "all") {
          fetchProducts(currentPage);
        } else {
          fetchProductsByCategory(selectedCategory, currentPage);
        }
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
          Specification: newProduct.specification || "",
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
        // Maintain category filter when refreshing
        if (selectedCategory === "all") {
          fetchProducts(currentPage);
        } else {
          fetchProductsByCategory(selectedCategory, currentPage);
        }
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
      // Maintain category filter when refreshing
      if (selectedCategory === "all") {
        fetchProducts(currentPage);
      } else {
        fetchProductsByCategory(selectedCategory, currentPage);
      }
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
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
              style={{
                padding: "8px 15px",
                fontSize: "14px",
                border: "1px solid #000",
                borderRadius: "6px",
                backgroundColor: loadingCategories ? "#f5f5f5" : "white",
                cursor: loadingCategories ? "not-allowed" : "pointer",
                marginRight: "10px",
                minWidth: "180px",
                opacity: loadingCategories ? 0.6 : 1
              }}
            >
              {loadingCategories ? (
                <option value="all">Loading categories...</option>
              ) : (
                categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))
              )}
            </select>
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
                  {/* Featured Checkboxes */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginRight: "20px",
                    minWidth: "200px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <Checkbox
                        checked={!!product?.isFeatured}
                        disabled={featuredUpdating[product.id]}
                        onChange={(e) => handleFeaturedToggle(product, e.target.checked)}
                        sx={{
                          color: "#ED1B24",
                          '&.Mui-checked': {
                            color: "#ED1B24",
                          },
                          padding: "4px"
                        }}
                      />
                      <label style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none"
                      }}>
                        Featured
                        {featuredUpdating[product.id] && (
                          <CircularProgress size={14} sx={{ color: "#ED1B24", marginLeft: "8px" }} />
                        )}
                      </label>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <Checkbox
                        checked={featuredProducts.desktop.has(product?.id)}
                        onChange={() => handleFeaturedDesktopChange(product?.id)}
                        sx={{
                          color: "#ED1B24",
                          '&.Mui-checked': {
                            color: "#ED1B24",
                          },
                          padding: "4px"
                        }}
                      />
                      <label style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none"
                      }}>
                        is_featured_home(desktop)
                      </label>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <Checkbox
                        checked={featuredProducts.mobile.has(product?.id)}
                        onChange={() => handleFeaturedMobileChange(product?.id)}
                        sx={{
                          color: "#ED1B24",
                          '&.Mui-checked': {
                            color: "#ED1B24",
                          },
                          padding: "4px"
                        }}
                      />
                      <label style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none"
                      }}>
                        is_featured_home(mobile)
                      </label>
                    </div>
                  </div>
                  <div className="products-page-product-button-container">
                    {(!product?.specification || product?.specification.trim() === "") && (
                      <button 
                        onClick={() => {
                          setSpecificationProduct(product);
                          setOpenSpecificationDialog(true);
                        }}
                        style={{ backgroundColor: '#28a745', marginRight: '5px' }}
                      >
                      SPEC
                      </button>
                    )}
                    <button onClick={() => handleEditProduct(product)}>EDIT</button>
                    <button onClick={() => handleDeleteProduct(product)}>DELETE</button>
                  </div>
                </div>
              </div>
            ))
          }
          {!loading && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No products found. {
                isSearchMode 
                  ? 'Try a different search term.' 
                  : selectedCategory !== "all" 
                    ? `No products found in category "${selectedCategory}".` 
                    : 'Add your first product!'
              }</p>
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
        onRefresh={() => {
          if (selectedCategory === "all") {
            fetchProducts(currentPage);
          } else {
            fetchProductsByCategory(selectedCategory, currentPage);
          }
        }}
        API_BASE_URL={API_BASE_URL}
      />

      {/* Add Bulk Product Dialog */}
      <AddBulkProductDialog
        open={openBulkProductDialog}
        onClose={() => setOpenBulkProductDialog(false)}
        onSubmit={handleSubmitBulkProduct}
      />

      {/* Specification Dialog */}
      <SpecificationDialog
        open={openSpecificationDialog}
        onClose={() => {
          setOpenSpecificationDialog(false);
          setSpecificationProduct(null);
        }}
        product={specificationProduct}
        onSuccess={() => {
          // Refresh products after specification update
          if (selectedCategory === "all") {
            fetchProducts(currentPage);
          } else {
            fetchProductsByCategory(selectedCategory, currentPage);
          }
        }}
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
function AddSingleProductDialog({ open, onClose, product, onSubmit, onRefresh, API_BASE_URL }) {
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
  const [specification, setSpecification] = useState(product ? product?.specification || "" : "");
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
      specification,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <TextField
            margin="normal"
            label="Specification"
            fullWidth
            multiline
            rows={4}
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            style={{ flex: 1 }}
          />
          {product && product.specification && product.specification.trim() !== "" && (
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this specification?")) {
                  try {
                    const productModel = product.model || model;
                    const response = await fetch(`${API_BASE_URL}/specifications/${productModel}`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error("Failed to delete specification");
                    }
                    
                    alert("Specification deleted successfully!");
                    setSpecification("");
                    
                    // Refresh products
                    if (onRefresh) {
                      onRefresh();
                    }
                  } catch (error) {
                    console.error("Error deleting specification:", error);
                    alert("Failed to delete specification. Please try again.");
                  }
                }
              }}
              sx={{ 
                backgroundColor: '#dc3545',
                '&:hover': { backgroundColor: '#c82333' },
                minWidth: '120px',
                height: '40px',
                marginTop: '16px'
              }}
            >
              Delete Spec
            </Button>
          )}
        </div>
        
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

// 4) SpecificationDialog: For adding/editing/deleting product specifications
function SpecificationDialog({ open, onClose, product, onSuccess }) {
  const [modelNo, setModelNo] = useState("");
  const [specification, setSpecification] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";

  // Update form when product changes
  useEffect(() => {
    const loadSpecification = async () => {
      if (product) {
        const model = product.model || "";
        setModelNo(model);
        
        // First set from product data
        let spec = product.specification || "";
        let hasSpec = !!(spec && spec.trim() !== "");
        
        // Try to fetch from specifications API if model exists
        if (model) {
          try {
            const response = await fetch(`${API_BASE_URL}/specifications/${model}`);
            if (response.ok) {
              const specData = await response.json();
              // Handle different response structures
              const fetchedSpec = specData.Specification || specData.specification || specData.Spec || "";
              if (fetchedSpec && fetchedSpec.trim() !== "") {
                spec = fetchedSpec;
                hasSpec = true;
              }
            }
          } catch (error) {
            console.warn("Could not fetch specification from API:", error);
            // Use product specification as fallback
          }
        }
        
        setSpecification(spec);
        setIsEditing(hasSpec);
      } else {
        setModelNo("");
        setSpecification("");
        setIsEditing(false);
      }
    };
    
    loadSpecification();
  }, [product]);

  const handleSubmit = async () => {
    if (!modelNo.trim()) {
      alert("Model number is required!");
      return;
    }

    if (!specification.trim()) {
      alert("Specification is required!");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/specifications${isEditing ? `/${modelNo}` : ""}`;
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Model_no: modelNo,
          Specification: specification
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save specification");
      }

      alert(isEditing ? "Specification updated successfully!" : "Specification added successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving specification:", error);
      alert(`Failed to save specification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this specification?")) {
      return;
    }

    if (!modelNo.trim()) {
      alert("Model number is required!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/specifications/${modelNo}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete specification");
      }

      alert("Specification deleted successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error deleting specification:", error);
      alert(`Failed to delete specification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? "Edit Specification" : "Add Specification"}</DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="normal"
          label="Model Number"
          fullWidth
          value={modelNo}
          onChange={(e) => setModelNo(e.target.value)}
          disabled={isEditing} // Disable model number when editing
          required
        />
        <TextField
          margin="normal"
          label="Specification"
          fullWidth
          multiline
          rows={6}
          value={specification}
          onChange={(e) => setSpecification(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        {isEditing && (
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ backgroundColor: "#dc3545", "&:hover": { backgroundColor: "#c82333" } }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        )}
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ backgroundColor: "black" }}
        >
          {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update" : "Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Products;