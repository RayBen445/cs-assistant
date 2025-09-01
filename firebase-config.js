// ==========================
// FIREBASE CONFIGURATION
// ==========================

// Firebase configuration - Production Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDC5wv7g_SVN5TUu0mJaNCXsixQ2xGEn0U",
  authDomain: "sample-firebase-ai-app-f3995.firebaseapp.com",
  projectId: "sample-firebase-ai-app-f3995",
  storageBucket: "sample-firebase-ai-app-f3995.firebasestorage.app",
  messagingSenderId: "1075039632976",
  appId: "1:1075039632976:web:3ec667db87f8c47de25b55"
};

// Initialize Firebase (with fallback for demo mode)
let auth, db;
let firebaseAvailable = false;

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseAvailable = true;
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase not available - running in demo mode");
  }
} catch (error) {
  console.warn("Firebase initialization failed - running in demo mode:", error);
}

// Constants
const FIREBASE_ADMIN_USERNAME = "RayBen445";
const FIREBASE_ADMIN_EMAIL = "oladoyeheritage445@gmail.com";

// ==========================
// FIREBASE AUTH FUNCTIONS (with fallback)
// ==========================

async function firebaseSignUp(email, password, username, displayName = "") {
  if (!firebaseAvailable) {
    // Fallback to localStorage for demo
    return localStorageSignUp(email, password, username, displayName);
  }
  
  try {
    // Create user with email and password
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      username: username,
      displayName: displayName || username,
      email: email,
      profileCreated: Date.now(),
      lastLoginTime: Date.now(),
      isAdmin: username.trim().toLowerCase() === FIREBASE_ADMIN_USERNAME.toLowerCase(),
      preferences: {
        theme: "light",
        accentColor: "#0078d4",
        voice: null
      }
    };
    
    // If admin, set the configured email
    if (userProfile.isAdmin) {
      userProfile.email = FIREBASE_ADMIN_EMAIL;
    }
    
    // Save to Firestore
    await db.collection('users').doc(user.uid).set(userProfile);
    
    return { success: true, user, profile: userProfile };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
}

async function firebaseSignIn(email, password) {
  if (!firebaseAvailable) {
    // Fallback to localStorage for demo
    return localStorageSignIn(email, password);
  }
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const profile = userDoc.data();
      
      // Update last login time
      await db.collection('users').doc(user.uid).update({
        lastLoginTime: Date.now()
      });
      
      return { success: true, user, profile: { ...profile, lastLoginTime: Date.now() } };
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

async function firebaseSignOut() {
  if (!firebaseAvailable) {
    // Fallback to localStorage for demo
    return localStorageSignOut();
  }
  
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
}

async function updateFirebaseUserProfile(uid, updates) {
  if (!firebaseAvailable) {
    // Fallback to localStorage for demo
    return localStorageUpdateProfile(updates);
  }
  
  try {
    await db.collection('users').doc(uid).update(updates);
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: error.message };
  }
}

async function getFirebaseUserProfile(uid) {
  if (!firebaseAvailable) {
    // Fallback to localStorage for demo
    return localStorageGetProfile(uid);
  }
  
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
}

// ==========================
// FALLBACK FUNCTIONS (localStorage demo mode)
// ==========================
function localStorageSignUp(email, password, username, displayName) {
  try {
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem("demoUsers") || "{}");
    
    if (existingUsers[email]) {
      return { success: false, error: "User already exists with this email" };
    }
    
    // Create demo user
    const userProfile = {
      uid: "demo-" + Date.now(),
      username: username,
      displayName: displayName || username,
      email: email,
      profileCreated: Date.now(),
      lastLoginTime: Date.now(),
      isAdmin: username.trim().toLowerCase() === FIREBASE_ADMIN_USERNAME.toLowerCase(),
      preferences: {
        theme: "light",
        accentColor: "#0078d4",
        voice: null
      }
    };
    
    // If admin, set the configured email
    if (userProfile.isAdmin) {
      userProfile.email = FIREBASE_ADMIN_EMAIL;
    }
    
    // Save to localStorage
    existingUsers[email] = userProfile;
    localStorage.setItem("demoUsers", JSON.stringify(existingUsers));
    
    return { success: true, user: { uid: userProfile.uid }, profile: userProfile };
  } catch (error) {
    console.error("Demo signup error:", error);
    return { success: false, error: error.message };
  }
}

function localStorageSignIn(email, password) {
  try {
    const existingUsers = JSON.parse(localStorage.getItem("demoUsers") || "{}");
    const userProfile = existingUsers[email];
    
    if (!userProfile) {
      return { success: false, error: "User not found" };
    }
    
    // Update last login
    userProfile.lastLoginTime = Date.now();
    existingUsers[email] = userProfile;
    localStorage.setItem("demoUsers", JSON.stringify(existingUsers));
    
    return { success: true, user: { uid: userProfile.uid }, profile: userProfile };
  } catch (error) {
    console.error("Demo login error:", error);
    return { success: false, error: error.message };
  }
}

function localStorageSignOut() {
  return { success: true };
}

function localStorageUpdateProfile(updates) {
  try {
    if (!currentUserProfile) return { success: false };
    
    const existingUsers = JSON.parse(localStorage.getItem("demoUsers") || "{}");
    const email = currentUserProfile.email;
    
    if (existingUsers[email]) {
      existingUsers[email] = { ...existingUsers[email], ...updates };
      localStorage.setItem("demoUsers", JSON.stringify(existingUsers));
      return { success: true };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Demo profile update error:", error);
    return { success: false };
  }
}

function localStorageGetProfile(uid) {
  // For demo mode, find profile by uid
  try {
    const existingUsers = JSON.parse(localStorage.getItem("demoUsers") || "{}");
    for (const email in existingUsers) {
      if (existingUsers[email].uid === uid) {
        return existingUsers[email];
      }
    }
    return null;
  } catch (error) {
    console.error("Demo get profile error:", error);
    return null;
  }
}