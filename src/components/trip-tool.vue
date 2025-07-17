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
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import { ArrowLeft, Play, Plus, MapPin, Clock, CalendarIcon, Route } from 'lucide-vue-next'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

defineProps<{ currentConfig: string, onBack: () => void }>()

interface Trip {
  id: string
  user_id: string
  driver_id: string
  vehicle_id: string
  from_address: string
  to_address: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  started_at?: string
  completed_at?: string
  price: number
  distance: number
}

const mockTrips: Trip[] = [
  {
    id: 't001',
    user_id: 'u001',
    driver_id: 'd001',
    vehicle_id: 'v001',
    from_address: 'Москва, Красная площадь',
    to_address: 'Москва, Шереметьево',
    status: 'completed',
    created_at: '2024-01-15T10:30:00Z',
    started_at: '2024-01-15T10:35:00Z',
    completed_at: '2024-01-15T11:45:00Z',
    price: 1500,
    distance: 35.2,
  },
  {
    id: 't002',
    user_id: 'u002',
    driver_id: 'd002',
    vehicle_id: 'v002',
    from_address: 'Москва, Ленинский проспект',
    to_address: 'Москва, Центральный вокзал',
    status: 'active',
    created_at: '2024-01-15T12:00:00Z',
    started_at: '2024-01-15T12:05:00Z',
    price: 800,
    distance: 12.5,
  },
  {
    id: 't003',
    user_id: 'u003',
    driver_id: 'd003',
    vehicle_id: 'v003',
    from_address: 'Москва, Арбат',
    to_address: 'Москва, Крокус Сити',
    status: 'pending',
    created_at: '2024-01-15T13:15:00Z',
    price: 1200,
    distance: 25.8,
  },
]

const trips = ref<Trip[]>([...mockTrips])
const selectedTrip = ref<Trip | null>(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const dateFrom = ref<Date | null>(null)
const dateTo = ref<Date | null>(null)
const isLoading = ref(false)
const jsonResponse = ref('')

const newTrip = ref({
  user_id: '',
  driver_id: '',
  vehicle_id: '',
  from_address: '',
  to_address: '',
  price: '',
})

const filteredTrips = computed(() => {
  return trips.value.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      trip.user_id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      trip.from_address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      trip.to_address.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || trip.status === filterStatus.value
    let matchesDate = true
    if (dateFrom.value || dateTo.value) {
      const tripDate = new Date(trip.created_at)
      if (dateFrom.value && tripDate < dateFrom.value) matchesDate = false
      if (dateTo.value && tripDate > dateTo.value) matchesDate = false
    }
    return matchesSearch && matchesStatus && matchesDate
  })
})

const handleTripSearch = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const response = {
    success: true,
    trips: filteredTrips.value,
    total: filteredTrips.value.length,
    filters: {
      query: searchQuery.value,
      status: filterStatus.value,
      date_from: dateFrom.value?.toISOString(),
      date_to: dateTo.value?.toISOString(),
    },
    timestamp: new Date().toISOString(),
  }
  jsonResponse.value = JSON.stringify(response, null, 2)
  isLoading.value = false
}

const handleCreateTrip = async () => {
  if (!newTrip.value.user_id || !newTrip.value.from_address || !newTrip.value.to_address) return
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const trip: Trip = {
    id: `t${String(trips.value.length + 1).padStart(3, '0')}`,
    user_id: newTrip.value.user_id,
    driver_id: newTrip.value.driver_id || 'unassigned',
    vehicle_id: newTrip.value.vehicle_id || 'unassigned',
    from_address: newTrip.value.from_address,
    to_address: newTrip.value.to_address,
    status: 'pending',
    created_at: new Date().toISOString(),
    price: Number.parseFloat(newTrip.value.price) || 0,
    distance: Math.random() * 50 + 5,
  }
  trips.value = [...trips.value, trip]
  newTrip.value = {
    user_id: '',
    driver_id: '',
    vehicle_id: '',
    from_address: '',
    to_address: '',
    price: '',
  }
  isLoading.value = false
}

const handleUpdateTripStatus = async (tripId: string, newStatus: string) => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  trips.value = trips.value.map((trip) => {
    if (trip.id === tripId) {
      const updatedTrip = { ...trip, status: newStatus as Trip['status'] }
      if (newStatus === 'active' && !trip.started_at) {
        updatedTrip.started_at = new Date().toISOString()
      }
      if (newStatus === 'completed' && !trip.completed_at) {
        updatedTrip.completed_at = new Date().toISOString()
      }
      return updatedTrip
    }
    return trip
  })
  if (selectedTrip.value?.id === tripId) {
    const updatedTrip = trips.value.find((t) => t.id === tripId)
    if (updatedTrip) selectedTrip.value = updatedTrip
  }
  isLoading.value = false
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Ожидает'
    case 'active':
      return 'В пути'
    case 'completed':
      return 'Завершена'
    case 'cancelled':
      return 'Отменена'
    default:
      return status
  }
}

