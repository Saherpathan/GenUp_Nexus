import { useGlobalContext } from "../contexts/GlobalContext";
import { useEffect, useState } from "react";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "../axios";
import { useTheme } from "next-themes";
import { Switch, Button, User, Card, CardHeader, CardBody, CardFooter, Image, Chip } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Layout } from "../components/Layout";
import { IoSaveOutline } from "react-icons/io5";
import Background from "../components/Background/Background";
import {
  MouseEnterProvider,
  CardContainerHome,
  CardBodyHome,
  CardItemHome,
} from "../components/3DCard/3dCard";
import aiBot from '../assets/aibot.svg';
import roadmap from '../assets/roadmap.png';
import { Player } from "@lottiefiles/react-lottie-player";

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
      <Background />
      <Layout>
        <div>
          {isLoading ? <Loader width="500px" height="250px" /> : null}
          <div className="flex justify-between m-2">
            <div className="m-2 text-2xl text-center"></div>
          </div>
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
                        <div className='text-[72px] z-50 relative'><Image src={roadmap} width={'250px'}></Image></div>
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
        </div>
      </Layout>
    </>
  );
};

export default Home;
