import './App.css'
import Shell from "./components/Shell";

export default function App() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-3xl font-bold text-warriorsGold">Golden State Warriors Dashboard</h1>
        <p className="text-textMuted">Official Blue: #1D428A | Gold: #FDB927 | BG: #0B0F1A</p>
        <button className="bg-warriorsGold text-warriorsBg px-4 py-2 rounded-lg hover:opacity-90 transition">
          Test Button
        </button>
      </div>
    </Shell>
  );
}
