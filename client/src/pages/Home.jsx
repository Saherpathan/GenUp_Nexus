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
import { MoonIcon } from "../components/MoonIcon";
import { SunIcon } from "../components/SunIcon";
import {toast} from "react-hot-toast";

const Home = () => {
  const { theme, setTheme } = useTheme();
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(user);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    toast.success("Logout successful!");
    navigateTo("/");
    setUser(null);
  };

  const deleteUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/user/delete");
      setIsLoading(false);
      toast.success("Account deleted successfully!");
      logout();
    } catch (error) {
      setIsLoading(false);
      toast.error("Account deletion failed!");
      console.log(error);
    }
  };

  return (
    <div className="">
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <div className="flex justify-between m-2">
        <div className="m-2 text-2xl text-center">Home</div>
        <User
          name={user.result.name}
          description={user.result.email}
          avatarProps={{
            src:
              (user && user.result.picture) ||
              "https://img.icons8.com/?size=256&id=kDoeg22e5jUY&format=png",
          }}
        />
        <div className="flex justify-between">
          <Switch
            defaultSelected
            size="lg"
            color="primary"
            thumbIcon={({ isSelected, className }) =>
              !isSelected ? (
                <SunIcon className={className} />
              ) : (
                <MoonIcon className={className} />
              )
            }
            onClick={() => {
              if (theme === "light") {
                setTheme("dark");
              } else if (theme === "dark") {
                setTheme("light");
              }
            }}
          />
          <Button
            onClick={logout}
            className="flex m-2"
            color="danger"
            variant="bordered"
            startContent={<RiLogoutCircleLine />}
          >
            logout
          </Button>
          <Button
            onClick={deleteUser}
            className="flex m-2"
            color="danger"
            variant="shadow"
            startContent={<MdDeleteOutline />}
          >
            Delete Account
          </Button>
        </div>
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
    </div>
  );
};

export default Home;
