import {DetailedProgram} from "./detailed-program";

export interface DetailedClient {
  [key: string]: any;
  id: number;
  name: string;
  parent: number;

  api_key: string;
  secret_login_key: string;

  master_schedule_enabled: boolean;
  remote_volume_control_enabled: boolean;

  monday_enabled: boolean;
  monday_open: string | null;
  monday_close: string | null;
  tuesday_enabled: boolean;
  tuesday_open: string | null;
  tuesday_close: string | null;
  wednesday_enabled: boolean;
  wednesday_open: string | null;
  wednesday_close: string | null;
  thursday_enabled: boolean;
  thursday_open: string | null;
  thursday_close: string | null;
  friday_enabled: boolean;
  friday_open: string | null;
  friday_close: string | null;
  saturday_enabled: boolean;
  saturday_open: string | null;
  saturday_close: string | null;
  sunday_enabled: boolean;
  sunday_open: string | null;
  sunday_close: string | null;

  promotions: any[];
  filters: ClientFilter[];

  basic_content: ClientContent;
  contents: ClientContentData[];
}

export interface ClientFilter {
  id: number;
  field: string;
  word: string;
  value: string;
  client: number;
}

export interface ClientContentData {
  id: number;
  client: number;
  content: ClientContent;
}

export interface ClientContent {
  id: number | string;
  type: string;
  object: DetailedProgram;
}
