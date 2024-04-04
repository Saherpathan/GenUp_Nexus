import {React, useEffect, useRef, useState} from 'react';
import Loader from "../../../components/Loader";
import { useTheme } from "next-themes";
import { Switch, Input, Button, Select, SelectItem, Textarea, Slider, Divider, Spacer} from "@nextui-org/react";
import { MoonIcon } from "../../../components/MoonIcon";
import { SunIcon } from "../../../components/SunIcon";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, ScrollShadow} from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";
import { Icon } from '@iconify/react';
import {technicalJobProfiles, roundTypes, difficultyLevelI, companyNames, popularLanguages} from "./data";
import Editor from "@monaco-editor/react";
import Background from '../../Background/Background';
import check from '../../../assets/check.gif';
import aiBot from '../../../assets/aibot.svg';
import aiBotPng from '../../../assets/aibot.png';
import { Link } from "react-router-dom";
import { useGlobalContext } from "../../../contexts/GlobalContext";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone } from "react-icons/fa";

const Interview = () => {
    const { user } = useGlobalContext();
    const [userId, setUserID] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [start, setStart] = useState(true);
    const [position, setPosition] = useState('');
    const [round, setRound] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [next, setNext] = useState(true);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [code, setCode] = useState('// Enter your code here...');
    const [error, setError] = useState('');
    const [end, setEnd] = useState(false);
    const [codeLang, setCodeLang] = useState('javascript');
    const [isLoading, setIsLoading] = useState(false);
    const { theme, setTheme } = useTheme();
    const [codeTheme, setCodeTheme] = useState('');
    const [reveal, setReveal] = useState(false);
    const gradioAppRef = useRef(null);
    const modal1Disclosure = useDisclosure();
    const modal2Disclosure = useDisclosure();
    const [backdrop, setBackdrop] = useState('blur');
    const [speaking, setSpeaking] = useState(false);
    const { transcript, interimTranscript, finalTranscript, resetTranscript, listening } = useSpeechRecognition();

    useEffect(() => {
        setUserID(user.result.userId);
        modal1Disclosure.onOpen();
        setCodeTheme(`vs-${theme}`);
        getInterviewHistory();
        const timerId = setTimeout(() => {
            const gradioAppElement = gradioAppRef.current;
            if (theme === 'light') {
                gradioAppElement.classList.remove('dark');
                gradioAppElement.classList.add('light');
            }
            else if (theme === 'dark') {
                gradioAppElement.classList.remove('light');
                gradioAppElement.classList.add('dark');
            }
        }, 1000);
        return () => clearTimeout(timerId);
    }, []);

    const getInterviewHistory = async () => {
        try {
            const response = await fetch( 'https://parthcodes-test-flask-deploy.hf.space/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "type": 1,
                    "user_id": user.result.userId
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log(data.data);
                    data.data.forEach((ele) => {
                        let temp = ele.interview_score;
                        temp = temp.toFixed(2);
                        ele.interview_score = temp;
                        companyNames.forEach((ele2) => {
                            if (ele2.value === ele.company_name) {
                                ele.src = ele2.src;
                            }
                        })
                    })
                    console.log(data.data);
                    setInterviewHistory(data.data);
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

    const startInterview = async () => {
        try {
        const response = await fetch( 'https://parthcodes-test-flask-deploy.hf.space/interview', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "from": "client",
                "user_id": userId,
                "type": 1,
                "position": position,
                "round": round,
                "difficulty_level": difficultyLevel,
                "company_name": companyName
            }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(JSON.parse(data.data));
                let temp = JSON.parse(data.data);
                console.log(temp.question);
                setQuestion(temp.question);
                speak(temp.question);
                setAnswer('');
                setCode('');
                setNext(false);
                listenContinuously();
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

    const nextQuestion = async () => {
        try {
          const response = await fetch( 'https://parthcodes-test-flask-deploy.hf.space/interview', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "from": "client",
                    "user_id": userId,
                    "type": 2,
                    "text_data": answer,
                    "code": code
                }),
            });
  
          if (response.ok) {
              const data = await response.json();
              if (data.end) {
                console.log(JSON.parse(data.data));
                setEnd(true);
                setNext(true);
                speak("Thank you for your time!!");
                SpeechRecognition.stopListening();
              }
              else if (data.success) {
                  console.log(JSON.parse(data.data));
                  let temp = JSON.parse(data.data);
                  setQuestion(temp.next_question);
                  speak(temp.next_question);
                  setAnswer('');
                  setCode('');
                  resetTranscript();
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

    const speak = (text) => {
        setSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === "Google UK English Male");
        utterance.voice = selectedVoice;
        utterance.pitch = 1;
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (finalTranscript !== '') {
            console.log('Got final result:', finalTranscript);
            setAnswer(transcript);
        }
    }, [interimTranscript, finalTranscript]);

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return null;
    }
    
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        console.log('Your browser does not support speech recognition software! Try Chrome desktop, maybe?');
    }
    const listenContinuously = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-GB',
        });
    };

    const starter = () => {
        let temp = document.querySelector('button[aria-label="start recording"]');
        temp.addEventListener('click', function() {
            if (end) {
                modal2Disclosure.onOpen();
            }
            else {
                startInterview();
            }
        });
        console.log('event Added');
        setStart(false);
    };

    return (
        <div>
            <Background />
            {isLoading ? (
                <Loader
                json="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json"
                width="500px"
                height="250px"
                />
            ) : null}
            <div className="flex justify-between m-5 text-2xl text-center">
                Mock Interview
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
                    const gradioAppElement = gradioAppRef.current;
                    if (theme === "light") {
                        setTheme("dark");
                        setCodeTheme('vs-dark');
                        gradioAppElement.classList.remove('light');
                        gradioAppElement.classList.add('dark');
                    } else if (theme === "dark") {
                        setTheme("light");
                        setCodeTheme('vs-light');
                        gradioAppElement.classList.remove('dark');
                        gradioAppElement.classList.add('light');
                    }
                    
                }}
                />
            </div>
            <Modal 
                size={'5xl'}
                backdrop={backdrop}
                isOpen={modal1Disclosure.isOpen} 
                onOpenChange={modal1Disclosure.onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                hideCloseButton={true}
                classNames={{
                    wrapper: "d-flex align-items-center justify-content-center",
                    base: "text-center"
                }}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1">Mock Interviews</ModalHeader>
                    <ModalBody className='flex flex-row justify-around gap-5 '>
                        <div className='flex flex-col justify-around gap-5'>
                            <b>Previous Interviews</b>
                            <ScrollShadow hideScrollBar className="w-full h-[400px]">
                                <div className='flex flex-col justify-between w-full gap-5'>
                                    {interviewHistory.map((item, index) => (
                                        <Link target='blank' to={`./results/${item._id}`}>
                                            <Card>
                                                <CardBody className="flex flex-row items-center justify-center gap-5 p-3 overflow-visible">
                                                    <Card
                                                        isFooterBlurred
                                                        radius="lg"
                                                        className="border-none"
                                                        >
                                                        <Icon icon={item.src} width="200" height="200" style={{padding: '20px'}} />
                                                        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                                            <p className="text-tiny text-white/80">{item.company_name}</p>
                                                            <Link target='blank' to={`./results/${item._id}`}><Button className="text-white text-tiny bg-black/20" variant="flat" color="default" radius="lg" size="sm" endContent={<Icon icon="line-md:arrow-right"  style={{color:`${theme==='light' ? `black` : `light`}`, fontSize: '16px'}} className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />}>
                                                                Check
                                                            </Button></Link>
                                                        </CardFooter>
                                                    </Card>
                                                    <div className='flex flex-col'>
                                                        <div className='text-center '>
                                                            <b className='text-lg text-green-500'>{item.interview_score}</b> / 10
                                                        </div>
                                                        <Table isCompact aria-label="Dynamic Content" hideHeader>
                                                            <TableHeader>
                                                                <TableColumn >Params</TableColumn>
                                                                <TableColumn >Value</TableColumn>
                                                            </TableHeader>
                                                            <TableBody>
                                                                <TableRow >
                                                                    <TableCell><b>Position</b></TableCell>
                                                                    <TableCell>{item.position}</TableCell>
                                                                </TableRow>
                                                                <TableRow >
                                                                    <TableCell><b>Round</b></TableCell>
                                                                    <TableCell>{item.round}</TableCell>
                                                                </TableRow>
                                                                <TableRow >
                                                                    <TableCell><b>Difficulty</b></TableCell>
                                                                    <TableCell>{item.difficulty_level}</TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </div>  
                        <div className='flex flex-col justify-start w-full gap-5'>
                            {!reveal ? (
                                <>
                                    <b>New Interview</b>
                                    <Card shadow="sm" isPressable onPress={() => {setReveal(true)}}>
                                        <CardBody className="flex items-center justify-center p-0 overflow-visible">
                                            <Image
                                                radius="lg"
                                                height={300}
                                                alt="Check Mark"
                                                className="w-full object-cover h-[140px] align-items-center justify-center text-center"
                                                src={aiBot}
                                            />
                                        </CardBody>
                                        <CardFooter className="justify-center text-medium">
                                            <p><b>AI Powered</b></p>
                                        </CardFooter>
                                    </Card>
                                </>
                            ) : (
                                <>
                                    <div className='flex items-center justify-between'>
                                        <b>New Inerview</b>
                                        <Button size='sm' onClick={() => {setReveal(false);}} startContent={<Icon icon="ph:arrow-left-bold" style={{color:`${theme==='light' ? `black` : `light`}`, fontSize:'16px'}} className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />} variant='light'>Back</Button>
                                    </div>
                                    <Select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        autoFocus
                                        endContent={
                                            <Icon icon="mingcute:suitcase-fill" className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                                        }
                                        label="Job Profile"
                                        placeholder="Select your Job profile"
                                        labelPlacement='outside'
                                        type="password"
                                        variant="bordered"
                                    >
                                        {technicalJobProfiles.map((jobProfile) => (
                                            <SelectItem key={jobProfile.value} value={jobProfile.value}>
                                            {jobProfile.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        value={round}
                                        onChange={(e) => setRound(e.target.value)}
                                        endContent={
                                            <Icon icon="mingcute:suitcase-fill" className="flex-shrink-0 text-2xl pointer-events-none text-default-400" /> 
                                        }
                                        label="Round Type"
                                        placeholder="Select your round type"
                                        labelPlacement='outside'
                                        variant="bordered"
                                    >
                                        {roundTypes.map((roundTypes) => (
                                            <SelectItem key={roundTypes.value} value={roundTypes.value}>
                                            {roundTypes.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        value={difficultyLevel}
                                        onChange={(e) => setDifficultyLevel(e.target.value)}
                                        endContent={
                                            <Icon icon="mingcute:suitcase-fill" className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                                            
                                        }
                                        label="Difficulty Level"
                                        placeholder="Select your difficulty Level"
                                        labelPlacement='outside'
                                        variant="bordered"
                                    >
                                        {difficultyLevelI.map((difficultyLevelI) => (
                                            <SelectItem key={difficultyLevelI.value} value={difficultyLevelI.value}>
                                            {difficultyLevelI.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        endContent={
                                            <Icon icon="mingcute:suitcase-fill" className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                                            
                                        }
                                        label="Company"
                                        placeholder="Select your Company"
                                        labelPlacement='outside'
                                        variant="bordered"
                                    >
                                        {companyNames.map((companyNames) => (
                                            <SelectItem key={companyNames.value} value={companyNames.value}>
                                            {companyNames.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <div className="flex justify-center px-1 py-2 text-center align-items-center">
                                        <Button color="primary" onPress={onClose} onClick={starter} >
                                            Start Interview
                                        </Button>
                                    </div>
                                </>
                            )}    
                        </div>
                    </ModalBody>
                    <ModalFooter className="justify-center text-center d-flex align-items-center">
                        
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
            <div className='h-full px-5' style={{display: 'flex', flexDirection:'row', gap: '10px'}}>
                <div className='flex flex-col w-[40%] gap-3'>
                    <Card className='w-full video-feed' style={{margin:'auto'}}>
                        <CardBody>
                            <Card shadow="sm" isPressable>
                                <CardBody className="flex items-center justify-center p-5 overflow-visible">
                                    <Image
                                        radius="lg"
                                        alt="Check Mark"
                                        className="w-full object-cover h-[150px] align-items-center justify-center text-center"
                                        src={aiBot}
                                    />
                                    {speaking && (<div className='flex justify-center w-0 h-0 align-middle'><Icon icon="svg-spinners:pulse-rings-multiple" className="text-default-400 text-9xl pointer-events-none flex-shrink-0 translate-y-[-100px]" /></div>)}
                                </CardBody>
                                <CardFooter className="justify-center text-medium">
                                    <p><b>AI</b></p>
                                </CardFooter>
                            </Card>
                        </CardBody>
                    </Card>
                    <Card className='w-full video-feed' style={{margin:'auto'}}>
                        <CardBody>
                            <gradio-app ref={gradioAppRef} src="https://parthcodes-test-video.hf.space/"></gradio-app>
                        </CardBody>
                        <CardFooter className='justify-center'>
                            You
                        </CardFooter>
                    </Card>
                </div>
                {end || start? (
                    <Card className='w-full h-[300px] p-10 flex align-middle justify-center items-center'>
                        {start ? 'Start the interview by starting the recording.' : 'Submit the interview by stoping the recording!'}
                    </Card>
                ) : (
                    <Card className='w-full p-3'>
                        <CardBody>
                            <div className='questionnaire'>
                                <div className='flex flex-row gap-10 question'>
                                    <div className='w-12 h-12'>
                                        <Image
                                            radius="lg"
                                            alt="AiBot"
                                            className="justify-center object-cover w-full h-full text-center align-items-center"
                                            src={aiBotPng}
                                            style={{objectFit: 'contain'}}
                                        />
                                    </div>
                                    <div>{question}</div>
                                </div>
                                <Divider className='my-5'/>
                                <div className='flex flex-row items-center p-2 answer'>
                                    <Textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        key="faded"
                                        variant="faded"
                                        label="Answer"
                                        labelPlacement="outside"
                                        placeholder="Enter your Answer"
                                        className="col-span-12 mb-6 md:col-span-6 md:mb-0"
                                        disableAutosize
                                        // isReadOnly
                                    />
                                    <Icon icon="svg-spinners:pulse" className="flex-shrink-0 text-5xl pointer-events-none text-default-400" />
                                    <FaMicrophone className='translate-x-[-32px]'/>
                                </div>
                                <Spacer y={3} />
                                <div className='flex flex-col items-center p-2 code'>
                                    <div className='flex flex-row items-center justify-between w-full gap-10 align-middle'>
                                        <div className='w-full text-small'>Code</div>
                                        <Select
                                            size='sm'
                                            value={codeLang}
                                            onChange={(e) => setCodeLang(e.target.value)}
                                            endContent={
                                                <Icon icon="mingcute:suitcase-fill" className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                                            }
                                            placeholder="Select your coding language"
                                            labelPlacement='outside'
                                        >
                                            {popularLanguages.map((popularLanguages) => (
                                                <SelectItem key={popularLanguages.value} value={popularLanguages.value}>
                                                {popularLanguages.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <Spacer y={3} />
                                    <div className='w-full overflow-hidden rounded-xl'>
                                        <Editor
                                            height="250px"
                                            language={codeLang}
                                            theme={codeTheme}
                                            value={code}
                                            onChange={(e) => setCode(e)}
                                            options={{
                                                inlineSuggest: true,
                                                fontSize: "16px",
                                                formatOnType: true,
                                                autoClosingBrackets: true,
                                                minimap: { scale: 10 },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                        <CardFooter className='flex justify-center'>
                                <Button variant='shadow' color='primary' isDisabled={next} onClick={nextQuestion} >Next</Button>
                            {/* <Button variant='shadow' color='success' isDisabled={!end} >Submit</Button> */}
                        </CardFooter>
                    </Card>
                )}
            </div>
            <Modal 
                backdrop={backdrop}
                isOpen={modal2Disclosure.isOpen} 
                onOpenChange={modal2Disclosure.onOpenChange}
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                hideCloseButton={true}
                classNames={{
                    wrapper: "d-flex align-items-center justify-content-center",
                    base: "text-center"
                }}
                placement="top-center"
            >
                <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1">Interview Submitted</ModalHeader>
                    <ModalBody>
                        <Card shadow="sm" isPressable>
                            <CardBody className="flex items-center justify-center p-0 overflow-visible">
                                <Image
                                radius="lg"
                                height={200}
                                alt="Check Mark"
                                className="w-full object-cover h-[140px] align-items-center justify-center text-center"
                                src={check}
                                />
                            </CardBody>
                            <CardFooter className="justify-center text-small">
                                <b>Note: </b>
                                <p className="text-default-500"> &nbsp; The results will take a few minutes to compute...</p>
                            </CardFooter>
                        </Card>
                    </ModalBody>
                    <ModalFooter className="justify-center text-center d-flex align-items-center">
                        <Link to={'./interview'}>
                            <Button color="primary" onPress={onClose} disabled={start} onClick={startInterview} endContent={
                                    <Icon icon="line-md:arrow-right"  style={{color: 'white'}} className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
                                } >
                                Check Results
                            </Button>
                        </Link>
                    </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default Interview;