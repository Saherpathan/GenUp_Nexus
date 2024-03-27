import React, { useRef, useState, useCallback } from "react";
import Loader from "../../../components/Loader";
import { useTheme } from "next-themes";
import { Switch, Input, Button } from "@nextui-org/react";
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

// import {
//   // nodes as initialNodes,
//   edges as initialEdges,
// } from "../../initial-elements.jsx";
import CustomNode from "../../CustomNode";

import "../../overview.css";
import Background2 from "../../Background/Background.jsx";

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

  return (
    <div>
      <Background2 />

      {isLoading ? (
        <Loader
          json="https://lottie.host/2639b394-c2db-4afd-a6ad-00e8dde8a240/OAhwCbq88U.json"
          width="500px"
          height="250px"
        />
      ) : null}
      <div className="z-10 flex justify-between m-5 text-2xl text-center">
        Mindmaps
        <Switch
          defaultSelected
          size="lg"
          color="primary"
          style={{zIndex: '5'}}
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
            } else if (theme === "dark") {
              setTheme("light");
            }
          }}
        />
      </div>
      
      <div className="z-10 sticky">
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

        <Button
          onClick={handleSumbmit}
          className="flex m-2"
          color="primary"
          variant="shadow"
          isLoading={isLoading}
        >
          Get
        </Button>
      </div>
      
      {initialNodes && (
        <div style={{ width: "100dvw", height: "100dvh", position: 'absolute', top: '0', zIndex: '1' }}>
          <ReactFlow
            nodes={nodes}
            edges={edgesWithUpdatedTypes}
            onConnect={onConnect}
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
    </div>
  );
};

export default Mindmaps;
