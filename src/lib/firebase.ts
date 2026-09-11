import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const authPersistence = setPersistence(auth, browserLocalPersistence).catch((error) => {
	console.error('No se pudo configurar la persistencia de Firebase Auth:', error);
});
