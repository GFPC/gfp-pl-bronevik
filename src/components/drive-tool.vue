<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import { ArrowLeft, Play, Plus, Edit, Trash2, Car, MapPin } from 'lucide-vue-next'

defineProps<{ currentConfig: string, onBack: () => void }>()

interface Vehicle {
  id: string
  model: string
  license_plate: string
  status: 'active' | 'maintenance' | 'inactive'
  driver_id: string
  location: string
  fuel_level: number
}

const mockVehicles: Vehicle[] = [
  {
    id: 'v001',
    model: 'Toyota Camry',
    license_plate: 'А123БВ77',
    status: 'active',
    driver_id: 'd001',
    location: 'Москва, Красная площадь',
    fuel_level: 85,
  },
  {
    id: 'v002',
    model: 'Mercedes E-Class',
    license_plate: 'В456ГД77',
    status: 'maintenance',
    driver_id: 'd002',
    location: 'Москва, Автосервис №1',
    fuel_level: 45,
  },
  {
    id: 'v003',
    model: 'BMW 5 Series',
    license_plate: 'Г789ЕЖ77',
    status: 'active',
    driver_id: 'd003',
    location: 'Москва, Шереметьево',
    fuel_level: 92,
  },
]

const vehicles = ref<Vehicle[]>([...mockVehicles])
const selectedVehicle = ref<Vehicle | null>(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const isLoading = ref(false)
const jsonResponse = ref('')

const newVehicle = ref({
  model: '',
  license_plate: '',
  driver_id: '',
  location: '',
})

const filteredVehicles = computed(() => {
  return vehicles.value.filter((vehicle) => {
    const matchesSearch =
      vehicle.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      vehicle.driver_id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || vehicle.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const handleVehicleSearch = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const response = {
    success: true,
    vehicles: filteredVehicles.value,
    total: filteredVehicles.value.length,
    timestamp: new Date().toISOString(),
  }
  jsonResponse.value = JSON.stringify(response, null, 2)
  isLoading.value = false
}

const handleAddVehicle = async () => {
  if (!newVehicle.value.model || !newVehicle.value.license_plate) return
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const vehicle: Vehicle = {
    id: `v${String(vehicles.value.length + 1).padStart(3, '0')}`,
    model: newVehicle.value.model,
    license_plate: newVehicle.value.license_plate,
    status: 'active',
    driver_id: newVehicle.value.driver_id || 'unassigned',
    location: newVehicle.value.location || 'Не указано',
    fuel_level: 100,
  }
  vehicles.value = [...vehicles.value, vehicle]
  newVehicle.value = { model: '', license_plate: '', driver_id: '', location: '' }
  isLoading.value = false
}

const handleDeleteVehicle = (vehicleId: string) => {
  vehicles.value = vehicles.value.filter((v) => v.id !== vehicleId)
  if (selectedVehicle.value?.id === vehicleId) {
    selectedVehicle.value = null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Активен'
    case 'maintenance':
      return 'Обслуживание'
    case 'inactive':
      return 'Неактивен'
    default:
      return status
  }
}
</script>

<template lang="pug">
div(class="space-y-4 sm:space-y-6 px-2 sm:px-0")
  // Mobile-First Header
  .flex(class="flex-col sm:flex-row sm:items-center gap-2 sm:gap-4")
    Button(variant="outline" @click="onBack" class="w-fit bg-transparent")
      ArrowLeft(class="mr-2 h-4 w-4")
      | Назад к Tools
    div
      h2(class="text-xl sm:text-2xl font-bold") Drive Tool
      p(class="text-gray-600 text-sm sm:text-base") Управление транспортом для: {{ currentConfig }}
  div(class="space-y-6 sm:space-y-8")
    // Search Vehicles Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          Truck(class="h-4 w-4 sm:h-5 sm:w-5")
          | Поиск транспорта
      CardContent
        .grid(class="grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6")
          // Left Side - Search Form
          div(class="space-y-3 sm:space-y-4")
            div
              Label(class="text-sm sm:text-base") Поиск
              Input(v-model="searchQuery" placeholder="Модель, номер или ID водителя" class="h-10 sm:h-11 text-sm sm:text-base")
            div
              Label(class="text-sm sm:text-base") Статус
              Select(v-model="filterStatus")
                SelectTrigger(class="h-10 sm:h-11")
                  SelectValue()
                SelectContent
                  SelectItem(value="all") Все
                  SelectItem(value="active") Активен
                  SelectItem(value="maintenance") Обслуживание
                  SelectItem(value="inactive") Неактивен
            Button(@click="handleVehicleSearch" :disabled="isLoading" class="w-full h-10 sm:h-11")
              Play(class="mr-2 h-4 w-4")
              | {{ isLoading ? 'Поиск...' : 'Найти' }}
            div(class="mt-4 sm:mt-6")
              Label(class="text-sm sm:text-base font-medium") Результаты поиска:
              ScrollArea(class="h-48 sm:h-60 mt-2 border rounded-md")
                div(class="p-2 space-y-2")
                  template(v-for="vehicle in filteredVehicles" :key="vehicle.id")
                    div(@click="selectedVehicle = vehicle" :class="['p-2 sm:p-3 rounded cursor-pointer transition-colors border touch-manipulation', selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent hover:border-gray-300 active:bg-gray-100']")
                      .flex(class="items-center justify-between")
                        div
                          div(class="font-medium text-sm sm:text-base") {{ vehicle.model }}
                          div(class="text-xs sm:text-sm text-gray-600") {{ vehicle.license_plate }}
                        Badge(:class="getStatusColor(vehicle.status) + ' text-xs'") {{ getStatusText(vehicle.status) }}
                      div(class="text-xs text-gray-500 mt-1") Водитель: {{ vehicle.driver_id }} • Топливо: {{ vehicle.fuel_level }}%
          // Right Side - JSON Response
          div
            Label(class="text-sm sm:text-base font-medium") API Ответ:
            div(class="mt-2")
              Textarea(:model-value="jsonResponse" readonly placeholder="Результат API запроса..." class="h-60 sm:h-80 font-mono text-xs sm:text-sm resize-none")
    Separator
    // Vehicle Details Section
    selectedVehicle &&
      Card
        CardHeader(class="pb-3 sm:pb-6")
          CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
            PencilSquare(class="h-4 w-4 sm:h-5 sm:w-5")
            | Детали транспорта
        CardContent
          .grid(class="grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6")
            div(class="space-y-3 sm:space-y-4")
              div
                Label(class="text-sm sm:text-base") ID транспорта
                Input(:model-value="selectedVehicle.id" readonly class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Модель
                Input(:model-value="selectedVehicle.model" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Номерной знак
                Input(:model-value="selectedVehicle.license_plate" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Статус
                Select(:model-value="selectedVehicle.status")
                  SelectTrigger(class="h-10 sm:h-11")
                    SelectValue()
                  SelectContent
                    SelectItem(value="active") Активен
                    SelectItem(value="maintenance") Обслуживание
                    SelectItem(value="inactive") Неактивен
            div(class="space-y-3 sm:space-y-4")
              div
                Label(class="text-sm sm:text-base") ID водителя
                Input(:model-value="selectedVehicle.driver_id" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Местоположение
                Input(:model-value="selectedVehicle.location" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Уровень топлива (%)
                Input(type="number" :model-value="selectedVehicle.fuel_level" min="0" max="100" class="h-10 sm:h-11 text-sm sm:text-base")
              div(class="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4")
                Button(class="flex-1 h-10 sm:h-11") Сохранить изменения
                Button(variant="destructive" @click="() => handleDeleteVehicle(selectedVehicle.id)" class="h-10 sm:h-11")
                  Trash(class="h-4 w-4")
    Separator
    // Add Vehicle Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          Plus(class="h-4 w-4 sm:h-5 sm:w-5")
          | Добавить транспорт
      CardContent
        .grid(class="grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4")
          div
            Label(class="text-sm sm:text-base") Модель *
            Input(v-model="newVehicle.model" placeholder="Toyota Camry" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Номерной знак *
            Input(v-model="newVehicle.license_plate" placeholder="А123БВ77" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") ID водителя
            Input(v-model="newVehicle.driver_id" placeholder="d001" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Местоположение
            Input(v-model="newVehicle.location" placeholder="Москва, Красная площадь" class="h-10 sm:h-11 text-sm sm:text-base")
        Button(@click="handleAddVehicle" :disabled="isLoading || !newVehicle.model || !newVehicle.license_plate" class="w-full mt-3 sm:mt-4 h-10 sm:h-11")
          Plus(class="mr-2 h-4 w-4")
          | {{ isLoading ? 'Добавление...' : 'Добавить транспорт' }}
    // Statistics Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          MapPin(class="h-4 w-4 sm:h-5 sm:w-5")
          | Статистика транспорта
      CardContent
        .grid(class="grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4")
          div(class="text-center p-3 sm:p-4 bg-green-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-green-600") {{ vehicles.filter(v => v.status === 'active').length }}
            div(class="text-xs sm:text-sm text-green-700") Активных
          div(class="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-yellow-600") {{ vehicles.filter(v => v.status === 'maintenance').length }}
            div(class="text-xs sm:text-sm text-yellow-700") На обслуживании
          div(class="text-center p-3 sm:p-4 bg-red-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-red-600") {{ vehicles.filter(v => v.status === 'inactive').length }}
            div(class="text-xs sm:text-sm text-red-700") Неактивных
          div(class="text-center p-3 sm:p-4 bg-blue-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-blue-600") {{ Math.round(vehicles.reduce((acc, v) => acc + v.fuel_level, 0) / vehicles.length) }}%
            div(class="text-xs sm:text-sm text-blue-700") Средний уровень топлива
</template> 