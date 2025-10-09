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
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/admin-panel/dashboard" : "/login"} />} />
      </Routes>
    </>
  )
}

export default App
