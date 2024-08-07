import React, { useRef, useState, useEffect } from "react";
import Loader from "../../../components/Loader";
import { useTheme } from "next-themes";
import {
  Switch,
  Input,
  Button,
  Card,
  CardBody,
  CardFooter,
  Tooltip,
} from "@nextui-org/react";
import { MoonIcon } from "../../../components/MoonIcon";
import { SunIcon } from "../../../components/SunIcon";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "../../../axios.js";
import { toast } from "react-hot-toast";
import { IoSaveOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi2";
import { Layout } from "../../../components/Layout";
import { toPng } from "html-to-image";
import CustomNode from "./CustomNode";
import Background2 from "../../Background/Background";
import "./overview.css";
import { IoOpenOutline } from 'react-icons/io5';
import { Tour } from "antd";
import { TfiInfoAlt } from "react-icons/tfi";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BackgroundGradient from "../../CardBackgroundGradient/CardBackgroundGradient.jsx";
import { HeroHighlight } from "../../HeroHighlight/HeroHighlight.jsx";

const initialForm = {
  query: "",
};

const imageWidth = 1024;
const imageHeight = 768;

const snapGrid = [25, 25];

const minimapStyle = {
  height: 120,
};

const nodeTypes = {
  custom: CustomNode,
};

const defaultEdgeOptions = {
  markerEnd: "edge-circle",
};

const onInit = (reactFlowInstance) =>
  console.log("flow loaded:", reactFlowInstance);

const Mindmaps = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveLoad, setIsSaveLoad] = useState(false);
  const [isDownLoad, setIsDownLoad] = useState(false);
  const [isShareLoad, setIsShareLoad] = useState(false);
  const { theme } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [initialEdges, setInitialEdges] = useState([]);
  const [initialNodes, setInitialNodes] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [objectId, setObjectId] = useState(null);
  const [isDisabledSave, setIsDisabledSave] = useState(false);
  const [mindmapHistory, setMindmapHistory] = useState(null);
  const [displayHistory, setDisplayHistory] = useState(false);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    fetchHistory();
  }, [initialNodes]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSumbmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // toast.loading("Generating...");

    try {
      const res = await axios.post("/tree/demo", form);
      console.log(res);
      const result = res.data;
      console.log("Response: ");
      console.log(JSON.parse(result.data));
      const datas = JSON.parse(result.data);
      setObjectId(result.objectId);
      console.log(result.objectId);
      const nodes = datas.nodes;
      const edges = datas.edges;
      setInitialNodes(nodes);
      setInitialEdges(edges);
      // console.log(initialNodes);
      // console.log(initialEdges);
      setIsDisabledSave(false);
      setIsLoading(false);
      toast.success("Mindmap Created Successfully!");
      setMoveDisplay(true);
      const timer = setTimeout(() => {
        document.getElementsByClassName("react-flow__attribution")[0].remove();
      }, 500);
      return () => clearTimeout(timer);
    } catch (error) {
      console.log(error);
      setIsDisabledSave(true);
      setIsLoading(false);
      toast.error("Server error please try again later");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaveLoad(true);
    try {
      const initialData = {
        data: {
          initialEdges: edges,
          initialNodes: nodes,
        },
        _id: objectId,
      };
      console.log(initialData);
      const res = await axios.post("/mindmap/save/id", initialData);
      const result = res.data;
      console.log(result);
      setIsSaveLoad(false);
      setIsDisabledSave(true);
      toast.success(result.message);
    } catch (err) {
      console.error(err);
      setIsSaveLoad(false);
      toast.error("Server error please try again later");
    }
  };

  const handleShare = async () => {
    setIsShareLoad(true);
    if (!isDisabledSave) {
      setIsShareLoad(false);
      return toast.error("Please save the mindmap first");
    }

    console.log(objectId);

    const currentUrl = window.location.href;
    const text = currentUrl + "/save/" + objectId;

    console.log(text);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsShareLoad(false);
        toast.success("Link copied to clipboard!");
        console.log("Text copied to clipboard successfully");
      })
      .catch((err) => {
        setIsShareLoad(false);
        toast.error("Failed to copy link to clipboard!");
        console.error("Unable to copy text to clipboard:", err);
      });
  };

  function downloadImage(dataUrl) {
    const a = document.createElement("a");

    const downloadName = initialNodes
      ? initialNodes[0].data.label + ".png"
      : "GenUpNexus.png";
    a.setAttribute("download", downloadName);
    a.setAttribute("href", dataUrl);
    a.click();
    setIsDownLoad(false);
    toast.success("Mindmap Downloaded!");
  }

  const { getNodes } = useReactFlow();
  const handleDownload = () => {
    setIsDownLoad(true);
    const nodesBounds = getNodesBounds(getNodes());
    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    const bgcolor = theme === "dark" ? "#000" : "#fff";

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: bgcolor,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
    }).then(downloadImage);
  };

  // Tour
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  // const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);
  const ref8 = useRef(null);
  const [open, setOpen] = useState(false);
  const steps = [
    {
      title: "Download Mindmap",
      description: "Download your mindmap as an image.",
      cover: (
        <img
          alt="tour.png"
          src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
        />
      ),
      target: () => ref1.current,
    },
    {
      title: "Save",
      description: "Save your mindmap.",
      target: () => ref2.current,
    },
    {
      title: "Share",
      description: "Share your mindmap. Link is copied to clipboard.",
      target: () => ref3.current,
    },
    {
      title: "Mindmap Controls",
      description:
        "Control your mindmap view, with zoom, fitview and lock view.",
      target: () => ref5.current,
    },
    {
      title: "Minimap",
      description: "Minimap to view the whole mindmap at a glance.",
      target: () => ref6.current,
    },
    {
      title: "Your Mindmap",
      description: "Mindmap you created. Click on the nodes to view details.",
      target: () => ref7.current,
    },
    {
      title: "Create Mindmap",
      description: "You can also create mindmap by entering the query.",
      target: () => ref8.current,
    },
  ];

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/mindmap/history/get");
      setMindmapHistory(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error( "Server error please try again later");
    }
  };

  const [moveDisplay, setMoveDisplay] = useState(false);
  
  return (
    <div>
      {/* <Background2 /> */}
      <Layout>
        {isLoading ? (
          <Loader
            json="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json"
            width="500px"
            height="250px"
          />
        ) : null}
        <div ref={ref8} className="absolute w-[350px] h-[200px]"></div>
        
        <div className="flex flex-col gap-3 pl-2">
          {moveDisplay ? (
            <Tooltip color="primary" content={'Expand'} placement="right">
              <Button className="z-20 relative" isIconOnly color="primary" variant="shadow" onClick={() => {setMoveDisplay(false);}}>
                <Icon icon={'ic:round-arrow-right'} fontSize={'32px'} />
              </Button>
            </Tooltip>
          ) : (
            <>
              <Card className="w-[300px] h-auto pb-5 z-20 relative">
                <CardBody className="gap-3">
                  <div className="flex justify-between text-2xl font-bold">
                    Mindmaps
                    <Tooltip color="primary" content={'Collapse'} placement="right">
                      <Button size="sm" isIconOnly color="primary" variant="shadow" onClick={() => {setMoveDisplay(true);}}>
                        <Icon icon={'ic:round-arrow-left'} fontSize={'32px'} />
                      </Button>
                    </Tooltip>
                  </div>
                  <Input type="text" label="What you want to learn ?" name="query" id="query" value={form.query} onChange={handleChange} isRequired />
                  <Button onClick={handleSumbmit} className="flex mx-3 my-2" color="primary" variant="shadow" isLoading={isLoading} isDisabled={form.query === ""} >
                    Generate
                  </Button>
                </CardBody>
              </Card>
              <Card className="w-[300px] h-auto pb-5 z-20 relative">
                <CardBody className="flex flex-col gap-3">
                  <div className="font-bold">Previous Mindmaps</div>
                  {mindmapHistory?.map((object, index) => (
                    <Card className="p-2">
                    <div className="flex flex-row justify-between align-middle items-center">
                      <div className="flex gap-3">
                        <p>{object.data.initialNodes[0].data.icon}</p>
                        <p className="font-bold">{object.data.initialNodes[0].data.label}</p>
                      </div>
                      <Link as="button" translateZ={20} target='blank' to={`/mindmap/save/${object._id}`} state={object}>
                        <Button isIconOnly color="warning" variant="shadow">
                          <IoOpenOutline />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  ))}
                  <Link className="flex text-sm flex-row gap-2 align-middle items-center" to={'/mindmap/personal'}>See all Mindmaps <Icon icon={'ph:arrow-right-bold'} fontSize={'16px'} /></Link>
                </CardBody>
              </Card>
            </>
          )}
        </div>
        <div className="flex justify-between absolute right-0 top-[75px] z-20">
          {initialNodes.length > 1 && (
            <div className="flex md:gap-2">
              <Tooltip content="How this page works?">
                <Button isIconOnly onClick={() => setOpen(true)} className="flex m-2" color="default" variant="shadow" >
                  <TfiInfoAlt />
                </Button>
              </Tooltip>
              <Tooltip content="Download">
                <Button isIconOnly onClick={handleDownload} className="flex m-2" color="warning" variant="shadow" isLoading={isDownLoad} ref={ref1} >
                  <FiDownload />
                </Button>
              </Tooltip>
              <Tooltip content={"Save"}>
                <Button isIconOnly onClick={handleSave} className="flex m-2" color="secondary" variant="shadow" isLoading={isSaveLoad} ref={ref2} >
                  <IoSaveOutline />
                </Button>
              </Tooltip>
              <Tooltip content="Share">
                <Button isIconOnly onClick={handleShare} className="flex m-2" color="primary" variant="shadow" isLoading={isShareLoad} ref={ref3} >
                  <HiOutlineShare />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        {initialNodes.length > 1 ? (
          <div className="w-full h-[100dvh] absolute top-0" ref={ref7}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={onInit}
              snapToGrid={true}
              snapGrid={snapGrid}
              fitView
              attributionPosition="bottom-right"
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
            >
              <div
                className="absolute bottom-0 right-0 w-[230px] h-[150px]"
                ref={ref6}
              >
                <MiniMap style={minimapStyle} zoomable pannable />
              </div>
              <div
                className="absolute bottom-0 left-0 w-[50px] h-[140px]"
                ref={ref5}
              >
                <Controls ref={ref5} />
              </div>
              <Background color="#aaa" gap={16} />

              <svg>
                <defs>
                  <linearGradient id="edge-gradient">
                    <stop offset="0%" stopColor="#ae53ba" />
                    <stop offset="100%" stopColor="#2a8af6" />
                  </linearGradient>

                  <marker
                    id="edge-circle"
                    viewBox="-5 -5 10 10"
                    refX="0"
                    refY="0"
                    markerUnits="strokeWidth"
                    markerWidth="10"
                    markerHeight="10"
                    orient="auto"
                  >
                    <circle
                      stroke="#2a8af6"
                      strokeOpacity="0.75"
                      r="2"
                      cx="0"
                      cy="0"
                    />
                  </marker>
                </defs>
              </svg>
            </ReactFlow>
          </div>
        ) : (
          <HeroHighlight className={'h-[100dvh] absolute top-0 flex flex-col justify-center align-middle items-center'}></HeroHighlight>
        )}

        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      </Layout>
    </div>
  );
};

export default Mindmaps;
