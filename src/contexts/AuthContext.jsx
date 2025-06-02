import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  removeFromLocalStorage 
} from '@/lib/localStorageManager';

const AuthContext = createContext(null);
const USERS_STORAGE_KEY = 'mygpa_users';
const SESSION_STORAGE_KEY = 'mygpa_session';
const PROFILES_STORAGE_KEY = 'mygpa_profiles';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback((userId) => {
    const profiles = loadFromLocalStorage(PROFILES_STORAGE_KEY, []);
    return profiles.find(p => p.id === userId) || null;
  }, []);

  useEffect(() => {
    setLoading(true);
    const session = loadFromLocalStorage(SESSION_STORAGE_KEY);
    if (session && session.userId) {
      const profile = fetchUserProfile(session.userId);
      if (profile) {
        setUser(profile);
      } else {
        // Invalid session or profile missing, clear session
        removeFromLocalStorage(SESSION_STORAGE_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [fetchUserProfile]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    const users = loadFromLocalStorage(USERS_STORAGE_KEY, []);
    const foundUser = users.find(u => u.email === email);

    if (foundUser && foundUser.password === password) { // In a real app, use hashed passwords
      const profile = fetchUserProfile(foundUser.id);
      if (profile) {
        setUser(profile);
        saveToLocalStorage(SESSION_STORAGE_KEY, { userId: profile.id, loggedInAt: new Date().toISOString() });
        toast({ title: "Login Successful!", description: `Welcome back, ${profile.name || profile.email}!`, variant: "default" });
        setLoading(false);
        return profile;
      } else {
        toast({ title: "Login Failed", description: "Profile not found for this user.", variant: "destructive" });
      }
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
    }
    setLoading(false);
    throw new Error("Invalid credentials or profile issue.");
  }, [toast, fetchUserProfile]);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    const users = loadFromLocalStorage(USERS_STORAGE_KEY, []);
    const profiles = loadFromLocalStorage(PROFILES_STORAGE_KEY, []);

    if (users.find(u => u.email === email)) {
      toast({ title: "Signup Failed", description: "Email already exists.", variant: "destructive" });
      setLoading(false);
      throw new Error("Email already exists.");
    }

    const userId = uuidv4();
    const newUserAccount = { id: userId, email, password }; // Store password directly for localStorage demo
    const newProfile = { 
      id: userId, 
      name, 
      email, 
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(),
      avatar_url: '', 
      university_name: '',
      degree_program: '',
      student_id_number: '',
      linkedin_url: '',
      portfolio_url: '',
    };

    users.push(newUserAccount);
    profiles.push(newProfile);

    saveToLocalStorage(USERS_STORAGE_KEY, users);
    saveToLocalStorage(PROFILES_STORAGE_KEY, profiles);
    
    setUser(newProfile);
    saveToLocalStorage(SESSION_STORAGE_KEY, { userId: newProfile.id, loggedInAt: new Date().toISOString() });

    toast({ title: "Signup Successful!", description: `Welcome, ${name}! Your account is created.`, variant: "default" });
    setLoading(false);
    return newProfile;
  }, [toast]);

  const logout = useCallback(async () => {
    setLoading(true);
    setUser(null);
    removeFromLocalStorage(SESSION_STORAGE_KEY);
    toast({ title: "Logged Out", description: "You have been successfully logged out.", variant: "default" });
    setLoading(false);
  }, [toast]);
  
  const updateUserProfileContext = useCallback(async (updatedProfileData) => {
    if (!user) throw new Error("User not authenticated");
    setLoading(true);
    let profiles = loadFromLocalStorage(PROFILES_STORAGE_KEY, []);
    const profileIndex = profiles.findIndex(p => p.id === user.id);

    if (profileIndex === -1) {
      toast({ title: "Profile Update Failed", description: "Profile not found.", variant: "destructive" });
      setLoading(false);
      throw new Error("Profile not found.");
    }
    
    const updatedProfile = {
      ...profiles[profileIndex],
      ...updatedProfileData,
      updated_at: new Date().toISOString(),
    };
    profiles[profileIndex] = updatedProfile;
    saveToLocalStorage(PROFILES_STORAGE_KEY, profiles);
    setUser(updatedProfile);

    toast({ title: "Profile Updated", description: "Your profile has been updated." });
    setLoading(false);
    return updatedProfile;
  }, [user, toast]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateUserProfileContext,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;