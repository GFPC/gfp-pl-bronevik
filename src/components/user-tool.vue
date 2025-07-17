<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import RadioGroup from '@/components/ui/radio-group/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/radio-group/RadioGroupItem.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import { ArrowLeft, Play, Upload, Save, User, Phone, Mail, Hash, MessageCircle } from "lucide-vue-next"
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'
import axios from 'axios'

interface UserField {
  key: string
  label: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json' | 'date'
  editable: boolean
}

const mockUserFields: UserField[] = [
  { key: 'u_id', label: 'User ID', value: '12345', type: 'string', editable: false },
  { key: 'phone', label: 'Телефон', value: '+7 900 123 45 67', type: 'string', editable: true },
  { key: 'email', label: 'Email', value: 'user@example.com', type: 'string', editable: true },
  { key: 'name', label: 'Имя', value: 'Иван Петров', type: 'string', editable: true },
  { key: 'status', label: 'Статус', value: 'active', type: 'string', editable: true },
  { key: 'balance', label: 'Баланс', value: 1500.5, type: 'number', editable: true },
  { key: 'verified', label: 'Верифицирован', value: true, type: 'boolean', editable: true },
  { key: 'created_at', label: 'Дата создания', value: '2024-01-15T10:30:00Z', type: 'date', editable: false },
  {
    key: 'u_details',
    label: 'Детали пользователя',
    value: { preferences: { theme: 'dark', language: 'ru' }, settings: { notifications: true } },
    type: 'json',
    editable: true,
  },
  { key: 'refCode', label: 'Реферальный код', value: 'REF123456', type: 'string', editable: true },
]

export default defineComponent({
  name: 'UserTool',
  components: {
    Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Textarea, RadioGroup, RadioGroupItem, Separator, Badge, ScrollArea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    ArrowLeft, Play, Upload, Save, User, Phone, Mail, Hash, MessageCircle
  },
  props: {
    onBack: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const apiStore = useApiStore()
    const currentConfig = computed(() => authStore.currentConfig)
    const activeSection = ref('get-user')
    const searchType = ref('phone')
    const searchValue = ref('')
    const jsonResponse = ref('')
    const isLoading = ref(false)
    // Edit User state
    const userId = ref('')
    const userFields = ref<UserField[]>([])
    const selectedField = ref<UserField | null>(null)
    const editValue = ref('')
    const changedFields = ref<string[]>([])
    const showUploadModal = ref(false)
    // Set refCode state
    const refCodeUserId = ref('')
    const newRefCode = ref('')

    const getSearchIcon = computed(() => {
      switch (searchType.value) {
        case 'phone': return Phone
        case 'email': return Mail
        case 'id': return Hash
        case 'tg':
        case 'whatsapp': return MessageCircle
        default: return User
      }
    })

    async function handleGetUser() {
      if (!searchValue.value.trim()) return
      isLoading.value = true
      jsonResponse.value = ''
      try {
        const configId = currentConfig.value?.id
        if (!configId) {
          jsonResponse.value = JSON.stringify({ error: 'Конфиг не выбран.' }, null, 2)
          isLoading.value = false
          return
        }
        const auth = authStore.getAuthDataByConfigId(configId)
        if (!auth || !auth.token || !auth.u_hash) {
          jsonResponse.value = JSON.stringify({ error: 'Нет авторизации для выбранного конфига. Пожалуйста, выполните вход.' }, null, 2)
          isLoading.value = false
          return
        }
        // Маппинг типа поиска в нужный ключ
        const typeMap: Record<string, string> = {
          phone: 'u_a_phone',
          email: 'u_a_email',
          id: 'u_a_id',
          tg: 'u_a_tg',
          whatsapp: 'u_a_whatsapp',
        }
        const paramKey = typeMap[searchType.value] || searchType.value
        const params = { [paramKey]: searchValue.value }
        const data = await apiStore.getUser(configId, params, auth.token, auth.u_hash)
        jsonResponse.value = JSON.stringify(data, null, 2)
      } catch (e: any) {
        jsonResponse.value = JSON.stringify({ error: e?.response?.data?.message || e?.message || 'Ошибка запроса' }, null, 2)
      } finally {
        isLoading.value = false
      }
    }

    async function handleLoadUser() {
      if (!userId.value.trim()) return
      isLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      userFields.value = mockUserFields
      isLoading.value = false
    }

    function handleFieldSelect(field: UserField) {
      selectedField.value = field
      editValue.value = field.type === 'json' ? JSON.stringify(field.value, null, 2) : String(field.value)
    }

    function handleSaveField() {
      if (!selectedField.value) return
      const updatedFields = userFields.value.map((field) => {
        if (field.key === selectedField.value!.key) {
          let newValue: any = editValue.value
          if (field.type === 'json') {
            try {
              newValue = JSON.parse(editValue.value)
            } catch (e) {
              alert('Некорректный JSON')
              return field
            }
          } else if (field.type === 'number') {
            newValue = Number.parseFloat(editValue.value)
          } else if (field.type === 'boolean') {
            newValue = editValue.value === 'true'
          }
          return { ...field, value: newValue }
        }
        return field
      })
      userFields.value = updatedFields
      if (!changedFields.value.includes(selectedField.value.key)) {
        changedFields.value = [...changedFields.value, selectedField.value.key]
      }
      selectedField.value = null
    }

    function handleUpload() {
      showUploadModal.value = true
    }

    async function confirmUpload() {
      isLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 1500))
      showUploadModal.value = false
      changedFields.value = []
      isLoading.value = false
      alert('Изменения успешно сохранены!')
    }

    async function handleSetRefCode() {
      if (!refCodeUserId.value.trim() || !newRefCode.value.trim()) return
      isLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      isLoading.value = false
      alert(`Реферальный код ${newRefCode.value} установлен для пользователя ${refCodeUserId.value}`)
    }

    return {
      activeSection, searchType, searchValue, jsonResponse, isLoading,
      userId, userFields, selectedField, editValue, changedFields, showUploadModal,
      refCodeUserId, newRefCode, getSearchIcon,
      handleGetUser, handleLoadUser, handleFieldSelect, handleSaveField, handleUpload, confirmUpload, handleSetRefCode,
      onBack: props.onBack
    }
  }
})
</script>

