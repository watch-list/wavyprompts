export type Category = 'NanoBanana' | 'Midjourney' | 'Seedream';

export interface PromptData {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  category: Category;
  createdAt: number;
}

export interface SharedData {
  title: string;
  prompt: string;
  imageUrl: string;
  category: Category;
}