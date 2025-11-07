
export interface Team {
  idTeam: string;
  strTeam: string;
  strLeague: string;
  intFormedYear: string;
  strStadium: string;
  strTeamBadge: string;
  strTeamBanner?: string;
  strDescriptionEN?: string;
  strWebsite?: string;
}

export interface Player {
  idPlayer: string;
  strPlayer: string;
  strPosition?: string;
  strHeight?: string;
  strWeight?: string;
  dateBorn?: string;
  strThumb?: string;
  strDescriptionEN?: string;
  strNumber?: string;
  strNationality?: string;
}

export interface Event {
  idEvent: string;
  dateEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore?: string;
  intAwayScore?: string;
}
