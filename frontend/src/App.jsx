import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { seedData } from "@/lib/seed";
import { useEffect } from "react";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound.jsx";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import FindDoctorPage from "./pages/patient/FindDoctorPage";
import BookAppointmentPage from "./pages/patient/BookAppointmentPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import AppointmentDetailPage from "./pages/patient/AppointmentDetailPage";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorAppointmentDetailPage from "./pages/doctor/DoctorAppointmentDetailPage";
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminPatientsPage from "./pages/admin/AdminPatientsPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    seedData();
  }, []);

  return (/*#__PURE__*/
    _jsxDEV(QueryClientProvider, { client: queryClient, children: /*#__PURE__*/
      _jsxDEV(TooltipProvider, { children: [/*#__PURE__*/
        _jsxDEV(Toaster, {}, void 0, false), /*#__PURE__*/
        _jsxDEV(Sonner, { position: "top-right", richColors: true }, void 0, false), /*#__PURE__*/
        _jsxDEV(BrowserRouter, { children: /*#__PURE__*/
          _jsxDEV(AuthProvider, { children: /*#__PURE__*/
            _jsxDEV(Routes, { children: [/*#__PURE__*/
              _jsxDEV(Route, { path: "/", element: /*#__PURE__*/_jsxDEV(Navigate, { to: "/login", replace: true }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/login", element: /*#__PURE__*/_jsxDEV(LoginPage, {}, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/register", element: /*#__PURE__*/_jsxDEV(RegisterPage, {}, void 0, false) }, void 0, false), /*#__PURE__*/

              _jsxDEV(Route, { path: "/patient", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "patient", children: /*#__PURE__*/_jsxDEV(PatientDashboard, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/patient/doctors", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "patient", children: /*#__PURE__*/_jsxDEV(FindDoctorPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/patient/book/:doctorId", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "patient", children: /*#__PURE__*/_jsxDEV(BookAppointmentPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/patient/appointments", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "patient", children: /*#__PURE__*/_jsxDEV(PatientAppointmentsPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/patient/appointments/:id", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "patient", children: /*#__PURE__*/_jsxDEV(AppointmentDetailPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/

              _jsxDEV(Route, { path: "/doctor", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "doctor", children: /*#__PURE__*/_jsxDEV(DoctorDashboard, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/doctor/appointments", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "doctor", children: /*#__PURE__*/_jsxDEV(DoctorAppointmentsPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/doctor/appointments/:id", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "doctor", children: /*#__PURE__*/_jsxDEV(DoctorAppointmentDetailPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/doctor/schedule", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "doctor", children: /*#__PURE__*/_jsxDEV(DoctorSchedulePage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/

              _jsxDEV(Route, { path: "/admin", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "admin", children: /*#__PURE__*/_jsxDEV(AdminDashboard, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/admin/doctors", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "admin", children: /*#__PURE__*/_jsxDEV(AdminDoctorsPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/admin/patients", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "admin", children: /*#__PURE__*/_jsxDEV(AdminPatientsPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/
              _jsxDEV(Route, { path: "/admin/appointments", element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { role: "admin", children: /*#__PURE__*/_jsxDEV(AdminAppointmentsPage, {}, void 0, false) }, void 0, false) }, void 0, false), /*#__PURE__*/

              _jsxDEV(Route, { path: "*", element: /*#__PURE__*/_jsxDEV(NotFound, {}, void 0, false) }, void 0, false)] }, void 0, true
            ) }, void 0, false
          ) }, void 0, false
        )] }, void 0, true
      ) }, void 0, false
    ));

};

export default App;