<script setup lang="ts">
import './assets/main.css'
import './assets/output.css'
import Header from "@/components/Header.vue";
</script>

<template lang="pug">
div.min-h-screen.w-full
  router-view
</template>
<script lang="ts">
import {useAuthStore} from "@/stores/auth.js";

export default {
  name: "App",
  data() {
    return {
      authStore: useAuthStore()
    }
  },
  async mounted() {
    await this.authStore.init()
  }
}
</script>
<style>

</style>
