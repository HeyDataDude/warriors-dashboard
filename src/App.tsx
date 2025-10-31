import './App.css'
import Shell from "./components/Shell";

import { useEffect } from "react";
import { getRecentEvents } from "./api";
import { transformEvents } from "./utils";

export default function App() {
  useEffect(() => {
    (async () => {
      const data = await getRecentEvents();
      const games = transformEvents(data);
      console.table(games);
    })();
  }, []);

  return <div className="text-center text-yellow-400 p-8">Check console for game data ⚡</div>;
}
