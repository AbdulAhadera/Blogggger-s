
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { getAuth, signOut, } from "firebase/auth"
import { app, db } from "../Firebase"
import { toast } from "react-toastify"
import Logo from '../assets/blog-logo.png'

function Navbar() {

    const navigate = useNavigate();
    const auth = getAuth(app)

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                // console.log('User signed out successfully');
                navigate('/login')
            })
            .catch((error) => {
                toast.error('Error signing out:', error.message);
            });
    };


    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    const handleLogin = () => {
        navigate('/login')
    }
    const handleSignUp = () => {
        navigate('/signup')
    }

    return (
        <nav className=' bg-gray-100 py-1 px-1'>

            <div className="container mx-auto flex items-center justify-between">

                <Link to='/home' className='flex text-teal-500 text-2xl font-semibold'>
                    <img src={Logo}
                    className="h-8"
                    />
                    <p className="text-teal-600 text-md">Blogggger's</p>
                </Link>

                <button
                    className="text-teal-700 hover:cursor-pointer focus:outline-none md:hidden mr-2"
                    onClick={toggleDrawer}
                >
                    <FaBars className="" />
                </button>

                {/* Drawer */}

                <div
                    className={`md:hidden fixed inset-0 z-50 bg-gray-100 bg-opacity-100 transition-all duration-1000 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                        }`}>
                    <div className="flex justify-end bg-teal-500 font-semibold">
                        <button
                            className="text-white p-4"
                            onClick={toggleDrawer}>
                            Close
                        </button>
                    </div>

                    <div className="flex-flex-col items-center justify-center h-full">

                        <div onClick={toggleDrawer} className="h-12 hover:bg-gray-300 rounded-md mx-1 my-1 py-2">
                            <Link to='/home' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-3 mx-2">
                                Home
                            </Link>
                        </div>
                        <div onClick={toggleDrawer} className="h-12 hover:bg-gray-300 rounded-md mx-1 py-2">
                            <Link to='/dashboard' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-3 mx-2">
                                Dashboard
                            </Link>
                        </div>
                        <div onClick={toggleDrawer} className="h-12 hover:bg-gray-300 rounded-md mx-1 py-2">
                            <Link to='/profile' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-3 mx-2">
                                Profile
                            </Link>
                        </div>
                        <div onClick={toggleDrawer} className="h-12 hover:bg-gray-300 rounded-md mx-1 py-2">
                            <Link to='/create' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-3 mx-2">
                                Create Blog
                            </Link>
                        </div>

                        {
                            auth.currentUser ? (
                                <button onClick={() => { toggleDrawer(); handleLogout() }} className="bg-teal-500 mx-4 my-3 rounded-md text-white px-3 py-1 hover:cursor-pointer">
                                    Logout
                                </button>
                            ) : (
                                <div className="flex">
                                    <button
                                        onClick={() => { toggleDrawer(); handleLogin() }}
                                        className="bg-teal-500 rounded-md font-bold text-white px-3 py-2 mx-2 hover:cursor-pointer">
                                        Login
                                    </button>
                                    <button
                                        onClick={() => { toggleDrawer(); handleSignUp() }}
                                        className="bg-teal-500 rounded-md font-bold text-white px-3 py-2 mx-2 hover:cursor-pointer">
                                        SignUp
                                    </button>

                                </div>
                            )

                        }


                    </div>

                </div>




                <div className="hidden md:flex space-x-4">
                    <Link onClick={toggleDrawer} to='/home' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-1 ">Home</Link>
                    <Link to='/dashboard' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-1 ">Dashboard</Link>
                    <Link to='/profile' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-1 ">Profile</Link>
                    {/* <Link to='/saved' className="text-teal-500 font-semibold hover:text-teal-900 cursor-pointer px-2 py-1 ">Saved Blogs</Link> */}

                    {auth.currentUser ? (
                        <button onClick={handleLogout} className="bg-teal-500 rounded-md text-white px-3 py-1 hover:cursor-pointer">
                            Logout
                        </button>
                    ) : (
                        <div>
                            <button onClick={handleLogin} className="bg-teal-500 rounded-md text-white px-3 py-1 hover:cursor-pointer">Login</button>
                            <button onClick={handleSignUp} className="bg-teal-500 rounded-md text-white px-3 py-1 mx-1 hover:cursor-pointer">Signup</button>
                        </div>
                    )}



                </div>




            </div>



        </nav>
    )
}

export default Navbar
