
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "./Firebase";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import CreateBlog from './Pages/CreateBlog';
import Home from "./Pages/Home";
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import { FaSpinner } from "react-icons/fa";
import BlogScreen from "./Pages/BlogScreen";
import logo from '../src/assets/blog-logo.png';



const Router = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const auth = getAuth(app)


    useEffect(() => {
        const authChange = () => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const uid = user.uid;
                    // console.log(uid)
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            });
        };

        authChange();
    }, []);


    // Check User Authentication
    if (isAuthenticated === null) {

        return (
            <div className="flex justify-center items-center mt-56">

                <img src={logo}
                    className="h-16 absolute animate-ping"
                />

            </div>

        )

    }

    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/:id" element={<BlogScreen />} />
            {/* <Route path="/saved" element={isAuthenticated ? <SavedScreen /> : <Navigate to='/login' />} /> */}
            <Route path="/create" element={isAuthenticated ? <CreateBlog /> : <Navigate to='/login' />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        </Routes>

    );
};

export default Router;