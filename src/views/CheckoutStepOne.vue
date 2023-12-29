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
const showLoading = ref<boolean>(false);
const showModal = ref<boolean>(false);
const total = ref<number | any>(0);
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
              `users/${userStore.userName}/favorites/${item.name}_${Weight}_${Package}`
            ),
            {
              sum: (item.sum -= 1),
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
              `users/${userStore.userName}/favorites/${item.name}_${Weight}_${Package}`
            ),
            {
              sum: (item.sum += 1),
            }
          )
          : item.sum;
      }
    });
  }
};

const handleDelete = async (SelectId: string, Weight: string, Package: string) => {
  showLoading.value = true;
  if (favoriteItem.value) {
    favoriteItem.value?.forEach(async (item) => {
      if (item.id === SelectId && item.weight === Weight && item.package === Package) {
        await update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${item.name}_${Weight}_${Package}`
          ),
          {
            id: null,
            img: null,
            name: null,
            price: null,
            package: null,
            weight: null,
            sum: null,
          }
        ).then(async () => {
          showLoading.value = false;
        });
      }
    });
  }
};

const handleSubmit = () => {
  router.push("/checkout/step2");
};

const getFavoriteItem = () => {
  const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
  onValue(favoriteRef, (snapshot) => {
    if (snapshot.exists()) {
      favoriteItem.value = Object.values(snapshot.val()).filter((item) => item) as FavoriteItem[];
      total.value = favoriteItem.value.reduce((acc, cur) => acc.price * acc.sum + cur.price * cur.sum as any);
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
  }
});
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <div class="lg:w-[60vw] lg:h-[20vh] flex justify-evenly items-center lg:mx-auto">
      <div v-for="step of steps" :key="step.id" :class="step.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
        class="relative test lg:w-[55px] lg:h-[55px] flex justify-center items-center rounded-full">
        <div class="text-3xl text-[#F5F5F5]">{{ step.id }}</div>
        <div :class="step.process ? 'text-[#5C6E58]' : 'text-[#BDBDBD]'"
          class="absolute w-[8vw] text-center -bottom-3 translate-y-full text-base">
          {{ step.text }}
        </div>
        <div v-show="step.id !== 3" class="absolute w-[13vw] h-[3px] left-full bg-[#E0E0E0]"></div>
      </div>
    </div>
    <NSpin :show="showLoading">
      <div class="lg:w-[80vw] flex flex-col lg:pb-[4vh] border-b border-[#E0E0E0]">
        <div class="lg:py-[2vh] flex items-center text-xl text-[#FAFAFA] bg-[#8AA899]">
          <div class="mx-[2vw]">購物車商品 ({{ userStore.favoriteSum }} 件)</div>
        </div>
        <div class="lg:py-[1vh] flex items-center text-base text-[#616161] bg-[#FAFAFA]">
          <div class="lg:w-full flex justify-between tracking-wider">
            <div class="lg:mx-[6vw]">商品資料</div>
            <div class="lg:w-[120px] text-end">價格</div>
            <div class="lg:w-[8vw] text-center">購買數量</div>
            <div class="lg:mx-[2vw]">小計</div>
          </div>
        </div>
        <div v-for="item of favoriteItem" :key="item.id"
          class="flex justify-between items-center text-lg lg:py-[2vh] text-[#616161] bg-[#FAFAFA] c">
          <div class="flex justify-center items-center">
            <div class="lg:mx-[2vw]">
              <img src="/img/all-item/delete.jpg" class="cursor-pointer" @click="showModal = true" />
              <NModal v-model:show="showModal" v-bind:close-on-esc="false" class="header">
                <NCard style="width: 300px" title="是否刪除此品項？" size="medium" role="card" aria-modal="true">
                  <template #footer>
                    <div class="flex justify-evenly items-center">
                      <div>
                        <button type="button" class="lg:px-[1.5vw] lg:py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                          @click="showModal = false">
                          取消
                        </button>
                      </div>
                      <div>
                        <button type="button" class="lg:px-[1.5vw] lg:py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#8F2E17]"
                          @click="handleDelete(item.id, item.weight, item.package)">
                          確定
                        </button>
                      </div>
                    </div>
                  </template>
                </NCard>
              </NModal>
            </div>
            <div>
              <img :src="item.img" class="w-[5rem] h-[5rem]" />
            </div>
            <div class="lg:mx-[1vw]">
              <div class="!text-base !text-[#5C6E58] lg:mb-[1vh]">
                {{ item.name }}
              </div>
              <div class="!text-sm !text-[#9E9E9E]">
                {{ item.weight }} / {{ item.package }}
              </div>
            </div>
          </div>
          <div>NT$ {{ item.price }}</div>
          <div class="flex lg:ml-[2vw]">
            <img src="/img/all-item/minus.png" class="w-[35px] h-[35px] cursor-pointer"
              @click="handleMinusCount(item.id, item.weight, item.package)" />
            <div class="lg:mx-[1vw] lg:my-auto text-lg">{{ item.sum }}</div>
            <img src="/img/all-item/plus.png" class="w-[35px] h-[35px] cursor-pointer"
              @click="handlePlusCount(item.id, item.weight, item.package)" />
          </div>
          <div class="lg:mx-[2vw]">NT$ {{ item.price * item.sum }}</div>
        </div>
      </div>
    </NSpin>
    <div class="lg:w-[78vw] lg:py-[4vh] flex justify-end">
      <div class="flex flex-col items-end">
        <div class="text-base text-[#616161]">合計　NT$ {{ total }}</div>
        <div class="lg:my-[1vh] text-sm text-[#9E9E9E]">※ 運費、折扣將在結帳時計算</div>
        <button class="lg:w-[250px] lg:py-[.8vh] text-[#616161] bg-[#F2D349] rounded-[0.3125rem]" type="submit"
          @click="handleSubmit">
          結帳
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
