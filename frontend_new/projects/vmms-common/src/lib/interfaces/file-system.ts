export interface FileSystem {
  folders: Folder[];
  items: any;
}

export interface Folder {
  id: number;
  name: string;
  type: string;
  parent: number;
  folders?: Folder[];
  playlists?: Playlist[];
  programs?: Program[];
}

export interface Playlist {
  id: number;
  name: string;
  type: string;
  parent: number;
  prefix: string;
  songCount: number; // TODO: discuss
}

export interface Program {
  id: number;
  name: string;
  type: string;
  parent: number;
  prefix: string;
  playlists: {
    id: number;
    percentage: number; // 0-100
    playlist: number; // playlist ID
    program: number; // program ID
  }[];
}
