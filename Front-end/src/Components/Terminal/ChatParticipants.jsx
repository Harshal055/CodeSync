import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import debounce from "lodash.debounce";
import Participants from "./Participants";
import { GiDuration } from "react-icons/gi";
import Chat from "./Chat";

const ChatParticipants = ({
  parentRef,
  clients,
  chatTabIndex,
  justOpened,
  hostId,
  remoteHostId,
  micOn,
  unseenCount,
  setUnseenCount,
}) => {
  const [activeComponent, setActiveComponent] = useState(chatTabIndex || 0);
  const sliderRef = useRef(null);

  const components = [
    <div className="m-4 bg-transparent">
      <div className="h-full rounded-lg">
        <Participants
          clients={clients}
          hostId={hostId}
          remoteHostId={remoteHostId}
          micOn={micOn}
        />
      </div>
    </div>,
    <div className="m-2 bg-transparent h-[calc(100vh-260px)]">
      <div className="pr-2 h-full rounded-lg">
        <Chat
          unseenCount={unseenCount}
          setUnseenCount={setUnseenCount}
          isActive={activeComponent}
          chatTabIndex={chatTabIndex}
        />
      </div>
    </div>,
  ];

  const tabs = [`Participants (${clients.length})`, "Chat"];

  const settings = {
    dots: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (current, index) => setActiveComponent(index),
  };

  const handleTabClick = (index) => {
    setActiveComponent(index);
    sliderRef.current.slickGoTo(index);
  };

  useEffect(() => {
    if (typeof chatTabIndex === "number" && chatTabIndex !== activeComponent) {
      setActiveComponent(chatTabIndex);
    }
  }, [chatTabIndex]);

  useEffect(() => {
    localStorage.setItem("chatTabIndex", activeComponent);
  }, [activeComponent]);

  return (
    <div className="">
      <div className="relative flex justify-around bg-[#282828] rounded-xl mt-4 mb-6 ml-5 mr-4 p-1">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#333333] border border-[#3C3C3C] rounded-xl z-0"
          animate={{
            left: `${(activeComponent / tabs.length) * 100}%`,
            width: `${100 / tabs.length}%`,
          }}
        />
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`relative w-full py-2 text-[#b3b3b3] font-semibold text-[16px] z-0
                ${
                  activeComponent === index
                    ? "text-[#f2f2f2]"
                    : "hover:text-[#f2f2f2]"
                }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <hr className="border-[#333333] ml-4 mr-3 mb-1.5" />
      <div className="ml-2 mr-1 overflow-hidden">
        <motion.div
          className="flex gap-1"
          animate={{ x: `-${activeComponent * 100}%` }}
          transition={{
            x: justOpened
              ? { duration: 0 } // 🔥 jump instantly on first mount
              : { duration: 0.4, ease: "easeInOut" },
          }}
        >
          {components.map((component, index) => (
            <motion.div
              key={index}
              className="w-full flex-shrink-0 transition-opacity duration-500"
              initial={{ opacity: 0 }}
              animate={{
                opacity: activeComponent === index ? 1 : 0.5,
              }}
              transition={{
                opacity: { duration: 0.5 },
              }}
            >
              {component}
            </motion.div>
          ))}
        </motion.div>

        {/*<Slider ref={sliderRef} {...settings} className="w-full h-full">
          {components.map((component, index) => (
            <div
              key={index}
              className={`w-full h-full flex items-center justify-center text-[#b3b3b3] text-xl font-bold transition-opacity duration-500 ease-out ${
                activeComponent === index ? "opacity-100" : "opacity-45"
              }`}
            >
              {component}
            </div>
          ))}
        </Slider>*/}
      </div>
    </div>
  );
};

export default ChatParticipants;
