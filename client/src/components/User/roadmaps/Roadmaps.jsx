import React from "react";
import { Layout } from "../../Layout";
import Background from "../../Background/Background";
import {Popover, PopoverTrigger, PopoverContent, Button, ScrollShadow, Card} from "@nextui-org/react";
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

const data = [
  {
    "week1": {
      "title": "Introduction to Web Development",
      "description": "Basic concepts and tools for web development.",
      "data": {
        "day1": {
          "heading": "HTML Basics",
          "description": "Learn the basic structure of HTML and how to create elements.",
          "links": ["https://www.w3schools.com/html/", "https://developer.mozilla.org/en-US/docs/Web/HTML"],
          "isComplete": true
        },
        "day2": {
          "heading": "CSS Basics",
          "description": "Explore CSS syntax, selectors, and basic styling techniques.",
          "links": ["https://www.w3schools.com/css/", "https://developer.mozilla.org/en-US/docs/Web/CSS"],
          "isComplete": true
        },
        "day3": {
          "heading": "Introduction to JavaScript",
          "description": "Get started with JavaScript fundamentals such as variables, data types, and operators.",
          "links": ["https://www.javascript.com/", "https://developer.mozilla.org/en-US/docs/Web/JavaScript"],
          "isComplete": true
        },
        "day4": {
          "heading": "Setting Up Development Environment",
          "description": "Install and configure necessary development tools such as code editors and web browsers.",
          "links": ["https://code.visualstudio.com/", "https://www.google.com/chrome/"],
          "isComplete": true
        },
        "day5": {
          "heading": "Building Your First Web Page",
          "description": "Apply HTML, CSS, and JavaScript to build a simple web page.",
          "links": [],
          "isComplete": true
        },
        "day6": {
          "heading": "Project Work and Review",
          "description": "Work on a small project to reinforce learning and review the week's topics.",
          "links": [],
          "isComplete": true
        },
        "day7": {
          "heading": "Rest Day",
          "description": "Take a break and recharge for the upcoming week.",
          "links": [],
          "isComplete": true
        }
      }
    }
  },
  {
    "week2": {
      "title": "Frontend Development Essentials",
      "description": "Focus on frontend technologies and frameworks.",
      "data": {
        "day1": {
          "heading": "Intermediate HTML",
          "description": "Dive deeper into HTML by learning about forms, tables, and semantic markup.",
          "links": ["https://www.w3schools.com/html/html_forms.asp", "https://developer.mozilla.org/en-US/docs/Web/HTML/Element"],
          "isComplete": true
        },
        "day2": {
          "heading": "Intermediate CSS",
          "description": "Learn advanced CSS techniques like flexbox, grid layout, and CSS preprocessors.",
          "links": ["https://css-tricks.com/snippets/css/a-guide-to-flexbox/", "https://sass-lang.com/"],
          "isComplete": true
        },
        "day3": {
          "heading": "DOM Manipulation with JavaScript",
          "description": "Understand how to manipulate the Document Object Model (DOM) using JavaScript.",
          "links": ["https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"]
        },
        "day4": {
          "heading": "Responsive Web Design",
          "description": "Learn techniques to create responsive layouts that adapt to different screen sizes.",
          "links": ["https://www.w3schools.com/css/css_rwd_intro.asp", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/responsive_design_building_blocks"]
        },
        "day5": {
          "heading": "Introduction to Bootstrap",
          "description": "Explore the Bootstrap framework for building responsive and mobile-first websites.",
          "links": ["https://getbootstrap.com/docs/5.1/getting-started/introduction/", "https://www.tutorialrepublic.com/twitter-bootstrap-tutorial/"]
        },
        "day6": {
          "heading": "Project Work and Review",
          "description": "Apply the concepts learned during the week to a practical project and review previous topics.",
          "links": []
        },
        "day7": {
          "heading": "Rest Day",
          "description": "Take a break and recharge for the upcoming week.",
          "links": []
        }
      }
    }
  },
  {
    "week3": {
      "title": "Backend Development Fundamentals",
      "description": "Understanding server-side development.",
      "data": {
        "day1": {
          "heading": "Introduction to Node.js",
          "description": "Learn about Node.js and its role in server-side development.",
          "links": ["https://nodejs.org/en/", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction"]
        },
        "day2": {
          "heading": "Working with Express.js",
          "description": "Explore the Express.js framework for building web applications and APIs.",
          "links": ["https://expressjs.com/", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"]
        },
        "day3": {
          "heading": "RESTful APIs",
          "description": "Understand the principles of RESTful API design and implementation.",
          "links": ["https://restfulapi.net/", "https://developer.mozilla.org/en-US/docs/Glossary/REST"]
        },
        "day4": {
          "heading": "Database Basics (SQL/NoSQL)",
          "description": "Learn about different types of databases including SQL and NoSQL.",
          "links": ["https://www.w3schools.com/sql/", "https://www.mongodb.com/nosql-explained"]
        },
        "day5": {
          "heading": "CRUD Operations with MongoDB",
          "description": "Practice creating, reading, updating, and deleting data in MongoDB.",
          "links": ["https://docs.mongodb.com/guides/", "https://www.tutorialspoint.com/mongodb/index.htm"]
        },
        "day6": {
          "heading": "Project Work and Review",
          "description": "Apply backend development concepts to a project and review previous topics.",
          "links": []
        },
        "day7": {
          "heading": "Rest Day",
          "description": "Take a break and recharge for the upcoming week.",
          "links": []
        }
      }
    }
  },
  {
    "week4": {
      "title": "Full Stack Development",
      "description": "Integrating frontend and backend development.",
      "data": {
        "day1": {
          "heading": "Connecting Frontend to Backend",
          "description": "Learn techniques to connect frontend and backend components.",
          "links": ["https://www.sitepoint.com/how-to-connect-your-flask-app-with-a-mongodb-database/"]
        },
        "day2": {
          "heading": "User Authentication",
          "description": "Implement user authentication and authorization in web applications.",
          "links": ["https://auth0.com/docs/authentication", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Authentication"]
        },
        "day3": {
          "heading": "State Management (Redux)",
          "description": "Understand Redux for managing application state in React applications.",
          "links": ["https://redux.js.org/introduction/getting-started", "https://react-redux.js.org/introduction/quick-start"]
        },
        "day4": {
          "heading": "Deploying Applications",
          "description": "Explore various methods for deploying web applications to production servers.",
          "links": ["https://www.heroku.com/", "https://aws.amazon.com/getting-started/projects/deploy-nodejs-web-app/"]
        },
        "day5": {
          "heading": "Project Work and Review",
          "description": "Work on a full-stack project integrating frontend and backend components, and review previous topics.",
          "links": []
        },
        "day6": {
          "heading": "Project Work and Review",
          "description": "Continue working on the full-stack project and review previous topics.",
          "links": []
        },
        "day7": {
          "heading": "Project Work and Review",
          "description": "Finish the full-stack project and review previous topics in preparation for further learning.",
          "links": []
        }
      }
    }
  },
  {
    "week4": {
      "title": "Full Stack Development",
      "description": "Integrating frontend and backend development.",
      "data": {
        "day1": {
          "heading": "Connecting Frontend to Backend",
          "description": "Learn techniques to connect frontend and backend components.",
          "links": ["https://www.sitepoint.com/how-to-connect-your-flask-app-with-a-mongodb-database/"]
        },
        "day2": {
          "heading": "User Authentication",
          "description": "Implement user authentication and authorization in web applications.",
          "links": ["https://auth0.com/docs/authentication", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Authentication"]
        },
        "day3": {
          "heading": "State Management (Redux)",
          "description": "Understand Redux for managing application state in React applications.",
          "links": ["https://redux.js.org/introduction/getting-started", "https://react-redux.js.org/introduction/quick-start"]
        },
        "day4": {
          "heading": "Deploying Applications",
          "description": "Explore various methods for deploying web applications to production servers.",
          "links": ["https://www.heroku.com/", "https://aws.amazon.com/getting-started/projects/deploy-nodejs-web-app/"]
        },
        "day5": {
          "heading": "Project Work and Review",
          "description": "Work on a full-stack project integrating frontend and backend components, and review previous topics.",
          "links": []
        },
        "day6": {
          "heading": "Project Work and Review",
          "description": "Continue working on the full-stack project and review previous topics.",
          "links": []
        },
        "day7": {
          "heading": "Project Work and Review",
          "description": "Finish the full-stack project and review previous topics in preparation for further learning.",
          "links": []
        }
      }
    }
  }
];

const Roadmaps = () => {
  const { theme } = useTheme();
  const botImages = [membot1, membot2, membot3, membot4, membot5, membot6];

  const randomBot = () => {
    const randomIndex = Math.floor(Math.random() * botImages.length);
    return botImages[randomIndex];
  };

  return (
    <div>
      <Layout>
        <Background />
        <div className="flex justify-between m-5 text-2xl text-center">
          Roadmaps
        </div>
        <div className="flex">
          {!data[0].week1.data.day1.isComplete && (
            <Card className="starter flex flex-col justify-around align-middle items-center h-[350px] rounded-lg p-3">
              <img src={botPoint} alt="AiBot" height={'300px'} width={'200px'} />
              <p className="text-small text-center">Start your Journey from here...</p>
            </Card>
          )}
          <ScrollShadow size={100} hideScrollBar offset={100} className="max-w-full max-h-[350px] pl-20" orientation="horizontal" >
            <div style={{width: `${(data.length * 380)+310}px`}} className={`flex flex-row gap-0 py-5 justify-center align-middle items-start w-[${data.length * 400}px] sm:w-[${data.length * 400}px]`}>
              {data.map((week, index) => (
                <>
                  {(index % 2) === 0 ? (
                    <div key={index} style={{ backgroundImage: `url(${path})`, backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[300px] w-[300px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                      <Popover size="sm" placement={'top'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className="absolute top-[-20px] left-[-100px] rounded-full">
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
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">{Object.values(week)[0].title}</div>
                            <div className="text-tiny">{Object.values(week)[0].description}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute top-0 left-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day1.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 1</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day1.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                        <div className={`absolute top-9 left-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day2.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 2</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day2.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute top-20 left-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day3.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 3</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day3.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day4.isComplete ? 'bg-green-500' : 'bg-slate-300' } flex justify-center items-center`}><Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 4</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day4.heading)}</div><br />
                            <div className="text-tiny"> ✨ Your're half way there.</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-20 right-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day5.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 5</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day5.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-9 right-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day6.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 6</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day6.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-0 right-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day7.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 7</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day7.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="absolute bottom-0 left-[-100px]">
                        <img src={randomBot()} alt="membot-random" height={'200px'} width={'150px'} />
                      </div>
                    </div>
                  ) : (
                    <div key={index} style={{ backgroundImage: `url(${path})`, transform:'scaleY(-1)', backgroundSize: 'auto', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} className="relative h-[300px] w-[300px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                      <Popover size="sm" placement={'bottom'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className="absolute top-[-20px] left-[-100px] !scale-y-[-1] rounded-full">
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
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">{Object.values(week)[0].title}</div>
                            <div className="text-tiny">{Object.values(week)[0].description}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute top-0 left-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day1.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 1</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day1.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                        <div className={`absolute top-9 left-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day2.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 2</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day2.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute top-20 left-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day3.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 3</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day3.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day4.isComplete ? 'bg-green-500' : 'bg-slate-300' } flex justify-center items-center`}><Icon icon={'line-md:my-location-loop'} fontSize={'18px'} color="black"/></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 4</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day4.heading)}</div><br />
                            <div className="text-tiny"> ✨ Your're half way there.</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-20 right-28 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day5.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 5</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day5.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-9 right-[5.5rem] rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day6.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 6</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day6.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover size="sm" placement={'right-end'} color="primary" className="ml-3 w-[180px]">
                        <PopoverTrigger>
                          <div className={`absolute bottom-0 right-12 rounded-full h-[40px] w-[40px] ${Object.values(week)[0].data.day7.isComplete ? 'bg-green-500' : 'bg-slate-300' }`}></div>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="text-small font-bold">Day 7</div>
                            <div className="text-tiny">{Object.values(Object.values(week)[0].data.day7.heading)}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="absolute bottom-0 left-[-100px] scale-y-[-1]">
                        <img src={randomBot()} alt="membot-random" height={'200px'} width={'150px'} />
                      </div>
                    </div>
                  )}
                </>
              ))}
              <div className="relative h-[300px] w-[100px] m-auto overflow-visible flex align-middle justify-center items-center bg-transparent">
                <Popover size="sm" placement={'top'} color="primary" className="ml-3 w-[180px]">
                  <PopoverTrigger>
                    <div className="absolute bottom-[-20px] left-[-100px] rounded-full">
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
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">AI Mock Interview</div>
                      <div className="text-tiny">Test the skills that you aquired using AI powered Mock Interviews.</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollShadow>
          {data[data.length - 1][Object.keys(data[data.length - 1])[Object.keys(data[data.length - 1]).length - 1]].data.day7.isComplete && (
            <Card className="ender flex flex-col justify-around align-middle items-center h-[350px] rounded-lg p-3">
              <img src={botCheer} alt="AiBot" height={'250px'} width={'150px'} />
              <p className="text-small text-center">Congo! you have completed your journey.</p>
            </Card>
          )}
        </div>
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