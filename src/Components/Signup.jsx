import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { app, storage, db } from '../Firebase';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import 'react-toastify/dist/ReactToastify.css';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

function Signup() {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [number, setNumber] = useState('');
    const [uploadImage, setUploadImage] = useState(null);
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [cropper, setCropper] = useState(null);
    const navigate = useNavigate();
    const imageRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageElement = imageRef.current;
                imageElement.src = reader.result;
                const cropperInstance = new Cropper(imageElement, {
                    aspectRatio: 1,
                    viewMode: 1,
                });
                setCropper(cropperInstance);
            };
            reader.readAsDataURL(file);
            setUploadImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!uploadImage) {
            toast.error("Image is required");
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be greater than 8 characters");
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Password does not match');
            setIsLoading(false);
            return;
        }

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
            })
            .then(async () => {
                const croppedCanvas = cropper.getCroppedCanvas();
                const croppedDataUrl = croppedCanvas.toDataURL('image/jpeg');
                const imageRef = ref(storage, `userImages/${uploadImage.name}`);
                await uploadString(imageRef, croppedDataUrl, 'data_url');
                const imageUrl = await getDownloadURL(imageRef);

                const docRef = await addDoc(collection(db, "users"), {
                    email: email,
                    number: number,
                    userId: auth.currentUser.uid,
                    profilePic: imageUrl,
                });
                await setDoc(doc(db, "users", docRef.id), {
                    email: email,
                    number: number,
                    userId: auth.currentUser.uid,
                    userDocRef: docRef.id,
                    profilePic: imageUrl,
                });
                toast.success('User registered successfully');
            })
            .then(() => {
                setIsLoading(false);
                navigate('/home');
            })
            .catch((error) => {
                const errorCode = error.code;
                toast.error(errorCode.slice(5));
                setIsLoading(false);
            });
    };

    return (
        <div className='container mx-auto my-3'>
            <div className='mx-auto w-11/12 lg:w-9/12 bg-gray-100 p-8 rounded-lg shadow-lg'>
                <div className='flex justify-between'>
                    <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <div className='mx-auto bg-white h-20 w-20 rounded-full flex justify-center items-center'>
                            <input
                                type='file'
                                className='w-20 h-20 rounded-full opacity-0 absolute cursor-pointer'
                                onChange={handleFileChange}
                            />
                            <FaCamera className='text-gray-500 rounded-full absolute cursor-wait' />
                        </div>
                        <img ref={imageRef} alt="Crop preview" style={{ display: 'none' }} />
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email :
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                            type="text"
                            placeholder="Enter your email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='mb-4'>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Number :
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                            type="number"
                            placeholder="Enter your Number"
                            value={number}
                            required
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                    <div className='mb-4'>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password :
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                            type="password"
                            placeholder="Enter your Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className='mb-4'>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm Password :
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-teal-500 focus:shadow-outline"
                            type="password"
                            placeholder="Enter your Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <p className='text-gray-500 mb-2'>already a member <Link to={'/login'} className='text-blue-600 font-semibold cursor-pointer'>Sign In...</Link></p>
                    <button
                        className="flex justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline md:w-1/6"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <FaSpinner className='animate-spin' /> : 'SignUp'}
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Signup;
