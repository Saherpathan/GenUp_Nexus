import React, {useState, useEffect} from 'react'
import { Layout } from '../../Layout'
import Background from '../../Background/Background'
import { toast } from "react-hot-toast";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import {Button, Image} from "@nextui-org/react";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import {positions, companyNames, timesWeek} from "./data";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { CanvasRevealEffect } from '../../CanvasRevealEffect/CanvasRevealEffect';
import { Meteors } from "../../Meteors/Meteors.jsx";
import {Pagination} from "@nextui-org/react";
import { useTheme } from "next-themes";
import gemini from '../../../assets/gemini.png';
import webDev1 from '../../../assets/web_dev1.png';
import webDev2 from '../../../assets/web_dev2.png';
import axios from "../../../axios.js";
import { Link } from 'react-router-dom';
import { IconSquareRoundedX } from "@tabler/icons-react";
import { MultiStepLoader } from '../../MultiStepLoader/MultiStepLoader.jsx';
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import { useGlobalContext } from '../../../contexts/GlobalContext.jsx';

const Card2 = ({ title, icon, bgColor, children }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${bgColor} bg-opacity-60 group/canvas-card flex items-center justify-center w-full relative h-full rounded-2xl overflow-clip`}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4  font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
      </div>
    </div>
  );
};

const Card3 = ({ title, icon, bgColor, children }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${bgColor} bg-opacity-60 group/canvas-card flex items-center justify-center w-full relative h-[150px] rounded-2xl overflow-clip m-0`}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 justify-center text-center">
        <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="absolute top-[50%] w-full m-auto dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100  z-10 text-black mt-4  font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
      </div>
    </div>
  );
};

const loadingStates = [
  {
	text: "Starting Generation"
  },
  {
    text: "Generated Content",
  },
  {
    text: "Integrated Youtube",
  },
  {
    text: "Merged References",
  },
];

function getTodayDayData() {
    var todayDate = new Date();
	var temp = {
		day: todayDate.getDate(),
		month: todayDate.getMonth()+1,
		year: todayDate.getFullYear(),
		dayOfWeek: todayDate.toLocaleDateString('en-US', { weekday: 'long' })
	};
	console.log(temp);
    return temp;
  };

const iconList = [webDev1, webDev2, webDev1];

