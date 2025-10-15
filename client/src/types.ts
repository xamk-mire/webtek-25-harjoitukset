export type Todo = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
};

export enum Category {
  GENERAL = 'GENERAL',
  WORK = 'WORK',
  STUDY = 'STUDY',
  HOME = 'HOME',
}
