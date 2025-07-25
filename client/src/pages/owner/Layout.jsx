import React, { use, useEffect } from 'react'
import NavOwner from '../../components/owner/NavOwner'
import SideBar from '../../components/owner/SideBar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, navigate } = useAppContext();

  useEffect(() => {
    if (!isOwner) {
      navigate('/');
    }
  })
  return (
    <div className='flex flex-col'>
      <NavOwner />
      <div className='flex'>
        <SideBar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout