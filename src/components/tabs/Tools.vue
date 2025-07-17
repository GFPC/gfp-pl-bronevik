<template lang="pug">
//- Main wrapper
div(class="space-y-4 sm:space-y-6 px-2 sm:px-0")
  .text-center(class="px-2" v-if="!currentTool")
    h2(class="text-2xl sm:text-3xl font-bold mb-2") Инструменты
    p(class="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto")
      | Административные и сервисные инструменты для работы с API

  //- Main Tools Grid
  .grid(class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto" v-if="!currentTool")
    Card(class="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-gray-300 active:scale-95 touch-manipulation" v-for="tool in toolsData" :key="tool.id" @click="setCurrentTool(tool.id)")
      CardHeader(class="text-center pb-3 sm:pb-4")
        div(:class="tool.color + ' w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300'")
          component(:is="tool.icon" class="h-6 w-6 sm:h-8 sm:w-8 text-white")
        CardTitle(class="text-lg sm:text-xl font-bold") {{ tool.name }}
      CardContent(class="text-center pt-0")
        CardDescription(class="mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed") {{ tool.description }}
        Button(class="w-full group-hover:bg-gray-900 transition-colors duration-300 h-9 sm:h-10 text-sm sm:text-base")
          | Перейти
          ArrowRight(class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300")

  //- Tool components
  UserTool(v-if="currentTool === 'user'" :currentConfig="currentConfig?.id" @back="setCurrentTool(null)")
  DriveTool(v-if="currentTool === 'drive'" :currentConfig="currentConfig?.id" @back="setCurrentTool(null)")
  TripTool(v-if="currentTool === 'trip'" :currentConfig="currentConfig?.id" @back="setCurrentTool(null)")

  //- Legacy Tools Section
  div(class="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200")
    h3(class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-gray-700") Дополнительные инструменты
    .grid(class="grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto")
      Card(class="hover:shadow-md transition-shadow duration-300")
        CardHeader(class="pb-2 sm:pb-3")
          CardTitle(class="flex items-center gap-2 text-base sm:text-lg")
            TestTube(class="h-4 w-4 sm:h-5 sm:w-5")
            | API Тестирование
        CardContent(class="pt-0")
          p(class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3") Тестирование API эндпоинтов
          Button(variant="outline" size="sm" class="w-full bg-transparent h-8 sm:h-9 text-xs sm:text-sm") Открыть
      Card(class="hover:shadow-md transition-shadow duration-300")
        CardHeader(class="pb-2 sm:pb-3")
          CardTitle(class="flex items-center gap-2 text-base sm:text-lg")
            Database(class="h-4 w-4 sm:h-5 sm:w-5")
            | SQL Консоль
        CardContent(class="pt-0")
          p(class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3") Выполнение SQL запросов
          Button(variant="outline" size="sm" class="w-full bg-transparent h-8 sm:h-9 text-xs sm:text-sm") Открыть
      Card(class="hover:shadow-md transition-shadow duration-300")
        CardHeader(class="pb-2 sm:pb-3")
          CardTitle(class="flex items-center gap-2 text-base sm:text-lg")
            Upload(class="h-4 w-4 sm:h-5 sm:w-5")
            | Импорт данных
        CardContent(class="pt-0")
          p(class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3") Загрузка данных из файлов
          Button(variant="outline" size="sm" class="w-full bg-transparent h-8 sm:h-9 text-xs sm:text-sm") Открыть
      Card(class="hover:shadow-md transition-shadow duration-300")
        CardHeader(class="pb-2 sm:pb-3")
          CardTitle(class="flex items-center gap-2 text-base sm:text-lg")
            Download(class="h-4 w-4 sm:h-5 sm:w-5")
            | Экспорт данных
        CardContent(class="pt-0")
          p(class="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3") Выгрузка данных в файлы
          Button(variant="outline" size="sm" class="w-full bg-transparent h-8 sm:h-9 text-xs sm:text-sm") Открыть
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, User, Car, MapPin, Database, TestTube, Upload, Download } from 'lucide-vue-next'
import UserTool from '@/components/user-tool.vue'
import DriveTool from '@/components/drive-tool.vue'
import TripTool from '@/components/trip-tool.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const currentConfig = computed(() => authStore.currentConfig)

const toolsData = [
  {
    id: 'user',
    name: 'User',
    description: 'Управление пользователями: поиск, редактирование, настройка refCode',
    icon: User,
    color: 'bg-blue-500',
  },
  {
    id: 'drive',
    name: 'Drive',
    description: 'Управление транспортом: добавление, редактирование, мониторинг',
    icon: Car,
    color: 'bg-green-500',
  },
  {
    id: 'trip',
    name: 'Trip',
    description: 'Управление поездками: создание, отслеживание, аналитика',
    icon: MapPin,
    color: 'bg-purple-500',
  },
]

const currentTool = ref<string | null>(null)
const setCurrentTool = (id: string | null) => {
  currentTool.value = id
}
</script>

<style scoped>

</style>