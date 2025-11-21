import './App.css'
import { Route, Routes, BrowserRouter } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

// ✅ Lazy load Terms page
const Terms = lazy(() => import("./pages/Terms"));
const Profile = lazy(() => import("./pages/Profile"));
const isLoggedIn=  true //localStorage.getItem("isLoggedIn")
const PublicOnly = ({ isLoggedIn, children }) => {
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const PrivateOnly = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};
function App() {
  return (
    <>
      <Toaster />
      <Header />
      
      <BrowserRouter>
  <Suspense fallback={<div className="text-center py-20">Loading...</div>}>

    <Routes>
      {/* Public pages that only NON-logged-in users should access */}
      <Route
        path="/login"
        element={
          <PublicOnly isLoggedIn={isLoggedIn}>
            <Login />
          </PublicOnly>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicOnly isLoggedIn={isLoggedIn}>
            <Signup />
          </PublicOnly>
        }
      />

      {/* Private pages that only logged-in users can access */}
      <Route
        path="/upload-doc"
        element={
          <PrivateOnly isLoggedIn={isLoggedIn}>
            <UploadPage />
          </PrivateOnly>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateOnly isLoggedIn={isLoggedIn}>
            <Profile />
          </PrivateOnly>
        }
      />

      {/* Public for everyone */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={<Home />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>

  </Suspense>
</BrowserRouter>


      <Footer />
    </>
  );
}

export default App;
