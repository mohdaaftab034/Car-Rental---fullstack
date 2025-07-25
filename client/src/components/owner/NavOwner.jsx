import React from 'react'
import { Link } from 'react-router-dom'
import { assets, dummyCarData, dummyUserData } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const NavOwner = () => {

    const { user } = useAppContext();

  return (
    <div>
        <div className='flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor relative transition-all'>
            <Link to='/'>
            <img src={assets.logo} alt="" className='h-7' />
            </Link>
            <p>Welcome, {user?.name || "Owner"}</p>
        </div>
    </div>
  )
}

export default NavOwner