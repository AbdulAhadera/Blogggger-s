import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, app } from '../Firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DOMPurify from "dompurify";



function Dashboard() {

  const auth = getAuth(app);
  const navigate = useNavigate()

  const [blogs, setBlogs] = useState([]);




  useEffect(() => {

    onAuthStateChanged(auth, async (user) => {

      if (user) {

        const getBlogs = collection(db, 'blogs')
        const getBlogsSnapshot = await getDocs(getBlogs);
        let blogsArray = [];
        getBlogsSnapshot.forEach((doc) => {
          blogsArray.push(doc.data());
        });
        setBlogs(blogsArray);
      }
      else {
        // console.log("user not found ")
      }

    })
  }, [])



  return (
    <div className='sm:block p-3'>

      {
        blogs.map((item, index) => (
          <div
            key={index}
            className='w-full h-auto  p-2 mt-4 bg-gray-100 rounded-md shadow-md cursor-pointer '
          >
            <Link
              to={`/${item.blogRef}`}
              className="p-1 flex justify-between">
              <div
                className="w-2/3 h-28">
                <p className="text-md font-semibold md:text-4xl">{item.title.slice(0, 20)}...</p>

                <div className="text-sm leading-none text-gray-400 md:text-sm"
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

        ))
      }



    </div>

 )
}

export default Dashboard
