<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted, ref, watchEffect } from "vue";
import { NSpin, NModal, NCard } from "naive-ui";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

interface FavoriteItem {
  id: string;
  img: string;
  name: string;
  price: number;
  weight: string;
  package: string;
  sum: number;
  availableSum: number
}

interface Step {
  id: number;
  text: string;
  process: boolean
}

const router = useRouter();
const favoriteItem = ref<FavoriteItem[] | null>(null);
const showModal = ref<boolean>(false);
const showLoading = ref<boolean>(false)
const isEmpty = ref<boolean>(false)
const total = ref<number>(0);
const steps = ref<Step[]>([
  {
    id: 1,
    text: "訂單確認",
    process: true,
  },
  {
    id: 2,
    text: "結帳",
    process: false,
  },
  {
    id: 3,
    text: "完成訂購",
    process: false,
  },
]);
const selectId = ref<string | null>(null)
const selectWeight = ref<string | null>(null)
const selectPackage = ref<string | null>(null)

firebaseConfig;
const db = getDatabase();
const userStore = useUserStore();

const handleMinusCount = async (SelectId: string, Weight: string, Package: string) => {
  if (favoriteItem.value) {
    await update(dref(db, `users/${userStore.userName}/`), {
      carId: SelectId,
    });
    await update(dref(db, `users/${userStore.userName}/`), {
      carWeight: Weight,
    });
    favoriteItem.value.forEach((item) => {
      if (item.id === SelectId && item.weight === Weight && item.package === Package) {
        item.sum !== 1
          ? update(
            dref(
              db,
              `users/${userStore.userName}/favorites/${item.name}_${item.weight}_${item.package}`
            ),
            {
              sum: (item.sum -= 1),
              availableSum: item.availableSum += 1
            }
          )
          : item.sum;
      }
    });
  }
};

const handlePlusCount = async (SelectId: string, Weight: string, Package: string) => {
  if (favoriteItem.value) {
    await update(dref(db, `users/${userStore.userName}/`), {
      carId: SelectId,
    });
    await update(dref(db, `users/${userStore.userName}/`), {
      carWeight: Weight,
    });
    favoriteItem.value.forEach((item) => {
      if (item.id === SelectId && item.weight === Weight && item.package === Package) {
        item.sum < userStore.carMaxSum
          ? update(
            dref(
              db,
              `users/${userStore.userName}/favorites/${item.name}_${item.weight}_${item.package}`
            ),
            {
              sum: (item.sum += 1),
              availableSum: item.availableSum -= 1
            }
          )
          : item.sum;
      }
    });
  }
};

const handleDelete = async (SelectId: string, Weight: string, Package: string) => {
  if (favoriteItem.value) {
    showModal.value = true
    selectId.value = SelectId
    selectWeight.value = Weight
    selectPackage.value = Package
  }
};

const handleClear = async () => {
  showLoading.value = true
  favoriteItem.value?.forEach(async (item) => {
    if (item.id === selectId.value && item.weight === selectWeight.value && item.package === selectPackage.value) {
      await update(
        dref(
          db,
          `users/${userStore.userName}/favorites/${item.name}_${selectWeight.value}_${selectPackage.value}`
        ),
        {
          id: null,
          img: null,
          name: null,
          price: null,
          package: null,
          weight: null,
          sum: null,
          availableSum: null
        }
      ).then(() => {
        showLoading.value = false
        showModal.value = false
      })
    }
  });
}

const handleSubmit = () => {
  if (userStore.favoriteSum)
    router.push("/checkout/step2");
};

const getFavoriteItem = async () => {
  showLoading.value = true
  const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
  onValue(favoriteRef, async (snapshot) => {
    if (snapshot.exists()) {
      isEmpty.value = false
      favoriteItem.value = Object.values(snapshot.val()) as FavoriteItem[];
      showLoading.value = false
      total.value = favoriteItem.value.reduce((acc, cur) =>
        acc + cur.price * cur.sum, 0
      )
    } else {
      showLoading.value = false
      isEmpty.value = true
    }
  });
};

onMounted(() => {
  getFavoriteItem();
});

watchEffect(() => {
  if (userStore.favoriteSum) {
    getFavoriteItem();
  }
  if (userStore.favoriteSum === 0) {
    favoriteItem.value = null;
    total.value = 0
  }
});
</script>

