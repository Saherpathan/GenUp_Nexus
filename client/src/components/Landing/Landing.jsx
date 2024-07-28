import React, { useRef } from 'react'
import Background from "../Background/Background";
import { Image, Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';
import Sparkles from '../Sparkles/Sparkles';
import GoogleGeminiEffect from '../GoogleGeminiEffect/GoogleGeminiEffect';
import { useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import HoverEffect from '../CardHoverEffect/CardHoverEffect';
import external1 from '../../assets/external1.png';
import external2 from '../../assets/external2.png';
import external3 from '../../assets/external3.png';
import external4 from '../../assets/external4.png';
import external5 from '../../assets/external5.png';
import external6 from '../../assets/external6.png';
import external7 from '../../assets/external7.png';
import external8 from '../../assets/external8.png';
import external9 from '../../assets/external9.svg';
import BackgroundGradient from '../CardBackgroundGradient/CardBackgroundGradient';
import aibot from '../../assets/aibot.svg';
import { Chip } from "@nextui-org/react";
import {
  MouseEnterProvider,
  CardContainerHome,
  CardBodyHome,
  CardItemHome,
} from "../../components/3DCard/3dCard";
import aiBot from '../../assets/aibot.svg';
import genUp from '../../assets/logo.png';
import genUp2 from '../../assets/gen-up.png';
import roadmapIcon from '../../assets/roadmap.png';
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "../HeroHighlight/HeroHighlight";
import { TypewriterEffectSmooth } from '../TypewriterEffect/TypewriterEffect';
import { useEffect } from 'react';
import { useState } from 'react';

export const projects = [
  {
    title: "Facial Emotion Image Detection",
    image: external1,
    description: "For detecting facial emotions in the interview.",
    link: "https://huggingface.co/dima806/facial_emotions_image_detection",
  },
  {
    title: "OpenAI - Whisper",
    image: external4,
    description: "For generating audio transcription in real time.",
    link: "https://github.com/openai/whisper",
  },
  {
    title: "Google vit-base-patch16-224-in21k",
    image: external5,
    description: "Vision Transformer for training over facial expressions data.",
    link: "https://huggingface.co/google/vit-base-patch16-224-in21k",
  },
  {
    title: "BERT Roberta base-go_emotions",
    image: external6,
    description: "For audio transcript text Sentiment analysis.",
    link: "https://huggingface.co/SamLowe/roberta-base-go_emotions",
  },
  {
    title: "Body Language: Mediapipe",
    image: external8,
    description: "To detect the body language of the candidate during interview.",
    link: "https://github.com/google/mediapipe",
  },
  {
    title: "Video Processing: OpenCV",
    image: external9,
    description: "For performing operations on the video data.",
    link: "https://opencv.org/",
  }
];

const transition = {
  duration: 0,
  ease: "linear",
};

const Landing = () => {
  const { theme, setTheme } = useTheme();
  useEffect(() => { setTheme('dark'); setDisLogo(localStorage.getItem('disLogo') || 'new'); });
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [disLogo, setDisLogo] = useState(() => {
    return localStorage.getItem('disLogo') || 'new';
  });
 
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

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

  return (
    <div>
      <Background />
      <div className={`h-[100dvh] w-full bg-opacity-75 bg-black border-none flex flex-col items-center justify-center overflow-hidden rounded-md`}>        
        <HeroHighlight className={'h-[100dvh] flex flex-col justify-center align-middle items-center'}>
          <MouseEnterProvider>
            <CardContainerHome className="inter-var">
              <CardBodyHome className="relative group/card w-[40dvw] h-auto rounded-xl p-6 border-none bg-transparent">
                <CardItemHome translateZ="100" className="w-full mt-4 flex justify-center align-middle items-center relative">
                  <div className='absolute background-globe h-[150px] w-[150px]'></div>
                  <div className='w-full h-[250px] rounded-lg flex justify-center align-middle items-center z-10 relative'>
                    <div className='text-[72px] z-50 relative'>{disLogo === 'new' ? (
                      <Image src={genUp} width={'300px'}/>
                    ) : (
                      <Image src={genUp2} width={'300px'}/>
                    )}</div>
                    <div className='absolute background-globe h-[110px] w-[110px]'></div>
                  </div>
                </CardItemHome>
              </CardBodyHome>
            </CardContainerHome>
          </MouseEnterProvider>
          <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20 text-[24px] modded-bg bg-gradient-to-r from-blue-700 to-red-600 text-transparent">
            GenUP Nexus
          </h1>
          <div className="w-[40rem] h-40 relative">
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
            <Sparkles background="transparent" minSize={0.4} maxSize={1} particleDensity={1200} className="w-full h-full" particleColor="#FFFFFF" />
            <div className="absolute inset-0 w-full h-full bg-black bg-opacity-80 [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
          </div>        
          <Link to={'/user'}><Button color='primary' variant='shadow' endContent={<Icon icon={'fluent:arrow-right-12-filled'} fontSize={'24px'} />}><p className='font-bold text-lg'>Get Started</p></Button></Link>
        </HeroHighlight>
      </div>

      <div className="w-full bg-black  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex flex-col items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <>
          <br /><br />
          <div className='w-full flex flex-col gap-7 justify-center align-middle items-center'>
            <BackgroundGradient>
              <button className="px-8 py-2 rounded-full relative bg-slate-700 text-white text-sm hover:shadow-2xl hover:shadow-white/[0.1] transition duration-200 border border-slate-600">
                <div className="absolute inset-x-0 h-[2px] w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                <span className="relative z-20 text-large">
                  <b>Features</b>
                </span>
              </button>
            </BackgroundGradient>
            <div className="flex flex-col md:flex-row gap-5 justify-center w-full">
              <Link to={'/roadmap'}>
                <MouseEnterProvider>
                  <CardContainerHome className="inter-var">
                    <CardBodyHome className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-[30dvw] h-auto rounded-xl p-6 border  ">
                      <CardItemHome translateZ="50" className="text-2xl font-bold text-neutral-600 dark:text-white text-center flex justify-center align-middle items-center" >
                        RoadMaps
                      </CardItemHome>
                      <CardItemHome as="p" translateZ="60" className="text-neutral-500 text-md max-w-sm mt-2 h-10 dark:text-neutral-300" >
                        Learn a skill using AI curated Learning Path.
                      </CardItemHome>
                      <CardItemHome translateZ="100" className="w-full mt-4 flex justify-center align-middle items-center relative">
                        <div className='absolute background-globe h-[150px] w-[150px]'></div>
                        <div className='w-full h-[190px] rounded-lg flex justify-center align-middle items-center z-10 relative'>
                          <div className='text-[72px] z-50 relative'><Image src={roadmapIcon} width={'250px'}></Image></div>
                          <div className='absolute background-globe h-[110px] w-[110px]'></div>
                        </div>
                      </CardItemHome><br />
                      <div className="flex justify-between items-center mt-5">
                        <CardItemHome translateZ={20} as="a" className="px-4 py-2 w-fit gap-3 rounded-xl text-[20px] font-normal dark:text-white" >
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Mock Interview
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Video & Audio Processing
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Text and Code Processing
                          </Chip>
                        </CardItemHome>
                        <CardItemHome translateZ={20} as="button" >
                        </CardItemHome>
                      </div>
                    </CardBodyHome>
                  </CardContainerHome>
                </MouseEnterProvider>
              </Link>
              <Link to={'../mindmap'}>
                <MouseEnterProvider>
                  <CardContainerHome className="inter-var">
                    <CardBodyHome className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-[30dvw] h-auto rounded-xl p-6 border  ">
                      <CardItemHome translateZ="50" className="text-2xl font-bold text-neutral-600 dark:text-white text-center flex justify-center align-middle items-center" >
                        Mindmaps
                      </CardItemHome>
                      <CardItemHome as="p" translateZ="60" className="text-neutral-500 text-md max-w-sm mt-2 h-10 dark:text-neutral-300" >
                        Visualize any info about any topic.
                      </CardItemHome>
                      <CardItemHome translateZ="100" className="w-full mt-4 flex justify-center align-middle items-center relative">
                        <div className='absolute background-globe h-[150px] w-[150px]'></div>
                        <div className='w-full h-[190px] rounded-lg flex justify-center align-middle items-center z-10 relative'>
                          <div className='text-[72px] z-50 relative'>
                            <Player src="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json" background="transparent" speed="1" style={{ height: '250px' , width: '175px', background : 'transperent' }} loop autoplay />
                          </div>
                          <div className='absolute background-globe h-[110px] w-[110px]'></div>
                        </div>
                      </CardItemHome><br />
                      <div className="flex justify-between items-center mt-5">
                        <CardItemHome translateZ={20} as="a" className="px-4 py-2 w-fit gap-3 rounded-xl text-[20px] font-normal dark:text-white" >
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Visualize data
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Collaberative experience
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Save & Share
                          </Chip>
                        </CardItemHome>
                        <CardItemHome translateZ={20} as="button" >
                        </CardItemHome>
                      </div>
                    </CardBodyHome>
                  </CardContainerHome>
                </MouseEnterProvider>
              </Link>
              <Link to={'/interview'}>
                <MouseEnterProvider>
                  <CardContainerHome className="inter-var">
                    <CardBodyHome className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-[30dvw] h-auto rounded-xl p-6 border  ">
                      <CardItemHome translateZ="50" className="text-2xl font-bold text-neutral-600 dark:text-white text-center flex justify-center align-middle items-center" >
                        AI Interview
                      </CardItemHome>
                      <CardItemHome as="p" translateZ="60" className="text-neutral-500 text-md max-w-sm mt-2 h-10 dark:text-neutral-300" >
                        Test your skills with our AI mock interview.
                      </CardItemHome>
                      <CardItemHome translateZ="100" className="w-full mt-4 flex justify-center align-middle items-center relative">
                        <div className='absolute background-globe h-[150px] w-[150px]'></div>
                        <div className='w-full h-[190px] rounded-lg flex justify-center align-middle items-center z-10 relative'>
                          <div className='text-[72px] z-50 relative'><Image src={aiBot} width={'300px'}></Image></div>
                          <div className='absolute background-globe h-[110px] w-[110px]'></div>
                        </div>
                      </CardItemHome><br />
                      <div className="flex justify-between items-center mt-5">
                        <CardItemHome translateZ={20} as="a" className="px-4 py-2 w-fit gap-3 rounded-xl text-[20px] font-normal dark:text-white" >
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Mock Interview
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Video & Audio Processing
                          </Chip>
                          <Chip variant="shadow" classNames={{ base: "m-1 bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30", content: "drop-shadow shadow-black text-white", }} >
                            Text and Code Processing
                          </Chip>
                        </CardItemHome>
                        <CardItemHome translateZ={20} as="button" >
                        </CardItemHome>
                      </div>
                    </CardBodyHome>
                  </CardContainerHome>
                </MouseEnterProvider>
              </Link>
            </div>
          </div><br /><br /><br />
        </>

        <div className=' w-full flex flex-col justify-center align-middle items-center'>
          <BackgroundGradient>
            <button className="px-8 py-2 rounded-full relative bg-slate-700 text-white text-sm hover:shadow-2xl hover:shadow-white/[0.1] transition duration-200 border border-slate-600">
              <div className="absolute inset-x-0 h-[2px] w-1/2 mx-auto -top-px shadow-2xl  bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
              <span className="relative z-20 text-large">
                <b>Models & References</b>
              </span>
            </button>
          </BackgroundGradient>
          <div className="max-w-7xl mx-auto px-8">
            <HoverEffect items={projects} />
          </div>
        </div>        
      </div>

      <div className="h-[400vh] pb-10 bg-black bg-opacity-75 w-full border-none rounded-md relative pt-40 overflow-clip" ref={ref} >
        <GoogleGeminiEffect
          title={'Built with Gemini'}
          description={'This project is built upon Google Gemini AI model and Hugging Face'}
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
        />
      </div>
    </div>
  )
}

export default Landing;