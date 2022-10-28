<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="uploader" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div
          class="bg-white rounded border border-gray-200 relative flex flex-col"
        >
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">My Songs</span>
            <i
              class="fa fa-compact-disc float-right text-green-400 text-2xl"
            ></i>
          </div>
          <div class="p-6">
            <!-- Composition Items -->
            <composition-item
              v-for="(song, i) in songs"
              :key="song.docID"
              :song="song"
              :index="i"
              :updateSong="updateSong"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
import Upload from "../components/Upload/Upload.vue";
import { getUserSongs } from "@/plugins/firebase";
import CompositionItem from "../components/compositionItem/compositionItem.vue";

export default {
  name: "manage-music",
  // beforeRouteEnter(to, from, next) {
  //   const store = useUserStore();
  //   console.log("------");
  //   if (store.userLoggedIn) {
  //     next();
  //   } else {
  //     next({ name: "home" });
  //   }
  // },
  data() {
    return { songs: [], unsavedFlag: false };
  },
  components: { AppUpload: Upload, CompositionItem },
  // beforeRouteLeave(to, from, next) {
  //   this.$refs.uploader.cancelUploads();
  //   next();
  // },
  async created() {
    const snapshot = await getUserSongs();
    console.log(snapshot);
    snapshot.forEach((document) => this.addSong(document));
  },
  methods: {
    updateSong(i, values) {
      this.songs[i].modified_name = values.modified_name;
      this.songs[i].genre = values.genre;
    },
    removeSong(i) {
      this.songs.splice(i, 1);
    },
    addSong(document) {
      const song = {
        ...(typeof document.data === "function" ? document.data() : document),
        docID: document.id,
      };
      console.log(song);
      this.songs.push(song);
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },
  },
  beforeRouteLeave(to, from, next) {
    let flag = true;
    if (!this.unsavedFlag) {
      flag = true;
    } else {
      flag = confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
    }
    next(flag);
  },
};
</script>
