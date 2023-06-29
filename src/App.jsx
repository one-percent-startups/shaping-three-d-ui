import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoutes from "./components/protected routes/ProtectedRoutes";
import Auth from "./pages/auth/auth";
import SignUp from "./pages/auth/signup";
import Printers from "./pages/printers.jsx";
import PrinterDashboard from "./pages/printerdashboard.jsx";
import Logout from "./components/auth/logout";
import { PrinterConsole } from "./pages/printerConsole";
import Globals from "./pages/globals";

// import StudentDashboard from "./pages/student_dashboard";
// import NavBar from "./components/navigation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="logout" element={<Logout />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="printers" element={<Printers />} />
        <Route
          path="printers/:printerid"
          element={<PrinterDashboard />}
        ></Route>
        <Route
          path="printers/:printerId/console"
          element={<PrinterConsole />}
        ></Route>
        <Route path="globals" element={<Globals />} />
      </Route>
    </Routes>
  );
}

export default App;
