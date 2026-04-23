import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const executeQuery = async (question) => {
  const { data } = await api.post('/query', { question });
  return data;
};

export const getSchema = async () => {
  const { data } = await api.get('/schema');
  return data;
};

export const getSuggestions = async () => {
  const { data } = await api.get('/suggestions');
  return data;
};

export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const insertRow = async (table, row) => {
  const { data } = await api.post('/data/insert', { table, row });
  return data;
};

export const deleteRow = async (table, id) => {
  const { data } = await api.delete(`/data/delete/${table}/${id}`);
  return data;
};

export const updateRow = async (table, id, updates) => {
  const { data } = await api.put(`/data/update/${table}/${id}`, { updates });
  return data;
};
