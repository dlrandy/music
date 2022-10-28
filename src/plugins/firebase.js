// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  runTransaction,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  orderBy,
  deleteDoc,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
export { getDownloadURL };
export const createUserWithEmailPassword = (email, password) => {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};
export const updateUserProfile = (currentUser, profile) => {
  return updateProfile(currentUser, {
    ...profile,
  });
};
export const signInWithEmailPassword = (email, password) => {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
};
export const signOutFromFirebase = () => {
  const auth = getAuth();
  return auth.signOut();
};

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((error) =>
  console.log(`Firebase persistence error ${error.code}`)
);
export const usersCollection = collection(db, "users");
export const songsCollection = collection(db, "songs");
export const commentsCollection = collection(db, "comments");
export const analytics = getAnalytics(app);
export const addComment = (comment) => {
  console.log(comment);
  return addDoc(commentsCollection, {
    id: comment.uid,
    name: comment.name,
    content: comment.content,
    sid: comment.sid,
    datePosted: comment.datePosted,
  });
};
export const addUser = (user) => {
  console.log(user);
  return addDoc(usersCollection, {
    id: user.uid,
    name: user.name,
    email: user.email,
    age: user.age,
    country: user.country,
  });
};
export const addSong = (song) => {
  console.log(song);
  return addDoc(songsCollection, {
    id: song.uid,
    display_name: song.display_name,
    original_name: song.original_name,
    modified_name: song.modified_name,
    genre: song.genre,
    url: song.url,
    comment_count: song.comment_count,
  });
};
export const getSong = async (docID) => {
  const docRef = doc(db, "songs", docID);
  const docSnap = await getDoc(docRef);
  return docSnap;
};

export const deleteSong = async (song) => {
  console.log(song);
  return await deleteDoc(doc(db, "songs", song.docID));
};
export const storage = getStorage(app);
export const songsRef = ref(storage, "songs");

export const getUserSongs = async ({
  user = auth.currentUser,
  sortBy,
  maxPerPage,
  lastDoc,
} = {}) => {
  console.log(user, "--");
  const querySnapshot = await getDocs(
    user
      ? query(
          ...[
            collection(db, "songs"),
            where("id", "==", user.uid),
            sortBy && orderBy(sortBy),
            lastDoc && startAfter(lastDoc),
            maxPerPage && limit(maxPerPage),
          ].filter((t) => !!t)
        )
      : query(
          ...[
            collection(db, "songs"),
            sortBy && orderBy(sortBy),
            lastDoc && startAfter(lastDoc),
            maxPerPage && limit(maxPerPage),
          ].filter((t) => !!t)
        )
  );
  return querySnapshot;
};
export const getSongComments = async ({ sid }) => {
  const querySnapshot = await getDocs(
    query(collection(db, "comments"), where("sid", "==", sid))
  );
  return querySnapshot;
};

export const updateSong = async (song) => {
  const songsDocRef = doc(db, "songs", song.docID);
  return await runTransaction(db, async (transaction) => {
    const sfDoc = await transaction.get(songsDocRef);
    if (!sfDoc.exists()) {
      throw "Document does not exist!";
    }

    transaction.update(songsDocRef, { ...song });
  });
};

export const uploadSong = async ({
  name,
  file,
  metadata = { contentType: "audio/mpeg" },
}) => {
  const songRef = ref(songsRef, name);
  const uploadTask = await uploadBytesResumable(songRef, file, metadata);
  return uploadTask;
};

export const auth = getAuth();
export default app;
