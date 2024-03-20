import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from './components/Landing/Landing';
import Mindmaps from './components/User/mindmaps/Mindmaps';
import Interview from './components/User/interview/Interview';
import Roadmaps from './components/User/roadmaps/Roadmaps';
// import { Excalidraw } from "@excalidraw/excalidraw";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/user" element={<User />} /> */}
        <Route path="/mindmap" element={<Mindmaps />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/roadmap" element={<Roadmaps />} />
      </Routes>
    </Router>
  );
}

export default App;
