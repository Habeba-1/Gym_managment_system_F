import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { AuthContext } from '../AuthContext/AuthProvider';
import PublicRoute from '../components/CustomeRoute/PublicRoute';
import ProtectedRoute from '../components/CustomeRoute/ProtectedRoute';

// Lazy load dashboard & feature components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DashboardOverview = lazy(() => import('../pages/DashboardOverview'));
const Members = lazy(() => import('../pages/Members'));
const Attendance = lazy(() => import('../pages/Attendance'));
const Communication = lazy(() => import('../pages/Communication'));
const Staff = lazy(() => import('../pages/Staff'));
const Expenses = lazy(() => import('../pages/Expenses'));
const Reports = lazy(() => import('../pages/Reports'));
const Store = lazy(() => import('../pages/Store'));
const Equipment = lazy(() => import('../pages/Equipment'));
const Reminders = lazy(() => import('../pages/Reminders'));
const Login = lazy(() => import('../pages/Login/Login'));
const NotFound = lazy(() => import('../components/NotFound'));

export default function Routers() {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <Router>
            <Suspense fallback={<Loader isLoading={true} />}>
                <Routes>
                    {/* Root Path Logic */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated
                                ? <Navigate to="/dashboard" replace />
                                : <Navigate to="/login" replace />
                        }
                    />

                    {/* Public Route (Login) */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute isAuthenticated={isAuthenticated}>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard/overview" replace />} />
                        <Route path="overview" element={<DashboardOverview />} />
                        <Route path="members" element={<Members />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="communication" element={<Communication />} />
                        <Route path="staff" element={<Staff />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="store" element={<Store />} />
                        <Route path="equipment" element={<Equipment />} />
                        <Route path="reminders" element={<Reminders />} />
                    </Route>

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    );
}
