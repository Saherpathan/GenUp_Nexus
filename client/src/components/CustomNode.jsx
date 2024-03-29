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
import { TbBulb } from "react-icons/tb";
import "./overview.css";

function CustomNode({ data }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip content={data?.description}>
        <div>
          <div className="cloud gradient">
            <div className="text-yellow-300 ">{data?.icon}</div>
          </div>
          <div onClick={onOpen} className="wrapper gradient">
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {data.label}
              </ModalHeader>
              <ModalBody>{data?.description}</ModalBody>
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
