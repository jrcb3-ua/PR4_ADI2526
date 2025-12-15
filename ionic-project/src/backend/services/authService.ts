import { pb } from '../config/pb.js';


const login = async (email: string, password: string) => {
  return await pb.collection("users").authWithPassword(email, password)
}

const logout = () => {
  pb.authStore.clear()
};

export {login, logout };