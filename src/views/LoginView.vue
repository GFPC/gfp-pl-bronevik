<template lang="pug">
section.flex.items-center.justify-center.min-h-screen.bg-gray-100
  .w-full.max-w-md.bg-white.p-8.rounded.shadow
    h2.text-2xl.font-bold.mb-6.text-center Вход в систему
    form.flex.flex-col.gap-4(@submit.prevent="onLogin")
      input(type="email" v-model="email" placeholder="Email" required class="input input-bordered w-full")
      input(type="password" v-model="password" placeholder="Пароль" required class="input input-bordered w-full")
      button(type="submit" class="btn btn-primary w-full") Войти
    p.text-center.mt-4
      | Нет аккаунта?
      button.text-blue-600.ml-2(@click="goRegister" type="button") Зарегистрироваться
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('admin@bronevik.com')
const password = ref('admin123')
const router = useRouter()

function onLogin() {
  // Демо-логика: просто редирект на dashboard
  router.push('/dashboard')
}
function goRegister() {
  router.push('/register')
}
</script> 