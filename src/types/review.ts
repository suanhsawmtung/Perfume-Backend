
export type ListReviewsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type BuildReviewWhereParams = Omit<ListReviewsParams, "pageSize" | "offset">;

export type ParseReviewQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string;
  status?: "publish" | "unpublish" | undefined;
  user?: string;
  product?: string;
};
