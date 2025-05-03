import React from 'react'
import { ContainerScroll } from "./ui/container-scroll-animation";
import logoImage from '../assets/images/image.png';



const Home1 = () => {
  return (
    
        <div className="flex flex-col overflow-hidden scroll-smooth  bg-black">
          <ContainerScroll
            titleComponent={
              <>
                <h1 className="text-4xl font-semibold text-black dark:text-white">
                  Real Base Terminal  <br />
                  <span className="text-3xl  md:text-[6rem] font-bold mt-1 leading-none">
                    Unlish Power of coding with Code Sync
                  </span>
                </h1>
              </>
            }
          >
            <img
              src={ logoImage}
              alt="hero"
              height={520}
              width={1000}
              className="mx-auto rounded-2xl object-cover h-full object-left-top"
              draggable={false}
            />
          </ContainerScroll>
        </div>
  )
}

export default Home1