const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru })
}
</script>

<template lang="pug">
div(class="space-y-4 sm:space-y-6 px-2 sm:px-0")
  .flex(class="flex-col sm:flex-row sm:items-center gap-2 sm:gap-4")
    Button(variant="outline" @click="onBack" class="w-fit bg-transparent")
      ArrowLeft(class="mr-2 h-4 w-4")
      | Назад к Tools
    div
      h2(class="text-xl sm:text-2xl font-bold") Trip Tool
      p(class="text-gray-600 text-sm sm:text-base") Управление поездками для: {{ currentConfig }}
  div(class="space-y-6 sm:space-y-8")
    // Search Trips Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          Route(class="h-4 w-4 sm:h-5 sm:w-5")
          | Поиск поездок
      CardContent
        .grid(class="grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6")
          div(class="space-y-3 sm:space-y-4")
            div
              Label(class="text-sm sm:text-base") Поиск
              Input(v-model="searchQuery" placeholder="ID поездки, пользователя или адрес" class="h-10 sm:h-11 text-sm sm:text-base")
            .grid(class="grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4")
              div
                Label(class="text-sm sm:text-base") Статус
                Select(v-model="filterStatus")
                  SelectTrigger(class="h-10 sm:h-11")
                    SelectValue()
                  SelectContent
                    SelectItem(value="all") Все
                    SelectItem(value="pending") Ожидает
                    SelectItem(value="active") В пути
                    SelectItem(value="completed") Завершена
                    SelectItem(value="cancelled") Отменена
              div
                Label(class="text-sm sm:text-base") Период
                .flex(class="gap-2")
                  Popover
                    PopoverTrigger(as-child)
                      Button(variant="outline" size="sm" class="flex-1 bg-transparent h-10 sm:h-11")
                        CalendarIcon(class="h-4 w-4")
                    PopoverContent(class="w-auto p-0")
                      Calendar(mode="single" v-model="dateFrom" initialFocus)
                  Popover
                    PopoverTrigger(as-child)
                      Button(variant="outline" size="sm" class="flex-1 bg-transparent h-10 sm:h-11")
                        CalendarIcon(class="h-4 w-4")
                    PopoverContent(class="w-auto p-0")
                      Calendar(mode="single" v-model="dateTo" initialFocus)
            Button(@click="handleTripSearch" :disabled="isLoading" class="w-full h-10 sm:h-11")
              Play(class="mr-2 h-4 w-4")
              | {{ isLoading ? 'Поиск...' : 'Найти поездки' }}
            div(class="mt-4 sm:mt-6")
              Label(class="text-sm sm:text-base font-medium") Результаты поиска:
              ScrollArea(class="h-48 sm:h-60 mt-2 border rounded-md")
                div(class="p-2 space-y-2")
                  template(v-for="trip in filteredTrips" :key="trip.id")
                    div(@click="selectedTrip = trip" :class="['p-2 sm:p-3 rounded cursor-pointer transition-colors border touch-manipulation', selectedTrip?.id === trip.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-transparent hover:border-gray-300 active:bg-gray-100']")
                      .flex(class="items-center justify-between")
                        div
                          div(class="font-medium text-sm sm:text-base") {{ trip.id }}
                          div(class="text-xs sm:text-sm text-gray-600") {{ trip.from_address }} → {{ trip.to_address }}
                        Badge(:class="getStatusColor(trip.status) + ' text-xs'") {{ getStatusText(trip.status) }}
                      div(class="text-xs text-gray-500 mt-1") {{ formatDateTime(trip.created_at) }} • {{ trip.price }}₽ • {{ trip.distance.toFixed(1) }}км
          div
            Label(class="text-sm sm:text-base font-medium") API Ответ:
            div(class="mt-2")
              Textarea(:model-value="jsonResponse" readonly placeholder="Результат API запроса..." class="h-60 sm:h-80 font-mono text-xs sm:text-sm resize-none")
    Separator
    selectedTrip &&
      Card
        CardHeader(class="pb-3 sm:pb-6")
          CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
            MapPin(class="h-4 w-4 sm:h-5 sm:w-5")
            | Детали поездки
        CardContent
          .grid(class="grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6")
            div(class="space-y-3 sm:space-y-4")
              div
                Label(class="text-sm sm:text-base") ID поездки
                Input(:model-value="selectedTrip.id" readonly class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") ID пользователя
                Input(:model-value="selectedTrip.user_id" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") ID водителя
                Input(:model-value="selectedTrip.driver_id" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") ID транспорта
                Input(:model-value="selectedTrip.vehicle_id" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Откуда
                Input(:model-value="selectedTrip.from_address" class="h-10 sm:h-11 text-sm sm:text-base")
            div(class="space-y-3 sm:space-y-4")
              div
                Label(class="text-sm sm:text-base") Куда
                Input(:model-value="selectedTrip.to_address" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Статус
                Select(:model-value="selectedTrip.status" @update:model-value="val => handleUpdateTripStatus(selectedTrip.id, val)")
                  SelectTrigger(class="h-10 sm:h-11")
                    SelectValue()
                  SelectContent
                    SelectItem(value="pending") Ожидает
                    SelectItem(value="active") В пути
                    SelectItem(value="completed") Завершена
                    SelectItem(value="cancelled") Отменена
              div
                Label(class="text-sm sm:text-base") Цена (₽)
                Input(type="number" :model-value="selectedTrip.price" class="h-10 sm:h-11 text-sm sm:text-base")
              div
                Label(class="text-sm sm:text-base") Расстояние (км)
                Input(type="number" :model-value="selectedTrip.distance" step="0.1" class="h-10 sm:h-11 text-sm sm:text-base")
              div(class="pt-2 sm:pt-4")
                Button(class="w-full h-10 sm:h-11") Сохранить изменения
          Separator(class="my-4 sm:my-6")
          .grid(class="grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4")
            div
              Label(class="text-xs sm:text-sm font-medium") Создана
              p(class="text-xs sm:text-sm text-gray-600") {{ formatDateTime(selectedTrip.created_at) }}
            selectedTrip.started_at &&
              div
                Label(class="text-xs sm:text-sm font-medium") Начата
                p(class="text-xs sm:text-sm text-gray-600") {{ formatDateTime(selectedTrip.started_at) }}
            selectedTrip.completed_at &&
              div
                Label(class="text-xs sm:text-sm font-medium") Завершена
                p(class="text-xs sm:text-sm text-gray-600") {{ formatDateTime(selectedTrip.completed_at) }}
    Separator
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          Plus(class="h-4 w-4 sm:h-5 sm:w-5")
          | Создать поездку
      CardContent
        .grid(class="grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4")
          div
            Label(class="text-sm sm:text-base") ID пользователя *
            Input(v-model="newTrip.user_id" placeholder="u001" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") ID водителя
            Input(v-model="newTrip.driver_id" placeholder="d001" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") ID транспорта
            Input(v-model="newTrip.vehicle_id" placeholder="v001" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Цена (₽)
            Input(type="number" v-model="newTrip.price" placeholder="1500" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Откуда *
            Input(v-model="newTrip.from_address" placeholder="Москва, Красная площадь" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Куда *
            Input(v-model="newTrip.to_address" placeholder="Москва, Шереметьево" class="h-10 sm:h-11 text-sm sm:text-base")
        Button(@click="handleCreateTrip" :disabled="isLoading || !newTrip.user_id || !newTrip.from_address || !newTrip.to_address" class="w-full mt-3 sm:mt-4 h-10 sm:h-11")
          Plus(class="mr-2 h-4 w-4")
          | {{ isLoading ? 'Создание...' : 'Создать поездку' }}
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="flex items-center gap-2 text-lg sm:text-xl")
          Clock(class="h-4 w-4 sm:h-5 sm:w-5")
          | Статистика поездок
      CardContent
        .grid(class="grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4")
          div(class="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-yellow-600") {{ trips.filter(t => t.status === 'pending').length }}
            div(class="text-xs sm:text-sm text-yellow-700") Ожидают
          div(class="text-center p-3 sm:p-4 bg-blue-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-blue-600") {{ trips.filter(t => t.status === 'active').length }}
            div(class="text-xs sm:text-sm text-blue-700") В пути
          div(class="text-center p-3 sm:p-4 bg-green-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-green-600") {{ trips.filter(t => t.status === 'completed').length }}
            div(class="text-xs sm:text-sm text-green-700") Завершены
          div(class="text-center p-3 sm:p-4 bg-purple-50 rounded-lg")
            div(class="text-xl sm:text-2xl font-bold text-purple-600") {{ Math.round(trips.reduce((acc, t) => acc + t.price, 0)) }}₽
            div(class="text-xs sm:text-sm text-purple-700") Общая выручка
</template> 