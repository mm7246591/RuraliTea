<script setup lang="ts">
import Header from './layout/Header.vue';
import Footer from './layout/Footer.vue';
import { NMessageProvider } from "naive-ui";
import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';

const route = useRoute()
const isHome = ref<boolean>(false)

watch(route, () => {
  if (route.meta.name === '首頁')
    isHome.value = true
  else
    isHome.value = false
})
</script>

<template>
  <NMessageProvider :max="1" :duration="2000">
    <Header />
    <RouterView />
    <Footer v-show="!isHome" />
  </NMessageProvider>
</template>

<style scoped></style>
