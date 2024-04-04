import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Layout } from "../../Layout";
import Background from "../../Background/Background";
import {Popover, PopoverTrigger, PopoverContent, Button, ScrollShadow, Card, CardBody, CardFooter, Image, Divider, Chip, CardHeader, Input, Tabs, Tab, Tooltip} from "@nextui-org/react";
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import path from '../../../assets/pppointed.svg';
import botPoint from '../../../assets/botpoint.png';
import botCheer from '../../../assets/botcheer.png';
import membot1 from '../../../assets/membot1.png';
import membot2 from '../../../assets/membot2.png';
import membot3 from '../../../assets/membot3.png';
import membot4 from '../../../assets/membot4.png';
import membot5 from '../../../assets/membot5.png';
import membot6 from '../../../assets/membot6.png';
import { useTheme } from "next-themes";
import {Listbox, ListboxItem, cn} from "@nextui-org/react";
import { ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@nextui-org/react";
import { PiNumberSquareOneFill, PiNumberSquareTwoFill, PiNumberSquareThreeFill, PiNumberSquareFourFill, PiNumberSquareFiveFill, PiNumberSquareSixFill, PiNumberSquareSevenFill } from "react-icons/pi";
import check from '../../../assets/check.gif';
import { useGlobalContext } from "../../../contexts/GlobalContext";
import { Link } from "react-router-dom";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import { ThreeDCard } from "../../3DCard/ThreeDCard.jsx";
import { Progress, ConfigProvider } from 'antd';
import toast from "react-hot-toast";

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Roadmaps = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const botImages = [membot1, membot2, membot3, membot4, membot5, membot6];
  const [roadMapData, setRoadMapData] = useState(null);
  const [activeDays, setActiveDays] = useState([]);
  const [activeDaysMod, setActiveDaysMod] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { user } = useGlobalContext();
  const [userId, setUserID] = useState(null);
  const [weekNum, setWeekNum] = useState(1);
  const [dayNum, setDayNum] = useState(1);
  const [mindmaps, setMindmaps] = useState([]);
  const [layout, setLayout] = useState(1);
  const [weekProgress, setWeekProgress] = useState(0);
  const [dayProgress, setDayProgress] = useState(0);

  const iconComponents = [
    PiNumberSquareOneFill,
    PiNumberSquareTwoFill,
    PiNumberSquareThreeFill,
    PiNumberSquareFourFill,
    PiNumberSquareFiveFill,
    PiNumberSquareSixFill,
    PiNumberSquareSevenFill,
  ];

  const randomBot = () => {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    return botImages[randomIndex];
  };

  function getPrevious30Days() {
    var dates = [];
    var today = new Date();
  
    for (var i = 0; i < 30; i++) {
      var prevDate = new Date(today);
      prevDate.setDate(today.getDate() - i);
  
      var formattedDate = {
        day: prevDate.getDate(),
        month: prevDate.getMonth() + 1,
        year: prevDate.getFullYear(),
        dayOfWeek: prevDate.toLocaleDateString('en-US', { weekday: 'long' })
      };
  
      dates.push(formattedDate);
    }
  
    return dates;
  };

  function getTodayDayData() {
    var todayDate = new Date();
    return {
      day: todayDate.getDate(),
      month: todayDate.getMonth()+1,
      year: todayDate.getFullYear(),
      dayOfWeek: todayDate.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  const daysActive = (data) => {
    const temp = getPrevious30Days();
    const addActiveKey = (date) => ({ ...date, active: data.some(
      (activeDate) =>
        activeDate.day === date.day &&
        activeDate.month === date.month &&
        activeDate.year === date.year
    ) });
    const previous30DaysWithActive = temp.map(date => {
      const monthName = monthNames[date.month - 1];
      return addActiveKey({ ...date, monthName });
    });
    var currentStreak = 0;
    for (let i = 0; i <= previous30DaysWithActive.length - 1; i++) {
      const day = previous30DaysWithActive[i];
      if (day.active) {
          currentStreak++;
      } else {
          break;
      }
    }
    setCurrentStreak(currentStreak);
    return previous30DaysWithActive;
  };

  const DisplayWeekData =  ({ weekNum }) => {
    const weekData = roadMapData[weekNum - 1];
    const weekKey = `week${weekNum}`;
    const week = weekData[weekKey];

    let totalComplete = 0;
    Object.keys(week.data).map((dayKey, index) => {
      if (week.data[dayKey].isComplete) { totalComplete++; }
    })
    setWeekProgress(totalComplete);

  
    return (
      <Card>
        <CardBody>
          <p className="text-large"> {week.title}</p>
          <p className="text-small text-gray-400"> {week.description}</p>
          <ConfigProvider
            theme={{
                components: {
                    Progress: {
                        colorText: `${theme === 'light' ? 'black' : 'white'}`,
                        remainingColor: `${theme === 'light' ? 'rgb(240, 240, 240)' : 'rgb(60, 60, 60)'}`,
                    },
                },
            }}>
            <Progress className="py-3" size={'small'} type="line" percent={parseInt(weekProgress*100/7)} />
          </ConfigProvider>
          <div className="w-auto border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
            <Listbox disallowEmptySelection selectionMode="single" variant="flat" aria-label="Listbox menu with descriptions">
              {Object.keys(week.data).map((dayKey, index) => {
                const IconComponent = iconComponents[index % iconComponents.length];
                return (
                  <ListboxItem onClick={() => {setWeekNum(weekNum); setDayNum(index+1);}} key={index} startContent={<IconComponent size={'24px'} />} endContent={week.data[dayKey].isComplete ? <Image src={check} width={'40px'} /> : <div className="w-[40px] h-[40px]"></div>} >
                    <p>{week.data[dayKey].heading}</p>
                  </ListboxItem>
                );
              })}
            </Listbox>
          </div>
        </CardBody>
      </Card>
    );
  };

  const roadmapModder = async(data) => {
    try {
      const response = await fetch( 'http://127.0.0.1:5000/roadmapmodder', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });
  
      if (response.ok) {
          const res = await response.json();
          if (res.success) {
              toast.success("Updated!");
              if (data.type === 11) {
                return res.youtubeUpdate;
              }
          } else {
              setError(res.error);
          }
      } else {
          setError('Cannot connect to server right now !!');
      }
    } catch (error) {
        setError('We are experiencing heavy traffic !!');
    }
  };

  const DisplayDayData =  ({ numWeek, numDay }) => {
    if (numWeek < 1 || numWeek > roadMapData.length) { return <div>Week not found</div>; }

    const weekData = roadMapData[numWeek - 1];
    const weekKey = `week${numWeek}`;
    const week = weekData[weekKey];

    if (!week) { return <div>Week not found</div>; }
    const dayKey = `day${numDay}`;
    const day = week.data[dayKey];
    if (!day) { return <div>Day not found</div>; }

    var total = day.links.length + day.youtube.length;
    var totalComplete = 0;
    if (day.isComplete === true) { totalComplete = 100; }
    else { totalComplete = day.links.reduce((count, link) => count + (link.visited ? 1 : 0), 0) + day.youtube.reduce((count, video) => count + (video.viewed ? 1 : 0), 0); }
    setDayProgress(totalComplete);

    const labelsMap = {
      completed: "Completed",
      inprogress: "In Progress",
    }
    const [selectedOption, setSelectedOption] = useState(new Set(["inprogress"]));
    const selectedOptionValue = Array.from(selectedOption)[0];
  
    const handleComplete = () => {
      day.isComplete = true;
      var temp = activeDays
      temp.push(getTodayDayData());
      setActiveDaysMod(daysActive(temp));

      roadmapModder({
        "type": 31,
        "_id": id,
        "user_id": user.result.userId,
        "weekNum": weekNum,
        "dayNum": dayNum,
        "todayData": getTodayDayData()
      });
    };

    const mindmapModalDisclosure = useDisclosure();
    const youtubeModalDisclosure = useDisclosure();
    const LinksModalDisclosure = useDisclosure();

    const handleVisit = (index) => {
      const updatedLinks = [...day.links];
      updatedLinks[index].visited = true;
      setRoadMapData(roadMapData);
      roadmapModder({
        "type": 22,
        "_id": id,
        "user_id": user.result.userId,
        "weekNum": weekNum,
        "dayNum": dayNum,
        "todayData": getTodayDayData(),
        "refLinkIndex": index
      });
    };

    const handleViewed = (index) => {
      const updatedYoutube = [...day.youtube];
      updatedYoutube[index].viewed = true;
      setRoadMapData(roadMapData);
      roadmapModder({
        "type": 12,
        "_id": id,
        "user_id": user.result.userId,
        "weekNum": weekNum,
        "dayNum": dayNum,
        "todayData": getTodayDayData(),
        "videoIndex": index
      });
    }

    const getDomainName = (link) => {
      return new URL(link).hostname;
    };

    const [newYoutubeLink, setNewYoutubeLink] = useState('');
    const [newReferenceLink, setReferenceLink] = useState(null);

    const handleAddVideo = (videoUrl) => {
      var temp = roadmapModder({
        "type": 11,
        "_id": id,
        "user_id": user.result.userId,
        "weekNum": weekNum,
        "dayNum": dayNum,
        "todayData": getTodayDayData(),
        "videoUrl": videoUrl
      });
      var updatedYoutube = [...day.youtube];
      updatedYoutube.push(temp);
      day.youtube = updatedYoutube;
      setRoadMapData(roadMapData);
    };

    const handleAddLink = (newLink) => {
      var updatedLinks = [...day.links];
      updatedLinks.push({"link": newLink, "visited": true});
      day.links = updatedLinks;
      setRoadMapData(roadMapData);
      roadmapModder({
        "type": 21,
        "_id": id,
        "user_id": user.result.userId,
        "weekNum": weekNum,
        "dayNum": dayNum,
        "todayData": getTodayDayData(),
        "refLink": newLink
      });
    };
  
    return (
      <div>
        <div className="absolute top-3 right-3">
          <div className="flex align-middle gap-2">
            <Button isIconOnly onClick={() => setLayout(layout === 1 ? 2 : 1)} className="z-10 cursor-pointer"><Icon icon={'tabler:layout'} fontSize={'24px'} /></Button>
            <ConfigProvider
              theme={{
                  components: {
                      Progress: {
                          colorText: `${theme === 'light' ? 'black' : 'white'}`,
                          remainingColor: `${theme === 'light' ? 'rgb(240, 240, 240)' : 'rgb(60, 60, 60)'}`,
                      },
                  },
              }}>
              <Progress className="p-0" size={40} type="circle" percent={parseInt(dayProgress*100/total)} />
            </ConfigProvider>
            {day.isComplete ? (
              <Button variant="shadow" className="flex justify-center align-middle items-center bg-green-600" > <p className="text-[18px]">👑</p> <b>Completed</b></Button>
            ) : (
              <ButtonGroup variant="flat">
                  <Button>{labelsMap[selectedOptionValue]}</Button>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button isIconOnly>
                        <Icon icon='eva:arrow-down-fill' fontSize={'18px'} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      disallowEmptySelection
                      aria-label="Merge options"
                      selectedKeys={selectedOption}
                      selectionMode="single"
                      onSelectionChange={handleComplete}
                      className="max-w-[300px]"
                    >
                      <DropdownItem key="completed">
                        {labelsMap["completed"]}
                      </DropdownItem>
                      <DropdownItem key="inprogress">
                        {labelsMap["inprogress"]}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
              </ButtonGroup>
            )}
          </div>
        </div>
        <ScrollShadow hideScrollBar size={50} className="max-h-[63dvh] p-2">
          <div className="text-[24px]"><b>{day.heading}</b></div>
          <div className="text-[16px]">{day.description}</div>
          <br />

          {layout === 1 ? (
            <Tabs aria-label="Options" color="default">
              <Tab
                key="mindmaps"
                title={
                  <div className="flex items-center space-x-2">
                    <div className="text-[18px] flex flex-row align-middle items-center gap-5"><Icon icon='icon-park-outline:mindmap-map' fontSize={'28px'} style={{color:'#ae00ff', fontWeight: 'bolder'}} /><b>MindMaps</b><button className={`flex gap-3 h-8 animate-shimmer items-center justify-start cursor-pointer rounded-md border ${
                          theme === "light"
                            ? "border-gray-300 bg-[linear-gradient(110deg,#EAFFFE,45%,#AAF0F1,55%,#EAFFFE)] bg-[length:200%_100%] text-grey-800"
                            : "border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-200"
                        } px-2 font-medium transition-colors `}>
                        <Icon icon='simple-icons:googlegemini' color="blue" fontSize={'24px'} /><p className="text-[12px]"><b>AI</b></p>
                      </button>
                    </div>
                  </div>
                }>
                <div className="flex flex-row">
                  {mindmaps?.data?.map((item, index) => {
                    return (
                      <ThreeDCard item={item} index={index} />
                    );
                  })}
                  <Modal isOpen={mindmapModalDisclosure.isOpen} backdrop="blur" onOpenChange={mindmapModalDisclosure.onOpenChange}>
                    <ModalContent>
                      {(onClose) => (
                        <>
                          <ModalHeader className="flex flex-col gap-1">Generate a new Mindmap</ModalHeader>
                          <ModalBody className="w-full">
                            <Input type="link" startContent={<Icon icon={'icon-park-outline:topic'} fontSize={'28px'} />} size="lg" label="Topic" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter topic name" defaultValue={`${day.heading} : ${day.description}`} />
                          </ModalBody>
                          <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                              Close
                            </Button>
                            <Button color="primary" onPress={onClose} startContent={<Icon icon={'simple-icons:googlegemini'} fontSize={'24px'} />}>
                              Generate
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </ModalContent>
                  </Modal>
                  <Button variant="shadow" color="primary" onClick={mindmapModalDisclosure.onOpen} className="w-[350px] h-auto mb-5 border-2 border-white bg-blue-600 border-dashed" >
                    <Card isFooterBlurred className="w-[350px] h-auto col-span-12 sm:col-span-7 flex justify-center items-center align-middle bg-blue-600 ">
                      <Icon icon={'icons8:plus'} fontSize={'52px'} color="white" /><br />
                      <p className="text-large text-white"><b>Generate a New Mindmap</b></p>
                    </Card>
                  </Button>
                </div>
              </Tab>
              <Tab
                key="youtube"
                title={
                  <div className="flex items-center space-x-2">
                    <div className="text-[18px] flex flex-row align-middle items-center gap-5"> <Icon icon='logos:youtube-icon' /> <b>Youtube</b></div>
                  </div>
                }>
                  <div className="flex flex-row h-[300px] gap-3">
                    <ScrollShadow orientation="horizontal" hideScrollBar className={`flex max-w-full max-h-[300px]`}>
                      <div className={`flex gap-5 flex-row w-[${(day.youtube.length) * 500}px] h-full p-2 pb-5`}>
                        {day.youtube.map((youtubeObj, index) => (
                          <Card isFooterBlurred className={`w-[350px] h-auto col-span-12 sm:col-span-7 ${youtubeObj.type === 'video' ? 'shadow-lg shadow-blue-600' : 'shadow-lg shadow-violet-600 '}`}>
                            <CardHeader className="absolute z-10 top-1 flex-col items-start">
                              <div className="flex justify-between w-full"><p className="text-tiny text-white/60 uppercase font-bold">{youtubeObj.videoTitle}</p>{youtubeObj.viewed && <div className="bg-black bg-opacity-70 rounded-full shadow-xl shadow-black"><img src={check} width={'50px'} /></div>}</div>
                            </CardHeader>
                            <Image
                              removeWrapper
                              alt="Relaxing app background"
                              className="z-0 w-full h-full object-fill"
                              src={youtubeObj.thumbnail}
                            />
                            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                              <div className="flex flex-grow gap-2 items-center">
                                <Icon icon='logos:youtube-icon' /> 
                                <div className="flex flex-col">
                                  <p className="text-tiny text-white/60">{youtubeObj.channelName}</p>
                                  {/* <p className="text-tiny text-white/60">Get a good night's sleep.</p> */}
                                </div>
                              </div>
                              <Link to={youtubeObj.type === 'video' ? `https://www.youtube.com/watch?v=${youtubeObj.videoId}` : `https://www.youtube.com/playlist?list=${youtubeObj.playlistId}`} target="blank"><Button onClick={() => {handleViewed(index)}} radius="full" size="sm">Watch Now!</Button></Link>
                            </CardFooter>
                          </Card>
                        ))}
                        <Modal isOpen={youtubeModalDisclosure.isOpen} backdrop="blur" onOpenChange={youtubeModalDisclosure.onOpenChange}>
                          <ModalContent>
                            {(onClose) => (
                              <>
                                <ModalHeader className="flex flex-col gap-1">Add a video</ModalHeader>
                                <ModalBody className="w-full">
                                  <Input value={newYoutubeLink} onChange={(e) => {setNewYoutubeLink(e.target.value)}} type="link" startContent={<Icon icon={'fluent:video-link-28-filled'} fontSize={'28px'} />} size="lg" label="Link" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter Youtube video link" />
                                </ModalBody>
                                <ModalFooter>
                                  <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                  </Button>
                                  <Button color="primary" onPress={() => {onClose(); handleAddVideo(newYoutubeLink);}}>
                                    Add
                                  </Button>
                                </ModalFooter>
                              </>
                            )}
                          </ModalContent>
                        </Modal>
                        <Button variant="shadow" color="primary" onClick={youtubeModalDisclosure.onOpen} className="w-[350px] h-auto mb-5 border-2 border-white bg-blue-600 border-dashed" >
                          <Card isFooterBlurred className="w-[350px] h-auto col-span-12 sm:col-span-7 flex justify-center items-center align-middle bg-blue-600 ">
                            <Icon icon={'icons8:plus'} fontSize={'52px'} color="white" /><br />
                            <p className="text-large text-white"><b>Add to your playlist</b></p>
                          </Card>
                        </Button>
                      </div>
                    </ScrollShadow>
                  </div>
              </Tab>
              <Tab
                key="links"
                title={
                  <div className="flex items-center space-x-2">
                    <div className="text-[18px] flex flex-row align-middle items-center gap-5"> <Icon icon='dashicons:admin-links' color="blue"/> <b>Links</b></div>
                  </div>
                }
              >
              <div className="flex gap-3">
                {day.links.map((linkObj, index) => (
                  <Chip size="lg" color={linkObj.visited ? 'success' : 'secondary'} key={index} onClick={() => {handleVisit(index); window.open(linkObj.link, '_blank');}} endContent={<Icon icon={'quill:link-out'} fontSize={'28px'} />} className="cursor-pointer">{getDomainName(linkObj.link)}</Chip>
                ))}
                <Modal isOpen={LinksModalDisclosure.isOpen} backdrop="blur" onOpenChange={LinksModalDisclosure.onOpenChange}>
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">Add a Link for references</ModalHeader>
                        <ModalBody className="w-full">
                          <Input value={newReferenceLink} onChange={(e) => {setReferenceLink(e.target.value)}} type="link" startContent={<Icon icon={'mingcute:link-fill'} fontSize={'28px'} />} size="lg" label="Link" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter reference link" />
                        </ModalBody>
                        <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                            Close
                          </Button>
                          <Button color="primary" onPress={() => {onClose(); handleAddLink(newReferenceLink);}}>
                            Add
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
                <button onClick={LinksModalDisclosure.onOpen}>
                  <Chip size="lg" className="cursor-pointer" color="primary" startContent={<Icon icon={'icons8:plus'} fontSize={'24px'} />}>Add more references</Chip>
                </button>
              </div>
              </Tab>
            </Tabs>
          ) : (
            <>
              <div className="text-[18px] flex flex-row align-middle items-center gap-5"><Icon icon='icon-park-outline:mindmap-map' fontSize={'28px'} style={{color:'#ae00ff', fontWeight: 'bolder'}} /><b>MindMaps</b><button className={`flex gap-3 h-8 animate-shimmer items-center justify-start cursor-pointer rounded-md border ${
                              theme === "light"
                                ? "border-gray-300 bg-[linear-gradient(110deg,#EAFFFE,45%,#AAF0F1,55%,#EAFFFE)] bg-[length:200%_100%] text-grey-800"
                                : "border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-200"
                            } px-2 font-medium transition-colors `}>
                            <Icon icon='simple-icons:googlegemini' color="blue" fontSize={'24px'} /><p className="text-[12px]"><b>AI</b></p>
                          </button>
              </div>
              <hr style={{borderTop: '2px dashed', height: '1px'}} className="my-5"/>
              <div className="flex flex-row">
                {mindmaps?.data?.map((item, index) => {
                  return (
                    <ThreeDCard item={item} index={index} />
                  );
                })}
                <Modal isOpen={mindmapModalDisclosure.isOpen} backdrop="blur" onOpenChange={mindmapModalDisclosure.onOpenChange}>
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">Generate a new Mindmap</ModalHeader>
                        <ModalBody className="w-full">
                          <Input type="link" startContent={<Icon icon={'icon-park-outline:topic'} fontSize={'28px'} />} size="lg" label="Topic" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter topic name" defaultValue={`${day.heading} : ${day.description}`} />
                        </ModalBody>
                        <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                            Close
                          </Button>
                          <Button color="primary" onPress={onClose} startContent={<Icon icon={'simple-icons:googlegemini'} fontSize={'24px'} />}>
                            Generate
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
                <Button variant="shadow" color="primary" onClick={mindmapModalDisclosure.onOpen} className="w-[350px] h-auto mb-5 border-2 border-white bg-blue-600 border-dashed" >
                  <Card isFooterBlurred className="w-[350px] h-auto col-span-12 sm:col-span-7 flex justify-center items-center align-middle bg-blue-600 ">
                    <Icon icon={'icons8:plus'} fontSize={'52px'} color="white" /><br />
                    <p className="text-large text-white"><b>Generate a New Mindmap</b></p>
                  </Card>
                </Button>
              </div>
              <br />
              
              <div className="text-[18px] flex flex-row align-middle items-center gap-5"> <Icon icon='logos:youtube-icon' /> <b>Youtube</b></div>
              <hr style={{borderTop: '2px dashed', height: '1px'}} className="my-5"/>
              <div className="flex flex-row h-[300px] gap-3">
                <ScrollShadow orientation="horizontal" hideScrollBar className={`flex max-w-full max-h-[300px]`}>
                  <div className={`flex gap-5 flex-row w-[${(day.youtube.length) * 500}px] h-full p-2 pb-5`}>
                    {day.youtube.map((youtubeObj, index) => (
                      <Card isFooterBlurred className={`w-[350px] h-auto col-span-12 sm:col-span-7 ${youtubeObj.type === 'video' ? 'shadow-lg shadow-blue-600' : 'shadow-lg shadow-violet-600 '}`}>
                        <CardHeader className="absolute z-10 top-1 flex-col items-start">
                          <div className="flex justify-between w-full"><p className="text-tiny text-white/60 uppercase font-bold">{youtubeObj.videoTitle}</p>{youtubeObj.viewed && <div className="bg-black bg-opacity-70 rounded-full shadow-xl shadow-black"><img src={check} width={'50px'} /></div>}</div>
                        </CardHeader>
                        <Image
                          removeWrapper
                          alt="Relaxing app background"
                          className="z-0 w-full h-full object-fill"
                          src={youtubeObj.thumbnail}
                        />
                        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                          <div className="flex flex-grow gap-2 items-center">
                            <Icon icon='logos:youtube-icon' /> 
                            <div className="flex flex-col">
                              <p className="text-tiny text-white/60">{youtubeObj.channelName}</p>
                              {/* <p className="text-tiny text-white/60">Get a good night's sleep.</p> */}
                            </div>
                          </div>
                          <Link to={youtubeObj.type === 'video' ? `https://www.youtube.com/watch?v=${youtubeObj.videoId}` : `https://www.youtube.com/playlist?list=${youtubeObj.playlistId}`} target="blank"><Button onClick={() => {handleViewed(index)}} radius="full" size="sm">Watch Now!</Button></Link>
                        </CardFooter>
                      </Card>
                    ))}
                    <Modal isOpen={youtubeModalDisclosure.isOpen} backdrop="blur" onOpenChange={youtubeModalDisclosure.onOpenChange}>
                      <ModalContent>
                        {(onClose) => (
                          <>
                            <ModalHeader className="flex flex-col gap-1">Add a video</ModalHeader>
                            <ModalBody className="w-full">
                              <Input value={newYoutubeLink} onChange={(e) => {setNewYoutubeLink(e.target.value)}} type="link" startContent={<Icon icon={'fluent:video-link-28-filled'} fontSize={'28px'} />} size="lg" label="Link" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter Youtube video link" />
                            </ModalBody>
                            <ModalFooter>
                              <Button color="danger" variant="light" onPress={onClose}>
                                Close
                              </Button>
                              <Button color="primary" onPress={() => {onClose(); handleAddVideo(newYoutubeLink);}}>
                                Add
                              </Button>
                            </ModalFooter>
                          </>
                        )}
                      </ModalContent>
                    </Modal>
                    <Button variant="shadow" color="primary" onClick={youtubeModalDisclosure.onOpen} className="w-[350px] h-auto mb-5 border-2 border-white bg-blue-600 border-dashed" >
                      <Card isFooterBlurred className="w-[350px] h-auto col-span-12 sm:col-span-7 flex justify-center items-center align-middle bg-blue-600 ">
                        <Icon icon={'icons8:plus'} fontSize={'52px'} color="white" /><br />
                        <p className="text-large text-white"><b>Add to your playlist</b></p>
                      </Card>
                    </Button>
                  </div>
                </ScrollShadow>
              </div>
              <br />
              
              <div className="text-[18px] flex flex-row align-middle items-center gap-5"> <Icon icon='dashicons:admin-links' color="blue"/> <b>Links</b></div>
              <hr style={{borderTop: '2px dashed', height: '1px'}} className="my-5"/>
              <div className="flex gap-3">
                {day.links.map((linkObj, index) => (
                  <Chip size="lg" color={linkObj.visited ? 'success' : 'secondary'} key={index} onClick={() => {handleVisit(index); window.open(linkObj.link, '_blank');}} endContent={<Icon icon={'quill:link-out'} fontSize={'28px'} />} className="cursor-pointer">{getDomainName(linkObj.link)}</Chip>
                ))}
                <Modal isOpen={LinksModalDisclosure.isOpen} backdrop="blur" onOpenChange={LinksModalDisclosure.onOpenChange}>
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">Add a Link for references</ModalHeader>
                        <ModalBody className="w-full">
                          <Input value={newReferenceLink} onChange={(e) => {setReferenceLink(e.target.value)}} type="link" startContent={<Icon icon={'mingcute:link-fill'} fontSize={'28px'} />} size="lg" label="Link" labelPlacement="outside-left" className="w-full justify-center" width={'100%'} placeholder="Enter reference link" />
                        </ModalBody>
                        <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                            Close
                          </Button>
                          <Button color="primary" onPress={() => {onClose(); handleAddLink(newReferenceLink);}}>
                            Add
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
                <button onClick={LinksModalDisclosure.onOpen}>
                  <Chip size="lg" className="cursor-pointer" color="primary" startContent={<Icon icon={'icons8:plus'} fontSize={'24px'} />}>Add more references</Chip>
                </button>
              </div><br />
            </>
          )}
        </ScrollShadow>
      </div>
    );
  };

  useEffect(() => {
    setUserID(user.result.user_id);
    const getRoadMap = async () => {
      try {
        const response = await fetch( 'http://192.168.0.104:5000/roadmap', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "type": 2,
                "_id": id,
                "user_id": user.result.userId
            }),
        });
    
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(data);
                setRoadMapData(data.roadmapData.data);
                setActiveDays(data.activeDays);
                setActiveDaysMod(daysActive(data.activeDays));
            } else {
                setError(data.error);
            }
        } else {
            setError('Cannot connect to server right now !!');
        }
      } catch (error) {
          setError('We are experiencing heavy traffic !!');
      }
    }
    getRoadMap();
  }, []);

  return (
    <div>
      <Layout>
        <Background />
        <div className="flex justify-between m-5 text-2xl text-center">
          Roadmaps
        </div>
        {roadMapData &&  (
          <>
            <div className="flex">
              {!roadMapData[0].week1.data.day1.isComplete && (
                <Card className="starter flex flex-col justify-around align-middle items-center h-[350px] rounded-lg p-3">
                  <img src={botPoint} alt="AiBot" height={'300px'} width={'200px'} />
                  <p className="text-small text-center">Start your Journey from here...</p>
                </Card>
              )}
              <ScrollShadow size={100} hideScrollBar offset={100} className="max-w-full max-h-[350px] pl-20" orientation="horizontal" >
                <div style={{width: `${(roadMapData.length * 380)+310}px`}} className={`flex flex-row gap-0 py-5 justify-center align-middle items-start w-[${roadMapData.length * 400}px] sm:w-[${roadMapData.length * 400}px]`}>
                  {roadMapData.map((week, index) => (
                    <>
                      {(index % 2) === 0 ? (
                        <div key={index} style={{ backgroundImage: `url(${path})`, backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[300px] w-[300px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">{Object.values(week)[0].title}</div>
                              <div className="text-tiny">{Object.values(week)[0].description}</div>
                            </div>
                          } size="sm" placement={'top'} color="primary" className="ml-3 w-[180px]" delay={0} closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(1); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 1});}} className="absolute top-[-20px] left-[-100px] rounded-full">
                              <div className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px]">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full ${theme === 'light' ? 'bg-gray-200 text-slate-900' : 'bg-slate-950 text-white'} px-3 text-sm font-medium backdrop-blur-3xl`}>
                                  <button className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                                    <div className={`px-8 py-2 ${theme === 'light' ? 'bg-gray-200 text-slate-900 border-none' : 'bg-black text-white'} rounded-full  relative group transition duration-200  hover:bg-transparent`}>
                                      Week {index + 1}
                                    </div>
                                  </button>
                                </span>
                              </div>
                            </div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 1</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day1.heading)}</div>
                            </div>
                          }  size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200} >
                            <div onClick={() => {setWeekNum(index+1); setDayNum(1); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 1});}} className={`absolute top-0 left-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day1.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 2</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day2.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(2); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 2});}} className={`absolute top-9 left-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day2.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 3</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day3.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(3); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 3});}} className={`absolute top-20 left-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day3.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 4</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day4.heading)}</div><br />
                              <div className="text-tiny">{(Object.values(week)[0].data.day4.isComplete && !Object.values(week)[0].data.day5.isComplete) && " ✨ Your're half way there." }</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(4); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 4});}} className={`absolute rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day4.isComplete ? 'bg-green-500' : 'bg-slate-300' } flex justify-center items-center`}><Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 5</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day5.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(5); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 5});}} className={`absolute bottom-20 right-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day5.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 6</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day6.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(6); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 6});}} className={`absolute bottom-9 right-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day6.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 7</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day7.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(7); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 7});}} className={`absolute bottom-0 right-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day7.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <div className='absolute bottom-16 left-[-100px] background-globe h-[110px] w-[110px]'></div>
                          <div className="absolute bottom-5 left-[-100px]">
                            <img src={randomBot()} alt="membot-random" height={'200px'} width={'150px'} />
                          </div>
                        </div>
                      ) : (
                        <div key={index} style={{ backgroundImage: `url(${path})`, transform:'scaleY(-1)', backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[300px] w-[300px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">{Object.values(week)[0].title}</div>
                              <div className="text-tiny">{Object.values(week)[0].description}</div>
                            </div>
                          } size="sm" placement={'bottom'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(1); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 1});}} className="absolute top-[-20px] left-[-100px] !scale-y-[-1] rounded-full">
                                <div className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px]">
                                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                  <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full ${theme === 'light' ? 'bg-gray-200 text-slate-900' : 'bg-slate-950 text-white'} px-3 text-sm font-medium backdrop-blur-3xl`}>
                                    <button className="relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                                      <div className={`px-8 py-2 ${theme === 'light' ? 'bg-gray-200 text-slate-900 border-none' : 'bg-black text-white'} rounded-full  relative group transition duration-200  hover:bg-transparent`}>
                                        Week {index + 1}
                                      </div>
                                    </button>
                                  </span>
                                </div>
                              </div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 1</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day1.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200} >
                            <div onClick={() => {setWeekNum(index+1); setDayNum(1); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 1});}} className={`absolute top-0 left-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day1.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 2</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day2.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(2); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 2});}} className={`absolute top-9 left-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day2.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 3</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day3.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(3); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 3});}} className={`absolute top-20 left-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day3.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 4</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day4.heading)}</div><br />
                              <div className="text-tiny">{(Object.values(week)[0].data.day4.isComplete && !Object.values(week)[0].data.day5.isComplete) && " ✨ Your're half way there." }</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(4); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 4});}} className={`absolute rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day4.isComplete ? 'bg-green-500' : 'bg-slate-300' } flex justify-center items-center`}><Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/></div>                            
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 5</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day5.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(5); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 5});}} className={`absolute bottom-20 right-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day5.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 6</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day6.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(6); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 6});}} className={`absolute bottom-9 right-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day6.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <Tooltip content={
                            <div className="px-1 py-2">
                              <div className="text-small font-bold">Day 7</div>
                              <div className="text-tiny">{Object.values(Object.values(week)[0].data.day7.heading)}</div>
                            </div>
                          } size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]" closeDelay={200}>
                            <div onClick={() => {setWeekNum(index+1); setDayNum(7); setInfo({"data": Object.values(week)[0], "week": `${index + 1}`, "day": 7});}} className={`absolute bottom-0 right-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day7.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                          </Tooltip>
                          <div className='absolute bottom-16 left-[-100px] background-globe h-[110px] w-[110px]'></div>
                          <div className="absolute bottom-5 left-[-100px] scale-y-[-1]">
                            <img src={randomBot()} alt="membot-random" height={'200px'} width={'150px'} />
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                  <div className="relative h-[300px] w-[100px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                    <Tooltip content={
                      <div className="px-1 py-2">
                        <div className="text-small font-bold">AI Mock Interview</div>
                        <div className="text-tiny">Test the skills that you aquired using AI powered Mock Interviews.</div>
                      </div>
                    } size="sm" placement={roadMapData.length % 2 === 0 ? 'bottom' : 'top'} color="primary" className="ml-3 w-[180px]" closeDelay={300}>
                      <div className={`absolute ${roadMapData.length % 2 === 0 ? `top-[-20px]` : `bottom-[-20px]`}  left-[-100px] rounded-full`}>
                          <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px]">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full ${theme === 'light' ? 'bg-gray-200 text-slate-900' : 'bg-slate-950 text-white'} px-3 text-sm font-medium backdrop-blur-3xl`}>
                              <button className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                                <div className={`px-8 py-2 ${theme === 'light' ? 'bg-gray-200 text-slate-900 border-none' : 'bg-black text-white'} rounded-full  relative group transition duration-200  hover:bg-transparent`}>
                                  AI Interviews
                                </div>
                              </button>
                            </span>
                          </button>
                        </div>
                    </Tooltip>
                  </div>
                </div>
              </ScrollShadow>
              {roadMapData[roadMapData.length - 1][Object.keys(roadMapData[roadMapData.length - 1])[Object.keys(roadMapData[roadMapData.length - 1]).length - 1]].data.day7.isComplete && (
                <Card className="ender flex flex-col justify-around align-middle items-center h-[350px] rounded-lg p-3">
                  <img src={botCheer} alt="AiBot" height={'250px'} width={'150px'} />
                  <p className="text-small text-center">Congo! you have completed your journey.</p>
                </Card>
              )}
            </div><br /><br />
            {info && (
              <div className="h-[100dvh] flex flex-col p-1">
                <div className="breadcrumbs">
                  <Breadcrumbs radius="full" variant="solid" size={'md'}>
                      <BreadcrumbItem>{roadMapData[0].week1.title}</BreadcrumbItem>
                      <BreadcrumbItem>
                        <Dropdown backdrop="blur">
                          <DropdownTrigger>
                            <Button
                              className="h-6 pr-2 text-small"
                              endContent={<Icon icon='eva:arrow-down-fill' fontSize={'18px'} />}
                              radius="full"
                              size="sm"
                              variant="light"
                            >
                              Week {weekNum}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Routes">
                            {roadMapData.map((item, index) => (
                              <DropdownItem>
                                <p key={index} onClick={() => {setWeekNum(index + 1); setDayNum(1);}}>Week {index + 1}</p>
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </BreadcrumbItem>
                      <BreadcrumbItem>
                        <Dropdown backdrop="blur">
                          <DropdownTrigger>
                            <Button
                              className="h-6 pr-2 text-small"
                              endContent={<Icon icon='eva:arrow-down-fill' fontSize={'18px'} />}
                              radius="full"
                              size="sm"
                              variant="light"
                            >
                              Day {dayNum}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Routes">
                            <DropdownItem><p onClick={() => {setDayNum(1);}}>Day 1</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(2);}}>Day 2</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(3);}}>Day 3</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(4);}}>Day 4</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(5);}}>Day 5</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(6);}}>Day 6</p></DropdownItem>
                            <DropdownItem><p onClick={() => {setDayNum(7);}}>Day 7</p></DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </BreadcrumbItem>
                  </Breadcrumbs>
                </div>
                <div className="flex flex-row justify-center w-full p-1 pt-0">
                  <div className="flex flex-col gap-3 p-3 w-[30%]">
                    <DisplayWeekData weekNum={weekNum}></DisplayWeekData>
                  </div>
                  <div className="flex flex-col w-[75%] pt-2">
                    <div className="flex w-full h-[120px] mb-1">
                      <div className={`w-full h-auto flex ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'} rounded-[14px]`}>
                        <Card isPressable className="w-[100px]">
                          <CardBody className="text-[20px] p-0 text-center items-center align-middle justify-center h-auto bg-gradient-to-t from-purple-600 to-blue-600">
                          🔥<b className="text-white">{currentStreak}</b>
                          </CardBody>
                          <CardFooter className="text-center text-tiny p-2 bg-purple-600">
                            <b className="text-white">Current Streak</b>
                          </CardFooter>
                        </Card>
                        <ScrollShadow size={100} hideScrollBar offset={100} className="max-w-full w-full max-h-auto" orientation="horizontal" >
                          <div className={`flex flex-row gap-2 py-2 px-5 justify-start align-middle items-start w-[2800px]`}>
                            {activeDaysMod.map((date, index) => (
                              <Card isPressable key={index}>
                                <CardBody className={`${date.active &&'bg-green-600 shadow-md shadow-green-600'} w-[80px] flex flex-col justify-center items-center align-middle p-0`}>
                                  <div className="text-[14px]">{date.active ? ' 👑 ' : ' ❗ ' }</div>
                                  <div className="text-[18px]"><b>{date.day}</b></div>
                                  <div className="text-[10px]">{date.dayOfWeek.toString().slice(0,3)}</div>
                                </CardBody>
                                <CardFooter className="justify-center p-2">
                                  <div className="text-[10px]">{`${date.monthName}-${date.year.toString().slice(2)}`}</div>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        </ScrollShadow>
                      </div>
                    </div>
                    <Card className="w-full h-full">
                      <CardBody>
                        <DisplayDayData numWeek={weekNum} numDay={dayNum} />
                      </CardBody>
                      <CardFooter className="flex justify-around">
                        <div>
                          <button onClick={() => {if (weekNum === 1 && dayNum === 1) {} else if (dayNum === 1) {setWeekNum(weekNum-1); setDayNum(7);} else {setDayNum(dayNum-1);} }} className={`flex gap-3 h-10 animate-shimmer items-center justify-start cursor-pointer rounded-md border ${
                              theme === "light"
                                ? "border-gray-300 bg-[linear-gradient(110deg,#EAFFFE,45%,#AAF0F1,55%,#EAFFFE)] bg-[length:200%_100%] text-grey-800"
                                : "border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-200"
                            } px-6 font-medium transition-colors `}>
                            <Icon icon='mingcute:arrow-left-fill' /><p>Back</p>
                          </button>
                        </div>
                        <p>Week {weekNum} - Day {dayNum}</p>
                        <div>
                          <button onClick={() => {if (weekNum === roadMapData.length && dayNum === 7) {} else if (dayNum === 7) {setWeekNum(weekNum+1); setDayNum(1);} else {setDayNum(dayNum+1);}}} className={`flex gap-3 h-10 animate-shimmer items-center justify-start cursor-pointer rounded-md border ${
                              theme === "light"
                                ? "border-gray-300 bg-[linear-gradient(110deg,#EAFFFE,45%,#AAF0F1,55%,#EAFFFE)] bg-[length:200%_100%] text-grey-800"
                                : "border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-200"
                            } px-6 font-medium transition-colors `}>
                            <p>Next</p><Icon icon='mingcute:arrow-right-fill' />
                          </button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Layout>
    </div>
  );
};

export default Roadmaps;

          {/* Small Screen */}
          {/* <div style={{ backgroundImage: `url(${path})`, backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[200px] w-[200px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
            <div className="absolute top-[-0px] left-0 rounded-full h-[10px] w-[10px] bg-slate-300"></div>
            <div className="absolute top-2 left-10 rounded-full h-[10px] w-[10px] bg-slate-300"></div>
            <div className="absolute top-10 left-[4.5rem] rounded-full h-[10px] w-[10px] bg-slate-50"></div>
            <div className="absolute top-[4.5rem] left-[5.5rem] rounded-full h-[10px] w-[10px] bg-slate-50"></div>
            <div className="absolute rounded-full h-[10px] w-[10px] bg-slate-50 flex justify-center items-center">
              <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                <PopoverTrigger>
                  <Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-small font-bold">Weekly MidJourney</div>
                    <div className="text-tiny">You are midway to your weeky journey!</div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="absolute bottom-[-0px] right-0 rounded-full h-[10px] w-[10px] bg-slate-50"></div>
            <div className="absolute bottom-2 right-10 rounded-full h-[10px] w-[10px] bg-slate-50"></div>
            <div className="absolute bottom-10 right-[4.5rem] rounded-full h-[10px] w-[10px] bg-slate-50"></div>
            <div className="absolute bottom-[4.5rem] right-[5.5rem] rounded-full h-[10px] w-[10px] bg-slate-50"></div>
          </div>

          <div style={{ backgroundImage: `url(${path})`, backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[300px] w-[300px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
            <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
              <PopoverTrigger>
                <div className="absolute top-[-20px] left-[-100px] rounded-full">
                  <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px]">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 text-sm font-medium text-white backdrop-blur-3xl">
                      <button className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                          Week 1
                        </div>
                      </button>
                    </span>
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <div className="px-1 py-2">
                  <div className="text-small font-bold">Weekly MidJourney</div>
                  <div className="text-tiny">You are midway to your weeky journey!</div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="absolute top-2 left-12 rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute top-10 left-[5.5rem] rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute top-20 left-28 rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute rounded-full h-[40px] w-[40px] bg-slate-50 flex justify-center items-center">
              <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                <PopoverTrigger>
                  <Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-small font-bold">Weekly MidJourney</div>
                    <div className="text-tiny">You are midway to your weeky journey!</div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="absolute bottom-20 right-28 rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute bottom-10 right-[5.5rem] rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute bottom-2 right-12 rounded-full h-[40px] w-[40px] bg-slate-50"></div>
            <div className="absolute bottom-[-10px] right-0 rounded-full h-[40px] w-[40px] bg-slate-50"></div>
          </div> */}