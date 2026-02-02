
export type NoteStatus = 'active' | 'archived' | 'deleted';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  status: NoteStatus;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

export enum SidebarTab {
  NOTES = 'notes',
  ARCHIVE = 'archive',
  TRASH = 'trash'
}
