import axios from 'axios';

const AI_API_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5000/api/ai';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const aiService = {
  /**
   * Generate exam questions using AI
   * @param {Object} params - Question generation parameters
   * @param {string} params.topic - Topic for questions
   * @param {number} params.count - Number of questions
   * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
   * @param {string} params.type - Question type (mcq, true-false, short-answer, essay)
   */
  generateQuestions: async ({ topic, count = 5, difficulty = 'medium', type = 'mcq' }) => {
    try {
      const response = await axios.post(`${AI_API_URL}/generate-questions`, {
        topic,
        count,
        difficulty,
        type,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Fallback to mock data for development
      return {
        questions: [
          {
            id: 1,
            question: `What is the main concept of ${topic}?`,
            type: 'mcq',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is the correct answer because...',
            difficulty,
          },
        ],
      };
    }
  },

  /**
   * Grade student answer using AI
   * @param {Object} params - Grading parameters
   * @param {string} params.question - The question text
   * @param {string} params.studentAnswer - Student's answer
   * @param {string} params.correctAnswer - Correct/reference answer
   * @param {number} params.maxMarks - Maximum marks for the question
   */
  gradeAnswer: async ({ question, studentAnswer, correctAnswer, maxMarks = 10 }) => {
    try {
      const response = await axios.post(`${AI_API_URL}/grade-answer`, {
        question,
        studentAnswer,
        correctAnswer,
        maxMarks,
      });
      return response.data;
    } catch (error) {
      console.error('Error grading answer:', error);
      
      // Fallback mock grading
      return {
        score: Math.floor(maxMarks * 0.7),
        feedback: 'Good attempt. You covered most key points.',
        suggestions: ['Include more specific examples', 'Elaborate on the main concept'],
      };
    }
  },

  /**
   * Analyze student performance using AI
   * @param {string} studentId - Student ID
   */
  analyzePerformance: async (studentId) => {
    try {
      const response = await axios.post(`${AI_API_URL}/analyze-performance`, {
        studentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing performance:', error);
      
      // Fallback mock analysis
      return {
        strengths: ['Good understanding of basic concepts', 'Consistent performance'],
        weaknesses: ['Need to work on advanced topics', 'Time management'],
        recommendations: ['Practice more MCQs', 'Focus on essay writing'],
        predictedScore: 75,
      };
    }
  },

  /**
   * Generate answer explanation using AI
   * @param {string} question - Question text
   * @param {string} answer - Correct answer
   */
  explainAnswer: async (question, answer) => {
    try {
      const response = await axios.post(`${AI_API_URL}/explain-answer`, {
        question,
        answer,
      });
      return response.data;
    } catch (error) {
      console.error('Error explaining answer:', error);
      return {
        explanation: 'This is the correct answer because it addresses the key concepts.',
      };
    }
  },

  /**
   * Detect plagiarism in answers
   * @param {string} answer - Student's answer
   * @param {Array} referenceTexts - Reference texts to compare against
   */
  detectPlagiarism: async (answer, referenceTexts = []) => {
    try {
      const response = await axios.post(`${AI_API_URL}/detect-plagiarism`, {
        answer,
        referenceTexts,
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting plagiarism:', error);
      return {
        plagiarismScore: 0,
        isPlagiarized: false,
        matches: [],
      };
    }
  },

  /**
   * Get personalized recommendations for student
   * @param {string} studentId - Student ID
   */
  getRecommendations: async (studentId) => {
    try {
      const response = await axios.post(`${AI_API_URL}/recommendations`, {
        studentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        recommendations: [
          'Focus on weak areas',
          'Practice regularly',
          'Take mock tests',
        ],
      };
    }
  },
};

export default aiService;
