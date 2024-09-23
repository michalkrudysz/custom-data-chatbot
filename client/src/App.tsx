import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import LoginPage, { action as loginAction } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

// Główny router aplikacji
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} action={loginAction} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
