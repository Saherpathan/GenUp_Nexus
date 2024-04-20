import React, { useState, useEffect, useCallback, useRef } from "react";
import { FollowPointer } from "./FollowingPointer/FollowingPointerCard.jsx";
import Loader from "../../Loader";
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
import "./overview.css";
import CustomNode from "./CustomNode";
import axios from "../../../axios.js";
import axiosvercel from "../../../axios-vercel.js";
import { toast } from "react-hot-toast";
import { Layout } from "../../Layout";
import { Button, Tooltip, Avatar } from "@nextui-org/react";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../../contexts/GlobalContext";
import { toPng } from "html-to-image";
import { IoSaveOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi2";
import { TfiInfoAlt } from "react-icons/tfi";
import { useTheme } from "next-themes";
import { Tour } from "antd";
import io from "socket.io-client";
import { LuMousePointer2 } from "react-icons/lu";
import { TbPointerStar } from "react-icons/tb";
import { HeroHighlight } from "../../HeroHighlight/HeroHighlight.jsx";

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

const MindmapOpener = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [initialNodes, setInitialNodes] = useState([]);
  const [initialEdges, setInitialEdges] = useState([]);
  const [mindmaps, setMindmaps] = useState(null);
  const [isSaveLoad, setIsSaveLoad] = useState(false);
  const [isDownLoad, setIsDownLoad] = useState(false);
  const [isShareLoad, setIsShareLoad] = useState(false);
  const { theme } = useTheme();
  const { user } = useGlobalContext();
  const navigateTo = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const socketRef = useRef(null);
  const [remotePointers, setRemotePointers] = useState({});
  const [remoteActivity, setRemoteActivity] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const currentUrl = window.location.href;
        const segments = currentUrl.split("/");
        const id = segments[segments.length - 1];
        const res = await axiosvercel.get(`/mindmap/get/${id}`);
        setMindmaps(res.data);
        console.log(mindmaps);
        setInitialEdges(res.data.data.data.initialEdges);
        setInitialNodes(res.data.data.data.initialNodes);
        console.log(initialNodes);
        console.log(initialEdges);
        // toast.success("Mindmap fetched!");
        // setNodes(initialNodes);
        // setEdges(initialEdges);
        const timer = setTimeout(() => {
          document.getElementsByClassName("react-flow__attribution")[0].remove();
        }, 500);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error(err);
        toast.error("Server error please try again later");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    console.log(nodes);
  }, [initialNodes]);

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);

    try {
      const currentUrl = window.location.href;
      const segments = currentUrl.split("/");
      const id = segments[segments.length - 1];
      await axios.post("/mindmap/delete", { _id: id });
      toast.success("Mindmap Deleted!");
      navigateTo("/mindmap/personal");
    } catch (err) {
      console.error(err);
      toast.error("Server error please try again later");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaveLoad(true);
    try {
      const currentUrl = window.location.href;
      const segments = currentUrl.split("/");
      const id = segments[segments.length - 1];
      const initialData = {
        data: {
          initialEdges: edges,
          initialNodes: nodes,
        },
        _id: id,
      };
      const res = await axios.post("/mindmap/save/id", initialData);
      const result = res.data;
      console.log(result);
      setIsSaveLoad(false);
      toast.success(result.message);
    } catch (err) {
      console.error(err);
      setIsSaveLoad(false);
      toast.error("Server error please try again later");
    }
  };

  const handleShare = async () => {
    setIsShareLoad(true);

    const currentUrl = window.location.href;
    const text = currentUrl;

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
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);

  const [open, setOpen] = useState(false);

  const steps = [
    {
      title: "Mindmap Remote Activity",
      description: "See others users activity on this mindmap",
      cover: (
        <img
          alt="tour.png"
          src="https://kit8.net/wp-content/uploads/2020/12/Remote_collaboration@2x.png"
          className="h-[300px]"
        />
      ),
      target: () => ref0.current,
    },
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
      title: "Delete",
      description: "Delete your mindmap.",
      target: () => ref4.current,
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
  ];

  // Live Pointer
  const colors = [
    "var(--sky-500)",
    "var(--neutral-500)",
    "var(--teal-500)",
    "var(--green-500)",
    "var(--blue-500)",
    "var(--red-500)",
    "var(--yellow-500)",
  ];

  const secColor = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    const socket = io("https://genup-nexus-server-v2.onrender.com/", {
      transports: ["websocket"],
    }); // Replace with your server URL
    socketRef.current = socket;
    socket.on("remotePointerMove", (data) => {
      // Update remote pointers based on data received from the server
      const currentUrl = window.location.href;
      const segments = currentUrl.split("/");
      const mindMapId = segments[segments.length - 1];
      if (data.id !== user?.result?.userId && data.mapId === mindMapId) {
        setRemotePointers((prevPointers) => ({
          ...prevPointers,
          [data.id]: {
            x: data.x,
            y: data.y,
            name: data.name,
            color: data.color,
            mapId: data.mapId,
            dp: data.dp,
          },
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePointerMove = (event) => {
    const { clientX, clientY } = event;

    // const coll = colors[Math.floor(Math.random() * colors.length)]
    // console.log(coll)
    const currentUrl = window.location.href;
    const segments = currentUrl.split("/");
    const id = segments[segments.length - 1];

    const pointerData = {
      id: user?.result?.userId, // Use unique identifier for each client
      x: clientX,
      y: clientY,
      name: user?.result?.name,
      color: secColor,
      mapId: id,
      dp: user?.result?.picture,
    };
    socketRef.current.emit("pointerMove", pointerData);
  };

  return (
    <div>
      <Layout>
        {isLoading ? (
          <Loader
            json="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json"
            width="500px"
            height="250px"
          />
        ) : null}

        <div className="m-5 text-2xl z-20 relative font-bold">
          Mindmap{" "}
          {initialNodes.length > 1 && (
            <span>: {initialNodes[0]?.data?.label}</span>
          )}
        </div>
        <div className="absolute top-50% right-2 z-20 flex flex-col gap-1 md:gap-2">
          {initialNodes.length > 1 && (
            <>
              <Tooltip color="default" placement="left" content="How this page works?">
                <Button
                  isIconOnly
                  onClick={() => setOpen(true)}
                  className="flex m-2"
                  color="default"
                  variant="shadow"
                >
                  <TfiInfoAlt />
                </Button>
              </Tooltip>
              <Tooltip color="success" placement="left" content="Mindmap Remote Activity">
                <Button
                  isIconOnly
                  onClick={() => setRemoteActivity((prevState) => !prevState)}
                  className="flex m-2"
                  color="success"
                  variant="shadow"
                  ref={ref0}
                >
                  {!remoteActivity ? <LuMousePointer2 /> : <TbPointerStar />}
                </Button>
              </Tooltip>
              <Tooltip color="warning" placement="left" content="Download">
                <Button
                  isIconOnly
                  onClick={handleDownload}
                  className="flex m-2"
                  color="warning"
                  variant="shadow"
                  isLoading={isDownLoad}
                  ref={ref1}
                >
                  <FiDownload />
                </Button>
              </Tooltip>
              <Tooltip color="secondary" placement="left" content={user ? "Save" : "Login to save."}>
                <Button
                  isIconOnly
                  onClick={handleSave}
                  className="flex m-2"
                  color="secondary"
                  variant="shadow"
                  isLoading={isSaveLoad}
                  ref={ref2}
                >
                  <IoSaveOutline />
                </Button>
              </Tooltip>
              <Tooltip color="primary" placement="left" content="Share">
                <Button
                  isIconOnly
                  onClick={handleShare}
                  className="flex m-2"
                  color="primary"
                  variant="shadow"
                  isLoading={isShareLoad}
                  ref={ref3}
                >
                  <HiOutlineShare />
                </Button>
              </Tooltip>
              {mindmaps?.data?.userId === user?.result?.userId && (
                <Tooltip color="danger" placement="left" content="Delete">
                  <Button
                    isIconOnly
                    onClick={handleDelete}
                    className="flex m-2"
                    color="danger"
                    variant="shadow"
                    isLoading={isButtonLoading}
                    ref={ref4}
                  >
                    <MdDeleteOutline />
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </div>
        {initialNodes.length > 1 ? (
          <div
            // style={{ width: "100vw", height: "81vh" }}
            className="absolute top-0 w-full h-[100dvh]"
            ref={ref7}
            onMouseMove={handlePointerMove}
          >
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
              {" "}
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
        {remoteActivity &&
          Object.keys(remotePointers).map((pointerId) => (
            <div
              key={pointerId}
              style={{
                position: "absolute",
                left: remotePointers[pointerId].x,
                top: remotePointers[pointerId].y,
              }}
            >
              {/* Render remote pointer */}
              <FollowPointer
                title={remotePointers[pointerId].name}
                colorr={remotePointers[pointerId].color}
                pic={remotePointers[pointerId].dp}
              />
            </div>
          ))}
      </Layout>
    </div>
  );
};

export default MindmapOpener;