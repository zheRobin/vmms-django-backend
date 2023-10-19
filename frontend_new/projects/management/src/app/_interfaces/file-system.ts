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
  clients?: Client[];
}

export interface Client {
  id: number;
  name: string;
  type: string;
  parent: number;
  master_schedule_enabled: boolean;
}
