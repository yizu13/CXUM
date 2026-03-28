import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import LandingPage from "../components/pages/LandingPage";
import ContactPage from "../components/pages/ContactPage";
import VolunteersPage from "../components/pages/VolunteersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/Contacto",
    element: <ContactPage />,
  },
  {
    path: "/Voluntarios",
    element: <VolunteersPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
