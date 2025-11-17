import './App.css'
import {Route, Routes , BrowserRouter} from "react-router"
import UploadPage from "./pages/UploadPage"
import Header from './components/Header'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
function App() {

  return (
    <>
    <Toaster/>
      <Header/>
    
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<UploadPage/>} />
    </Routes>
    </BrowserRouter>
    <Footer/>
    </>
  )
}

export default App
