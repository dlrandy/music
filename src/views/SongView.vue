<template>
  <!-- Music Header -->
  <section class="w-full mb-8 py-14 text-center text-white relative">
    <div
      class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
      style="background-image: url(/assets/img/song-header.png)"
    ></div>
    <div class="container mx-auto flex items-center">
      <!-- Play/Pause Button -->
      <button
        @click.prevent="newSong(song)"
        type="button"
        class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
      >
        <i class="fas fa-play"></i>
      </button>
      <div class="z-50 text-left ml-8">
        <!-- Song Info -->
        <div class="text-3xl font-bold">{{ song.modified_name }}</div>
        <div>{{ song.genre }}</div>
        <div class="song-price">{{ $n(1, "currency") }}</div>
      </div>
    </div>
  </section>
  <!-- Form -->
  <section class="container mx-auto mt-6">
    <div class="bg-white rounded border border-gray-200 relative flex flex-col">
      <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
        <!-- Comment Count -->
        <span class="card-title">{{
          $tc("song.comment_count", song.comment_count, {
            count: song.comment_count,
          })
        }}</span>
        <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
      </div>
      <div class="p-6">
        <div
          v-if="comment_show_alert"
          class="text-white text-center font-bold p-4 mb-4"
          :class="comment_alert_variant"
        >
          {{ comment_alert_message }}
        </div>
        <vee-form
          v-if="userLoggedIn"
          :validation-schema="schema"
          @submit="addComment"
        >
          <vee-field
            as="textarea"
            name="comment"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
            placeholder="Your comment here..."
          ></vee-field>
          <ErrorMessage class="text-red-600" name="comment" />
          <button
            type="submit"
            class="py-1.5 px-3 rounded text-white bg-green-600 block"
            :disabled="comment_in_submission"
          >
            Submit
          </button>
        </vee-form>
        <!-- Sort Comments -->
        <select
          v-model="sort"
          class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        >
          <option value="1">Latest</option>
          <option value="2">Oldest</option>
        </select>
      </div>
    </div>
  </section>
  <!-- Comments -->
  <ul class="container mx-auto" id="comments">
    <li
      v-for="comment in sortedComments"
      :key="comment.docID"
      class="p-6 bg-gray-50 border border-gray-200"
    >
      <!-- Comment Author -->
      <div class="mb-5">
        <div class="font-bold">{{ comment.name }}</div>
        <time>{{ comment.datePosted }}</time>
      </div>

      <p>
        {{ comment.content }}
      </p>
    </li>
  </ul>
</template>
<script>
import {
  getSong,
  updateSong,
  auth,
  addComment,
  getSongComments,
} from "@/plugins/firebase";
import { mapState, mapActions } from "pinia";
import useUserStore from "@/stores/user";
import usePlayerStore from "@/stores/player";
export default {
  name: "Song_View",
  data() {
    return {
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_varaiant: "bg-blue-500",
      comment_alert_message: "Please wait!Your comment is being submitted.",
      song: {},
      schema: { comment: "required|min:3" },
      comments: [],
      sort: "1",
    };
  },
  computed: {
    ...mapState(useUserStore, ["userLoggedIn"]),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === "1") {
          return new Date(b.datePosted) - new Date(a.datePosted);
        }
        return new Date(a.datePosted) - new Date(b.datePosted);
      });
    },
  },
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await getSong(to.params.id);
    next((vm) => {
      if (!docSnapshot.exists) {
        return vm.$router.push({ name: "Home" });
      }
      const { sort } = vm.$route.query;
      vm.sort = sort === "1" || sort === "2" ? sort : "1";
      vm.song = docSnapshot.data();
      vm.getComments();
    });
  },
  // async created() {
  //   const docSnapshot = await getSong(this.$route.params.id);
  //   if (!docSnapshot.exists) {
  //     return this.$router.push({ name: "Home" });
  //   }
  //   const { sort } = this.$route.query;
  //   this.sort = sort === "1" || sort === "2" ? sort : "1";
  //   this.song = docSnapshot.data();
  //   this.getComments();
  // },
  methods: {
    ...mapActions(usePlayerStore, ["newSong"]),
    async addComment(values, context) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.comment_alert_variant = "bg-blue-500";
      this.comment_alert_message =
        "Please wait!Your comment is being submitted.";

      const comment = {
        content: values.comment,
        dataPosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
        datePosted: new Date().toString(),
      };
      try {
        await addComment(comment);
        this.song.comment_count += 1;
        console.log(this.song);
        await updateSong({ ...this.song, docID: this.$route.params.id });
        this.comment_in_submission = false;
        this.comment_show_alert = true;
        this.comment_alert_variant = "bg-green-500";
        this.comment_alert_message = "Comment added.";
        context.resetForm();
        this.getComments();
      } catch (error) {
        console.error(error);
        this.comment_in_submission = false;
      }
    },
    async getComments() {
      const snapshots = await getSongComments({ sid: this.$route.params.id });
      this.comments = [];
      snapshots.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    },
  },
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
};
</script>
