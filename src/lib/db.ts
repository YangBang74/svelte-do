import Dexie from 'dexie';
import type { Table } from 'dexie';
export interface Task {
  id?: number;
  title: string;
  status: 'active' | 'completed';
  createdAt: Date;
}

class TaskDB extends Dexie {
  tasks!: Table<Task, number>;

  constructor() {
    super('taskDB');
    this.version(1).stores({
      tasks: '++id, title, status, createdAt'
    });
  }
}

export const db = new TaskDB();
