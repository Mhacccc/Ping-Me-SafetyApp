import { Routes, Route} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./context/Login";
import Signup from "./context/Signup";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./layouts/AppLayout";
import People from "./pages/People";
import UserProfile from "./pages/UserProfile";
import Places from "./pages/Places";
import NotificationsPage from "./pages/NotificationsPage";
import Report from "./pages/Report";
import Home from "./pages/Home"
import "./App.css"

function App() {


  // derive active nav item from pathname

  return (
    <>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<AppLayout/>}>
              <Route index element={<Home />} />
              <Route path="people" element={<People />} />
              <Route path="report" element={<Report />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="places" element={<Places />} />
              <Route path="userProfile/:userId" element={<UserProfile/>} />
            </Route>
          </Route>
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </>

  );
}

export default App;
