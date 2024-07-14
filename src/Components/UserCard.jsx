
import { getAuth, onAuthStateChanged, updateEmail, } from 'firebase/auth'
import { app, db } from '../Firebase'
import { useNavigate } from 'react-router-dom';
import { query, collection, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function UserCard() {
    const auth = getAuth(app);
    const navigate = useNavigate()
    const [userEmail, setUserEmail] = useState();
    const [userNumber, setUserNumber] = useState();
    const [userImage, setUserImage] = useState()

    const handleUpdateEmail = async () => {

        const { value: email } = await Swal.fire({
            title: "Input email address",
            input: "email",
            inputLabel: "Your email address",
            inputPlaceholder: "Enter your email address",
            animation: false,
            confirmButtonColor: '#38B2AC',
            focusConfirm: true,
            confirmButtonText: "Confirm Email"
        });

        toast.error('please verify the old email first')

        await updateEmail(auth.currentUser, email)
            .then(() => {
            }).catch((error) => {
                // console.log(error)
            });

    }

    const handleUpdateNumber = async () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const q = query(collection(db, "users"), where("userId", "==", user.uid));
                const userDocRef = await getDocs(q);
                const documentIds = userDocRef.docs.map(doc => doc.id);
                const documentRefInString = documentIds.join(', ');

                if (documentRefInString !== null) {
                    try {
                        const { value: newNumber } = await Swal.fire({
                            title: "Input your number",
                            input: "number",
                            inputLabel: "Your Number",
                            inputPlaceholder: "Enter your number",
                            animation: false,
                            confirmButtonColor: '#38B2AC',
                            focusConfirm: true,
                            confirmButtonText: "Confirm Number"
                        });

                        await updateDoc(doc(db, "users", documentRefInString), {
                            number: newNumber,
                        });
                        // console.log("Number updated successfully");
                        toast.success("Number updated successfully");


                    } catch (error) {
                        toast.error("Error updating number");
                    }
                } else {
                    toast.error('Number is not provided')
                }


            } else {
                toast.error('User must sign in');
            }
        })
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uid = user.uid;
                const q = query(collection(db, "users"), where("userId", "==", uid));
                const querySnapshot = await getDocs(q);
                setUserEmail(querySnapshot.docs.map(doc => doc.data().email));
                setUserNumber(querySnapshot.docs.map(doc => doc.data().number))
                setUserImage(querySnapshot.docs.map(doc => doc.data().profilePic))
            } else {
                // console.log('User must sign in');
                navigate('/login');
            }
        });

    }, [])


    return (
        <>
            <div className='container mx-auto my-6'>
                <div className={'sm:w-1/2 md:w-7/12 lg:w-3/5 container mx-auto w-11/12 bg-gray-100 rounded-md py-3 shadow-md'}>


                    {!(userEmail && userNumber) ? (
                        <>
                            <div className="p-4 max-w-sm w-full mx-auto">
                                <div className="rounded-full bg-slate-300 h-24 w-24 mx-auto mb-2"></div>
                                <div className="animate-pulse flex space-x-4">

                                    <div className="flex-1 space-y-1 py-1">

                                        <div className="h-8 bg-slate-300 rounded"></div>
                                        <div className="h-8 bg-slate-300 rounded"></div>
                                        <div className="h-8 bg-slate-300 rounded"></div>


                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='py-2'>
                                <img
                                    className='mx-auto my-2 max-h-24 rounded-full'
                                    src={userImage}
                                    alt='Loading'
                                />
                            </div>
                            <div className='bg-white mx-2 h-8 py-0.5 rounded-sm my-1.5 flex justify-between'>
                                <h3 className='pl-2 font-semibold'>Email: {userEmail}</h3>
                                <button onClick={handleUpdateEmail} className='pr-2'><FaPencilAlt /></button>
                            </div>
                            <div className='bg-white mx-2 h-8 py-0.5 rounded-sm my-1.5 flex justify-between'>
                                <h3 className='pl-2 font-semibold'>Number: {userNumber}</h3>
                                <button className='pr-2' onClick={handleUpdateNumber}><FaPencilAlt /></button>
                            </div>
                            <div className='bg-white mx-2 h-8 py-0.5 rounded-sm my-1.5'>
                                <button className='font-semibold pl-2'>Change Password</button>
                            </div>
                        </>
                    )}
                </div>
                <ToastContainer />
            </div>
        </>
    );

}

export default UserCard
