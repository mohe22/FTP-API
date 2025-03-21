import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import ProtectedRoute from "./context/protected-route";
import Landing from "./pages/landing";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardLayout from "./context/admin-dashboard-layout";
import AdminUsers from "./pages/admin-users";
import AdminGroups from "./pages/admin-groups";
import AdminSingleUser from "./pages/admin-single-user";
import AdminSingleGroup from "./pages/admin-single-group";
import AdminActivity from "./pages/admin-activity";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <AdminDashboardLayout>
            <AdminDashboard/>
          </AdminDashboardLayout>
        }
      />
       <Route
        path="/admin-dashboard/users"
        element={
          <AdminDashboardLayout>
            <AdminUsers/>
          </AdminDashboardLayout>
        }
      />
   
       <Route
        path="/admin-dashboard/users/:id"
        element={
          <AdminDashboardLayout>
            <AdminSingleUser/>
          </AdminDashboardLayout>
        }
      />
      <Route
        path="/admin-dashboard/groups"
        element={
          <AdminDashboardLayout>
            <AdminGroups/>
          </AdminDashboardLayout>
        }
   
      />
        <Route
        path="/admin-dashboard/activity"
        element={
          <AdminDashboardLayout>
            <AdminActivity/>
          </AdminDashboardLayout>
        }
      />
      <Route
        path="/admin-dashboard/groups/:id"
        element={
          <AdminDashboardLayout>
            <AdminSingleGroup/>
          </AdminDashboardLayout>
        }
      />
      <Route path="/landing" element={<Landing />} />
    </Routes>
  );
}

export default App;
