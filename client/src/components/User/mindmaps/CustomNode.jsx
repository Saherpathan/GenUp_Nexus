import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip,
  Skeleton,
  ScrollShadow,
} from "@nextui-org/react";
import React, { memo, useState } from "react";
import { Handle, useReactFlow, useStoreApi, Position } from "reactflow";
import axios from "../../../axios.js";
import { toast } from "react-hot-toast";
import Loader from "../../../components/Loader";
import "./overview.css";

function CustomNode({ data }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoaded, setIsLoaded] = useState(false);
  const [genData, setGenData] = useState(null);

  const generateData = async () => {
    onOpen();
    try {
      const initialData = {
        topic: data?.label,
        description: data?.description,
        category: data?.category,
      };
      const res = await axios.post("/mindmap/generate/data", initialData);
      console.log(res);

      setGenData(res.data.data);
      // console.log(res.data.data);
      document.getElementById("data").innerHTML = res.data.data;
      setIsLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error("Server error please try again later");
    }
  };

  return (
    <>
      <Tooltip content={data?.description}>
        <div>
          <div className="cloud gradient">
            <div className="text-yellow-300 ">{data?.icon}</div>
          </div>
          <div onClick={generateData} className="wrapper gradient">
            <div className="inner">
              <div className="body">
                <div>
                  <div className="text-white title">{data?.label}</div>
                  <div className="subline">{data?.category}</div>
                </div>
                <Handle type="target" position={Position.Top} />
                <Handle type="source" position={Position.Bottom} />
              </div>
            </div>
          </div>
        </div>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={"3xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between">
                <div>
                  {data.label} {data.icon}
                </div>
                <div className="p-1 mr-6 text-sm rounded-lg bg-secondary">
                  {data.category}
                </div>
              </ModalHeader>
              <ModalBody>
                {data?.description}
                {!genData && (
                  <Loader
                    json="https://lottie.host/9e62675c-18a1-4136-8cb1-6628107f253f/SgGe48PPix.json"
                    width="200px"
                    height="150px"
                  />
                )}

                {/* {genData && ( */}
                <ScrollShadow className="w-full h-[400px]">
                  <div className="" id="data"></div>
                </ScrollShadow>
                {/* )} */}
              </ModalBody>
              <ModalFooter>
                {/* <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default memo(CustomNode);
