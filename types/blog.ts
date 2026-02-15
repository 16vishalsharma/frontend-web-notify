export interface IBlogger {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface IBlog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  blogger: IBlogger;
  tags?: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface IBlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  bloggerName: string;
  bloggerEmail: string;
  bloggerPassword: string;
  bloggerBio?: string;
  bloggerAvatar?: string;
  bloggerWebsite?: string;
  bloggerTwitter?: string;
  bloggerLinkedin?: string;
  bloggerGithub?: string;
  tags?: string;
  status: 'draft' | 'published';
  featuredImage?: string;
}