const Roadmaps = () => {
  const { theme } = useTheme();
	const [position, setPosition] = useState(null);
	const [time, setTime] = useState(null);
	const [company, setCompany] = useState(null);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [currentPage, setCurrentPage] = useState(1);
	const [roadmapHistory, setRoadmapHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useGlobalContext();

	useEffect(() => {
    fetchHistory();
  }, []);

	const fetchHistory = async () => {
    try {
      const res = await axios.get("/roadmap/history");
      setRoadmapHistory(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error( "Server error please try again later");
    }
  };

	const generateRoadmap = async() => {
		setLoading(true);
		if (position && time && company) {
			try {
				const res = await axios.post("/roadmap", {
						"type": 1,
						"user_id": user.result.userId,
						"todayData": getTodayDayData(),
						"position" : position,
						"time": time,
						"company": company
				});
				setRoadmapHistory(res.data.data);
				setLoading(false);
			} catch (err) {
				console.error(err);
				toast.error( "Server error please try again later");
				setLoading(false);
			}
		}
		else {
			console.error("Fill all details!!");
			toast.error("Fill all the details first");
		}
	};

  return (
    <div>
		<Background />
		<Layout>
			<div className="flex justify-between m-5 text-sm text-center">
			</div>
			<div className='flex flex-col gap-5 p-5'>
				<div onClick={onOpen} className='flex flex-col cursor-pointer hover:shadow-md hover:shadow-teal-400 transition-all rounded-2xl'>
					<Card3 
						title={'Generate a Roadmap'} 
						icon={ <><Image src={gemini} width={300}/><Icon icon={'streamline:arrow-roadmap'} fontSize={'64px'} color='#fc03f8' /></> }
						bgColor={'bg-blue-600 bg-opacity-100'}
						className={'h-full'}>
						<CanvasRevealEffect animationSpeed={5} dotSize={2} containerClassName='bg-blue-600' />
					</Card3>
				</div>
				<Modal backdrop={'blur'} size={'5xl'} isOpen={isOpen} onOpenChange={onOpenChange} className="p-0"
					motionProps={{
						variants: {
							enter: {
							y: 0,
							opacity: 1,
							transition: {
								duration: 0.3,
								ease: "easeOut",
							},
							},
							exit: {
							y: -20,
							opacity: 0,
							transition: {
								duration: 0.2,
								ease: "easeIn",
							},
							},
						}
					}}
				>
					<ModalContent className="p-0">
						{(onClose) => (
							<>
								<ModalBody>
									<Meteors />
									<div className='flex flex-row h-[80dvh] gap-2'>
										<div className='flex flex-col w-[50%]'>
											<Card2 
												title={`${
													currentPage === 1 ? 'Personalization 1'
														: currentPage === 2 ? 'Personalization 2'
														: currentPage === 3 ? 'Personalization 3' : ''
												}`} 
												icon={
													currentPage === 1 ? <Icon icon={'streamline:arrow-roadmap'} fontSize={'48px'} />
													: currentPage === 2 ? <Icon icon={'streamline:arrow-roadmap'} fontSize={'52px'} />
													: currentPage === 3 ? <Icon icon={'streamline:arrow-roadmap'} fontSize={'58px'} /> : null
												}
												bgColor={`${
													currentPage === 1 ? 'bg-violet-600' 
													: currentPage === 2 ? 'bg-blue-600'
													: currentPage === 3 ? 'bg-green-600' : '' 
												}`} >
												<CanvasRevealEffect animationSpeed={2} dotSize={2} containerClassName={`${ currentPage === 1 ? 'bg-violet-600' : currentPage === 2 ? 'bg-blue-600' : currentPage === 3 ? 'bg-green-600' : '' }  bg-opacity-50`} />
											</Card2>
										</div>
										<div className='flex flex-col w-[50%] justify-between align-middle items-start'>
											<Card className={`relative shadow-xl ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-950' } w-full px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-start align-middle items-start gap-5`}>
												<Meteors number={20} />
												<Breadcrumbs>
													<BreadcrumbItem startContent={<Icon icon={'mdi:company'} />} onClick={() => setCurrentPage(1)} isCurrent={currentPage === 1}>{company}</BreadcrumbItem>
													<BreadcrumbItem startContent={<Icon icon={'iconoir:position'} />} onClick={() => setCurrentPage(2)} isCurrent={currentPage === 2}>{position}</BreadcrumbItem>
													<BreadcrumbItem startContent={<Icon icon={'mingcute:time-fill'} />} onClick={() => setCurrentPage(3)} isCurrent={currentPage === 3}>{time} weeks</BreadcrumbItem>
												</Breadcrumbs>
												{(() => {
													switch (currentPage) {
														case 1:
															return (
																<CardBody className="gap-5">
																	<Card className="w-full">
																		<CardHeader className="flex gap-3 justify-center text-[24px] text-blue-800"><Icon icon={'mdi:company'} /><b>Company</b></CardHeader>
																		<CardBody className="flex align-middle items-center p-5 justify-center">
																			<Select color="primary" placeholder="Select a postion" className="max-w-xs" value={company} onChange={(e) => setCompany(e.target.value)}>
																				{companyNames.map((companyKey) => (
																					<SelectItem key={companyKey.value} value={companyKey.value}>
																						{companyKey.label}
																					</SelectItem>
																				))}
																			</Select>
																		</CardBody>
																	</Card>
																	<Card className="w-full">
																		<CardBody className="flex flex-col gap-3 text-slate-400">
																			<b className='text-md'>Note:</b>
																			<p className='text-[12px]'><b>1.</b> The relevance of company is given a less relevance as the main goal is to acquire a skill for a position.</p>
																			<p className='text-[12px]'><b>2.</b> The generated roadmaps includes a generalized overview of concepts for learning that skill.</p>
																		</CardBody>
																	</Card>
																</CardBody>
															)
														case 2:
															return (
																<CardBody className="gap-5">
																	<Card className="w-full">
																		<CardHeader className="flex gap-3 justify-center text-[24px] text-blue-800"><Icon icon={'iconoir:position'} /><b>Position</b></CardHeader>
																		<CardBody className="flex align-middle items-center p-5 justify-center">
																			<Select color="primary" placeholder="Select a postion" className="max-w-xs" value={position} onChange={(e) => setPosition(e.target.value)} >
																				{positions.map((positionsKey) => (
																					<SelectItem key={positionsKey.value} value={positionsKey.value}>
																						{positionsKey.label}
																					</SelectItem>
																				))}
																			</Select>
																		</CardBody>
																	</Card>
																	<Card className="w-full">
																		<CardBody className="flex flex-col gap-3 text-slate-400">
																			<b className='text-md'>Note:</b>
																			<p className='text-[12px]'><b>1.</b> The position refers to the goal or the skills that you are trying to acquire.</p>
																			<p className='text-[12px]'><b>2.</b> The generated roadmaps may include non-essential skills for that position.</p>
																			<p className='text-[12px]'><b>3.</b> The roadmap can be modified according to your need as well.</p>
																		</CardBody>
																	</Card>
																</CardBody>
															)
														case 3:
															return (
																<CardBody className="gap-5">
																	<Card className="w-full">
																		<CardHeader className="flex gap-3 justify-center text-[24px] text-blue-800"><Icon icon={'mingcute:time-fill'} /><b>Time</b></CardHeader>
																		<CardBody className="flex align-middle items-center p-5 justify-center">
																			<Select color="primary" placeholder="Select a postion" className="max-w-xs" value={time} onChange={(e) => setTime(e.target.value)}>
																				{timesWeek.map((weekTime) => (
																					<SelectItem key={weekTime.value} value={weekTime.value}>
																						{weekTime.label}
																					</SelectItem>
																				))}
																			</Select>
																		</CardBody>
																	</Card>
																	<Card className="w-full">
																		<CardBody className="flex flex-col gap-3 text-slate-400">
																			<b className='text-md'>Note:</b>
																			<p className='text-[12px]'><b>1.</b> The time required may or may not be enough for acquiring all the required skills.</p>
																		</CardBody>
																	</Card>
																	<div className='flex justify-center'><Button onClick={generateRoadmap} variant='shadow' color='primary' size='lg' startContent={<Image src={gemini} width={'30px'} />}><p className='text-[20px] font-bold'>Generate</p></Button></div>
																</CardBody>
															)
														default:
															return null
													}
												})()}
												<CardFooter className="flex flex-row justify-between">
													<Button size='sm' isDisabled={currentPage === 1 ? true : false} onPress={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))} variant="flat" color="secondary" startContent={<Icon icon={'mingcute:arrow-left-fill'} fontSize={'18px'} />}>Previous</Button>
													<Pagination total={3} color="secondary" page={currentPage} onChange={setCurrentPage} />
													<Button size='sm' isDisabled={currentPage === 3 ? true : false}  onPress={() => setCurrentPage((prev) => (prev < 3 ? prev + 1 : prev))} variant="flat" color="primary" endContent={<Icon icon={'mingcute:arrow-right-fill'} fontSize={'18px'} />}>Next</Button>
												</CardFooter>
											</Card>
										</div>
									</div>
									{/* <div className='absolute bottom-0 left-[50%] translate-x-[-50%] z-10 p-2 px-5 bg-gradient-to-t from-black to-transperent rounded-3xl shadow-lg shadow-black mb-2'>
										<Pagination total={3} color="secondary" page={currentPage} onChange={setCurrentPage} />
									</div> */}
								</ModalBody>
							</>
						)}
					</ModalContent>
				</Modal>
				
				<Card className={`${theme === 'light' ? 'bg-slate-200' : 'bg-slate-900'} p-2`}>
					<CardHeader>
						<b className='text-[18px]'>Recent Roadmaps</b>
					</CardHeader>
					<div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-2 h-[1px] w-full" />
					<CardBody className='flex flex-row gap-5 p-3'>
						{roadmapHistory && (
							<>
								{roadmapHistory.map((roadmap, index) => (
									<Card isFooterBlurred radius="lg" className="border-none bg-gradient-to-t from-pink-500 to-yellow-500 hover:shadow-md hover:shadow-teal-400 transition-all" >
										<Image alt="Woman listing to music" className="object-cover" height={250} src={iconList[index]} width={250} style={{padding: '2rem'}} />
										<CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
											<p className="text-tiny text-white/80">{roadmap.title}</p>
											<Link to={`/roadmap/${roadmap._id}`} target='blank'>
												<Button endContent={<Icon icon={'mingcute:arrow-right-fill'} />} className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
													View
												</Button>
											</Link>
										</CardFooter>
									</Card>
								))}
							</>
						)}
					</CardBody>
				</Card>
			</div>
		</Layout>
		<MultiStepLoader loadingStates={loadingStates} loading={loading} duration={30000} loop={false} />
		{loading && (
        <button className="fixed top-4 right-4 text-black dark:text-white z-[120]" onClick={() => setLoading(false)} >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  )
}

export default Roadmaps