<template lang="pug">
div(class="space-y-4 sm:space-y-6 px-2 sm:px-0")
  .flex(class="flex-col sm:flex-row sm:items-center gap-2 sm:gap-4")
    Button(variant="outline" @click="onBack" class="w-fit bg-transparent")
      ArrowLeft(class="mr-2 h-4 w-4")
      | Назад к Tools
    div
      h2(class="text-xl sm:text-2xl font-bold") User Tool
      p(class="text-gray-600 text-sm sm:text-base") Управление пользователями для: {{ currentConfig }}
  div(class="space-y-6 sm:space-y-8")
    // Get User Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="text-lg sm:text-xl") Get User
      CardContent
        .grid(class="grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6")
          div(class="space-y-3 sm:space-y-4")
            div
              Label(class="text-sm sm:text-base font-medium") Поиск по:
              RadioGroup(v-model="searchType" class="mt-2 space-y-2")
                div(class="flex items-center space-x-2")
                  RadioGroupItem(value="phone" id="phone")
                  Label(for="phone" class="flex items-center gap-2 text-sm sm:text-base")
                    Phone(class="h-3 w-3 sm:h-4 sm:w-4")
                    | Телефон
                div(class="flex items-center space-x-2")
                  RadioGroupItem(value="email" id="email")
                  Label(for="email" class="flex items-center gap-2 text-sm sm:text-base")
                    Mail(class="h-3 w-3 sm:h-4 sm:w-4")
                    | Email
                div(class="flex items-center space-x-2")
                  RadioGroupItem(value="id" id="id")
                  Label(for="id" class="flex items-center gap-2 text-sm sm:text-base")
                    Hash(class="h-3 w-3 sm:h-4 sm:w-4")
                    | ID
                div(class="flex items-center space-x-2")
                  RadioGroupItem(value="tg" id="tg")
                  Label(for="tg" class="flex items-center gap-2 text-sm sm:text-base")
                    MessageCircle(class="h-3 w-3 sm:h-4 sm:w-4")
                    | Telegram
                div(class="flex items-center space-x-2")
                  RadioGroupItem(value="whatsapp" id="whatsapp")
                  Label(for="whatsapp" class="flex items-center gap-2 text-sm sm:text-base")
                    MessageCircle(class="h-3 w-3 sm:h-4 sm:w-4")
                    | WhatsApp
            div
              Label(class="text-sm sm:text-base") Значение для поиска
              div(class="relative")
                component(:is="getSearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2")
                Input(v-model="searchValue" :placeholder="`Введите ${searchType === 'phone' ? 'номер телефона' : searchType === 'email' ? 'email' : searchType === 'id' ? 'ID пользователя' : 'username'}`" class="pl-10 h-10 sm:h-11 text-sm sm:text-base")
            Button(@click="handleGetUser" :disabled="isLoading || !searchValue.trim()" class="w-full h-10 sm:h-11")
              Play(class="mr-2 h-4 w-4")
              | {{ isLoading ? 'Выполняется...' : 'Execute' }}
          div
            Label(class="text-sm sm:text-base font-medium") Результат:
            div(class="mt-2")
              Textarea(:model-value="jsonResponse" readonly placeholder="Результат появится здесь..." class="h-60 sm:h-80 font-mono text-xs sm:text-sm resize-none")
    Separator
    // Edit User Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="text-lg sm:text-xl") Edit User
      CardContent
        div(class="space-y-3 sm:space-y-4")
          .flex(class="flex-col sm:flex-row gap-2 sm:gap-4")
            div(class="flex-1")
              Label(class="text-sm sm:text-base") User ID
              Input(v-model="userId" placeholder="Введите ID пользователя" class="h-10 sm:h-11 text-sm sm:text-base")
            div(class="flex items-end")
              Button(@click="handleLoadUser" :disabled="isLoading || !userId.trim()" class="w-full sm:w-auto h-10 sm:h-11")
                | {{ isLoading ? 'Загрузка...' : 'Загрузить' }}
          div(v-if="userFields.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6")
            div
              Label(class="text-sm sm:text-base font-medium") Поля пользователя:
              ScrollArea(class="h-60 sm:h-80 mt-2 border rounded-md")
                div(class="p-2 space-y-1")
                  template(v-for="field in userFields" :key="field.key")
                    div(@click="field.editable && handleFieldSelect(field)" :class="['p-2 sm:p-3 rounded cursor-pointer transition-colors touch-manipulation', field.editable ? 'hover:bg-gray-100 border border-transparent hover:border-gray-300 active:bg-gray-200' : 'bg-gray-50 cursor-not-allowed', selectedField?.key === field.key ? 'bg-blue-50 border-blue-300' : '']")
                      .flex(class="items-center justify-between")
                        span(class="font-medium text-sm sm:text-base") {{ field.label }}
                        div(class="flex gap-1")
                          Badge(v-if="!field.editable" variant="secondary" class="text-xs") Readonly
                          Badge(v-if="changedFields.includes(field.key)" variant="default" class="text-xs") Изменено
                      div(class="text-xs sm:text-sm text-gray-600 mt-1 truncate") {{ field.type === 'json' ? JSON.stringify(field.value) : String(field.value) }}
              Button(v-if="changedFields.length > 0" @click="handleUpload" class="w-full mt-3 sm:mt-4 h-10 sm:h-11")
                Upload(class="mr-2 h-4 w-4")
                | Upload ({{ changedFields.length }} изменений)
            div(v-if="selectedField")
              Label(class="text-sm sm:text-base font-medium") Редактирование поля:
              div(class="mt-2 space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md")
                div
                  Label(class="text-xs sm:text-sm font-medium") Название поля:
                  p(class="text-xs sm:text-sm text-gray-600") {{ selectedField.label }}
                div
                  Label(class="text-xs sm:text-sm font-medium") Old Value:
                  div(class="text-xs sm:text-sm text-gray-600 p-2 bg-gray-50 rounded font-mono") {{ selectedField.type === 'json' ? JSON.stringify(selectedField.value, null, 2) : String(selectedField.value) }}
                div
                  Label(class="text-xs sm:text-sm font-medium") New Value:
                  Textarea(v-if="selectedField.type === 'json'" v-model="editValue" class="font-mono text-xs sm:text-sm h-24 sm:h-32" placeholder="JSON данные...")
                  Input(v-else v-model="editValue" :type="selectedField.type === 'number' ? 'number' : 'text'" class="h-10 sm:h-11 text-sm sm:text-base")
                Button(@click="handleSaveField" class="w-full h-10 sm:h-11")
                  Save(class="mr-2 h-4 w-4")
                  | Сохранить поле
    Separator
    // Set refCode Section
    Card
      CardHeader(class="pb-3 sm:pb-6")
        CardTitle(class="text-lg sm:text-xl") Set refCode
      CardContent
        .grid(class="grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4")
          div
            Label(class="text-sm sm:text-base") User ID
            Input(v-model="refCodeUserId" placeholder="Введите ID пользователя" class="h-10 sm:h-11 text-sm sm:text-base")
          div
            Label(class="text-sm sm:text-base") Новый refCode
            Input(v-model="newRefCode" placeholder="Введите новый реферальный код" class="h-10 sm:h-11 text-sm sm:text-base")
        Button(@click="handleSetRefCode" :disabled="isLoading || !refCodeUserId.trim() || !newRefCode.trim()" class="w-full mt-3 sm:mt-4 h-10 sm:h-11")
          | {{ isLoading ? 'Обновление...' : 'Установить refCode' }}
  Dialog(:open="showUploadModal" @update:open="val => showUploadModal = val")
    DialogContent(class="w-[95vw] max-w-md mx-auto")
      DialogHeader
        DialogTitle(class="text-lg sm:text-xl") Подтверждение изменений
        DialogDescription(class="text-sm sm:text-base") Вы собираетесь отправить следующие изменения:
      div(class="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto")
        template(v-for="fieldKey in changedFields" :key="fieldKey")
          div(v-if="userFields.find(f => f.key === fieldKey)" class="p-2 bg-gray-50 rounded")
            .font-medium(class="text-sm sm:text-base") {{ userFields.find(f => f.key === fieldKey)?.label }}
            .text-xs(class="sm:text-sm text-gray-600") {{ userFields.find(f => f.key === fieldKey)?.type === 'json' ? JSON.stringify(userFields.find(f => f.key === fieldKey)?.value) : String(userFields.find(f => f.key === fieldKey)?.value) }}
      DialogFooter(class="flex-col sm:flex-row gap-2 sm:gap-0")
        Button(variant="outline" @click="() => showUploadModal = false" class="w-full sm:w-auto") Отмена
        Button(@click="confirmUpload" :disabled="isLoading" class="w-full sm:w-auto") {{ isLoading ? 'Отправка...' : 'Подтвердить' }}
</template> 