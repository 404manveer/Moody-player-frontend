import React, { useState, useRef, useEffect } from "react";

function Videosho({ songs }) {
  const [playing, setPlaying] = useState(null);
  const audioref = useRef([]);

  // Reset refs if songs change
  useEffect(() => {
    audioref.current = Array(songs.length);
    setPlaying(null);
  }, [songs.length]);

  const handling = async (index) => {
    audioref.current.forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    const audio = audioref.current[index];
    if (!audio) return;

    if (playing === index) {
      audio.pause();
      setPlaying(null);
    } else {
      try {
        audio.currentTime = 0;
        await audio.play();
        setPlaying(index);
      } catch (err) {
        console.error("Audio play error:", err);
        setPlaying(null);
      }
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-10">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-10 bg-gradient-to-l from-blue-500 to-green-400 bg-clip-text text-transparent text-center tracking-tight">
          Recommended Tracks
        </h2>
        <div className="flex flex-col gap-7 w-full">
          {songs.map((e, id) => (
            <div
              key={id}
              className="flex items-center justify-between bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl p-7 transition-transform hover:scale-[1.025] hover:shadow-2xl"
            >
              <div className="flex flex-col gap-1 text-left">
                <h2 className="text-2xl font-semibold">{e.title}</h2>
                {e.artist && (
                  <p className="text-sm text-gray-500">{e.artist}</p>
                )}
                {e.mood && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 text-xs font-bold shadow">
                    {e.mood}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <audio
                  src={e.audio}
                  ref={(el) => {
                    audioref.current[id] = el;
                  }}
                  preload="auto"
                ></audio>
                <button
                  onClick={() => handling(id)}
                  className={`text-5xl transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg
                    ${
                      playing === id
                        ? "text-blue-600 hover:text-blue-800 scale-105 bg-blue-100"
                        : "text-gray-400 hover:text-blue-500 bg-white/60"
                    }
                  `}
                  aria-label={playing === id ? "Pause" : "Play"}
                  style={{ boxShadow: "0 4px 24px 0 rgba(80,180,255,0.10)" }}
                >
                  {playing === id ? (
                    <i className="ri-pause-circle-fill"></i>
                  ) : (
                    <i className="ri-play-circle-fill"></i>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Videosho;
