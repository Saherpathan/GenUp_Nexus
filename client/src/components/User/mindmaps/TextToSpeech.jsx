import React, { useState, useEffect } from "react";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaCircleStop } from "react-icons/fa6";
import { Button, Tooltip } from "@nextui-org/react";

const TextToSpeech = ({ text }) => {
  const [utterance, setUtterance] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (window.speechSynthesis) {
      const newUtterance = new SpeechSynthesisUtterance(text);
      setUtterance(newUtterance);
    }
  }, [text]);

  const speak = () => {
    if (utterance) {
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if (utterance) {
      window.speechSynthesis.cancel();
    }
  };

  const handleClick = () => {
    setIsClicked((prev) => !prev)

    if(isClicked){
      stop();
    }else{
      speak();
    }
  }

  return (
    <div>
      <Tooltip content="Read Aloud 🗣️">
        <Button
          isIconOnly
          onClick={handleClick}
          className=""
          color="success"
          variant="faded"
        >
          {isClicked ? <FaCircleStop /> : <HiSpeakerWave />}
        </Button>
      </Tooltip>
    </div>
  );
};

export default TextToSpeech;
