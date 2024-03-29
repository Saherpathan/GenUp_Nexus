import React, { useState, useEffect, useCallback } from "react";
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
import { toast } from "react-hot-toast";
import { Layout } from "../../Layout";
import { Button, Tooltip } from "@nextui-org/react";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../../contexts/GlobalContext";
import { toPng } from "html-to-image";
import { IoSaveOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { HiOutlineShare } from "react-icons/hi2";
import { useTheme } from "next-themes";

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
  const [initialNodes, setInitialNodes] = useState(null);
  const [initialEdges, setInitialEdges] = useState(null);
  const [mindmaps, setMindmaps] = useState(null);
  const [isSaveLoad, setIsSaveLoad] = useState(false);
  const [isDownLoad, setIsDownLoad] = useState(false);
  const [isShareLoad, setIsShareLoad] = useState(false);
  const { theme } = useTheme();
  const { user } = useGlobalContext();
  const navigateTo = useNavigate();
  // const [nodes, setNodes,onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const currentUrl = window.location.href;
        const segments = currentUrl.split("/");
        const id = segments[segments.length - 1];
        const res = await axios.get(`/mindmap/get/${id}`);
        setMindmaps(res.data);
        console.log(mindmaps);
        setInitialEdges(res.data.data.data.initialEdges);
        setInitialNodes(res.data.data.data.initialNodes);
        console.log(initialNodes);
        console.log(initialNodes);
        // toast.success("Mindmap fetched!");
      } catch (err) {
        console.error(err);
        toast.error("Server error please try again later");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsButtonLoading(true);

    try {
      const currentUrl = window.location.href;
      const segments = currentUrl.split("/");
      const id = segments[segments.length - 1];
      await axios.post("/mindmap/delete", { _id: id });
      toast.success("Mindmap Deleted!");
      navigateTo("/savedmindmaps");
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
      const initialData = {
        initialEdges: initialEdges,
        initialNodes: initialNodes,
      };
      const res = await axios.post("/mindmap/save", initialData);
      const result = res.data;
      console.log(result);
      setIsSaveLoad(false);
      toast.success("Mindmap Saved!");
    } catch (err) {
      console.error(err);
      setIsSaveLoad(false);
      toast.error("Server error please try again later");
    }
  };

  // const edgesWithUpdatedTypes = edges.map((edge) => {
  //   if (edge.sourceHandle) {
  //     const edgeType = nodes.find((node) => node.type === "custom").data
  //       .selects[edge.sourceHandle];
  //     edge.type = edgeType;
  //   }

  //   return edge;
  // });
  // const removeAttr = () => {
  //   let temp = document.getElementsByClassName("react-flow__attribution");
  //   temp[0].parentNode.removeChild(temp[0]);
  // };

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

        <div className="flex justify-between">
          <div className="m-5 text-2xl">
            Mindmap{" "}
            {initialNodes && <span>: {initialNodes[0].data.label}</span>}
          </div>
          {initialNodes && (
            <div className="flex gap-2">
              <Tooltip content="Download">
                <Button
                  isIconOnly
                  onClick={handleDownload}
                  className="flex m-2"
                  color="default"
                  variant="shadow"
                  isLoading={isDownLoad}
                  startContent={<FiDownload />}
                ></Button>
              </Tooltip>
              {mindmaps?.data?.userId !== user?.result?.userId && (
                <Tooltip content="Save">
                  <Button
                    isIconOnly
                    onClick={handleSave}
                    className="flex m-2"
                    color="secondary"
                    variant="shadow"
                    isLoading={isSaveLoad}
                    startContent={<IoSaveOutline />}
                  ></Button>
                </Tooltip>
              )}
              <Tooltip content="Share">
                <Button
                  isDisabled
                  isIconOnly
                  onClick={handleSave}
                  className="flex m-2"
                  color="primary"
                  variant="shadow"
                  isLoading={isShareLoad}
                  startContent={<HiOutlineShare />}
                ></Button>
              </Tooltip>
              {mindmaps?.data?.userId === user?.result?.userId && (
                <Tooltip content="Delete">
                  <Button
                    isIconOnly
                    onClick={handleDelete}
                    className="flex m-2"
                    color="danger"
                    variant="shadow"
                    isLoading={isButtonLoading}
                  >
                    <MdDeleteOutline />
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        {}
        {initialNodes && (
          <div style={{ width: "98vw", height: "86vh" }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              // onNodesChange={onNodesChange}
              // onEdgesChange={onEdgesChange}
              onInit={onInit}
              snapToGrid={true}
              snapGrid={snapGrid}
              fitView
              attributionPosition="bottom-right"
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
            >
              <MiniMap style={minimapStyle} zoomable pannable />
              <Controls />
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
        )}
      </Layout>
    </div>
  );
};

export default MindmapOpener;
