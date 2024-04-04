import React from 'react';
import { MouseEnterProvider } from './3dCard';
import { CardContainer, CardBody, CardItem } from './3dCard';
import { Button, Chip, Image } from '@nextui-org/react';
import { Link } from 'react-router-dom';
import { IoOpenOutline } from 'react-icons/io5';
import './ThreeDCard.css';

export function ThreeDCard({item, index}) {
  
  function shortenString(string) {
      if (string.length <= 70) {
          return string;
      } else {
          return string.substring(0, 70)+ '...';
      }
  }

  const isEmoji = (string) => {
    const emojiRegex = /\p{Emoji}/u;
    return emojiRegex.test(string);
  };
  
  const replaceWithBrainEmoji = (test) => {
    if (test && !isEmoji(test)) {
      return "🧠";
    }
    else if (test && test.startsWith("https:")) {
      return "💡";
    }
    else {
      return test;
    }
  };

  function createHex() {
    var hexCode1 = "";
    var hexValues1 = "0123456789abcdef";
    
    for ( var i = 0; i < 6; i++ ) {
      hexCode1 += hexValues1.charAt(Math.floor(Math.random() * hexValues1.length));
    }
    return hexCode1;
  }
  
  function generate() {
    var deg = Math.floor(Math.random() *360);
    return "linear-gradient(" + deg + "deg, " + "#" + createHex() + ", " + "#" + createHex() +")";
  }

  return (
    <MouseEnterProvider>
      <CardContainer className="inter-var">
        <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-[90dvw] sm:w-[20rem] h-[24rem] rounded-xl p-6 border  ">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-neutral-600 dark:text-white"
          >
          {item?.data.initialNodes[0].data.label}
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-neutral-500 text-sm max-w-sm mt-2 h-10 dark:text-neutral-300"
          >
          {shortenString(item?.data.initialNodes[0].data.description)}
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4 flex justify-center align-middle items-center relative">
            <div className='absolute background-globe h-[150px] w-[150px]'></div>
            <div className='w-full h-[190px] custom-pattern rounded-lg flex justify-center align-middle items-center z-10 relative' style={{background: generate()}}>
              <div className='text-[72px] z-50 relative'>{replaceWithBrainEmoji(item?.data.initialNodes[0].data.icon)}</div>
              <div className='absolute background-globe h-[110px] w-[110px]'></div>
            </div>
          </CardItem>
          <div className="flex justify-between items-center mt-5">
          <CardItem translateZ={20} as="a" className="px-4 py-2 rounded-xl text-[20px] font-normal dark:text-white" >
            <div as="a" translateZ={20} className='flex align-middle justify-center items-center' ><Chip size="md">{item?.data.initialNodes[0].data.category}</Chip></div>
            </CardItem>
            <CardItem translateZ={20} as="button" >
              <Link as="button" translateZ={20} to={`/mindmap/save/${item._id}`} state={item}>
                <Button isIconOnly color="warning" variant="shadow">
                  <IoOpenOutline />
                </Button>
              </Link>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </MouseEnterProvider>
  );
}