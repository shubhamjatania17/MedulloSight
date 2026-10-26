/**
 * MedulloSight — Client API Service
 * Handles communication with the Express Gateway API.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 900000
});

export async function analyzeSingleImage(formData) {
  const response = await apiClient.post('/analyze/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function analyzeBatchImages(formData) {
  const response = await apiClient.post('/analyze/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function getSessionsList() {
  const response = await apiClient.get('/sessions');
  return response.data.sessions || [];
}

export async function getSessionDetails(id) {
  const response = await apiClient.get(`/sessions/${id}`);
  return response.data;
}

export async function requestPdfReport(reportPayload) {
  const response = await apiClient.post('/report/pdf', reportPayload, {
    responseType: 'blob'
  });
  return response.data;
}

export async function benchmarkImpulseNoise(formData) {
  const response = await apiClient.post('/benchmark/noise', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function getBenchmarkSamples() {
  const response = await apiClient.get('/samples');
  return response.data.samples || [];
}

export function getBatchCsvUrl(batchId) {
  return `${API_BASE}/export/csv/${batchId}`;
}

export function getBatchZipUrl(batchId) {
  return `${API_BASE}/export/zip/${batchId}`;
}
