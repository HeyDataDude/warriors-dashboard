import axios from "axios";
import type { Team, Player, Event } from "./types";

// ---- CONFIG ----
const BASE_URL =
    import.meta.env.VITE_API_BASE?.trim() ||
    "https://www.thesportsdb.com/api/v1/json/123";
const TEAM_ID = import.meta.env.VITE_TEAM_ID?.trim() || "134865";

// ---- UTILITY WRAPPER ----
export async function safeFetch<T>(
    fn: () => Promise<T>,
    fallback: T
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        console.error("API Error:", error);
        return fallback;
    }
}



// ---- PLAYERS ----
export async function getPlayers(): Promise<Player[]> {
     const url = `${BASE_URL}/lookup_all_players.php?id=${TEAM_ID}`;
  console.log("[getPlayers] →", url);
    try {
        const { data } = await axios.get(`${BASE_URL}/lookup_all_players.php`, {
            params: { id: TEAM_ID },
        });
        return data?.player || [];
    } catch (error) {
        console.error("Failed to fetch players:", error);
        return [];
    }
}

// ---- RECENT GAMES ----
export async function getRecentEvents(): Promise<Event[]> {
    const url = `${BASE_URL}/eventslast.php?id=${TEAM_ID}`;
  console.log("[getRecentEvents] →", url);
    try {
        const { data } = await axios.get(`${BASE_URL}/eventslast.php`, {
            params: { id: TEAM_ID },
        });
        return data?.results || [];
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
}
