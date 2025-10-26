import { useState } from "react";
import FaceDetection from "./components/FaceDetection";
import Videosho from "./components/Videosho";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const [mood, setmood] = useState("happy");
  const [songs, setsongs] = useState([]);

  console.log(mood);

  useEffect(() => {
    async function fetchingdata() {
      try {
        const res = await axios.get(`http://localhost:3000/song?mood=${mood}`);
        setsongs(res.data.song);
      } catch (error) {
        console.log(error);
      }
    }
    fetchingdata();
  }, [mood]);

  useEffect(() => {
    console.log("Songs updated:", songs);
  }, [songs]);

  return (
    <>
     <div className="flex  items-center justify-center min-h-screen bg-gray-100">
       <FaceDetection setmood={setmood} />
      <Videosho songs={songs} />
     </div>
    </>
  );
}

export default App;
