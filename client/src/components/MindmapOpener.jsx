import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./overview.css";
import CustomNode from "./CustomNode";
import axios from "../axios.js";
import { toast } from "react-hot-toast";
import { Layout } from "./Layout";
import { Button } from "@nextui-org/react";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

const MindmapOpener = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [initialNodes, setInitialNodes] = useState(null);
  const [initialEdges, setInitialEdges] = useState(null);
  const [mindmaps, setMindmaps] = useState(null);
  const navigateTo = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const currentUrl = window.location.href;
        const segments = currentUrl.split("/");
        const id = segments[segments.length - 1];
        const res = await axios.get(`/mindmap/get/${id}`);
        setMindmaps(res.data);
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
            <div>
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
            </div>
          )}
        </div>

        {initialNodes && (
          <div style={{ width: "98vw", height: "80vh" }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              onInit={onInit}
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
