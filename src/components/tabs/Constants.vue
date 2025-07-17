<template lang="pug">
div(class="rounded-sm bg-muted text-muted-foreground border p-4")
  template(v-if="isLoading")
    div(class="flex items-center justify-center min-h-[200px]")
      svg(class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24")
        circle(class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
        path(class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z")
  template(v-else-if="error")
    div(class="text-red-500 text-sm") {{ error }}
  template(v-else-if="jsonData")
    // Lang Values Table
    template(v-if="jsonData.data && jsonData.data.data && jsonData.data.data.lang_vls")
      h3(class="text-lg font-bold mb-2") Lang Values
      div(class="flex items-center mb-2 gap-2")
        Popover
          PopoverTrigger
            Button(variant="outline" size="sm")
              | Filter
          PopoverContent(class="w-80 p-4 rounded-lg shadow-lg border flex flex-col gap-3" :class="'dark:bg-[hsl(var(--background))] dark:text-[hsl(var(--foreground))] bg-white'")
            label(class="text-xs font-semibold text-gray-700 mb-1") Name (Key)
            Input(v-model="filterName" placeholder="Regex по ключу" class="mb-2")
            label(class="text-xs font-semibold text-gray-700 mb-1") Value (RU/EN)
            Input(v-model="filterValue" placeholder="Regex по значению" class="mb-2")
            div(class="text-xs text-gray-400 mt-1")
              | Фильтрация по регулярному выражению. Например: ^add
        div(class="flex gap-2 flex-1 justify-end")
          Button(size="sm" :disabled="isUploading || !Object.values(selectedKeys).some(Boolean)" @click="deleteSelectedLangVls" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors flex items-center gap-2")
            | Delete selected
          Button(size="sm" :disabled="isUploading" @click="uploadAllLangVls" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors flex items-center gap-2")
            span(v-if="isUploading")
              svg(class="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24")
                circle(class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4")
                path(class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z")
            | Save
          span.text-xs.text-gray-500.ml-2(v-if="uploadMessage") {{ uploadMessage }}
          Button(size="sm" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors") Reset
      // Мобильный адаптив: горизонтальный скролл, скрытие столбцов, уменьшение шрифта
      div(class="mb-6 max-h-[70vh] overflow-auto rounded border bg-background text-foreground w-full sm:w-auto")
        // min-w-[500px] для скролла на мобилках
        div(class="w-full overflow-x-auto")
          Table(class="min-w-[500px] w-full text-xs sm:text-sm")
            TableHeader(class="bg-background text-foreground dark:bg-[hsl(var(--background))] dark:text-[hsl(var(--foreground))]")
              TableRow
                TableHead(width="1")
                TableHead Key
                TableHead(class="hidden xs:table-cell") RU
                TableHead(class="hidden xs:table-cell") EN
            TableBody
              TableRow(v-for="(val, key) in filteredLangVls" :key="key" @click="openEditModal(key, val)" :class="['cursor-pointer hover:bg-primary/10 transition', changedKeys[key] ? 'bg-yellow-100' : '']")
                TableCell(width="1")
                  input(type="checkbox" :checked="selectedKeys[key] || false" @click.stop="toggleSelectKey(key)")
                TableCell(class="font-mono text-xs text-gray-700")
                  span {{ key }}
                  // Иконка для открытия модалки на мобилках
                  button.ml-2(:class="'sm:hidden'" @click.stop="openEditModal(key, val)")
                    svg(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 text-gray-400")
                      path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7")
                TableCell(class="hidden xs:table-cell") {{ val[1] || '' }}
                TableCell(class="hidden xs:table-cell") {{ val[2] || '' }}
    // Dialog for editing lang value
    Dialog(v-model:open="editModalOpen")
      DialogContent
        DialogHeader
          DialogTitle {{ editKey }}
        div(class="mb-4")
          div(v-for="lang in langsList" :key="lang.id" class="mb-3")
            label(class="block text-xs font-semibold text-gray-700 mb-1") {{ lang.native }} ({{ lang.iso }})
            div(class="flex gap-2 items-center")
              div(class="flex-1")
                label(class="text-xs text-gray-500 mb-0.5 block") Old value
                Input(:modelValue="editOld[lang.id]" disabled class="bg-gray-100 text-gray-400 cursor-not-allowed w-full")
              div(class="flex-1")
                label(class="text-xs text-gray-700 mb-0.5 block") New value
                Input(:modelValue="editDraft[lang.id]" @update:modelValue="v => onDraftChange(lang.id, v)" placeholder="New value" class="w-full")
        DialogFooter
          Button(variant="secondary" size="sm" @click="saveEdit" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1 rounded shadow-sm transition-colors") Save
          Button(variant="outline" size="sm" @click="closeEditModal") Cancel
  template(v-else)
    div(class="text-gray-400 text-sm") Нет данных
</template>

<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'
import { JsonViewer } from 'vue3-json-viewer'
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableHead from '@/components/ui/table/TableHead.vue'
import TableBody from '@/components/ui/table/TableBody.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
import TableCell from '@/components/ui/table/TableCell.vue'
import Button from '@/components/ui/button/Button.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import Input from '@/components/ui/input/Input.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import Badge from '@/components/ui/badge/Badge.vue'

export default {
  name: 'Constants',
  components: {
    JsonViewer, Table, TableHeader, TableHead, TableBody, TableRow, TableCell, Button, Popover, PopoverTrigger, PopoverContent, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, Badge
  },
  data() {
    return {
      authStore: useAuthStore(),
      isLoading: false,
      error: '',
      jsonData: null as any,
      filterName: '',
      filterValue: '',
      editModalOpen: false,
      editKey: '',
      editOld: {} as Record<string, string>,
      editDraft: {} as Record<string, string>,
      changedKeys: {} as Record<string, boolean>,
      changedLangVls: {} as Record<string, Record<string, string>>,
      isUploading: false,
      uploadMessage: '',
      selectedKeys: {} as Record<string, boolean>,
    }
  },
  computed: {
    currentConfig() {
      return this.authStore.currentConfig
    },
    filteredLangVls() {
      const vls = this.jsonData?.data?.data?.lang_vls || {}
      let nameRegex = null
      let valueRegex = null
      try {
        nameRegex = this.filterName ? new RegExp(this.filterName, 'i') : null
      } catch {}
      try {
        valueRegex = this.filterValue ? new RegExp(this.filterValue, 'i') : null
      } catch {}
      return Object.fromEntries(
        Object.entries(vls).filter(([key, val]) => {
          const arr = val as any[];
          const ru = arr[1] ? String(arr[1]) : ''
          const en = arr[2] ? String(arr[2]) : ''
          const nameMatch = nameRegex ? nameRegex.test(key) : true
          const valueMatch = valueRegex ? (valueRegex.test(ru) || valueRegex.test(en)) : true
          return nameMatch && valueMatch
        })
      )
    },
    langsList() {
      const langs = this.jsonData?.data?.data?.langs || {}
      return Object.entries(langs).map(([id, obj]: [string, any]) => ({
        id,
        native: obj.native,
        iso: obj.iso
      }))
    }
  },
  methods: {
    openEditModal(key: string, val: any) {
      let langKeys: string[] = [];
      const langs = this.jsonData?.data?.langs || {};
      if (Object.keys(langs).length) {
        langKeys = Object.keys(langs);
      } else {
        langKeys = Object.keys(val);
      }
      const oldObj: Record<string, string> = {};
      langKeys.forEach(langId => {
        oldObj[langId] = val[langId] || '';
      });
      this.editKey = key;
      this.editOld = oldObj;
      // Если есть изменённые значения — показываем их, иначе оригинал
      if (this.changedLangVls[key]) {
        this.editDraft = { ...this.changedLangVls[key] };
      } else {
        this.editDraft = { ...oldObj };
      }
      this.editModalOpen = true;
      // Для отладки
      console.log('editOld', this.editOld, 'editDraft', this.editDraft, 'langKeys', langKeys);
    },
    closeEditModal() {
      this.editModalOpen = false
      this.editKey = ''
      this.editOld = {}
      this.editDraft = {}
    },
    saveEdit() {
      // Сохраняем draft в changedLangVls
      if (this.editKey) {
        this.changedLangVls[this.editKey] = { ...this.editDraft };
        // Подсветка: если есть отличия от оригинала — true, иначе false
        let changed = false;
        for (const k in this.editDraft) {
          if (this.editDraft[k] !== this.editOld[k]) {
            changed = true;
            break;
          }
        }
        this.changedKeys[this.editKey] = changed;
      }
      this.closeEditModal();
    },
    onDraftChange(langId: string, value: string) {
      this.editDraft[langId] = value;
      // Проверяем, изменилось ли хоть одно значение
      let changed = false;
      for (const k in this.editDraft) {
        if (this.editDraft[k] !== this.editOld[k]) {
          changed = true;
          break;
        }
      }
      if (this.editKey) this.changedKeys[this.editKey] = changed;
    },
    async fetchConstants() {
      if (!this.currentConfig?.id) return
      this.isLoading = true
      this.error = ''
      try {
        const apiStore = useApiStore();
        const data = await apiStore.getConstants(this.currentConfig.id)
        this.jsonData = data
      } catch (e: any) {
        this.error = e?.response?.data?.message || e?.message || 'Ошибка запроса'
      } finally {
        this.isLoading = false
      }
    },
    saveFilters() {
      localStorage.setItem('langVlsFilterName', this.filterName)
      localStorage.setItem('langVlsFilterValue', this.filterValue)
    },
    resetFilters() {
      this.filterName = ''
      this.filterValue = ''
    },
    async uploadAllLangVls() {
      if (!Object.keys(this.changedLangVls).length) {
        this.uploadMessage = 'Нет изменений для сохранения.';
        setTimeout(() => { this.uploadMessage = '' }, 2000);
        return;
      }
      this.isUploading = true;
      this.uploadMessage = '';
      try {
        const config = this.currentConfig;
        if (!config || !config.id) throw new Error('Нет выбранного конфига');
        const authData = this.authStore.getAuthDataByConfigId(config.id);
        if (!authData || !authData.token || !authData.u_hash) throw new Error('Нет токена или u_hash');
        const apiStore = useApiStore();
        await apiStore.uploadLangValues(
          config.id,
          authData.token,
          authData.u_hash,
          this.changedLangVls
        );
        this.uploadMessage = 'Изменения успешно сохранены!';
        // Сбросить локальные изменения и обновить таблицу
        this.changedLangVls = {};
        this.changedKeys = {};
        await this.fetchConstants();
      } catch (e: any) {
        this.uploadMessage = e?.message || 'Ошибка при сохранении';
      } finally {
        this.isUploading = false;
        setTimeout(() => { this.uploadMessage = '' }, 3000);
      }
    },
    toggleSelectKey(key: string) {
      this.selectedKeys[key] = !this.selectedKeys[key];
    },
    async deleteSelectedLangVls() {
      const keys = Object.keys(this.selectedKeys).filter(k => this.selectedKeys[k]);
      if (!keys.length) return;
      this.isUploading = true;
      this.uploadMessage = '';
      try {
        const config = this.currentConfig;
        if (!config || !config.id) throw new Error('Нет выбранного конфига');
        const authData = this.authStore.getAuthDataByConfigId(config.id);
        if (!authData || !authData.token || !authData.u_hash) throw new Error('Нет токена или u_hash');
        const delObj: Record<string, any> = {};
        for (const key of keys) {
          delObj[key] = { active: 0 };
        }
        const apiStore: any = useApiStore();
        await apiStore.deleteLangValues(
          config.id,
          authData.token,
          authData.u_hash,
          delObj
        );
        this.uploadMessage = 'Удаление успешно!';
        this.selectedKeys = {};
        await this.fetchConstants();
      } catch (e: any) {
        this.uploadMessage = e?.message || 'Ошибка при удалении';
      } finally {
        this.isUploading = false;
        setTimeout(() => { this.uploadMessage = '' }, 3000);
      }
    },
  },
  mounted() {
    this.fetchConstants()
    this.filterName = localStorage.getItem('langVlsFilterName') || ''
    this.filterValue = localStorage.getItem('langVlsFilterValue') || ''
  }
}
</script>

<style scoped>
@media (max-width: 640px) {
  .xs\:table-cell { display: none !important; }
}
</style>