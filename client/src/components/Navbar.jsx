import React from "react";
import { useTheme } from "next-themes";
import {
  Navbar,
  Switch,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Input,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import { MoonIcon } from "./MoonIcon";
import { SunIcon } from "./SunIcon";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../contexts/GlobalContext";
import { useEffect, useState } from "react";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import axios from "../axios";
import { User } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const { location, setLocation } = useTheme();

  useEffect(() => {
    // console.log(user);
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
    <Navbar
      maxWidth="2xl"
      height="80px"
      isBordered
      className=" sticky top-[0vh] "
    >
      <NavbarBrand className="mr-4 space-x-3">
        <Link to="/">
          <p className="font-bold sm:block text-inherit ">GenUpNexus</p>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
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
        </NavbarItem>
        {!user ? (
          <Button
            onClick={() => navigateTo("/login")}
            color="primary"
            variant="shadow"
          >
            Login
          </Button>
        ) : (
          <div className="cursor-pointer">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <NavbarItem>
                  <User
                    name={user.result.name}
                    description={user.result.email}
                    avatarProps={{
                      src:
                        (user && user.result.picture) ||
                        "https://img.icons8.com/?size=256&id=kDoeg22e5jUY&format=png",
                    }}
                  />
                </NavbarItem>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="gap-2 h-14">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user.result.email}</p>
                </DropdownItem>
                <DropdownItem key="settings">
                  <Link to="/">My Dashboard</Link>
                </DropdownItem>
                <DropdownItem key="configurations">
                  {" "}
                  <Link to="/savedmindmaps">Saved Mindmaps</Link>
                </DropdownItem>
                <DropdownItem key="help_and_feedback">
                  Help & Feedback
                </DropdownItem>
                <DropdownItem key="logout" color="danger">
                  <Button
                    onClick={logout}
                    className="w-full "
                    color="danger"
                    variant="bordered"
                    startContent={<RiLogoutCircleLine />}
                  >
                    logout
                  </Button>
                </DropdownItem>
                <DropdownItem>
                  <Button
                    onClick={deleteUser}
                    className="w-full"
                    color="danger"
                    variant="shadow"
                    startContent={<MdDeleteOutline />}
                  >
                    Delete Account
                  </Button>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </NavbarContent>
    </Navbar>
  );
}
