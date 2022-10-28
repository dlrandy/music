<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }"
        @drag.prevent.stop=""
        @dragstart.prevent.stop=""
        @dragend.prevent.stop="is_dragover = false"
        @dragover.prevent.stop="is_dragover = true"
        @dragenter.prevent.stop="is_dragover = true"
        @dragleave.prevent.stop="is_dragover = false"
        @drop.prevent.stop="upload($event)"
      >
        <h5>Drop your files here</h5>
      </div>
      <input type="file" multiple @change="upload($event)" />
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm" :class="upload.text_class">
          <i :class="upload.icon"></i>{{ upload.name }}
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar bg-blue-400"
            :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { addSong, auth, uploadSong, getDownloadURL } from "@/plugins/firebase";
export default {
  name: "upload-component",
  props: ["addSong"],
  data() {
    return { is_dragover: false, uploads: [] };
  },
  methods: {
    async upload($event) {
      this.is_dragover = false;
      console.log($event, $event.dataTransfer.files);
      const files = $event.dataTransfer
        ? [...$event.dataTransfer.files]
        : [...$event.target.files];
      files.forEach(async (file) => {
        if (file.type !== "audio/mpeg") {
          return;
        }
        if (!navigator.onLine) {
          this.uploads.push({
            task: {},
            current_progress: 100,
            name: file.name,
            icon: "fas fa-times",
            text_class: "text-red-400",
            variant: "bg-red-400",
          });
          return;
        }
        const uploadTask = await uploadSong({
          name: file.name,
          file,
          metadata: { contentType: "audio/mpeg" },
        });

        const taskIndex =
          this.uploads.push({
            task: uploadTask.task,
            current_progress: 0,
            name: file.name,
            variant: "bg-blue-400",
            icon: "fas fa-spinner fa-spin",
            text_class: "",
          }) - 1;

        uploadTask.task.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploads[taskIndex].current_progress = progress;
          },
          (error) => {
            this.uploads[taskIndex].variant = "bg-red-400";
            this.uploads[taskIndex].icon = "fas fa-times";
            this.uploads[taskIndex].text_class = "text-red-400";
            console.log(error);
          },
          async () => {
            console.log(uploadTask.ref, "uploadTask.ref");
            const song = {
              uid: auth.currentUser.uid,
              display_name: auth.currentUser.displayName,
              original_name: uploadTask.ref.name,
              modified_name: uploadTask.ref.name,
              genre: "",
              comment_count: 0,
            };
            song.url = await getDownloadURL(uploadTask.ref);
            await addSong(song);
            this.addSong(song);
            // Upload completed successfully, now we can get the download URL
            this.uploads[taskIndex].variant = "bg-green-400";
            this.uploads[taskIndex].icon = "fas fa-check";
            this.uploads[taskIndex].text_class = "text-green-400";
          }
        );
      });
    },
    cancelUploads() {
      this.uploads.forEach((upload) => {
        upload.task.cancel();
      });
    },
  },
  beforeUnmount() {
    this.cancelUploads();
  },
};
</script>
