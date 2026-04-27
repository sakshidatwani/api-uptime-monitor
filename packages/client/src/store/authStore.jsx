import {create} from 'zustand';

const getInitialUser = () => {
    try{
        const item = window.localStorage.getItem('user');
        return item ? JSON.parse(item):null;
    }catch(error){
        console.error('Failed to parse user fron localStorage', error);
        return null;
    }
}


// We call `create` to build our store. `create` takes a function as an argument.
// This function receives `set` as its parameter. `set` is the method we use to update the store's state.
export const useAuthStore = create((set) => ({
  // --- State ---
  // Our initial state is determined by what we find in localStorage.
  // `user` will hold the user object and the JWT token.
  user: getInitialUser(),
  // We can derive the 'isAuthenticated' status directly from the presence of a user token.
  isAuthenticated: !!getInitialUser()?.token,

  // --- Actions ---
  // Actions are functions that can be called from our components to update the state.

  /**
   * Logs a user in by updating the state and saving the user data to localStorage.
   * @param {object} userData - The user object received from the API, which includes the token.
   */
  login: (userData) => {
    // Save the entire user object (including the token) to localStorage.
    // We must stringify the object because localStorage can only store strings.
    localStorage.setItem('user', JSON.stringify(userData));

    // Use the `set` function to update the store's state.
    set({ user: userData, isAuthenticated: true });
  },

  /**
   * Logs a user out by clearing the state and removing the user data from localStorage.
   */
  logout: () => {
    // Remove the user data from localStorage.
    localStorage.removeItem('user');

    // Update the state to reflect that the user is no longer authenticated.
    set({ user: null, isAuthenticated: false });
  },
}));