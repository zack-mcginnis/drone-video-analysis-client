import { getData, postData, putData, deleteData } from './api';

interface User {
  id: number;
  name: string;
  email: string;
}

export const userService = {
  getUsers: () => getData<User[]>('/users'),

  getUser: (id: number) => getData<User>(`/users/${id}`),

  createUser: (userData: Omit<User, 'id'>) => postData<User>('/users', userData),

  updateUser: (id: number, userData: Partial<User>) => putData<User>(`/users/${id}`, userData),

  deleteUser: (id: number) => deleteData<void>(`/users/${id}`),
};
