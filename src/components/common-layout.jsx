import { useContext, useState, useRef, useEffect} from "react";
import "../css/common-layout.css"
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Context } from "../context/context";

function CommonLayout() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const lastSegment = pathSegments[pathSegments.length - 1];
  const {user, logout} = useContext(Context);
  const [linkSelected, setLinkSelected] = useState(lastSegment);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const navigate = useNavigate();
  const logoutMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };
  return (
    <div className="common-layout-container">
      <div className="common-layout-sidebar">
        <div className="common-layout-logo-container">
          <h1>KHOSLA</h1>
          <h2>ELECTRONICS</h2>
        </div>
        <div className="common-layout-menu-container">
          <button className={linkSelected === "dashboard" ? "selected" : ""} onClick={()=>{
            setLinkSelected("dashboard");
            navigate("/admin-panel/dashboard");
          }}>Dashboard</button>
          <button className={linkSelected === "products" ? "selected" : ""} onClick={()=>{
            setLinkSelected("products");
            navigate("/admin-panel/products");
          }}>Product Management</button>
          <button className={linkSelected === "orders" ? "selected" : ""} onClick={()=>{
            setLinkSelected("orders");
            navigate("/admin-panel/orders");
          }}>Order Management</button>
          {/* <button className={linkSelected === "coupons"?"selected":""} onClick={()=>{
            setLinkSelected("coupons");
            navigate("/admin-panel/coupons");
          }}>Coupon Management</button> */}
          <button className={linkSelected === "banners"?"selected":""} onClick={()=>{
            setLinkSelected("banners");
            navigate("/admin-panel/banners");
          }}>Banner Management</button>
          <button className={linkSelected === "store-locator"?"selected":""} onClick={()=>{
            setLinkSelected("store-locator");
            navigate("/admin-panel/store-locator");
          }}>Store Locator</button>
          <button className={linkSelected === "extra-banner-management"?"selected":""} onClick={()=>{
            setLinkSelected("extra-banner-management");
            navigate("/admin-panel/extra-banner-management");
          }}>Extra Banner </button>
          <button className={linkSelected === "youtube-video"?"selected":""} onClick={()=>{
            setLinkSelected("youtube-video");
            navigate("/admin-panel/youtube-video");
          }}>Youtube Video</button>
          <button className={linkSelected === "offer-management"?"selected":""} onClick={()=>{
            setLinkSelected("offer-management");
            navigate("/admin-panel/offer-management");
          }}>Offer Management</button>
          <button className={linkSelected === "abandonment-cart"?"selected":""} onClick={()=>{
            setLinkSelected("abandonment-cart");
            navigate("/admin-panel/abandonment-cart");
          }}>Abandonment Cart</button>
          {/* <button className={linkSelected === "user-management"?"selected":""} onClick={()=>{
            setLinkSelected("user-management");
            navigate("/admin-panel/user-management");
          }}>User Management</button> */}
        </div>
      </div>
      <div className="common-layout-content">
        <div className="common-layout-header">
          <div className="common-layout-user-info-container">
            {/* <h1>{user?.name}</h1> */}
            <h1>KHOSLA ONLINE</h1>
            <p>Admin Panel</p>
            {/* <p>{user?.email}</p> */}
            {/* <p>{user.role}</p> */}
          </div>
          <div 
            className="avatar-container" 
            ref={logoutMenuRef}
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            <img src="../../public/avatar.webp" alt="" className="common-layout-avatar"/>
            {showLogoutMenu && (
              <div className="logout-dropdown">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="common-layout-body">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default CommonLayout;