import React, { useRef, useState, useCallback } from "react";
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
  const [initialNodes, setInitialNodes] = useState(null);

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
      console.log(JSON.parse(result.data));
      const datas = JSON.parse(result.data);
      const nodes = datas.nodes;
      const edges = datas.edges;
      setInitialNodes(nodes);
      setInitialEdges(edges);
      console.log(initialNodes);
      console.log(initialEdges);
      setIsLoading(false);
      toast.success("Mindmap Created Successfully!");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Server error please try again later");
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

  const removeAttr = () => {
    let temp = document.getElementsByClassName("react-flow__attribution");
    temp[0].parentNode.removeChild(temp[0]);
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

  return (
    <div>
      <Background2 />
      <Layout>
        {isLoading ? (
          <Loader
            json="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json"
            width="500px"
            height="250px"
          />
        ) : null}
        <div className="flex justify-between m-5 text-2xl text-center">
          Mindmaps
        </div>
        <Input
          type="text"
          label="What you want to learn ?"
          name="query"
          id="query"
          value={form.query}
          onChange={handleChange}
          isRequired
          className="m-3 w-[300px]"
        />

        <div className="flex justify-between">
          <Button
            onClick={handleSumbmit}
            className="flex mx-3 my-2"
            color="primary"
            variant="shadow"
            isLoading={isLoading}
            isDisabled={form.query === ""}
          >
            Get
          </Button>

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
                >
                  <FiDownload />
                </Button>
              </Tooltip>
              <Tooltip content="Save">
                <Button
                  isIconOnly
                  onClick={handleSave}
                  className="flex m-2"
                  color="secondary"
                  variant="shadow"
                  isLoading={isSaveLoad}
                >
                  <IoSaveOutline />
                </Button>
              </Tooltip>
              <Tooltip content="Share">
                <Button
                  isDisabled
                  isIconOnly
                  onClick={handleSave}
                  className="flex m-2"
                  color="primary"
                  variant="shadow"
                  isLoading={isShareLoad}
                >
                  <HiOutlineShare />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        {initialNodes && (
          <div style={{ width: "98vw", height: "73vh" }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
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

export default Mindmaps;
