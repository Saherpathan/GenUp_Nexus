import React, { useRef, useState } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "../../../axios.js";

const initialForm = {
  query: "",
};

const Mindmaps = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [initialEdges, setInitialEdges] = useState([]);
  const [initialNodes, setInitialNodes] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSumbmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/mindmap/demo", form);
      const result = res.data;
      console.log(result);
      setInitialNodes(result.initialNodes);
      setInitialEdges(result.initialEdges);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // const initialNodes = [
  //   {
  //     id: "data-input",
  //     position: { x: 0, y: 0 },
  //     data: { label: "Data Input" },
  //   },
  //   {
  //     id: "data-preprocessing",
  //     position: { x: 200, y: 0 },
  //     data: { label: "Data Preprocessing" },
  //   },
  //   {
  //     id: "model-training",
  //     position: { x: 400, y: 0 },
  //     data: { label: "Model Training" },
  //   },
  //   {
  //     id: "model-evaluation",
  //     position: { x: 0, y: 200 },
  //     data: { label: "Model Evaluation" },
  //   },
  //   {
  //     id: "prediction",
  //     position: { x: 200, y: 200 },
  //     data: { label: "Prediction" },
  //   },
  //   {
  //     id: "data-visualization",
  //     position: { x: 400, y: 200 },
  //     data: { label: "Data Visualization" },
  //   },
  // ];

  // const initialEdges = [
  //   {
  //     id: "data-input-to-preprocessing",
  //     source: "data-input",
  //     target: "data-preprocessing",
  //   },
  //   {
  //     id: "preprocessing-to-training",
  //     source: "data-preprocessing",
  //     target: "model-training",
  //   },
  //   {
  //     id: "training-to-evaluation",
  //     source: "model-training",
  //     target: "model-evaluation",
  //   },
  //   {
  //     id: "training-to-prediction",
  //     source: "model-training",
  //     target: "prediction",
  //   },
  //   {
  //     id: "evaluation-to-visualization",
  //     source: "model-evaluation",
  //     target: "data-visualization",
  //   },
  //   {
  //     id: "prediction-to-visualization",
  //     source: "prediction",
  //     target: "data-visualization",
  //   },
  // ];

  const minimapStyle = {
    height: 120,
  };

  return (
    <div>
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <div className="flex justify-between m-5 text-2xl text-center">
        Mindmaps
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
            } else if (theme === "dark") {
              setTheme("light");
            }
          }}
        />
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

      <Button
        onClick={handleSumbmit}
        className="flex m-2"
        color="primary"
        variant="shadow"
        isLoading={isLoading}
      >
        Get
      </Button>

      {initialNodes && (
        <div style={{ width: "98vw", height: "75vh" }}>
          <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
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
