import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, } from 'firebase/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { ToastContainer, toast } from 'react-toastify';
import { app, db, storage } from '../Firebase'
import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';



function CreateBlog() {
  const auth = getAuth(app)
  const navigate = useNavigate()
  const [title, setTitle] = useState();
  const [blog, setBlog] = useState();
  const [cleanBlog, setCleanBlog] = useState();
  const [featuredImage, setFeaturedImage] = useState()
  const [loader, setLoader] = useState(false)
  const [pic, setPic] = useState()
  const [likes, setLikes] = useState(0)
  const [comment, setComment] = useState([])


  useEffect(() => {
    const authChange = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const uid = user.uid;
          const q = query(collection(db, "users"), where("userId", "==", uid));
          const querySnapshot = await getDocs(q);

          setPic(querySnapshot.docs.map(doc => doc.data().profilePic))
        } else {
          toast.error('user is logged out')
        }
      });
    };

    authChange();
  }, []);



  const handleBlogChange = (html) => {
    setBlog(html);
  };


  const handleAddBlog = async () => {
    setLoader(true)
    if (!title) return toast.error('Title is required')
    if (title.length < 3) toast.error('Tile must consist of at least 3 letters')
    if (!blog) return toast.error('Blog content is required')
    if (!featuredImage) return toast.error('Image is required')
    const sanitizedBlog = DOMPurify.sanitize(blog);
    setCleanBlog(sanitizedBlog);

    onAuthStateChanged(auth, async (user) => {

      if (user) {
        const q = query(collection(db, "users"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setPic(querySnapshot.docs.map(doc => doc.data().profilePic))
      } else {
        toast.error('user is logged out')
      }
    });



    const imageRef = ref(storage, `blogImages/${featuredImage.name}`);
    const snapshot = await uploadBytes(imageRef, featuredImage);
    const imageUrl = await getDownloadURL(snapshot.ref);



    const blogRef = await addDoc(collection(db, "blogs"), {
      title: title,
      blog: blog,
      blogPic: imageUrl,
      time: serverTimestamp(),
      authorId: auth.currentUser.uid,
      email: auth.currentUser.email,
      userPic: pic,
      likes: likes,
      comment: comment,
      likeState : false


    })
    await setDoc(doc(db, "blogs", blogRef.id), {
      title: title,
      blog: blog,
      blogPic: imageUrl,
      blogRef: blogRef.id,
      time: serverTimestamp(),
      authorId: auth.currentUser.uid,
      email: auth.currentUser.email,
      userPic: pic,
      likes: likes,
      comment: comment,
      likeState: false
    });
    navigate('/home')
    setLoader(false)
  }



  return (
    <div className='container mx-auto w-11/12  '>
      <div className='mt-3 bg-gray-100 rounded-md p-3'>

        <h1 className='font-semibold text-3xl'>Title :</h1>
        <input
          className='outline-teal-500 w-full h-9 p-3 font-semibold rounded-lg my-2'
          placeholder='Enter your title'
          onChange={e => setTitle(e.target.value)}
          value={title}
        />

        <h1 className='font-semibold text-3xl'>Blog content :</h1>
        <ReactQuill
          className='container bg-white mx-auto w-full my-2'
          theme="snow"
          onChange={handleBlogChange}
          value={blog}
        />

        <h1 className='font-semibold text-3xl'>Featured Image :</h1>
        <div className='lg:flex lg:items-center lg:justify-between'>
          <div className='lg:flex lg:items-center'>
            <input
              type='file'
              className='h-9 bg-white p-1 rounded-md w-full lg:w-auto lg:mr-2'
              onChange={e => setFeaturedImage(e.target.files[0])}
            />


            <button
              onClick={handleAddBlog}
              className='container h-8 bg-teal-500 px-5 py-1 my-3 font-semibold text-white rounded-md active:cursor-pointer w-full lg:w-auto flex items-center justify-center '
            >

              {loader ? <FaSpinner className='animate-spin' /> : 'publish blog'}
            </button>
          </div>
        </div>


      </div>
      <ToastContainer />
    </div>
  );
}

export default CreateBlog;
