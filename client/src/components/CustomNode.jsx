import { Button } from "@nextui-org/react";
import React, { memo } from "react";
import { Handle, useReactFlow, useStoreApi, Position } from "reactflow";

function CustomNode({ data, isConnectable, id }) {
  function handleClick() {
    console.log("clicked");
  }

  return (
    <>
      {/* <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      /> */}
      <div className="text-md">
        <div className="text-xl text-yellow-700">{data.label}</div>
        <div className="">
          {data.description}
          {data.icon}
        </div>
        <Button onClick={handleClick}>Details</Button>
      </div>

      {/* <Handle
        type="source"
        position={Position.Right}
        id=""
        isConnectable={isConnectable}
      /> */}
    </>
  );
}

export default memo(CustomNode);
