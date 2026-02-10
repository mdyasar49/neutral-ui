import axios from 'axios';
import { API_BASE_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const examService = {
  /**
   * Get all exams
   */
  getAllExams: async (params = {}) => {
    try {
      const response = await apiClient.get('/exams', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  /**
   * Get exam by ID
   */
  getExamById: async (examId) => {
    try {
      const response = await apiClient.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  /**
   * Create new exam
   */
  createExam: async (examData) => {
    try {
      const response = await apiClient.post('/exams', examData);
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  /**
   * Update exam
   */
  updateExam: async (examId, examData) => {
    try {
      const response = await apiClient.put(`/exams/${examId}`, examData);
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  /**
   * Delete exam
   */
  deleteExam: async (examId) => {
    try {
      const response = await apiClient.delete(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  /**
   * Assign exam to students
   */
  assignExam: async (examId, studentIds) => {
    try {
      const response = await apiClient.post(`/exams/${examId}/assign`, { studentIds });
      return response.data;
    } catch (error) {
      console.error('Error assigning exam:', error);
      throw error;
    }
  },

  /**
   * Get exam results
   */
  getExamResults: async (examId) => {
    try {
      const response = await apiClient.get(`/exams/${examId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },

  /**
   * Submit exam answers
   */
  submitExam: async (examId, answers) => {
    try {
      const response = await apiClient.post(`/exams/${examId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  },

  /**
   * Get student exams (upcoming and past)
   */
  getStudentExams: async (studentId) => {
    try {
      const response = await apiClient.get(`/exams/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student exams:', error);
      throw error;
    }
  },
};

export default examService;
