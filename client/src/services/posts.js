import api from './api';

export const fetchPosts = async () => {
  const { data } = await api.get('/posts');
  return data.data;
};

export const fetchPost = async (id) => {
  const { data } = await api.get(`/posts/${id}`);
  return data.data;
};

export const createPost = async (payload) => {
  const { data } = await api.post('/posts', payload);
  return data.data;
};

export const updatePost = async (id, payload) => {
  const { data } = await api.put(`/posts/${id}`, payload);
  return data.data;
};

export const deletePost = async (id) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

export const toggleLikePost = async (id) => {
  const res = await api.post(`/posts/${id}/like`);
  return res.data.data;
};

export const getComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data.data;
};

export const createComment = async (postId, content) => {
  const res = await api.post(`/posts/${postId}/comments`, { content });
  return res.data.data;
};
