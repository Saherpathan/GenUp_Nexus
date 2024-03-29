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
import {
  MouseEnterProvider,
  CardContainerNav,
  CardBodyNav,
  CardItem,
} from "./3DCard/3dCard";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const { location, setLocation } = useTheme();
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const visible = prevScrollPos > currentScrollPos;

      setPrevScrollPos(currentScrollPos);
      setVisible(visible);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

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
    <MouseEnterProvider>
      <CardContainerNav className="inter-var">
        <CardBodyNav>
          <div
            className={`transition-all shadow-teal-500 shadow-lg ${
              visible ? "top-100" : "top-[-500px]"
            } z-10 sticky w-auto flex m-auto h-15 animate-shimmer items-center justify-center rounded-full border-2 ${
              theme === "light"
                ? "border-gray-300 bg-[linear-gradient(110deg,#EAFFFE,45%,#AAF0F1,55%,#EAFFFE)] bg-[length:200%_100%] text-grey-800"
                : "border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-200"
            } font-medium transition-colors`}
          >
            <Navbar
              maxWidth="400px"
              height="50px"
              className="z-10 items-center justify-center w-full m-auto bg-transparent rounded-full"
            >
              <CardItem as="button" translateZ="100">
                <NavbarBrand className="justify-center mr-4 space-x-3">
                  <Link to="/user">
                    <p className="font-bold sm:block text-[20px]">
                      GenUP Nexus
                    </p>
                  </Link>
                </NavbarBrand>
              </CardItem>
              <CardItem as="div" translateZ="50">
                <NavbarContent justify="end">
                  <NavbarItem>
                    <Switch
                      defaultSelected
                      size="md"
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
                      <Dropdown placement="right">
                        <DropdownTrigger>
                          <NavbarItem className="flex items-center justify-center align-middle">
                            <User
                              // name={user.result.name}
                              // description={user.result.email}
                              avatarProps={{
                                size: "md",
                                src:
                                  (user && user.result.picture) ||
                                  "https://img.icons8.com/?size=256&id=kDoeg22e5jUY&format=png",
                              }}
                            />
                          </NavbarItem>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Profile Actions"
                          variant="flat"
                        >
                          <DropdownItem key="profile" className="gap-2 h-14">
                            <p className="font-semibold">Signed in as</p>
                            <p className="font-bold">{user.result.name}</p>
                            {/* <p className="font-semibold">{user.result.email}</p> */}
                          </DropdownItem>
                          <DropdownItem key="settings">
                            <Link to="/user">My Dashboard</Link>
                          </DropdownItem>
                          <DropdownItem key="configurations">
                            {" "}
                            <Link to="/mindmap/personal">Saved Mindmaps</Link>
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
              </CardItem>
            </Navbar>
          </div>
        </CardBodyNav>
      </CardContainerNav>
    </MouseEnterProvider>
  );
}
