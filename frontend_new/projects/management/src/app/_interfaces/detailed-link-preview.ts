import {DetailedProgram} from "./detailed-program";

export interface DetailedLinkPreview {
  id: number;
  key: string;
  name: string;
  expiration_date: Date;
  program: DetailedProgram;
}
