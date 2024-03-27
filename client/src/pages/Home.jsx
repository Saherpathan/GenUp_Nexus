import { useGlobalContext } from "../contexts/GlobalContext";
import { useEffect, useState } from "react";

import { RiLogoutCircleLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../components/Loader";
import axios from "../axios";

import { useTheme } from "next-themes";
import {
  Switch,
  Button,
  User,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
} from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Layout } from "../components/Layout";
import { IoSaveOutline } from "react-icons/io5";

const Home = () => {
  const { theme, setTheme } = useTheme();
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(user);
  }, []);

  return (
    <>
      <Layout>
        <div className="">
          {isLoading ? <Loader width="500px" height="250px" /> : null}
          <div className="flex justify-between m-2">
            <div className="m-2 text-2xl text-center">Home</div>
          </div>
          <Link to="/mindmap" className="p-2 m-2 text-primary">
            <Button className="flex m-2" color="primary" variant="shadow">
              Mindmap
            </Button>
          </Link>
          <Link to="/interview" className="p-2 m-2 text-primary">
            <Button className="flex m-2" color="secondary" variant="shadow">
              Interview
            </Button>
          </Link>
          <Link to="/roadmap" className="p-2 m-2 text-primary">
            <Button className="flex m-2" color="danger" variant="shadow">
              Roadmap
            </Button>
          </Link>
          <Link to="/savedmindmaps" className="p-2 m-2 text-primary">
            <Button className="flex m-2" color="warning" variant="shadow">
              Saved Mindmaps
            </Button>
          </Link>
        </div>
      </Layout>
    </>
  );
};

export default Home;
