export type Post = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImageUrl?: string;
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

export type CategoryKind = "post" | "tool";

export type Category = {
  slug: string;
  name: string;
  kind: CategoryKind;
  description?: string;
  createdAt: string;
};

export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  github?: string;
  logoUrl?: string;
  screenshots?: string[];
  maker?: string;
  pricing: "free" | "freemium" | "paid" | "open-source";
  openSource: boolean;
  category: string;
  tags: string[];
  featured: boolean;
  status: "published" | "draft";
  launchedAt: string;
  updatedAt?: string;
  upvotes: number;
};

export type UserRole = "user" | "admin";
export type AccountStatus = "active" | "disabled";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt?: string;
};

export type ToolSubmissionStatus = "pending" | "in_review" | "changes_requested" | "approved" | "rejected";

export type ToolSubmission = {
  id: string;
  userId: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  github?: string;
  logoUrl?: string;
  screenshots: string[];
  category: string;
  pricing: Tool["pricing"];
  openSource: boolean;
  maker?: string;
  tags: string[];
  reason?: string;
  status: ToolSubmissionStatus;
  adminNotes?: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  convertedToolSlug?: string;
};
