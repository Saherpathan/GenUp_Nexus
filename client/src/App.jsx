import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./contexts/ProtectedRoute";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Register from "./pages/Register";
import Landing from "./components/Landing/Landing";
import Mindmaps from "./components/User/mindmaps/Mindmaps";
import Interview from "./components/User/interview/Interview";
import Roadmaps from "./components/User/roadmaps/Roadmaps";
import SavedRoadmaps from "./components/User/roadmaps/SavedRoadmaps";
import SavedMindmaps from "./components/User/mindmaps/SavedMindmaps";
import MindmapOpener from "./components/User/mindmaps/MindmapOpener";
import Results from "./components/User/interview/Results";
import { ReactFlowProvider } from "reactflow";
import genUp from './assets/logo.png';
import genUp2 from './assets/gen-up.png';
import { useEffect } from "react";
import { useState } from "react";

function App() {
  localStorage.setItem("debug", true);
  useEffect(() => {
    window.updateUI = (attributes) => {
      if (attributes.logo) {
        setDisLogo(attributes.logo);
        localStorage.setItem('disLogo', attributes.logo);
        updateFavicon(attributes.logo);
      }
    };
    updateFavicon(localStorage.getItem('disLogo') || 'new');
  }, []);

  const [disLogo, setDisLogo] = useState(() => {
    return localStorage.getItem('disLogo') || 'new';
  });

  const updateFavicon = (faviconUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    if(faviconUrl === 'old') {
      link.href = '/gen-up.png';
    }
    else {
      link.href = '/logo.png';
    }
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <Routes>
        <Route path="/" element={<Landing />} />                            {/* Hero Page */}
        <Route path="/auth" element={<Auth />} />                           {/* Login and Registeration combined */}
        
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<Home />} />                         {/* Main User Dashboard */ }

          <Route path="/interview" element={<Interview />} />               {/* Main Interview Interface */}
          <Route path="/interview/results/:id" element={<Results />} />     {/* Interview Results */}

          <Route path="/roadmap" element={<Roadmaps />} />                  {/* Generating a Roadmap */}
          <Route path="/roadmap/:id" element={<SavedRoadmaps />} />         {/* Following a Roadmap */}

          <Route path="/mindmap" element={ <ReactFlowProvider> <Mindmaps /> </ReactFlowProvider> } />                 {/* Generating a Mindmap */}
          <Route path="/mindmap/save/:id" element={ <ReactFlowProvider> <MindmapOpener /> </ReactFlowProvider> } />   {/* Viewing saved Mindmap */}
          <Route path="/mindmap/personal" element={<SavedMindmaps />} />                                              {/* List of saved Mindmaps */}
        </Route>
        
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
      </Routes>
    </NextThemesProvider>
  );
}

export default App;
