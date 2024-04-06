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
import Markdown from "https://esm.sh/react-markdown@9";
import { RiAiGenerate } from "react-icons/ri";
import { HiSpeakerWave } from "react-icons/hi2";
import { useGlobalContext } from "../../../contexts/GlobalContext";
import TextToSpeech from "./TextToSpeech.jsx";

function CustomNode({ id, data }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoaded, setIsLoaded] = useState(false);
  const [genData, setGenData] = useState(null);
  const { user } = useGlobalContext();

  const handleClick = () => {
    onOpen();
    if (data?.GenData) {
      console.log("GenData is present");
      setGenData(data.GenData);
    } else {
      generateData();
    }
  };

  const generateData = async () => {
    try {
      setIsLoaded(true);
      const currentUrl = window.location.href;
      const segments = currentUrl.split("/");
      const mapid = segments[segments.length - 1];

      const initialData = {
        topic: data?.label,
        description: data?.description,
        category: data?.category,
        nodeId: id,
        mapId: mapid,
      };
      const res = await axios.post("/mindmap/generate/data", initialData);
      console.log(res);

      setGenData(res.data.data);
      data.GenData = res.data.data;
      // console.log(res.data.data);
      // document.getElementById("data").innerHTML = res.data.data;
      setIsLoaded(false);
      // toast("Make sure to save this info 💾")
    } catch (err) {
      console.error(err);
      setIsLoaded(false);
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
          <div onClick={handleClick} className="wrapper gradient">
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
                {isLoaded && (
                  <Loader
                    json="https://lottie.host/9e62675c-18a1-4136-8cb1-6628107f253f/SgGe48PPix.json"
                    width="200px"
                    height="150px"
                  />
                )}

                {/* {genData && ( */}
                <ScrollShadow className="w-full h-[400px]">
                  <Markdown>{genData}</Markdown>
                </ScrollShadow>
                {/* )} */}
              </ModalBody>
              <ModalFooter>
                {genData && (
                  <>
                    <TextToSpeech text={genData} />
                    <Tooltip content="Regenerate Info ✨">
                      <Button
                        // isIconOnly
                        onClick={generateData}
                        className=""
                        color="primary"
                        variant="faded"
                      >
                        Regenerate Info <RiAiGenerate />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default memo(CustomNode);
