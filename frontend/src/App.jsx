import { useState } from "react";
import { isAuthenticated, logout } from "./auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Addhome from "./components/Addhome";
import Edithome from "./components/Edithome";
import MainPage from "./pages/mainpage/Index.jsx";
import Addguest from "./components/guest/Addguest/Addguest.jsx";
import ViewGuest from "./components/guest/viewguest.jsx";
import TypePage from "./pages/typepage/typepage.jsx";
import TypeDetailPage from "./pages/typepage/typepage";
import FlatListPage from "./pages/typepage/page/page.jsx";
import TwinHomeListPage from "./pages/typepage/twinhome/page.jsx";
import TwinHomeListPage2 from "./pages/typepage/twinhome2/page.jsx";
import TownhomeListPage from "./pages/typepage/townhome/page.jsx";
import EmployeeHomeListPage from "./pages/typepage/employee_home/page.jsx";
import LoobyPage from "./pages/lobby/page.jsx";
import LoobyPage2 from "./pages/lobby/page 2.jsx";
import ViewHome from "./components/viewhome/viewhome.jsx";
import Search from "./components/Search/Search.jsx";
import EditGuest from "./components/guest/Editguest/editguest.jsx";
import AuditLog from "./components/Auditlog/auditlog.jsx";
import ScoreForm from "./components/form/scoreform.jsx";
import Home from "./pages/Home.jsx";
import RetirementPage from "./components/retirement/retirement.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Addtype from "./pages/Addtype/Addtype";
// เพิ่ม import
import TwinHomeAllPage from "./pages/typepage/twinhome/all";


function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  const handleLogin = () => setLoggedIn(true);
  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route
          path="/"
          element={
            loggedIn ? <TypeDetailPage onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        /> */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/" element={<TypePage />} /> */}
        <Route path="/addhome" element={<Addhome />} />
        <Route path="/edithome/:id" element={<Edithome />} />
        <Route path="/homedetail" element={<HomePage />} />
        <Route path="/addguest/:home_id" element={<Addguest />} />
        <Route path="/guestview/:home_id" element={<ViewGuest />} />
        <Route path="/type" element={<MainPage />} />
        <Route path="/" element={<TypeDetailPage />} />
        <Route path="/flat" element={<FlatListPage />} />
        <Route path="/twin1" element={<TwinHomeListPage />} />
        <Route path="/twin2" element={<TwinHomeListPage2 />} />
        <Route path="/townhome" element={<TownhomeListPage />} />
        <Route path="/emphome" element={<EmployeeHomeListPage />} />
        <Route path="/d" element={<LoobyPage />} />
        {/* <Route path="/" element={<LoobyPage2 />} /> */}
        <Route path="/viewhome/:home_id" element={<ViewHome/>} />
        <Route path="/search" element={<Search />} />
        <Route path="/search" element={<Search />} />
        <Route path="/editguest/:id" element={<EditGuest />} />
        <Route path="/auditlog" element={<AuditLog />} />
        <Route path="/score" element={<ScoreForm />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/retirement" element={<RetirementPage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addtype" element={<Addtype />} />
        <Route path="/twinhome" element={<TwinHomeAllPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
