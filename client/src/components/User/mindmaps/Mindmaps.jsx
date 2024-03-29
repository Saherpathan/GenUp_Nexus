import React, { useRef, useState, useCallback } from "react";
import Loader from "../../../components/Loader";
import { useTheme } from "next-themes";
import { Switch, Input, Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { MoonIcon } from "../../../components/MoonIcon";
import { SunIcon } from "../../../components/SunIcon";
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
import axios from "../../../axios.js";
import { toast } from "react-hot-toast";
import { IoSaveOutline } from "react-icons/io5";
import { Layout } from "../../../components/Layout";

// import {
//   // nodes as initialNodes,
//   edges as initialEdges,
// } from "../../initial-elements.jsx";
import CustomNode from "./CustomNode";
import Background2 from "../../Background/Background";
import "./overview.css";

const initialForm = {
  query: "",
};

const minimapStyle = {
  height: 120,
};

const nodeTypes = {
  custom: CustomNode,
};

const onInit = (reactFlowInstance) =>
  console.log("flow loaded:", reactFlowInstance);

const Mindmaps = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { theme, setTheme } = useTheme();
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
    setIsButtonLoading(true);
    try {
      const initialData = {
        initialEdges: initialEdges,
        initialNodes: initialNodes,
      };
      const res = await axios.post("/mindmap/save", initialData);
      const result = res.data;
      console.log(result);
      setIsButtonLoading(false);
      toast.success("Mindmap Saved!");
    } catch (err) {
      console.error(err);
      setIsButtonLoading(false);
      toast.error("Server error please try again later");
    }
  };

  const removeAttr = () => {
    let temp = document.getElementsByClassName("react-flow__attribution");
    temp[0].parentNode.removeChild(temp[0]);
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
        <Card className="z-10 w-1/5 m-3">
          <CardBody className="w-full">
            <Input
              type="text"
              label="What you want to learn ?"
              name="query"
              id="query"
              value={form.query}
              onChange={handleChange}
              isRequired
              className="p-3 w-full"
            />
            </CardBody>
            <CardFooter className="justify-center">
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
                <Button
                  isIconOnly
                  onClick={handleSave}
                  className="flex m-2"
                  color="secondary"
                  variant="shadow"
                  isLoading={isButtonLoading}
                  startContent={<IoSaveOutline />}
                ></Button>
              )}
            </CardFooter>
          </Card>

        {initialNodes && (
          <div style={{ width: "100dvw", height: "100dvh", position: 'absolute', top: '0', zIndex: '1' }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              onInit={onInit}
              fitView
              attributionPosition="bottom-right"
              nodeTypes={nodeTypes}
            >
              <MiniMap style={minimapStyle} zoomable pannable />
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default Mindmaps;
