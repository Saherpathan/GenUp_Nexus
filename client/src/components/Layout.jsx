import Footer from "./Footer";
import NavBar from "./Navbar";
import { Toaster } from "react-hot-toast";

export const Layout = ({ children }) => (
  <>
    <div className="bg-grid">
      
    </div>
    <NavBar />
    <div className=""> {children}</div>
    <div>
      <Toaster />
    </div>

    {/* <div className="absolute bottom-0">
      <Footer />
    </div> */}
  </>
);
