import { Post } from "@prisma/client";
import { ServiceResponseT } from "../../types/common";
import {
  CreatePostParams,
  ListPostResultT,
  ListPostsParams,
  ListPostT,
  UpdatePostParams,
} from "../../types/post";

export interface IAdminPostService {
  listPosts(params: ListPostsParams): Promise<ServiceResponseT<ListPostResultT>>;
  getPostDetail(slug: string): Promise<ServiceResponseT<ListPostT>>;
  createPost(params: CreatePostParams): Promise<ServiceResponseT<Post>>;
  updatePost(slug: string, params: UpdatePostParams): Promise<ServiceResponseT<Post>>;
  deletePost(slug: string): Promise<ServiceResponseT<null>>;
}

export interface IPublicPostService {
  listPosts(params: ListPostsParams): Promise<ServiceResponseT<ListPostResultT>>;
  getPostDetail(slug: string): Promise<ServiceResponseT<ListPostT>>;
}
