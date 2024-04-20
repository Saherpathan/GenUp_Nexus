import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalContext } from "../../../contexts/GlobalContext.jsx";
import { useTheme } from "next-themes";
import {Button, RadioGroup, Radio, cn} from "@nextui-org/react";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import {Pagination, PaginationItem, PaginationCursor} from "@nextui-org/react";
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import {CircularProgress, Chip} from "@nextui-org/react";
import { Meteors } from "../../Meteors/Meteors.jsx";
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/react";

export const CustomRadio = (props) => {
  const {children, ...otherProps} = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-start",
          "flex-row max-w-[500px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent"
        ),
      }}
    >
      {children}
    </Radio>
  );
};

const Practice = ({questions, title, weekNum, dayNum}) => {
  const { theme } = useTheme();
  const { id } = useParams();
  const { user } = useGlobalContext();
  const [error, setError] = useState(false);
  const [problems, setProblems] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currIndex, setCurrIndex]= useState(null);
  const [currKey, setCurrKey] = useState(null);
  const [currValue, setCurrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [timerValue, setTimerValue] = useState(0);

  // const startTimer = () => {
  //   const interval = setInterval(() => {
  //     setTimerValue((v) => (v >= 100 ? 0 : v + 10));
  //   }, 1000);
  //   return () => clearInterval(interval);
  // };
  
  useEffect(() => {
    setProblems(questions[(weekNum*10)+dayNum]);
  }, []);

  const handleSumbit = async(index, key, value) => {
    setLoading(true);
    console.log(index, key, value);
    console.log(Object.keys(problems[index].answer)[0] === key)
    if (Object.keys(problems[index].answer)[0] === key) {
      try {
        const response = await fetch('https://parthcodes-test-flask-deploy.hf.space/problemhandler', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "_id": id,
                "weekDay": (weekNum*10)+dayNum,
                "index": index,
                "key": key
            }),
        });
    
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
              console.log("Correct"); 
              problems[index].solved = true;
              setCurrentPage((prev) => (prev < 10 ? prev + 1 : prev));
              toast.success("Problem Solved");
              setLoading(false);
              setCurrIndex(null);
              setCurrKey(null);
              setCurrValue(null);
              setProblems(problems);
          } else {
            toast.error("Incorrect Answer");
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
    else {
      setError(true);
      toast.error("Incorrect Answer");
      setLoading(false);
    }
  };

  return (
    <div className='h-full p-2'>
      {questions && (
        <>
        {problems && (
        <Card className={`h-full ${theme === 'light' ? 'bg-slate-200' :'bg-slate-950'} p-2`}>
          <Breadcrumbs radius="full" variant="solid" size={'lg'}>
            <BreadcrumbItem>{title}</BreadcrumbItem>
            <BreadcrumbItem>Week {weekNum}</BreadcrumbItem>
            <BreadcrumbItem>Day {dayNum}</BreadcrumbItem>
          </Breadcrumbs>
          <CardBody>
              <div key={currentPage-1} className='flex flex-row gap-5 justify-center p-5'>
                <div className='w-full'>
                  <Card className={`h-full ${theme === 'light' ? 'bg-slate-300' :'bg-slate-900'} p-5`}>
                    <Meteors />
                    <CardBody>
                      <p className='text-lg font-extrabold'>Question No. {currentPage}</p><br />
                      <p className='text-xl'>{problems[currentPage-1].question}</p>
                    </CardBody>
                  </Card>
                  {/* {!problems[currentPage-1].solved && (
                    <Card className="w-[250px] h-[260px] border-none bg-gradient-to-br from-violet-500 to-fuchsia-500">
                      <CardBody className="justify-center items-center pb-0">
                        <CircularProgress
                          classNames={{
                            svg: "w-36 h-36 drop-shadow-md",
                            indicator: "stroke-white",
                            track: "stroke-white/10",
                            value: "text-3xl font-semibold text-white",
                          }}
                          aria-label="Loading..."
                          strokeWidth={3}
                          showValueLabel={true}
                        />
                      </CardBody>
                      <CardFooter className="justify-center items-center pt-0">
                        <Chip
                          classNames={{
                            base: "border-1 border-white/30",
                            content: "text-white/90 text-small font-semibold",
                          }}
                          variant="bordered"
                        >
                          {timerValue/10} sec
                        </Chip>
                      </CardFooter>
                    </Card>
                  )} */}
                </div>
                <div className='w-full flex flex-col'>
                  <Card className={`h-full ${theme === 'light' ? 'bg-slate-300' :'bg-slate-900'} p-5`}>
                    <Meteors />
                    <form typeof='submit'>
                      <CardBody className='flex flex-col gap-10'>
                        <RadioGroup isRequired isDisabled={problems[currentPage-1].solved} defaultValue={`${problems[currentPage-1].solved && Object.keys(problems[currentPage-1].answer)[0]}`} label="Answer" description="Choose one correct answer from the above options.">
                          {Object.entries(problems[currentPage-1].options).map(([key, value]) => (
                            <CustomRadio color={`${problems[currentPage-1].solved ? 'success' : error ? 'danger' : 'primary'}`} className={`${problems[currentPage-1].solved ? "data-[selected=true]:border-success" : error ? 'data-[selected=true]:border-danger' : "data-[selected=true]:border-primary"}`} key={key} id={`option${key}`} description="" value={key} onChange={() => {setError(false); setCurrIndex(currentPage-1); setCurrKey(key); setCurrValue(value);}}>
                              <p className='w-full flex justify-center align-middle items-center'>{value}</p>
                            </CustomRadio>
                          ))}
                        </RadioGroup>
                        <div className='flex justify-center align-middle items-center'><Button isDisabled={problems[currentPage-1].solved} isLoading={loading} onClick={() => handleSumbit(currIndex, currKey, currValue)} color='primary' variant='shadow'>Submit</Button></div>
                      </CardBody>
                    </form>
                  </Card>
                </div>
              </div>
          </CardBody>
          <CardFooter className="flex flex-row justify-between p-5">
            <Button size='md' isDisabled={currentPage === 1 ? true : false} onPress={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))} variant="flat" color="secondary" startContent={<Icon icon={'mingcute:arrow-left-fill'} fontSize={'18px'} />}>Previous</Button>
            <Pagination size='md' total={problems.length} color="secondary" page={currentPage} onChange={setCurrentPage} />
            <Button size='md' isDisabled={!problems[currentPage-1].solved || currentPage === 10 ? true : false}  onPress={() => setCurrentPage((prev) => (prev < 10 ? prev + 1 : prev))} variant="flat" color="primary" endContent={<Icon icon={'mingcute:arrow-right-fill'} fontSize={'18px'} />}>Next</Button>
          </CardFooter>
        </Card>
      )}
        </>
      )}
    </div>
  )
}

export default Practice;