import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { RouterProvider } from "react-router";
import { router } from "./Routing/AppRouter/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { PostUploadProvider } from "./context/PostUploadContext";

createRoot(document.getElementById("root")!).render(<StrictMode><ThemeProvider><AuthProvider><PostUploadProvider><RouterProvider router={router}/></PostUploadProvider></AuthProvider></ThemeProvider></StrictMode>);
