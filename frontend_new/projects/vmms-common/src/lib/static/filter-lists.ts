import {ListItem} from "../interfaces/list-item";

/* fields */

export const textFilterList: ListItem[] = [
  { name: 'Title', id: 'Title' },
  { name: 'Artist', id: 'Artist' },
  { name: 'Artist addition', id: 'Artist addition' },
  { name: 'Album', id: 'Album' },
  { name: 'Genre', id: 'Genre' },
  { name: 'Username', id: 'Username' },
];

export const selectorFilterList: ListItem[] = [
  { name: 'Language', id: 'Language' },
  { name: 'Voice', id: 'Voice' },
  { name: 'Version', id: 'Version' },
  { name: 'Cast', id: 'Cast' },
  { name: 'Speed', id: 'Speed' },
  { name: 'Mood', id: 'Mood' },
  { name: 'Energy', id: 'Energy' },
  { name: 'Target age', id: 'Target age' },
  { name: 'Fame', id: 'Fame' },
  { name: 'Daytime', id: 'Daytime' },
  { name: 'Season', id: 'Season' },
];

export const numericFilterList: ListItem[] = [
  { name: 'Year', id: 'Year' },
  { name: 'BPM', id: 'BPM' },
];

export const dateFilterList: ListItem[] = [
  { name: 'Created at', id: 'Created at' },
  { name: 'Updated at', id: 'Updated at' },
];

export const booleanFilterList: ListItem[] = [];

/* filters */

export const textFilterWordList: ListItem[] = [
  { name: 'is', id: 'is' },
  { name: 'is not', id: 'is not' },
  { name: 'contains', id: 'contains' },
  { name: 'does not contain', id: 'does not contain' },
];

export const numericFilterWordList: ListItem[] = [
  { name: 'equals to', id: 'equals to' },
  { name: 'does not equal to', id: 'does not equal to' },
  { name: 'less than', id: 'less than' },
  { name: 'greater than', id: 'greater than' },
  { name: 'less than or equals to', id: 'less than or equals to' },
  { name: 'greater than or equals to', id: 'greater than or equals to' },
];

export const dateFilterWordList: ListItem[] = [
  { name: 'before', id: 'before' },
  { name: 'after', id: 'after' },
];

export const booleanFilterWordList: ListItem[] = [
  { name: 'is', id: 'is' },
  { name: 'is not', id: 'is not' },
];
