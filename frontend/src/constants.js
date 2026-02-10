export const API_BASE_URL = 'http://localhost:5000/api';

export const ROUTES = {
  LOGIN: '/',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/home',
  USER_LIST: '/user-list',
  EXAM_LIST: '/exam-list',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const PAGE_TITLES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  STAFF_USER_LIST: 'User Management',
  EXAM_LIST: 'Exam Management',
};

export const MENU_ITEMS = [
  { label: 'Home', path: '/home' },
  { label: 'Users', path: '/user-list' },
  { label: 'Exams', path: '/exam-list' },
];
