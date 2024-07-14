import { useState, useEffect, useRef } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { PiPaperPlaneTiltFill } from "react-icons/pi";
import { MdBookmark } from "react-icons/md";
import { GoBookmarkSlashFill } from "react-icons/go";
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaComment, FaDownload, FaPencilAlt, FaSpinner, FaThumbsUp, FaTrash, FaLink } from "react-icons/fa";
import { db, app } from '../Firebase';
import { doc, getDoc, deleteDoc, updateDoc, increment, collection, getDocs, arrayUnion, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DOMPurify from 'dompurify';
import Swal from 'sweetalert2';
import logo from '../assets/blog-logo.png'


function BlogScreen() {
    const [optionBox, setOptionBox] = useState(false);
    const [saved, setSaved] = useState(false)
    const [likes, setLikes] = useState(false);
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [userRef, setUserRef] = useState(null);
    const [activeUserImg, setActiveUserImg] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [comment, setComment] = useState('');
    const [openCommentBox, SetOpenCommentBox] = useState(false);
    const [commentDeleteBox, setCommentDeleteBox] = useState(null);
    const [allComments, setAllComments] = useState([]);
    const [author, setAuthor] = useState(true);
    const [uid, setUid] = useState(null);

    const auth = getAuth(app);
    const navigate = useNavigate();
    let { id } = useParams();

    const ToggleOptionBox = () => {
        setOptionBox(!optionBox);
    };

    const copyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            Swal.fire({
                title: 'Copied!',
                text: 'The link has been copied to your clipboard.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
        }).catch(err => {
            Swal.fire({
                title: 'Error',
                text: 'Failed to copy the link.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        });
    }

    const handleLike = async () => {
        const updateBlogLike = doc(db, "blogs", id);
        if (!likes) {
            setCount(count + 1);
            await updateDoc(updateBlogLike, { likes: increment(1) });
            await updateDoc(updateBlogLike, { likeState: true });
            setLikes(true);
        } else {
            setCount(count - 1);
            await updateDoc(updateBlogLike, { likes: increment(-1) });
            await updateDoc(updateBlogLike, { likeState: false });
            setLikes(false);
        }
    };

    const deleteBlog = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteDoc(doc(db, "blogs", id));
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
                navigate('/home');
            }
        });
    };

    const updateBlog = async () => {
        const updateBlogRef = doc(db, "blogs", id);

        const { value: title } = await Swal.fire({
            input: "textarea",
            inputLabel: "Enter New Title",
            inputPlaceholder: "Type your title here...",
            inputAttributes: {
                "aria-label": "Type your text here"
            },
            showCancelButton: true,
        });

        if (title) {
            Swal.fire("Title updated successfully");

            const updateBlog = { title };

            updateDoc(updateBlogRef, updateBlog)
                .then(() => {
                    location.reload();
                })
                .catch((error) => {
                    console.error('Error updating document: ', error);
                });
        }
    };

    const addComment = async () => {
        const uniqueId = uuidv4();

        const blogRef = doc(db, "blogs", id);
        await updateDoc(blogRef, {
            comment: arrayUnion({ comment, activeUserImg, userEmail, uniqueId })
        });

        setAllComments([...allComments, { comment, activeUserImg, userEmail, uniqueId }]);
        setComment('');
    };

    const commentBox = async () => {
        const docRef = doc(db, "users", userRef);
        const docSnap = await getDoc(docRef);


        const fetchComments = doc(db, 'blogs', id);
        const commentsSnap = await getDoc(fetchComments);

        const authorQuery = query(collection(db, 'blogs'), where("authorId", "==", docSnap.data().userId));
        const querySnapshot = await getDocs(authorQuery);

        querySnapshot.forEach((doc) => {
            let userEmail = doc.data().email;
            if (userEmail === blog.email) {
                setAuthor(true);
            } else {
                setAuthor(false);
            }
        });

        if (commentsSnap.exists()) {
            setAllComments(commentsSnap.data().comment || []);
        } else {
            // console.log("No such document!");
        }
        if (!openCommentBox) {
            SetOpenCommentBox(true);
        }
        if (docSnap.exists()) {
            setActiveUserImg(docSnap.data().profilePic);
            setUserEmail(docSnap.data().email);
        } else {
            // console.log('error');
        }
    };

    const deleteComment = async (commentId) => {
        const blogRef = doc(db, "blogs", id);

        const updatedComments = allComments.filter(comment => comment.uniqueId !== commentId);
        await updateDoc(blogRef, {
            comment: updatedComments
        });
        setAllComments(updatedComments);
    };

    const openCommentDialogue = (id) => {
        if (commentDeleteBox === id) {
            setCommentDeleteBox(null);
        } else {
            setCommentDeleteBox(id);
        }
    };

    useEffect(() => {
        const fetchBlog = async () => {
            const blogDoc = await getDoc(doc(db, 'blogs', id));

            if (blogDoc.exists()) {
                setBlog(blogDoc.data());
                setCount(blogDoc.data().likes);
                setLikes(blogDoc.data().likeState);
            } else {
                // console.log("Blog not found");
            }
            setLoading(false);
        };



        onAuthStateChanged(auth, async (user) => {
            if (user) {
                fetchBlog();
                const uid = user.uid;
                const q = query(collection(db, "users"), where("userId", "==", uid));
                const querySnapshot = await getDocs(q);
                const userRefArray = querySnapshot.docs.map(doc => doc.data().userDocRef);
                const userReference = userRefArray.join('');
                setUserRef(userReference);
                setUid(user.uid);
            } else {
                // console.log("User not authenticated");
                setLoading(false);
            }
        });
    }, [id, auth]);

    if (loading) {
        return (
            <div className='flex justify-center mt-32 align-middle'>
                <FaSpinner className='animate-spin text-3xl text-teal-500' />
            </div>);
    }

    if (!blog) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='text-center'>
                    <img
                        src={logo}
                        className='h-20 mx-auto'
                        alt="Logo"
                    />
                    <p>
                        Blog not found
                    </p>
                </div>
            </div>

            )
    }

    return (
        <div className='container mx-auto'>
            <div className='md:m-3 lg:m-3 lg:mx-40 bg-gray-100 m-2 rounded-md'>


                <div className='p-2 flex justify-between'>
                    <div className='flex'>
                        <img
                            className='h-12 w-12 rounded-full mr-2'
                            src={blog.userPic[0]}
                            alt="User"
                        />
                        <div className='h-12'>
                            <Link to={'/profile'} className='text-md font-semibold text-gray-500'>{blog.email}</Link>
                            <p className='text-sm font-thin'>{new Date(blog.time.seconds * 1000).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className='my-2'>
                        <FiMoreHorizontal
                            onClick={ToggleOptionBox}
                            size={20}
                            color="gray"
                            className='cursor-pointer hover:bg-gray-300 hover:rounded-full'
                        />
                        {optionBox ? (
                            <div className='relative right-24 bottom-6'>
                                <div className='absolute m-4 bg-white shadow-xl w-24 h-22 rounded-md p-0.5'>
                                    <button
                                        onClick={deleteBlog}
                                        className='flex items-center h-8 active:bg-gray-300 hover:bg-gray-200 hover:rounded-md hover:cursor-pointer m-1'>
                                        <FaTrash color='red' className='ml-2' />
                                        <span className="ml-1 mr-3 text-red-500 font-semibold">Delete</span>
                                    </button>
                                    <hr className='mx-3 border-t-1 border-gray-300' />
                                    <button
                                        onClick={updateBlog}
                                        className='flex items-center h-8 hover:bg-gray-200 hover:rounded-md hover:cursor-pointer m-1'>
                                        <FaPencilAlt color='gray' className='ml-2' />
                                        <span className="ml-1 mr-7 text-gray-500 font-semibold">Edit</span>
                                    </button>
                                    <hr className='mx-3 border-t-1 border-gray-300' />
                                    <button
                                        onClick={copyLink}
                                        className='flex items-center h-8 active:bg-gray-300 hover:bg-gray-200 hover:rounded-md hover:cursor-pointer m-1'>
                                        <FaLink color='gray' className='ml-2' />
                                        <span className="ml-1 mr-3 text-gray-500 font-semibold">  Copy  </span>
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <hr className='mx-2 border-t-1 border-gray-300' />

                <div className='m-2'>
                    <img
                        className='w-full h-auto rounded-md'
                        src={blog.blogPic}
                        alt="Blog"
                    />
                </div>

                <hr className='mx-2' />
                <div className='m-1 flex justify-center'><p className='p-1 text-2xl font-bold '>{blog.title}</p></div>
                <hr className='mx-2' />
                <div className='m-2' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.blog) }} />

                <div className='flex justify-evenly p-2'>
                    <div
                        onClick={handleLike}
                        className='w-1/3 flex items-center hover:bg-gray-300 h-7 rounded-md justify-center pt-1.5'>
                        <p className={likes ? 'mr-2 font-bold text-teal-500' : 'mr-2 font-bold text-gray-600'}>{count}</p>
                        <FaThumbsUp className={likes ? 'text-teal-500' : 'text-gray-500'} />
                    </div>
                    <div className='w-1/3 hover:bg-gray-300 h-7 rounded-md flex justify-center pt-1.5'
                        onClick={commentBox}>
                        <FaComment className='text-gray-500' />
                    </div>

                </div>

                <hr className='mx-2' />
                {openCommentBox ? (
                    <div className='bg-gray-100 rounded-md'>
                        <div className='flex mx-2 py-1 h-12 '>
                            <img src={activeUserImg} className='h-10 w-10 rounded-full mx-2' />
                            <div className='flex justify-between w-screen bg-white rounded-full'>
                                <input
                                    className='rounded-lg ml-2 pl-3 h-10 w-11/12 font-semibold'
                                    placeholder='Write your comment...'
                                    onChange={(e) => { setComment(e.target.value) }}
                                    value={comment}
                                />
                                <button onClick={addComment}>
                                    <PiPaperPlaneTiltFill className='text-gray-500 text-2xl mr-2 hover:text-teal-500' />
                                </button>
                            </div>
                        </div>

                        {allComments.map((item) => (
                            <div key={item.uniqueId} className='relative flex mx-2 py-1'>
                                <img
                                    className='h-8 rounded-full'
                                    src={item.activeUserImg}
                                    alt="User"
                                />
                                <div className='h-auto bg-white mx-1 rounded-md px-2'>
                                    <div className='flex justify-between'>
                                        <p className='font-semibold text-sm'>{item.userEmail}</p>
                                    </div>
                                    <p className='text-xs'>{item.comment}</p>
                                </div>

                                {author ?
                                    <div className='relative'>
                                        <div
                                            className='h-6 w-6 flex justify-center items-center hover:bg-gray-300 rounded-full cursor-pointer'
                                            onClick={() => openCommentDialogue(item.uniqueId)}
                                        >
                                            <FiMoreHorizontal className='relative' />
                                        </div>

                                        {commentDeleteBox === item.uniqueId && (
                                            <div className='absolute -top-5 left-3 mt-8 w-auto px-2 bg-white flex shadow-lg rounded-md cursor-pointer'>
                                                <FaTrash className='text-red-500 m-1.5' />
                                                <p onClick={() => deleteComment(item.uniqueId)} className='text-red-500 my-0.5 font-semibold cursor-pointer'>Delete</p>
                                            </div>
                                        )}
                                    </div> : <div></div>
                                }
                            </div>
                        ))}
                    </div>
                ) : (
                    <div></div>
                )}

            </div>
        </div>
    );
}

export default BlogScreen;
