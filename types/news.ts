export interface INews {
  _id: string;
  title: string;
  topic: string;
  category: string;
  summary: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  tags?: string[];
  publishedAt: string;
  createdAt: string;
}

export interface INewsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: INews[];
}

export interface ITopicSummary {
  _id: { topic: string; category: string };
  count: number;
  latestNews: string;
  lastPublished: string;
}
