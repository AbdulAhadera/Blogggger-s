
import Router from "./Routes"
import Navbar from './Components/Navbar'
import { BrowserRouter } from "react-router-dom"


function App() {

  return (
    <>
      <div>
        <BrowserRouter>
          <Navbar />
          <div>
            <Router />
          </div>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
