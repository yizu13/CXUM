import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import LandingPage from "../components/pages/LandingPage";
import ContactPage from "../components/pages/ContactPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/Contacto",
    element: <ContactPage/>
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
