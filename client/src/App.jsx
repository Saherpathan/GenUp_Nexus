import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./contexts/ProtectedRoute";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Register from "./pages/Register";
import Landing from "./components/Landing/Landing";
import Mindmaps from "./components/User/mindmaps/Mindmaps";
import Interview from "./components/User/interview/Interview";
import Roadmaps from "./components/User/roadmaps/Roadmaps";
import SavedMindmaps from "./components/User/mindmaps/SavedMindmaps";
import MindmapOpener from "./components/User/mindmaps/MindmapOpener";
import Results from "./components/User/interview/Results";

function App() {
  localStorage.setItem("debug", true);

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/mindmap" element={<Mindmaps />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/interview/results/:id" element={<Results />} />
          <Route path="/roadmap" element={<Roadmaps />} />
          <Route path="/mindmap/personal" element={<SavedMindmaps />} />
          <Route path="/mindmap/save/:id" element={<MindmapOpener />} />
        </Route>
        
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </NextThemesProvider>
  );
}

export default App;
