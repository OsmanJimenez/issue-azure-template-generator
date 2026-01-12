export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Issue {
  id: string;
  userStory: string;
  year?: string;
  sp?: string;
  description?: string;
  template: string;
  tags: string[]; // references Tag IDs
  features: string[]; // references Feature IDs
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;
}

export interface IssueHistory {
  version: number;
  template: string;
  updatedAt: Date;
  action: 'created' | 'updated' | 'deleted';
}