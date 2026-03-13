
export type ListProductRatingsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  productSlug?: string | undefined;
  username?: string | undefined;
};

export type ListProductRatingSummaryParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  productSlug?: string | undefined;
};

export type ParseProductRatingQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  product?: string | undefined;
  user?: string | undefined;
};
