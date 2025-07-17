<template lang="pug">
div.min-h-screen.w-full
  router-view
</template>
<script lang="ts">
import './assets/main.css'
import './assets/output.css'
import {useAuthStore} from "@/stores/auth.js";

export default {
  name: "App",
  data() {
    return {
      authStore: useAuthStore()
    }
  },
  mounted() {
    this.authStore.init()
  }
}
</script>
<style>

</style>
