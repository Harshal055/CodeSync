import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom';

const collaborationWebsites = [
  {
    id: 1,
    name: "Codeshare",
    description: "An online code editor for real-time collaboration, used for interviews, troubleshooting, and teaching.",
    features: ["Real-time code sharing", "Pair programming", "Interview support"],
    imageurl: "https://codeshare.io/-/img/codeshare-logo.svg?v=v3.34.6"
  },
  {
    id: 2,
    name: "Replit",
    description: "A collaborative coding platform that allows users to write, review, and debug code together in real-time.",
    features: ["Synchronous collaboration", "Frictionless sharing", "Secure environment"],
    imageurl: "https://images.prismic.io/contrary-research/56e4af3b-4e2f-41d7-a579-1ff97be751b5_Replit+%281%29.png?auto=compress,format"
  },
  {
    id: 3,
    name: "Visual Studio Live Share",
    description: "A tool for remote pair programming with real-time editing, debugging, and communication features.",
    features: ["Multiplayer editing", "Audio and video chat", "Group debugging"],
    imageurl: "https://code.visualstudio.com/opengraphimg/opengraph-blog.png"
  }
];






const Feature = () => {
  const navigate = useNavigate();
  const back =() =>{
    navigate('/');
  }
  return (<>
 
<div className=" bg-blue-700 text-white h-[100vh] w-screen   ">
<button onClick={back} className='h-auto w-auto m-6 p-2 rounded-4xl bg-amber-300 font-bold'> back </button>
    <div className="flex-1 flex flex-col justify-center items-center p-8 ">
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collaborationWebsites.map((data) => (
          <div key={data.id} className="h-[60vh]  w-76  p-2 items-center justify-center bg-black rounded-xl" >
            <img src={data.imageurl} alt="" className='w-full  p-2  bg-cover h-40' />

            <h className="text-xl flex text-red-400 p-3 justify-center ">{data.name}</h>
            <h className='text-[2vh] text-blue-200'>Description:-</h>
            <p className='p-3'>{data.description}</p>
            <h className='text-md text-blue-200  '>Features</h>
            <p className='align-middle' > {data.features}</p>

          </div>
        ))}
      </div>

    </div>
    </div>
    <div className="flex-1 bg-white text-white flex flex-col   justify-center items-center p-8">
      <div className="h-screen w-screen">
        <div
          className="h-[60vh] w-[50vw] ml-30   items-center justify-center bg-black rounded-xl"
        >
        </div>
        <div
          className="h-[60vh] w-[50vw] ml-auto mt-[10vh] mr-4 items-center justify-center bg-black rounded-xl"
        >
        </div>
      </div>
    </div>
    <div className="flex-1 bg-white text-white flex flex-col   justify-center items-center p-8">
    <div className="h-[50vh] w-screen">
      </div>

      </div>
    


     
  </>
  )
}

export default Feature