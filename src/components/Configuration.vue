<template lang="pug">
div(v-if="!authStore.isLoaded" class="flex items-center justify-center min-h-[200px]")
  svg(class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24")
    circle(class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
    path(class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z")
div(v-else)
  transition(name="fade-slide")
    // только один дочерний элемент!
    .pb-6(v-if="showConfigPanel")
      Card
        CardHeader.flex.items-center.justify-between
          div.block.items-center.gap-2
            CardTitle.flex.items-center.gap-2.text-2xl
              Server.h-5.w-5
              | Конфигурация API
            CardDescription Выберите конфигурацию для работы с API
          // Иконка минус для сворачивания
          button(@click="$emit('update:showConfigPanel', false)" class="text-gray-400 hover:text-gray-700 text-xl ml-2")
            svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6")
              path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4")

        CardContent
          div.flex.items-center.gap-4
            div.flex-1
              Select(:modelValue="authStore.currentConfig" @update:modelValue="setCurrentConfig" v-bind="currentConfig")
                SelectTrigger.w-full
                  div.flex.items-center.gap-2
                    div.w-2.h-2.rounded-full(:class="getStatusColor(authStore.currentConfig.status)")
                    span {{ authStore.currentConfig.name }}

                SelectContent
                  SelectItem(v-for="config in authStore.getConfigs()" :key="config.id" :value="config")
                    div.flex.items-center.gap-2
                      div.w-2.h-2.rounded-full(:class="getStatusColor(config.status)")
                      span {{ config.name }}
            Button(variant="outline" size="sm" @click="onRefresh")
              RefreshCw.h-4.w-4(:class="{ 'animate-spin': isRefreshing }")
          div.mt-4.p-4.bg-gray-50.rounded-lg
            div.flex.items-center.justify-between.mb-2
              h4.font-medium {{ authStore.currentConfig.name }}
              Badge(:variant="authStore.currentConfig.status === 'active' ? 'default' : 'secondary'")
                | {{getStatusText(authStore.currentConfig.status)}}
            div.flex.items-center.gap-2.text-sm.text-gray-600
              Globe.h-4.w-4
              span {{authStore.currentConfig.url}}
            p.text-sm.text-gray-500.mt-1 {{ authStore.currentConfig.description }}
            div.authed.mt-2
              Badge.px-4.h-8.text-base(
                :variant="authStore.currentConfig.isAuthed ? 'secondary' : 'destructive'"
                :class="authStore.currentConfig.isAuthed ? 'text-green-600 bg-green-50 border-green-400' : 'text-red-600 bg-red-50 border-red-400'"
              )
                | {{authStore.currentConfig.isAuthed ? 'Авторизован' : 'Не авторизован'}}
                BadgeCheck.h-4.w-4(v-if="authStore.currentConfig.isAuthed")
                TriangleAlert.h-4.w-4(v-else)
            Button.mt-6(variant="outline" size="sm" @click="showLoginModal = true" class="bg-green-400 hover:active:bg-primary-100" v-if="!authStore.currentConfig.isAuthed")
              | Войти
div
  // Модальное окно входа
  div.fixed.inset-0.modal-backdrop.flex.items-center.justify-center.z-50(v-if="showLoginModal" @click="showLoginModal = false")
    Card.w-full.max-w-md.shadow-lg(@click.stop)
      CardHeader.flex.flex-row.items-center.justify-between
        CardTitle Вход в систему
        button(class="text-gray-400 hover:text-gray-700 text-xl" @click="showLoginModal = false") ×
      CardContent
        form.flex.flex-col.gap-4(@submit.prevent="onLogin")
          input(type="email" v-model="loginEmail" placeholder="Email" required class="input input-bordered w-full px-3 py-2 border rounded")
          input(type="password" v-model="loginPassword" placeholder="Пароль" required class="input input-bordered w-full px-3 py-2 border rounded")
          Button(type="submit" class="btn btn-primary w-full mt-2") Войти
          // Сообщение о статусе
          div.status-badge.flex.items-center.justify-center.mt-4.gap-2(v-if="loginMessage" :class="loginStatus === 'error' ? 'status-badge--error' : 'status-badge--success'")
            span.flex.items-center
              span(v-if="loginStatus === 'error'")
                svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 mr-1 inline")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z")
              span(v-if="loginStatus === 'success'")
                svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 mr-1 inline")
                  path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7")
              span.font-medium {{ loginMessage }}

</template>

<script lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw, Server, Globe, BadgeCheck, TriangleAlert } from "lucide-vue-next"
import { Badge } from "@/components/ui/badge"
import {Config, useAuthStore} from "@/stores/auth.ts";
import { computed } from 'vue';
export default {
  name: "Configuration",
  components: {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,

    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,

    Button,
    RefreshCw,
    Server,
    Globe,
    Badge,
    BadgeCheck,
    TriangleAlert
  },
  props: {
    showConfigPanel: Boolean
  },
  data() {
    return {
      authStore: useAuthStore(),
      configs: [] as Config[],
      // currentConfig: {} as Config, // Удаляем локальный currentConfig
      showLoginModal: false,
      loginEmail: '',
      loginPassword: '',
      loginStatus: '',
      loginMessage: '',
      isRefreshing: false
    }
  },
  methods: {
    getCurrentConfig() {
      return this.authStore.currentConfig;
    },
    setCurrentConfig(val: Config) {
      this.authStore.setCurrentConfig(val);
    },
    getStatusText(status: string) {
      switch (status) {
        case "active":
          return "Активен"
        case "maintenance":
          return "Обслуживание"
        case "inactive":
          return "Неактивен"
        default:
          return "Неизвестно"
      }
    },
    getStatusColor(status: string) {
      switch (status) {
        case "active":
          return "bg-green-500"
        case "maintenance":
          return "bg-yellow-500"
        case "inactive":
          return "bg-red-500"
        default:
          return "bg-gray-500"
      }
    },
    async onLogin() {
      this.loginStatus = '';
      this.loginMessage = '';
      const result = await this.authStore.authenticate({
        login: this.loginEmail,
        password: this.loginPassword,
        type: 'e-mail'
      }, this.authStore.currentConfig.id);
      console.log(result)
      if (result && result.status === 'error') {
        this.loginStatus = 'error';
        this.loginMessage = result.message || 'Ошибка входа';
      } else {
        this.loginStatus = 'success';
        this.loginMessage = 'Вход выполнен успешно';
        this.showLoginModal = false;
      }
    },
    onRefresh() {
      this.isRefreshing = true
      setTimeout(() => {
        this.isRefreshing = false
        console.log('Refresh action placeholder')
      }, 1000)
    }
  },
  watch: {
  }
}
</script>

<style scoped>
.modal-backdrop {
  background: rgba(0, 0, 0, 0.6);
}

.status-badge {
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  border-width: 1.5px;
  border-style: solid;
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  background: rgba(0,0,0,0.03);
}
.status-badge--error {
  color: #ef4444;
  background: rgba(239,68,68,0.08);
  border-color: #ef4444;
}
.status-badge--success {
  color: #22c55e;
  background: rgba(34,197,94,0.08);
  border-color: #22c55e;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: max-height 0.7s cubic-bezier(.4,0,.2,1), opacity 0.4s;
  overflow: hidden;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.fade-slide-enter-to, .fade-slide-leave-from {
  max-height: 3000px;
  opacity: 1;
}
</style>