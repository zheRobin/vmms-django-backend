export interface DetailedProgram {
  id: number;
  prefix: string;
  name: string;
  color: string; // "#7ae7bf"
  cover: null;
  parent: number; // parent folder ID

  playlists: ProgramPlaylist[];
  notes: string;
}

export interface ProgramPlaylist {
  id: number; // program playlist ID
  playlist: number; // playlist ID
  program: number; // program ID
  percentage: number;
}
