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

// ---- TEAM INFO ----
export async function getTeam(): Promise<Team> {
    try {
        const { data } = await axios.get(`${BASE_URL}/lookupteam.php`, {
            params: { id: TEAM_ID },
        });
        if (data?.teams && data.teams.length > 0) return data.teams[0];
        throw new Error("No team data found");
    } catch (error) {
        console.error("Failed to fetch team:", error);
        return {} as Team;
    }
}

// ---- PLAYERS ----
export async function getPlayers(): Promise<Player[]> {
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
