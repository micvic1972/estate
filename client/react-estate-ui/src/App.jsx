import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "./pages/homepage/Homepage"; 
import Listpage from "./pages/listpage/Listpage"; 
import Login from "./pages/login/Login";
import Singlepage from "./pages/singlepage/Singlepage";
import Profile from "./pages/profile/Profile"; //  Imported as Profile
import Register from "./pages/register/Register";
import Forgetpasssword from "./pages/forgetpassword/Forgetpassword"; //  Imported as Forgetpasssword
// FIXED: Both functions are imported using clean named curly braces from a single line
import { Layout, RequireAuth } from "./pages/layout/Layout"; 
import VerifyOtp from "./pages/verifyotp/Verifyotp";
import UpdateProfile from "./pages/updateprofile/Updateprofile";
const router = createBrowserRouter([
  {
    //  Group A: Public paths inside the standard Layout wrapper
    //this doesnt not it public accessable to anyone without login
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {path: "/verifyotp", element: <VerifyOtp/>},
      {path: "/forgot-password", element: <Forgetpasssword/> }
    ]
  },
  {
    // Group B: Private, guarded paths inside the RequireAuth checkpoint wrapper
    //this path require login before access grant else to login page
    path: "/",
    element: <RequireAuth />,
    children: [
      // FIXED: Switched element to <Profile /> to match your import line perfectly
      { path: "/profile", element: <Profile /> }, 
      { path: "/list", element: <Listpage /> },
      { path: "/:id", element: <Singlepage /> },
      {path: "/profile/update", element: <UpdateProfile/>}
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
