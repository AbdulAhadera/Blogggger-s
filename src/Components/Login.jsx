import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { app } from '../Firebase.js'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { FaSpinner } from 'react-icons/fa';

function Login() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [isLoading, setIsLoading] = useState()
    const navigate = useNavigate();

    const auth = getAuth(app);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                navigate('/home')
                toast.info('User is already Logged In')
            } else {
                // console.log('user logged Out')
                navigate('/login')
            }
        });
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)

        if (!password || !email) {
            toast.error('Enter Email and Password')
            setIsLoading(false)
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const uid = user.uid
                setIsLoading(false)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                toast.error(errorCode.slice(5))
                setIsLoading(false)
            });

    }
    const handleSignUp = () => {
        navigate('/signup')
    }

    return (
        <>
            <div className='container mx-auto my-3'>
                <div className='mx-auto w-11/12 lg:w-9/12  bg-gray-100 p-8 rounded-lg shadow-lg'>
                    <div className='flex justify-between'>
                        <h2 className="text-2xl font-semibold mb-4">Login</h2>

                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='mb-4'>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Email :
                            </label>
                            <input
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                                type="text"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='mb-4'>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Password :
                            </label>
                            <input
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                                type="password"
                                placeholder="Enter your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline md:w-1/6"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <FaSpinner className='animate-spin text-white text-lg' /> : "Login"}
                        </button>

                        <button
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 mt-2 w-full rounded focus:outline-none focus:shadow-outline sm:ml-0 md:w-1/2 md:ml-2  "
                            type="button"
                            onClick={handleSignUp}
                        >
                        Create new account
                        </button>
                    </form>
                </div>
                <ToastContainer />
            </div>
        </>
    )
}

export default Login