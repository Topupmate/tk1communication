import { sendRequest, BaseUrl } from './api';
import { logFeatures } from '../../utils/debugScopes';

export const GetBlogCategories = async ({ token }) => {
  logFeatures('Blog', 'GetBlogCategories request', {
    endpoint: `${BaseUrl}blog-category`,
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'blog-category',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Blog', 'GetBlogCategories response', {
    status: response?.status,
    message: response?.message,
    count: Array.isArray(response?.response) ? response.response.length : 0,
  });
  return response;
};

export const GetBlogPosts = async ({ token, page = 1, category = 0 }) => {
  logFeatures('Blog', 'GetBlogPosts request', {
    endpoint: `${BaseUrl}blog-posts?page=${page}&category=${category}`,
    page,
    category,
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: `blog-posts?page=${page}&category=${category}`,
    token,
    useFeaturesApi: true,
  });
  logFeatures('Blog', 'GetBlogPosts response', {
    status: response?.status,
    message: response?.message,
    page,
    category,
    count: Array.isArray(response?.response) ? response.response.length : 0,
  });
  return response;
};

export const GetBlogContent = async ({ token, post }) => {
  logFeatures('Blog', 'GetBlogContent request', {
    endpoint: `${BaseUrl}blog-content?post=${post}`,
    postId: post,
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: `blog-content?post=${post}`,
    token,
    useFeaturesApi: true,
  });
  logFeatures('Blog', 'GetBlogContent response', {
    status: response?.status,
    message: response?.message,
    postId: post,
    title: response?.response?.title,
  });
  return response;
};
