<template lang="pug">
header.shadow.px-6.py-4.flex.justify-between.items-center.bg-background.text-foreground(:class="'dark:bg-[hsl(var(--background))] dark:text-[hsl(var(--foreground))]'")
  h1.text-xl.font-bold Админ-панель Bronevik

  div.relative.flex.items-center
    button(
      v-if="!showConfigPanel"
      @click="handleClick"
      class="ml-auto mr-4 text-gray-600 hover:text-primary flex items-center"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    )
      Server.h-6.w-6
    span(
      v-if="showTooltip"
      class="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-1 rounded bg-black text-white text-xs shadow z-50 whitespace-nowrap"
    ) Unwrap API CONFIGURATION
    // Theme toggle
    button(@click="toggleTheme" :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'" class="ml-4 p-2 rounded-full border border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center")
      span(v-if="isDark")
        svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-yellow-400")
          path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.05l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z")
      span(v-else)
        svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-gray-700 dark:text-gray-200")
          path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z")
</template>

<script lang="ts">
import { RefreshCw, Server, Globe, BadgeCheck, TriangleAlert } from "lucide-vue-next"
export default {
  name: "Header",
  props: {
    showConfigPanel: Boolean
  },
  components: {
    Server
  },
  data() {
    return {
      showTooltip: false,
      isDark: false
    }
  },
  mounted() {
    // Инициализация темы при загрузке
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      this.isDark = true
      document.documentElement.classList.add('dark')
    } else {
      this.isDark = false
      document.documentElement.classList.remove('dark')
    }
  },
  methods: {
    handleClick() {
      this.$emit('update:showConfigPanel', true)
      this.showTooltip = false
    },
    toggleTheme() {
      this.isDark = !this.isDark
      if (this.isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }
  // убираем data, всё через prop и $emit
}
</script>

<style scoped>
/* Удалить transition для body/html, если есть, чтобы тема менялась мгновенно */
</style>