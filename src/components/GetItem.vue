<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Item from "./Item.vue";
import { NModal, NCard, NSelect } from "naive-ui";
import { Triangle } from "@vicons/ionicons5";
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
const selectItem = ref<Item[] | null>(null);
const selected = ref<string | null>(null);
const selectId = ref<string | null>(null);
const showModal = ref<boolean>(false);
const options = [
  {
    label: "400~1500/一斤",
    value: "400~1500/一斤",
  },
  {
    label: "500~1600/一斤",
    value: "500~1600/一斤",
  },
  {
    label: "600~1700/一斤",
    value: "600~1700/一斤",
  },
];

const filterItem = computed(() => {
  if (items.value)
    return items.value?.filter((item) =>
      item.category.includes(route.meta.name as string)
    );
});

const handleFilterItem = (value: string) => {
  console.log(value);
};

const handleAddCar = (SelectId: string) => {
  if (items.value) {
    selectId.value = SelectId;
    selectItem.value = items.value?.filter((item) => item.id === SelectId);
    showModal.value = true;
  }
};

const getItem = () => {
  const teaRef = dref(db, `/teas`);
  onValue(teaRef, (snapshot) => {
    if (snapshot.exists()) items.value = Object.values(snapshot.val()) as Item[];
  });
  selected.value = options[0].value;
};

onMounted(() => {
  getItem();
});
</script>

<template>
  <div class="lg:w-full">
    <div class="lg:w-[86vw] flex justify-end items-center mx-auto lg:my-[2vh]">
      <div>價位：</div>
      <div class="lg:w-[10vw]">
        <NSelect v-model:value="selected" :options="options" :default-value="options[0].value"
          @update:value="handleFilterItem">
          <template #arrow>
            <Triangle />
          </template>
        </NSelect>
      </div>
    </div>
    <div>
      <div class="lg:w-[90vw] flex flex-wrap mx-auto">
        <div v-for="item of filterItem" :key="item.id"
          class="relative lg:w-[28vw] flex flex-col items-center lg:mx-[1vw] lg:my-[5vh]">
          <div>
            <img :src="item.img" class="object-contain" />
          </div>
          <div class="text-base text-[#757575] lg:my-[1vh]">
            {{ item.name }}
          </div>
          <div class="absolute bottom-[6vh] right-[2vw]">
            <img src="/img/all-item/card-add.png" class="w-[48px] object-contain cursor-pointer"
              @click="handleAddCar(item.id)" />
          </div>
        </div>
        <NModal v-model:show="showModal" class="getItem" preset="card" size="large" :block-scroll="true">
          <NCard :bordered="false">
            <Item :id="selectId" :item="selectItem"></Item>
          </NCard>
        </NModal>
      </div>
    </div>
  </div>
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
  width: 90vw;
  padding: 0 2vw;
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
  padding: 0 !important;
}
</style>
