<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!showForm">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button
        @click="deleteSong"
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
      >
        <i class="fa fa-times"></i>
      </button>
      <button
        @click.prevent="showForm = true"
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div v-show="showForm">
      <div
        v-if="show_alert"
        class="text-white text-center font-bold p-4 mb-4"
        :class="alert_variant"
      >
        {{ alert_message }}
      </div>
      <vee-form
        @submit="edit"
        :validation-schema="schema"
        :initial-values="song"
      >
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            name="modified_name"
            type="text"
            @input="updateUnsavedFlag(true)"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
          />
          <error-message
            name="modified_name"
            class="text-red-600"
          ></error-message>
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            name="genre"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
          />
          <error-message name="genre" class="text-red-600"></error-message>
        </div>
        <button
          type="submit"
          class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="in_submission"
        >
          Submit
        </button>
        <button
          type="button"
          @click.prevent="showForm = false"
          class="py-1.5 px-3 rounded text-white bg-gray-600"
          :disabled="in_submission"
        >
          Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>
<script>
import { updateSong, deleteSong } from "../../plugins/firebase";
export default {
  name: "CompositionItem",
  props: {
    song: {
      type: Object,
      required: true,
    },
    updateSong: {
      type: Function,
      required: true,
    },
    removeSong: {
      type: Function,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
    },
  },
  data() {
    return {
      showForm: false,
      schema: {
        modified_name: "required",
        genre: "alpha_spaces",
      },
      in_submission: false,
      show_alert: false,
      alert_variant: "bg-blue-500",
      alert_message: "please wait!Updating song info.",
    };
  },
  methods: {
    async edit(values) {
      this.in_submission = true;
      this.show_alert = true;
      this.alert_variant = "bg-blue-500";
      this.alert_message = "please wait!Updating song info.";
      try {
        await updateSong(values);
      } catch (error) {
        this.in_submission = false;
        this.show_alert = true;
        this.alert_variant = "bg-red-500";
        this.alert_message = "something went wrong! try again later.";
        return;
      }
      this.updateSong(this.index, values);
      this.updateUnsavedFlag(false);
      this.in_submission = false;
      this.show_alert = true;
      this.alert_variant = "bg-green-500";
      this.alert_message = "Success!";
    },
    async deleteSong() {
      this.show_alert = true;
      this.alert_variant = "bg-blue-500";
      this.alert_message = "please wait!Deleting song info.";
      try {
        await deleteSong(this.song);
      } catch (error) {
        this.show_alert = true;
        this.alert_variant = "bg-red-500";
        this.alert_message = "something went wrong! try again later.";
        return;
      }
      this.removeSong(this.index);

      this.show_alert = true;
      this.alert_variant = "bg-green-500";
      this.alert_message = "Success!";
    },
  },
};
</script>
