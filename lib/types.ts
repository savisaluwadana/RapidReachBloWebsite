export type Post = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  keyTakeaways: string[];
  likes: number;
  status: "published" | "draft";
};

export type Comment = {
  _id?: string;
  postSlug: string;
  name: string;
  body: string;
  createdAt: string;
};
