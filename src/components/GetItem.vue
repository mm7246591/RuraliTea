<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Item from "./Item.vue";
import { NModal, NCard, NSpin } from "naive-ui";
import { getDatabase, ref as dref, onValue } from "firebase/database";
import { useRoute } from "vue-router";

interface Item {
  id: string;
  img: string;
  name: string;
  category: string;
  intro: string;
  price: number;
  items: { item: string; maxSum: number }[];
  pictures: { id: string; img: string }[];
}

const db = getDatabase();
const route = useRoute();
const items = ref<Item[] | null>(null);
const selectId = ref<string | null>(null);
const showModal = ref<boolean>(false);
const showLoading = ref<boolean>(false)

const filterItem = computed(() => {
  if (items.value)
    return items.value?.filter((item) =>
      item.category.includes(route.meta.name as string)
    );
});

const handleAddCar = (SelectId: string) => {
  if (items.value) {
    selectId.value = SelectId;
    showModal.value = true;
  }
};

const getItem = () => {
  showLoading.value = true
  const teaRef = dref(db, `/teas`);
  onValue(teaRef, async (snapshot) => {
    if (snapshot.exists()) {
      items.value = Object.values(await snapshot.val()) as Item[]
      showLoading.value = false
    }
  });
};

onMounted(() => {
  getItem();
});
</script>

<template>
  <NSpin :show="showLoading" :stroke="'#778168'">
    <div class="w-full" :class="route.meta.name !== '所有商品' ? 'h-[100vh]' : 'h-auto sm:h-[100vh]'">
      <div>
        <div class="w-[90vw] flex sm:justify-between flex-wrap mx-auto sm:my-[1vh]">
          <div v-for="data of filterItem" :key="data.id"
            class="relative w-[28vw] sm:w-[42vw] flex flex-col items-center mx-[.5vw] sm:mx-[1.2vw] my-[5vh] sm:my-[0vh]">
            <div>
              <img :src="data.img" class="object-contain" />
            </div>
            <div class="text-base 2sm:text-sm 3sm:!text-[12px] text-[#757575] my-[1vh]">
              {{ data.name }}
            </div>
            <div class="absolute bottom-[6vh] right-[2vw]">
              <img src="/img/all-item/card-add.png" class="w-[48px] sm:w-[40px] object-contain cursor-pointer"
                @click="handleAddCar(data.id)" />
            </div>
          </div>
          <NModal v-model:show="showModal" :block-scroll="true" v-bind:close-on-esc="false"
            class="getItem w-[90vw] px-[2vw] sm:my-[10vh]" preset="card" size="large">
            <NCard :bordered="false">
              <Item :id="selectId"></Item>
            </NCard>
          </NModal>
        </div>
      </div>
    </div>
  </NSpin>
</template>

<style>
.n-base-selection {
  --n-border-active: 1px solid #e0e0e0 !important;
  --n-border-focus: 1px solid #e0e0e0 !important;
  --n-border-hover: 1px solid #e0e0e0 !important;
  --n-box-shadow-active: 0 0 0 1px #e0e0e0 !important;
  --n-box-shadow-focus: 0 0 0 1px #e0e0e0 !important;
  --n-caret-color: #e0e0e0 !important;
  --n-loading-color: white !important;
  --border: 1px solid #e0e0e0 !important;
  --n-border-radius: 0.625rem !important;
  --n-color: #f5f5f5 !important;
}

.n-base-select-menu {
  --n-option-check-color: #5c6e58 !important;
  --n-option-text-color-active: #5c6e58 !important;
  --n-option-text-color-pressed: #5c6e58 !important;
  --n-loading-color: #5c6e58 !important;
}

.getItem {
  --n-close-size: 25px !important;
  --n-close-icon-size: 25px !important;
}

.getItem .n-base-icon {
  background-color: white !important;
  --n-close-icon-color: white !important;
  --n-close-icon-color-hover: white !important;
  --n-close-icon-color-pressed: white !important;
  --n-close-color-hover: white !important;
  --n-close-color-pressed: white !important;
}

.getItem .n-card__content {
  padding: 0 2vw !important;
}
</style>
