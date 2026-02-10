// API Base URL configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Route paths
export const ROUTES = {
  LOGIN: '/',
  REGISTER: '/register',
  HOME: '/home',
  INSTITUTE_LIST: '/institute-list',
  EXAM_LIST: '/exam-list',
  STAFF_USER_LIST: '/staff-user-list',
  STUDENT_USER_LIST: '/student-user-list',
  DRAWER: '/drawer',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
};

// Page titles
export const PAGE_TITLES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  INSTITUTE_LIST: 'Institute List',
  EXAM_LIST: 'Exam List',
  STAFF_USER_LIST: 'Staff User List',
  STUDENT_USER_LIST: 'Student User List',
};

// Menu items for navigation
export const MENU_ITEMS = [
  { label: 'Institute List', path: ROUTES.INSTITUTE_LIST },
  { label: 'Exam List', path: ROUTES.EXAM_LIST },
  { label: 'Staff User List', path: ROUTES.STAFF_USER_LIST },
  { label: 'Student User List', path: ROUTES.STUDENT_USER_LIST },
  { label: 'Draw', path: ROUTES.DRAWER },
];
