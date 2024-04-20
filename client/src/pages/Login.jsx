import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Validator from "../contexts/Validator";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios.js";
import axiosvercel from "../axios-vercel.js";
import { useGlobalContext } from "../contexts/GlobalContext";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import { useTheme } from "next-themes";
import { Switch, Input, Button } from "@nextui-org/react";
import { MoonIcon } from "../components/MoonIcon";
import { SunIcon } from "../components/SunIcon";
import { ImGoogle } from "react-icons/im";
import { toast } from "react-hot-toast";
import Background from "../components/Background/Background.jsx";
import { Layout } from "../components/Layout.jsx";
import { Meteors } from "../components/Meteors/Meteors.jsx";
import { MailIcon } from "./MailIcon.jsx";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon.jsx";
import { EyeFilledIcon } from "./EyeFilledIcon.jsx";
import { Label2 } from "../components/Form/Label.jsx";
import { Input2 } from "../components/Form/Input.jsx";
import { cn } from "../components/cn";

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
 
const LabelInputContainer = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const initialForm = {
  email: "",
  password: "",
};

const Login = () => {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();

  useEffect(() => {
    console.log(user);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

  const validationErrors = Validator({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors(validationErrors);
  };

  const handleSumbmit = async (e) => {
    e.preventDefault();

    const validationErrors = Validator(form);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);

      try {
        const res = await axiosvercel.post("/user/signin", form);
        const result = res.data;
        localStorage.setItem("user", JSON.stringify({ ...result }));
        setUser(JSON.parse(localStorage.getItem("user")));
        toast.success("Login successful!");
        setIsLoading(false);
        navigateTo("/user");
      } catch (error) {
        setIsLoading(false);
        setServerMsg(
          error.response.data.message || "Server error please try again later"
        );
        toast.error(
          error.response.data.message || "Server error please try again later"
        );
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const googleSignin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    window.location.href =
      "https://gen-up-nexus-server-v2.vercel.app/auth/google?sourceLink=" +
      encodeURIComponent(window.location.href);
  };
  //Google Auth Redirect
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  const userResult = queryParams.get("result");
  // console.log(token, userResult);
  if (token && userResult) {
    useEffect(() => {
      setIsLoading(true);
      const userG = {};
      userG.result = JSON.parse(userResult); // Parse the userResult JSON string into an object
      userG.token = token;
      localStorage.setItem("user", JSON.stringify(userG));
      setUser(JSON.parse(localStorage.getItem("user")));

      setIsLoading(false);
      navigateTo("/user");
    }, []);
  }

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Card className="h-full rounded-none">
      <Meteors />
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <CardBody className="flex justify-center items-center align-middle">
        <Card className="w-[400px] h-full backdrop-blur-[3px] bg-transparent">
          <CardBody>
          <p className="text-[32px] font-extrabold text-center w-full">Login</p><br />
          <form onSubmit={handleSumbmit} className="flex flex-col justify-center align-middle items-center">
            {/* <div className="flex flex-row justify-center items-center gap-2 w-full">
              <MailIcon className="text-3xl text-default-400 pointer-events-none flex-shrink-0" />
              <LabelInputContainer>
                <Label2 htmlFor="firstname"> First name</Label2>
                <Input2 id="firstname" placeholder="Enter your email..." type="email" />
              </LabelInputContainer>
            </div> */}
            <Input placeholder="Enter your email..." color="primary" labelPlacement="outside" startContent={ <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" /> } type="email" label="Email" name="email" id="email" value={form.email} onChange={handleChange} isInvalid={errors.email ? true : false} isRequired className="m-3 w-[300px]" />
            {errors.email && <div className="m-2 text-red-500 text-sm">{errors.email}</div>}<br />
            <Input placeholder="Enter your password..." color="primary" labelPlacement="outside" startContent={ <button className="focus:outline-none" type="button" onClick={toggleVisibility}> {isVisible ? ( <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" /> ) : ( <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" /> )} </button> } type="password" label="Password" name="password" id="password" value={form.password} onChange={handleChange} isInvalid={errors.password ? true : false} isRequired className="m-3 w-[300px]" />
            {errors.password && (<div className="p-1 m-2 text-red-500 text-sm">{errors.password}</div>)}
            <br />
            <Button type="submit" className="flex m-2 " color="primary" variant="shadow" isLoading={isLoading} >
              Sign in
            </Button>
            {serverMsg && <div className="p-1 m-2 text-red-500">{serverMsg}</div>}
          </form>
          </CardBody>
          <CardFooter className="flex flex-col justify-center align-middle items-center">
            <Button onClick={googleSignin} className="flex m-2" color="secondary" variant="shadow" isLoading={isLoading} startContent={<ImGoogle />} >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>
      </CardBody>
    </Card>
  );
};

export default Login;