import { defineStore } from "pinia";
import {
  addUser,
  createUserWithEmailPassword,
  updateUserProfile,
  signInWithEmailPassword,
  signOutFromFirebase,
} from "@/plugins/firebase";
export default defineStore("user", {
  state: () => ({
    userLoggedIn: false,
  }),
  actions: {
    async register(values) {
      const userCred = await createUserWithEmailPassword(
        values.email,
        values.password
      );
      console.log(userCred);
      await addUser({ ...values, uid: userCred.user.uid });
      await updateUserProfile(userCred.user, {
        displayName: values.name,
      });
      this.userLoggedIn = true;
      return userCred;
    },
    async authenticate(values) {
      await signInWithEmailPassword(values.email, values.password);
      this.userLoggedIn = true;
    },
    async signOut() {
      await signOutFromFirebase();
      this.userLoggedIn = false;
    },
  },
});
