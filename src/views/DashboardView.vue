<template lang="pug">
Header(v-model:showConfigPanel="showConfigPanel")
div.container.mx-auto.px-4.py-6
  Configuration(v-model:showConfigPanel="showConfigPanel")

  div.container.mx-auto.grid-cols-3
    Tabs(default-value="Constants").w-full
      TabsList.grid.grid-cols-3.w-full
        TabsTrigger(value="Constants") Constants
        TabsTrigger(value="Tools") Tools
        TabsTrigger(value="Settings") Settings
      TabsContent(value="Constants").mt-6
        Constants
      TabsContent(value="Tools").mt-6
        Tools
      TabsContent(value="Settings").mt-6
        Settings

</template>

<script lang="ts">
import Configuration from "@/components/Configuration.vue"
import Header from "@/components/Header.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Constants from "@/components/tabs/Constants.vue"
import Tools from "@/components/tabs/Tools.vue"
import Settings from "@/components/tabs/Settings.vue"
export default {
  name: "Dashboard",
  components: {
    Header,
    Configuration,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Constants,
    Tools,
    Settings
  },
  data() {
    return {
      showConfigPanel: false
    }
  }
}
</script>

<style scoped>
</style>