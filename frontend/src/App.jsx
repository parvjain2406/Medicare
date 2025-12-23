import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';

/**
 * Main App Component
 * Sets up routing and authentication provider
 */
function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
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

                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;

