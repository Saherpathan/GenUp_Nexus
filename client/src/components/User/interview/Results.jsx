import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useTheme } from "next-themes";
import { Spacer, Switch} from "@nextui-org/react";
import { Skeleton, Button } from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { MoonIcon } from "../../../components/MoonIcon";
import { SunIcon } from "../../../components/SunIcon";
import { useGlobalContext } from "../../../contexts/GlobalContext";
import { companyNames } from "./data";
import { Icon } from '@iconify/react';
import Background from '../../Background/Background';
import ReactStoreIndicator from 'react-score-indicator'
import {Divider} from "@nextui-org/react";
import Editor from "@monaco-editor/react";
import {ScrollShadow} from "@nextui-org/react";
import { Progress } from "@nextui-org/react";
import EmotionChart from './EmotionChart';

const Results = () => {
    const [error, setError] = useState('');
    const { id } = useParams();
    const { user } = useGlobalContext();
    const [resultData, setResultData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { theme, setTheme } = useTheme();
    const [codeTheme, setCodeTheme] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setCodeTheme(`vs-${theme}`);
        const getResults = async() => {
            try {
                const response = await fetch( 'https://parthcodes-test-flask-deploy.hf.space/result', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "type": 2,
                        "user_id": user.result.user_id,
                        "_id": id
                    }),
                });
        
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        console.log(data.data);
                        companyNames.forEach((ele) => {
                            if (ele.value === data.data.company_name) {
                                data.data.src = ele.src;
                            }
                        })
                        let temp = data.data.interview_score;
                        temp = temp.toFixed(2);
                        data.data.interview_score = temp;
                        setResultData(data.data);
                        setIsLoaded(true);
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
        getResults();
    }, []);

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
                Interview Results
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
                        setCodeTheme('vs-dark');
                    } else if (theme === "dark") {
                        setTheme("light");
                        setCodeTheme('vs-light');
                    }
                    
                }}
                />
            </div>
            {isLoaded ? (
                <div className='real-data flex flex-row gap-5 p-4'>
                    <div className='flex flex-col gap-10 w-[65%]'>
                        <div className='flex flex-row gap-3 w-full'>
                            <Card shadow="sm" isPressable isFooterBlurred radius="lg" className="border-none w-full" >
                                <CardBody className="overflow-visible p-0 flex align-middle justify-center items-center">
                                    <Icon icon={resultData.src} width="200" height="200" style={{padding: '20px'}} />
                                </CardBody>
                                <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                    <Skeleton isLoaded={isLoaded} className="h-full w-full rounded-lg" >
                                        <b><p className="text-medium" style={{color: `${theme === 'light' ? 'black' : 'white'}`}}>{resultData.company_name}</p></b>
                                    </Skeleton>
                                </CardFooter>
                            </Card>
                            <Card shadow="sm" isPressable className='w-full'>
                                <CardBody className="overflow-visible p-3 items-center">
                                    <Table aria-label="Dynamic Content" className='p-1'>
                                        <TableHeader>
                                            <TableColumn >Params</TableColumn>
                                            <TableColumn >Value</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow >
                                                <TableCell><b>Position</b></TableCell>
                                                <TableCell>{resultData.position}</TableCell>
                                            </TableRow>
                                            <TableRow >
                                                <TableCell><b>Round</b></TableCell>
                                                <TableCell>{resultData.round}</TableCell>
                                            </TableRow>
                                            <TableRow >
                                                <TableCell><b>Difficulty</b></TableCell>
                                                <TableCell>{resultData.difficulty_level}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardBody>
                                <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                    <Skeleton isLoaded={isLoaded} className="h-full w-full rounded-lg" >
                                        <b><p className="text-medium" style={{color: `${theme === 'light' ? 'black' : 'white'}`}}>Interview Params</p></b>
                                    </Skeleton>
                                </CardFooter>
                            </Card>
                            <Card shadow="sm" isPressable className='w-full'>
                                <CardBody className="overflow-visible p-0">
                                    <div className="max-w-[500px] w-full flex items-center gap-3 p-3 justify-center">
                                        <div className='pt-4 pb-5'>
                                            <ReactStoreIndicator
                                                width={200}
                                                value={resultData.interview_score}
                                                maxValue={10}
                                            />
                                        </div>
                                    </div>
                                </CardBody>
                                <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                    <Skeleton isLoaded={isLoaded} className="h-full w-full rounded-lg" >
                                        <b><p className="text-medium" style={{color: `${theme === 'light' ? 'black' : 'white'}`}}>Interview Score</p></b>
                                    </Skeleton>
                                </CardFooter>
                            </Card>
                        </div>
                        <div className='qa w-full'>
                            Questions & Answers
                            {resultData.qa.map((item, index) => (
                                <Card className="flex flex-col w-full h-[300px] m-3 p-3">
                                    <div key={index} className="flex flex-col h-auto w-full space-x-4 text-small">
                                        <div>Question: {item.question}</div>
                                        <Divider className="my-4 w-[97%] " />
                                        <div className='flex flex-row h-auto items-center space-x-4 text-small'>
                                            <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                                <div>Response : {item.text_answer}</div>
                                            </ScrollShadow>
                                            {item.code_answer && (
                                                <>
                                                    <Divider orientation="vertical" />
                                                    <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                                        <div>Code:
                                                            <Editor
                                                                height="250px"
                                                                language="python"
                                                                theme={codeTheme}
                                                                value={item.code_answer}
                                                                options={{
                                                                    inlineSuggest: true,
                                                                    fontSize: "12px",
                                                                    formatOnType: true,
                                                                    autoClosingBrackets: true,
                                                                    minimap: { scale: 0 },
                                                                }}
                                                            />
                                                        </div>
                                                    </ScrollShadow>
                                                </>
                                            )}
                                            <Divider orientation="vertical" />
                                            <div>
                                                {item.code_suggestions ? (
                                                    <>
                                                        <ScrollShadow hideScrollBar className="w-full h-[100px]">{item.text_suggestions && <p>Text Suggestions: {item.text_suggestions}</p>}</ScrollShadow>
                                                        <Divider className="my-4" />
                                                        <ScrollShadow hideScrollBar className="w-full h-[100px]">{item.code_suggestions && <p>Code Suggestions: {item.code_suggestions}</p>}</ScrollShadow>
                                                    </>
                                                ) : (
                                                    <ScrollShadow hideScrollBar className="w-full h-auto">{item.text_suggestions && <p>Text Suggestions: {item.text_suggestions}</p>}</ScrollShadow>
                                                )}
                                            </div>
                                            <Divider orientation="vertical" />
                                            <div className='w-[50px] align-middle flex flex-col items-center justify-center'>
                                                {item.code_correctness ? (
                                                    <>
                                                        <div>{item.text_correctness}</div>
                                                        <Divider className="my-4" />
                                                        <div>{item.code_correctness}</div>
                                                    </>
                                                ) : (
                                                    <div>{item.text_correctness}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className='scores w-[35%] flex flex-col gap-5'>
                        <div className='flex gap-3'>
                            <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <Progress
                                        size="md"
                                        radius="sm"
                                        classNames={{
                                            base: "max-w-md",
                                            track: "drop-shadow-md border border-default",
                                            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                            label: "tracking-wider font-medium text-default-600",
                                            value: "text-foreground/60",
                                        }}
                                        label={(resultData.gradio_results.body_language.Good * 100).toFixed(0) >= (resultData.gradio_results.body_language.Bad * 100).toFixed(0) ? "Good" : "Bad"}
                                        value={(resultData.gradio_results.body_language.Good * 100).toFixed(0) >= (resultData.gradio_results.body_language.Bad * 100).toFixed(0) ? (resultData.gradio_results.body_language.Good * 100).toFixed(0) : (resultData.gradio_results.body_language.Bad * 100).toFixed(0)}
                                        showValueLabel={true}
                                    />
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    Body Language
                                </CardFooter>
                            </Card>
                            <Card className='distraction-rate w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <Progress
                                        size="md"
                                        radius="sm"
                                        classNames={{
                                            base: "max-w-md",
                                            track: "drop-shadow-md border border-default",
                                            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                            label: "tracking-wider font-medium text-default-600",
                                            value: "text-foreground/60",
                                        }}
                                        label={(resultData.gradio_results.avg_text * 100).toFixed(0) >= 50 ? "High" : "Low"}
                                        value={(resultData.gradio_results.distraction_rate * 100).toFixed(0)}
                                        showValueLabel={true}
                                    />
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    Distraction Rate
                                </CardFooter>
                            </Card>    
                        </div>
                        <div className='flex gap-3'>    
                            <Card className='total-transcript-sentiment w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <Progress
                                        size="md"
                                        radius="sm"
                                        classNames={{
                                            base: "max-w-md",
                                            track: "drop-shadow-md border border-default",
                                            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                            label: "tracking-wider font-medium text-default-600",
                                            value: "text-foreground/60",
                                        }}
                                        label={Object.keys(resultData.gradio_results.total_transcript_sentiment)[0]}
                                        value={resultData.gradio_results.total_transcript_sentiment[Object.keys(resultData.gradio_results.total_transcript_sentiment)[0]] * 100}
                                        showValueLabel={true}
                                    />
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    Transcript Sentiment
                                </CardFooter>
                            </Card>                
                            <Card className='text-response w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <Progress
                                        size="md"
                                        radius="sm"
                                        classNames={{
                                            base: "max-w-md",
                                            track: "drop-shadow-md border border-default",
                                            indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                            label: "tracking-wider font-medium text-default-600",
                                            value: "text-foreground/60",
                                        }}
                                        label={(resultData.test_results.avg_text * 20).toFixed(0) >= 50 ? "Good" : "Bad"}
                                        value={(resultData.test_results.avg_text * 20).toFixed(0)}
                                        showValueLabel={true}
                                    />
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    Text Response
                                </CardFooter>
                            </Card>
                        </div>
                        <div className='flex gap-3'>
                            <Card className='code-response w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5 justify-center items-center'>
                                    {resultData.test_results.avg_code ? (
                                        <Progress
                                            size="md"
                                            radius="sm"
                                            classNames={{
                                                base: "max-w-md",
                                                track: "drop-shadow-md border border-default",
                                                indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
                                                label: "tracking-wider font-medium text-default-600",
                                                value: "text-foreground/60",
                                            }}
                                            label={(resultData.test_results.avg_code * 10).toFixed(0) >= 50 ? "Good" : "Bad"}
                                            value={(resultData.test_results.avg_code * 10).toFixed(0)}
                                            showValueLabel={true}
                                        />
                                    ) : (
                                        "-- Nil --"
                                    )}
                                        
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    Code Response
                                </CardFooter>
                            </Card>
                        </div>
                        <Card className='total-video-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5 justify-center align-middle'>
                                <EmotionChart emotions={resultData.gradio_results.total_video_emotions} />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                Total Video Emotions
                            </CardFooter>
                        </Card>
                        <Card className='speech-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5'>
                                <EmotionChart emotions={resultData.gradio_results.formatted_response} />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                Speech Emotions
                            </CardFooter>
                        </Card>
                        <Card className='mapped-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5'>
                                <EmotionChart emotions={resultData.gradio_results.emotions_final} />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                Mapped Emotions
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className='skeletons flex flex-row gap-5 p-4'>
                    <div className='flex flex-col gap-10 w-[65%]'>
                        <div className='flex flex-row gap-3 w-full'>
                            <Card shadow="sm" isPressable isFooterBlurred radius="lg" className="border-none w-full" >
                                <CardBody className="overflow-visible p-0 flex align-middle justify-center items-center">
                                    <Skeleton className="flex rounded-full w-20 h-20"/>
                                </CardBody>
                                <CardFooter >
                                    <Skeleton className="h-12 w-full rounded-lg" >
                                    </Skeleton>
                                </CardFooter>
                            </Card>
                            <Card shadow="sm" isPressable className='w-full'>
                                <CardBody className="overflow-visible p-10 items-center">
                                    <Skeleton className="h-[80%] w-full rounded-lg" />
                                </CardBody>
                                <CardFooter >
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </CardFooter>
                            </Card>
                            <Card shadow="sm" isPressable className='w-full'>
                                <CardBody className="overflow-visible p-0">
                                    <div className="max-w-[500px] w-full flex items-center gap-3 p-10 justify-center">
                                        <div className='pt-4 pb-5'>
                                            <Skeleton className="flex rounded-full w-20 h-20"/>
                                        </div>
                                    </div>
                                </CardBody>
                                <CardFooter >
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </CardFooter>
                            </Card>
                        </div>
                        <div className='qa w-full'>
                            <Skeleton className="h-10 w-1/4 rounded-lg" />
                            <Card className="flex flex-col w-full h-[300px] m-3 p-3">
                                <div className="flex flex-col h-auto w-full space-x-4 text-small">
                                    <Skeleton className="w-2/5 rounded-lg" />  
                                    <Divider className="my-4 w-[97%] " />
                                    <div className='flex flex-row h-auto items-center space-x-4 text-small'>
                                        <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                            <Skeleton className="h-full w-full rounded-lg" />
                                        </ScrollShadow>
                                        <Divider orientation="vertical" />
                                        <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                            <Skeleton className="h-full w-full rounded-lg" />
                                        </ScrollShadow>
                                        <Divider orientation="vertical" />
                                        <div className='w-full'>
                                            <ScrollShadow hideScrollBar className="w-full h-[100px]"><Skeleton className="h-[80%] w-full rounded-lg" /></ScrollShadow>
                                            <Divider className="my-4" />
                                            <ScrollShadow hideScrollBar className="w-full h-[100px]"><Skeleton className="h-[80%] w-full rounded-lg" /></ScrollShadow>
                                        </div>
                                        <Divider orientation="vertical" />
                                        <div className='w-[50px] align-middle flex flex-col items-center justify-center'>
                                            <div><Skeleton className="h-[20px] w-[20px] rounded-lg" /></div>
                                            <Divider className="my-4" />
                                            <div><Skeleton className="h-[20px] w-[20px] rounded-lg" /></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card className="flex flex-col w-full h-[300px] m-3 p-3">
                                <div className="flex flex-col h-auto w-full space-x-4 text-small">
                                    <Skeleton className="w-2/5 rounded-lg" />  
                                    <Divider className="my-4 w-[97%] " />
                                    <div className='flex flex-row h-auto items-center space-x-4 text-small'>
                                        <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                            <Skeleton className="h-full w-full rounded-lg" />
                                        </ScrollShadow>
                                        <Divider orientation="vertical" />
                                        <ScrollShadow hideScrollBar className="w-full h-[225px]">
                                            <Skeleton className="h-full w-full rounded-lg" />
                                        </ScrollShadow>
                                        <Divider orientation="vertical" />
                                        <div className='w-full'>
                                            <ScrollShadow hideScrollBar className="w-full h-[100px]"><Skeleton className="h-[80%] w-full rounded-lg" /></ScrollShadow>
                                            <Divider className="my-4" />
                                            <ScrollShadow hideScrollBar className="w-full h-[100px]"><Skeleton className="h-[80%] w-full rounded-lg" /></ScrollShadow>
                                        </div>
                                        <Divider orientation="vertical" />
                                        <div className='w-[50px] align-middle flex flex-col items-center justify-center'>
                                            <div><Skeleton className="h-[20px] w-[20px] rounded-lg" /></div>
                                            <Divider className="my-4" />
                                            <div><Skeleton className="h-[20px] w-[20px] rounded-lg" /></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                    <div className='scores w-[35%] flex flex-col gap-5'>
                        <div className='flex gap-3'>
                            <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <div className='flex justify-between'>
                                        <Skeleton className="w-2/5 h-[20px] rounded-lg"/>
                                        <Skeleton className="w-1/5 h-[20px] rounded-lg"/>
                                    </div>
                                    <Spacer y={2} />
                                    <Skeleton className="w-full h-[20px] p-2 rounded-lg"/> 
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    <Skeleton className="w-full h-[30px] rounded-lg"/>
                                </CardFooter>
                            </Card>
                            <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <div className='flex justify-between'>
                                        <Skeleton className="w-2/5 h-[20px] rounded-lg"/>
                                        <Skeleton className="w-1/5 h-[20px] rounded-lg"/>
                                    </div>
                                    <Spacer y={2} />
                                    <Skeleton className="w-full h-[20px] p-2 rounded-lg"/> 
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    <Skeleton className="w-full h-[30px] rounded-lg"/>
                                </CardFooter>
                            </Card>  
                        </div>
                        <div className='flex gap-3'>    
                            <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <div className='flex justify-between'>
                                        <Skeleton className="w-2/5 h-[20px] rounded-lg"/>
                                        <Skeleton className="w-1/5 h-[20px] rounded-lg"/>
                                    </div>
                                    <Spacer y={2} />
                                    <Skeleton className="w-full h-[20px] p-2 rounded-lg"/> 
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    <Skeleton className="w-full h-[30px] rounded-lg"/>
                                </CardFooter>
                            </Card>             
                            <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <div className='flex justify-between'>
                                        <Skeleton className="w-2/5 h-[20px] rounded-lg"/>
                                        <Skeleton className="w-1/5 h-[20px] rounded-lg"/>
                                    </div>
                                    <Spacer y={2} />
                                    <Skeleton className="w-full h-[20px] p-2 rounded-lg"/> 
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    <Skeleton className="w-full h-[30px] rounded-lg"/>
                                </CardFooter>
                            </Card>
                        </div>
                        <div className='flex gap-3'>
                        <Card className='body-language w-[50%] h-[150px] justify-center'>
                                <CardBody className='p-5'>
                                    <div className='flex justify-between'>
                                        <Skeleton className="w-2/5 h-[20px] rounded-lg"/>
                                        <Skeleton className="w-1/5 h-[20px] rounded-lg"/>
                                    </div>
                                    <Spacer y={2} />
                                    <Skeleton className="w-full h-[20px] p-2 rounded-lg"/> 
                                </CardBody>
                                <CardFooter className='flex justify-center'>
                                    <Skeleton className="w-full h-[30px] rounded-lg"/>
                                </CardFooter>
                            </Card>
                        </div>
                        <Card className='total-video-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5 justify-center align-middle'>
                                <Skeleton className="h-[80%] w-full rounded-lg" />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                <Skeleton className="w-3/5 h-[30px] rounded-lg" />
                            </CardFooter>
                        </Card>
                        <Card className='total-video-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5 justify-center align-middle'>
                                <Skeleton className="h-[80%] w-full rounded-lg" />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                <Skeleton className="w-3/5 h-[30px] rounded-lg" />
                            </CardFooter>
                        </Card>
                        <Card className='total-video-emotions w-[100%] h-[350px] justify-center'>
                            <CardBody className='p-5 justify-center align-middle'>
                                <Skeleton className="h-[80%] w-full rounded-lg" />
                            </CardBody>
                            <CardFooter className='flex justify-center'>
                                <Skeleton className="w-3/5 h-[30px] rounded-lg" />
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
            
        </div>
    )
}

export default Results;