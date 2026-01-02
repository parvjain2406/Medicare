import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DoctorAuthProvider } from './context/DoctorAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import BedAvailability from './pages/BedAvailability';
import DoctorDashboard from './pages/DoctorDashboard';
import Landing from './pages/Landing';

/**
 * Main App Component
 * Sets up routing and authentication providers for both patients and doctors
 */
function App() {
    return (
        <Router>
            <AuthProvider>
                <DoctorAuthProvider>
                    <div className="app">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Patient Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/doctors"
                                element={
                                    <ProtectedRoute>
                                        <FindDoctors />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/appointment"
                                element={
                                    <ProtectedRoute>
                                        <BookAppointment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/records"
                                element={
                                    <ProtectedRoute>
                                        <MedicalRecords />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/prescriptions"
                                element={
                                    <ProtectedRoute>
                                        <Prescriptions />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/beds"
                                element={
                                    <ProtectedRoute>
                                        <BedAvailability />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Doctor Protected Routes */}
                            <Route
                                path="/doctor/dashboard"
                                element={
                                    <DoctorProtectedRoute>
                                        <DoctorDashboard />
                                    </DoctorProtectedRoute>
                                }
                            />

                            {/* Catch all - redirect to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </DoctorAuthProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
