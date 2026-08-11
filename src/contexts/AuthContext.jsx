import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'sorumlu' veya 'admin'
  const [loading, setLoading] = useState(true);

  // Giriş Yap
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Çıkış Yap
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firestore'dan rolü kontrol et
        try {
          const sorumluDoc = await getDoc(doc(db, 'sorumlular', user.uid));
          if (sorumluDoc.exists()) {
            const docData = sorumluDoc.data();
            let dbRol = docData.rol || 'sorumlu';
            if (dbRol === 'yonetici') dbRol = 'admin'; // Geriye dönük uyumluluk
            setUserRole(dbRol);
            setCurrentUser({ ...user, ...docData, rol: dbRol });
          } else {
            const yoneticiDoc = await getDoc(doc(db, 'yoneticiler', user.uid));
            if (yoneticiDoc.exists()) {
              setUserRole('admin');
              setCurrentUser({ ...user, ...yoneticiDoc.data() });
            } else {
              setUserRole(null);
              setCurrentUser(user);
            }
          }
        } catch (error) {
          console.error("Rol bilgisi alınamadı", error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
