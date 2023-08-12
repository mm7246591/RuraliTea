<script setup lang="ts">
import Footer from './layout/Footer.vue';
import Header from './layout/Header.vue';
import { NMessageProvider } from "naive-ui";
</script>

<template>
  <NMessageProvider :max="1" :duration="2000">
    <Header />
    <RouterView />
    <Footer />
  </NMessageProvider>
</template>

<style scoped></style>