<template>
  <NSpin :show="showLoading">
    <div class="h-[100vh] flex flex-col justify-evenly sm:justify-start items-center sm:item">
      <div class="w-[60vw] sm:w-[85vw] h-[15vh] flex justify-evenly sm:justify-between">
        <div v-for="data of steps" :key="data.id" :class="data.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
          class="relative w-[55px] sm:w-[48px] h-[55px] sm:h-[48px] flex justify-center items-center rounded-full">
          <div class="text-3xl text-[#F5F5F5]">{{ data.id }}</div>
          <div :class="data.process ? 'text-[#5C6E58]' : 'text-[#BDBDBD]'"
            class="absolute w-[8vw] sm:w-[20vw] text-center -bottom-3 translate-y-full text-base">
            {{ data.text }}
          </div>
          <div v-show="data.id !== 3" class="absolute w-[13vw] sm:w-[28vw] h-[3px] left-full bg-[#E0E0E0]"></div>
        </div>
      </div>
      <div
        class="w-[80vw] sm:w-[90vw] flex flex-col pb-[4vh] sm:pb-[0vh] sm:mb-[2vh] border-b border-[#E0E0E0] sm:overflow-x-scroll sm:overflow-y-hidden">
        <div class="sm:w-[200vw] py-[2vh] flex items-center text-xl sm:text-lg text-[#FAFAFA] bg-[#8AA899]">
          <div class="mx-[2vw] sm:mx-[8vw]">購物車商品 ({{ userStore.favoriteSum }} 件)</div>
        </div>
        <div
          class="sm:w-[200vw] flex justify-between items-center py-[1vh] text-base text-[#616161] bg-[#FAFAFA] tracking-wider ">
          <div v-show="isEmpty" class="w-full flex flex-col justify-center items-center">
            <img src="/img/all-item/empty.png" class="sm:w-[100px]" alt="">
            <div class="text-base text-[#8F2E17]">購物車內沒有商品唷</div>
          </div>
          <div v-show="!isEmpty" class="w-[20vw] sm:w-[30vw] mx-[6vw] sm:text-center">商品資料</div>
          <div v-show="!isEmpty" class="w-[46vw] sm:w-[100vw] flex justify-around sm:justify-between sm:mx-[2vw]">
            <div class="sm:w-[30vw] mx-[2vw]">價格</div>
            <div class="w-[10vw] sm:w-[30vw] text-end sm:text-start">購買數量</div>
            <div class="w-[10vw] sm:w-[30vw] text-end">小計</div>
          </div>
        </div>
        <div v-for="data of favoriteItem" :key="data.id"
          class="sm:w-[200vw] flex justify-between items-center text-lg pb-[2vh] text-[#616161] bg-[#FAFAFA] border-t border-0">
          <div class="flex sm:justify-center items-center">
            <div class="mx-[2vw]">
              <img src="/img/all-item/delete.jpg" class="sm:w-[16px] sm:mx-[2vw] cursor-pointer"
                @click="handleDelete(data.id, data.weight, data.package)" />
              <NModal v-model:show="showModal" v-bind:close-on-esc="false" class="header">
                <NCard style="width: 300px" title="是否刪除此品項？" size="medium" role="card" aria-modal="true">
                  <template #footer>
                    <div class="flex justify-evenly items-center">
                      <div>
                        <button type="button"
                          class="px-[1.5vw] sm:px-[4vw] py-[.5vh] rounded-[5px] sm:text-base text-[#F5F5F5] bg-[#BDBDBD]"
                          @click="showModal = false">
                          取消
                        </button>
                      </div>
                      <div>
                        <button type="button"
                          class="px-[1.5vw] sm:px-[4vw] py-[.5vh] rounded-[5px] sm:text-base text-[#F5F5F5] bg-[#8F2E17]"
                          @click="handleClear()">
                          確定
                        </button>
                      </div>
                    </div>
                  </template>
                </NCard>
              </NModal>
            </div>
            <div>
              <img :src="data.img" class="w-[100px] h-[100px]" />
            </div>
            <div class="w-[15vw] sm:w-[30vw] mx-[1vw]">
              <div class="text-base text-[#5C6E58] mb-[1vh]">
                {{ data.name }}
              </div>
              <div class="text-sm text-[#9E9E9E]">
                {{ data.weight }} / {{ data.package }}
              </div>
            </div>
          </div>
          <div>NT$ {{ data.price }}</div>
          <div class="flex items-center ml-[2vw]">
            <img src="/img/all-item/minus.png" class="w-[35px] h-[35px] cursor-pointer"
              @click="handleMinusCount(data.id, data.weight, data.package)" />
            <div class="mx-[1vw] text-lg">{{ data.sum }}</div>
            <img src="/img/all-item/plus.png" class="w-[35px] h-[35px] cursor-pointer"
              @click="handlePlusCount(data.id, data.weight, data.package)" />
          </div>
          <div class="mx-[2vw]">NT$ {{ data.price * data.sum }}</div>
        </div>
      </div>
      <div class="w-[78vw] py-[4vh] flex justify-end">
        <div class="flex flex-col items-end">
          <div class="text-base text-[#616161]">合計　NT$ {{ total }}</div>
          <div class="my-[1vh] text-sm text-[#9E9E9E]">※ 運費、折扣將在結帳時計算</div>
          <button class="w-[250px] sm:w-[150px] py-[.8vh] text-[#616161] bg-[#F2D349] rounded-[0.3125rem]" type="submit"
            @click="handleSubmit">
            結帳
          </button>
        </div>
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: hsl(84, 12%, 67%, .5);
  border-radius: 50px;
}
</style>
