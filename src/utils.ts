import { Event } from "./types";

/**
 * Converts raw event data into structured game data for display or charts.
 */

export function isHomeGame(event: Event) {
  return event.strHomeTeam.toLowerCase().includes("warriors");
}

export function toNumber(value?: string | null): number {
  return value ? Number(value) || 0 : 0;
}

export function transformEvents(events: Event[]) {
  return events
    .slice(0, 8) 
    .reverse() 
    .map((e) => {
      const home = isHomeGame(e);
      const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
      const againstPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
      return {
        id: e.idEvent,
        name: e.strEvent,
        date: e.dateEvent,
        forPts,
        againstPts,
        result:
          forPts === againstPts ? "T" : forPts > againstPts ? "W" : "L",
      };
    });
}
