import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./contexts/ProtectedRoute";
import { ThemeProvider as NextThemesProvider } from "next-themes";

//Pages imports
import Login from "./pages/Login";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Mindmaps from "./components/User/mindmaps/Mindmaps";
import Interview from "./components/User/interview/Interview";
import Roadmaps from "./components/User/roadmaps/Roadmaps";
// import { Excalidraw } from "@excalidraw/excalidraw";

function App() {
  localStorage.setItem("debug", true);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/mindmap" element={<Mindmaps />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/roadmap" element={<Roadmaps />} />
        </Route>
        {/* <Route path="/" element={<Landing />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </NextThemesProvider>
  );
}

export default App;
