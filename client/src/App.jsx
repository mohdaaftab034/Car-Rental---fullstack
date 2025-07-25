import React, { useContext, useState } from 'react'
import Nav from './components/Nav'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import CarDetails from './pages/CarDetails';
import Cars from './pages/Cars';
import MyBooking from './pages/MyBooking';
import Footer from './components/Footer';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import ManageCar from './pages/owner/ManageCar';
import ManageBooking from './pages/owner/ManageBooking';
import AddCar from './pages/owner/AddCar';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import { AppContext } from './context/AppContext';

function App() {

  const {showLogin} = useContext(AppContext);
  const isOwnerPath = useLocation().pathname.startsWith('/owner')

  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      {!isOwnerPath && <Nav  />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBooking />} />
        <Route path='/owner' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-bookings' element={<ManageBooking />} />
          <Route path='manage-cars' element={<ManageCar />} />
        </Route>
      </Routes>
      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App