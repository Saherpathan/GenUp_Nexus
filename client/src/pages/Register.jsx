import { useState, useEffect } from "react";
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
import { Meteors } from "../components/Meteors/Meteors.jsx";
import { MailIcon } from "./MailIcon.jsx";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon.jsx";
import { EyeFilledIcon } from "./EyeFilledIcon.jsx";
import { Icon } from "@iconify/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/modal";
import OtpForm from "./OTP.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const navigateTo = useNavigate();
  const { user, setUser } = useGlobalContext();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const handleOtpVerification = (otp) => {
    setVerifiedOtp(otp);
  };

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

  const handleEmailVerification = async (e) => {
    e.preventDefault();

    const validationErrors = Validator(form);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);

      try {
        // const res = await axios.post("/user/verifymail", { name: form.name, email: form.email });
        const res = await fetch( 'https://testforapi.vercel.app/user/verifymail', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "name": form.name, "email": form.email 
            }),
        });
        const result = res.data;
        setIsLoading(false);
        onOpen();
      } catch (error) {
        setIsLoading(false);
        setServerMsg(
          error.response.data.message || "Server error please try again later"
        );
        toast.error("Server error please try again later");
      }
    } else {
      setErrors(validationErrors);
    }
  }

  const handleSumbmit = async () => {
    const validationErrors = Validator(form);
    if (Object.keys(validationErrors).length === 0 && verifiedOtp.length === 6) {
      setIsLoading(true);

      try {
        const res = await axios.post("/user/signup", {form: form, otp: verifiedOtp});
        const result = res.data;
        localStorage.setItem("user", JSON.stringify({ ...result }));
        setUser(JSON.parse(localStorage.getItem("user")));
        toast.success("Registration successful!");
        setIsLoading(false);
        navigateTo("/user");
      } catch (error) {
        setIsLoading(false);
        setServerMsg(
          error.response.data.message || "Server error please try again later"
        );
        toast.error("Server error please try again later");
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
  };

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Card className="h-full rounded-none">
      <Meteors />
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <CardBody className="flex justify-center items-center align-middle">
        <Card className="w-[400px] h-full backdrop-blur-[3px] bg-transparent">
          <CardBody>
            <p className="text-[32px] font-extrabold text-center w-full">Register</p><br />
            <form onSubmit={handleEmailVerification} className="flex flex-col justify-center align-middle items-center">
              <Input placeholder="Enter your name..." color="primary" labelPlacement="outside" startContent={<Icon icon={'wpf:name'} fontSize={'24px'} />} type="name" label="Name" name="name" id="name" value={form.name} onChange={handleChange} isInvalid={errors.name ? true : false} isRequired className="m-2 w-[300px]" />
              {errors.name && <div className="m-2 text-red-500 text-[12px]">{errors.name}</div>}
              <Input placeholder="Enter your email..." color="primary" labelPlacement="outside" startContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />} type="email" label="Email" name="email" id="email" value={form.email} onChange={handleChange} isInvalid={errors.email ? true : false} isRequired className="m-2 w-[300px]" />
              {errors.email && <div className="m-2 text-red-500 text-[12px]">{errors.email}</div>}
              <Input placeholder="Set new password..." color="primary" labelPlacement="outside" startContent={ <button className="focus:outline-none" type="button" onClick={toggleVisibility}> {isVisible ? ( <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" /> ) : ( <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" /> )} </button> } type="password" label="Password" name="password" id="password" value={form.password} onChange={handleChange} isInvalid={errors.password ? true : false} isRequired className="m-2 w-[300px]" />
              {errors.password && ( <div className="p-1 m-2 text-red-500 text-[12px]">{errors.password}</div> )}
              <Input placeholder="Repeat password..." color="primary" labelPlacement="outside" startContent={ <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" /> } type="password" label="Confirm Password" name="confirmPassword" id="confirmPassword" value={form.confirmPassword} onChange={handleChange} isInvalid={errors.confirmPassword ? true : false} isRequired className="m-2 w-[300px]" />
              {errors.confirmPassword && ( <div className="p-1 m-2 text-red-500 text-[12px]">{errors.confirmPassword}</div> )}<br />
              <Button type="submit" className="flex m-2" color="primary" variant="shadow" isLoading={isLoading} >
                Sign up
              </Button>
              {serverMsg && <div className="p-1 m-2 text-red-500 text-[12px]">{serverMsg}</div>}
            </form>
          </CardBody>
          <CardFooter className="flex flex-col justify-center align-middle items-center">
            <Button onClick={googleSignin} className="flex m-2" color="secondary" variant="shadow" isLoading={isLoading} startContent={<ImGoogle />} >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>
      </CardBody>
      <Modal 
        backdrop="opaque"
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        hideCloseButton
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">Verify Mail</ModalHeader>
              <ModalBody className="z-[999]">
                <OtpForm onVerify={handleOtpVerification} />
              </ModalBody>
              <ModalFooter className="flex justify-center items-center">
                <Button isLoading={isLoading} color="primary" variant="shadow" onPress={handleSumbmit}>Submit</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default Register;