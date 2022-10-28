<template>
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link
        exact-active-class="no-active"
        class="text-white font-bold uppercase text-2xl mr-4"
        :to="{ name: 'home' }"
        >Music</router-link
      >

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link class="px-2 text-white" to="/about">About</router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal"
              >Login / Register</a
            >
          </li>
          <template v-else>
            <li>
              <router-link class="px-2 text-white" :to="{ name: 'manage' }"
                >Manage</router-link
              >
            </li>
            <li>
              <a class="px-2 text-white" href="#" @click.prevent="signOut"
                >Logout</a
              >
            </li>
          </template>
        </ul>
        <ul class="ml-auto">
          <li>
            <a @click.prevent="changeLocale" class="px-2 text-white" href="#">
              {{ currentLocale }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>
<script>
import { mapActions, mapStores, mapState, mapWritableState } from "pinia";
import useModalStore from "@/stores/modal";
import useUserStore from "@/stores/user";
export default {
  name: "AppHeader",
  computed: {
    ...mapStores(useModalStore, useUserStore), // 带/不带的区别是什么
    ...mapWritableState(useModalStore, ["isOpen"]),
    ...mapState(useUserStore, ["userLoggedIn"]),
    currentLocale() {
      return this.$i18n.locale === "zh" ? "中文" : "English";
    },
  },
  methods: {
    changeLocale() {
      this.$i18n.locale = this.$i18n.locale === "zh" ? "en" : "zh";
    },
    // ...mapActions(useUserStore, ["signOut"]),
    toggleAuthModal() {
      // this.modalStore.isOpen = !this.modalStore.isOpen;
      this.isOpen = !this.isOpen;
      console.log(this.isOpen, "-----");
    },
    signOut() {
      console.log(this.$route);
      this.userStore.signOut();
      //["manage"].includes(this.$route.name)
      if (this.$route.meta.requiresAuth) {
        this.$router.push({ name: "home" });
      }
    },
  },
};
</script>
