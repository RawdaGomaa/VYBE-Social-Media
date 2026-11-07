import { createBrowserRouter } from "react-router";
import Layout from "../../Components/Layout/Layout";
import Posts from "../../Pages/Posts/Posts";
import Login from "../../Pages/Login/Login";
import Register from "../../Pages/Register/Register";
import NotFound from "../../Pages/NotFound/NotFound";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import Profile from "../../Pages/Profile/Profile";
import Bookmarks from "../../Pages/Bookmarks/Bookmarks";
import Community from "../../Pages/Community/Community";
import Notifications from "../../Pages/Notifications/Notifications";
import Settings from "../../Pages/Settings/Settings";
import PostDetails from "../../Pages/PostDetails/PostDetails";
import UserProfile from "../../Pages/UserProfile/UserProfile";

export const router=createBrowserRouter([{path:"",element:<Layout/>,children:[{path:"login",element:<Login/>},{path:"register",element:<Register/>},{element:<ProtectedRoute/>,children:[{index:true,element:<Posts/>},{path:"posts",element:<Posts/>},{path:"posts/:postId",element:<PostDetails/>},{path:"profile",element:<Profile/>},{path:"users/:userId",element:<UserProfile/>},{path:"bookmarks",element:<Bookmarks/>},{path:"community",element:<Community/>},{path:"notifications",element:<Notifications/>},{path:"settings",element:<Settings/>}]},{path:"*",element:<NotFound/>}]}]);
