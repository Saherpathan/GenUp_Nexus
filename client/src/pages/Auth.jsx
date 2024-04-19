import React, { useEffect, useState } from 'react'
import './auth.css';
import Register from './Register';
import Login from './Login';
import Background from '../components/Background/Background';
import { Layout } from '../components/Layout';
import { WavyBackground } from '../components/WavyBackground/WavyBackground';
import { useTheme } from "next-themes";
import { MoonIcon } from "../components/MoonIcon";
import { SunIcon } from "../components/SunIcon";
import { Switch, Input, Button } from "@nextui-org/react";
import Sparkles from '../components/Sparkles/Sparkles';
import { LampContainer } from '../components/Lamp/Lamp';
import { motion } from "framer-motion";
import { TextRevealCard, TextRevealCardDescription, TextRevealCardTitle } from '../components/TextRevealCard/TextRevealCard';
import { TypewriterEffect, TypewriterEffectSmooth } from '../components/TypewriterEffect/TypewriterEffect';

const words = [
  {
    text: "Start",
  },
  {
    text: "learning",
  },
  {
    text: "with",
  },
  {
    text: "GenUP Nexus.",
    className: "text-blue-500 dark:text-blue-500",
  },
];

const Auth = () => {
  const { theme, setTheme } = useTheme();
	const [active, setActive] = useState(true);
  const [waveReload, setWaveReload] = useState(true);

	useEffect(() => {
    const signUpButton = document.getElementById('signUp');
		const signInButton = document.getElementById('signIn');
		const container = document.getElementById('container');

		signUpButton.addEventListener('click', () => {
				container.classList.add("right-panel-active");
				setActive(false);
		});

		signInButton.addEventListener('click', () => {
				container.classList.remove("right-panel-active");
				setActive(true);
		});
  }, []);

  return (
    <div>
      <Background /><br />
			<div className='p-5'>
			<div className={`container p-5 ${theme === 'light' ? ('bg-white') :  ('bg-[#1c1c1c]')}`} id="container">
					<div className="form-container sign-up-container">
							<Register />
					</div>
					<div className="form-container sign-in-container">
							<Login />
					</div>
					<div className="overlay-container rounded-xl shadow-xl flex flex-col justify-center align-middle items-center">
            <Switch className='absolute top-2 right-2 z-50' defaultSelected size="md" color="primary" thumbIcon={({ isSelected, className }) => !isSelected ? ( <SunIcon className={className} /> ) : ( <MoonIcon className={className} /> ) } onClick={() => { if (theme === "light") { setTheme("dark"); setWaveReload(false); const timer = setTimeout(() => {setWaveReload(true);}, 10); return () => clearTimeout(timer); } else if (theme === "dark") { setTheme("light"); setWaveReload(false); const timer = setTimeout(() => {setWaveReload(true);}, 10); return () => clearTimeout(timer); } }} />
            {/* <TextRevealCard className={`relative top-2 z-50 border-none ${theme === 'light' ? ('bg-white') :  ('bg-[#181818]')} p-0 pl-3`} text="GenUP Nexus " revealText="GenUP Nexus" /> */}
            <Sparkles className="w-full h-full absolute opacity-1 z-10" id="tsparticlesfullpage" background="transparent" minSize={0.6} maxSize={1.4} particleDensity={60} particleColor={theme === 'light' ? ('#000') : ('#FFF')} />
            {waveReload && (<WavyBackground backgroundFill={`${theme === 'light' ? ('white') :  ('#181818')}`} />)}
            <TypewriterEffectSmooth className={`absolute top-2 left-[50%] translate-x-[-50%] z-50 border-none`} words={words} />
            <div className="overlay-panel overlay-left w-full h-full z-20" style={{display: active ? ('none') : ('block')}}>
                <p className='text-2xl font-bold'>Welcome Back!</p>
                <p>To keep connected with us please login with your personal info</p><br />
                <Button color='success' variant="shadow" id="signIn"><b>Sign In</b></Button>
            </div>
            <div className="overlay-panel overlay-right w-full h-full z-20" style={{display: active ? ('block') : ('none')}}>
                <p className='text-2xl font-bold'>Hello, Friend!</p>
                <p>Enter your personal details and start journey with us</p><br />
                <Button color='success' variant="shadow" id="signUp"><b>Sign Up</b></Button>
            </div>
					</div>
			</div>
			</div>
		</div>
  )
}

export default Auth