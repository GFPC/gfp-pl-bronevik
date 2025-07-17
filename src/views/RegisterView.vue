<template lang="pug">
section.flex.items-center.justify-center.min-h-screen.bg-gray-100
  .w-full.max-w-md.bg-white.p-8.rounded.shadow
    h2.text-2xl.font-bold.mb-6.text-center Регистрация
    form.flex.flex-col.gap-4(@submit.prevent="onRegister")
      input(type="email" v-model="email" placeholder="Email" required class="input input-bordered w-full")
      input(type="password" v-model="password" placeholder="Пароль" required class="input input-bordered w-full")
      input(type="password" v-model="confirm" placeholder="Повторите пароль" required class="input input-bordered w-full")
      button(type="submit" class="btn btn-primary w-full") Зарегистрироваться
    p.text-center.mt-4
      | Уже есть аккаунт?
      button.text-blue-600.ml-2(@click="goLogin" type="button") Войти
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirm = ref('')
const router = useRouter()

function onRegister() {
  // Демо-логика: просто редирект на login
  router.push('/login')
}
function goLogin() {
  router.push('/login')
}
</script> 