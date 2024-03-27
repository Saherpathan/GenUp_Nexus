import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import React, { memo } from "react";
import { Handle, useReactFlow, useStoreApi, Position } from "reactflow";
import { SunIcon } from "./SunIcon";

function CustomNode({ data }) {
  function handleClick() {
    console.log("clicked");
  }

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="">
        {/* <div className="text-xl text-yellow-700">{data.label}</div> */}
        <Tooltip content={data?.description}>
          <Button variant="none" className="">
            {data?.label}
          </Button>
        </Tooltip>
        <Button onPress={onOpen}>
          <SunIcon />
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {data?.label}
              </ModalHeader>
              <ModalBody>{data?.description}</ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
    </>
  );
}

export default memo(CustomNode);
