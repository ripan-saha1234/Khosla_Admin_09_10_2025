import './App.css'
import CommonLayout from './components/common-layout'
import Products from './pages/products'
import Orders from './pages/orders'
import { Route, Routes, Navigate } from 'react-router-dom'
import Coupons from './pages/coupons'
import Dashboard from './pages/dashboard'
import Banners from './pages/banners'
import UserManagement from './pages/user-management'
import Login from './pages/login'
import { useContext } from 'react'
import { Context } from './context/context'
import StoreLocator from './pages/StoreLocator'
import ExtraBannerManagement from './pages/ExtraBannerManagement'
import YoutubeVideo from './pages/YoutubeVideo'
import OfferManagement from './pages/OfferManagement'
import AbandonmentCart from './pages/AbdonmentCart'

function App() {
  const { isAuthenticated } = useContext(Context);

  return (
    <>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/admin-panel/dashboard" /> : <Login />
        } />
        
        <Route path="/admin-panel" element={
          isAuthenticated ? <CommonLayout /> : <Navigate to="/login" />
        }>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path='banners' element={<Banners/>} />
          <Route path='user-management' element={<UserManagement />} />
          <Route path='store-locator' element={<StoreLocator />} />
          <Route path='extra-banner-management' element={<ExtraBannerManagement />} />
          <Route path='youtube-video' element={<YoutubeVideo />} />
          <Route path='offer-management' element={<OfferManagement />} />
          <Route path='abandonment-cart' element={<AbandonmentCart />} />
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/admin-panel/dashboard" : "/login"} />} />
      </Routes>
    </>
  )
}

export default App
