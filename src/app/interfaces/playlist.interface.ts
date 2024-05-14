export interface PlaylistInterface {
  entries: PlaylistEntry[];
}

export interface PlaylistEntry {
  songId: string,
  votes: number
}

export interface VoteInterface {
  songId: string;
  voto: number;
}