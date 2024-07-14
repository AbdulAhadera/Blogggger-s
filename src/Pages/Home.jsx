import { useNavigate, Link } from "react-router-dom";
import { FaSearch } from 'react-icons/fa';
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { app, db } from '../Firebase';
import { query, collection, getDocs, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Home() {
    const auth = getAuth(app);
    const navigate = useNavigate();

    const [userBlogs, setUserBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredBlogs, setFilteredBlogs] = useState([]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        if (e.target.value) {
            const filtered = filterBlogsByTitle(allBlogs, e.target.value);
            setFilteredBlogs(filtered);
        } else {
            setFilteredBlogs(userBlogs); // Show only user's blogs if search is empty
        }
    };

    const filterBlogsByTitle = (blogs, title) => {
        return blogs.filter((blog) =>
            blog.title.toLowerCase().includes(title.toLowerCase())
        );
    };

    const writeBlog = () => {
        navigate('/create');
    };

    useEffect(() => {
        const fetchAllBlogs = async () => {
            const blogsCollection = await getDocs(collection(db, 'blogs'));
            let allBlogsArray = [];
            blogsCollection.forEach(doc => {
                allBlogsArray.push(doc.data());
            });
            setAllBlogs(allBlogsArray);
        };

        const fetchUserBlogs = async (userId) => {
            const getBlogs = query(collection(db, 'blogs'), where('authorId', '==', userId));
            const getBlogsSnapshot = await getDocs(getBlogs);
            let blogsArray = [];
            getBlogsSnapshot.forEach(doc => {
                blogsArray.push(doc.data());
            });
            setUserBlogs(blogsArray);
            setFilteredBlogs(blogsArray); // Initially show only user's blogs
        };

        fetchAllBlogs();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserBlogs(user.uid);
            }
        });
    }, []);

    return (
        <>
            <div className="container mx-auto ">
                <div className="lg:mx-28 md:mx-10 mx-4 mt-3 h-10 shadow-md">
                    <div className="rounded-tl rounded-bl flex">
                        <input
                            className="bg-gray-100 w-full h-10 pl-3 rounded-tl rounded-bl outline-teal-500"
                            placeholder="Search blog"
                            value={search}
                            onChange={handleSearch}
                        />
                        <button
                            className="bg-teal-500 text-white p-3 active:bg-teal-700 active:cursor-pointer rounded-br rounded-tr"
                            onClick={handleSearch}
                        >
                            <FaSearch />
                        </button>
                    </div>

                    <button
                        className="bg-teal-500 w-full shadow-md font-semibold h-9 mt-2 text-white p-1.5 active:bg-teal-700 active:cursor-pointer rounded-md"
                        onClick={writeBlog}
                    >
                        Write a Blog
                    </button>

                    <div className='sm:block mt-3'>
                        {filteredBlogs.map((item, index) => (
                            <div
                                key={index}
                                className='w-full h-auto p-2 mt-4 bg-gray-100 rounded-md shadow-md cursor-pointer'
                            >
                                <Link
                                    to={`/${item.blogRef}`}
                                    className="p-1 flex justify-between">
                                    <div className="w-2/3 h-28">
                                        <p className="text-md font-semibold md:text-4xl">{item.title.slice(0, 20)}...</p>
                                        <div
                                            className="text-sm leading-none text-gray-400 md:text-sm"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.blog.slice(0, 120)) }}
                                        ></div>
                                    </div>
                                    <div className="">
                                        <img
                                            src={item.blogPic}
                                            className="h-20 rounded-md"
                                            alt="Blog Image"
                                        />
                                    </div>
                                </Link>
                                <hr className="mx-2 pb-1 border-t-2" />
                                <div className="flex justify-between">
                                    <div className="flex m-1">
                                        <img
                                            src={item.userPic[0]}
                                            className="rounded-full h-12 w-12"
                                            alt="User Image"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-500 pl-3">{item.email}</p>
                                            <p className="font-thin text-gray-400 pl-3">{new Date(item.time.seconds * 1000).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
