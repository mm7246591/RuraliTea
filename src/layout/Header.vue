<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted, ref, watchEffect } from "vue";
import { NModal, NCard, NBadge, NDropdown, NPopover, NSpin, useMessage } from "naive-ui";
import { useUserStore } from "@/stores/user";
import { router } from "@/router";

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

interface FavoriteItem {
  id: string;
  img: string;
  name: string;
  price: number;
  weight: string;
  package: string;
  sum: number;
}

firebaseConfig;
const db = getDatabase();
const userStore = useUserStore();
const provider = new GoogleAuthProvider();
const auth = getAuth();
const message = useMessage();
const items = ref<Item[] | null>(null);
const favoriteItem = ref<FavoriteItem[] | null>(null);
const showModal = ref<boolean>(false);
const showLoading = ref<boolean>(false);
const options = [
  {
    label: "登出",
    key: "登出",
  },
];

const handleSignIn = async () => {
  await signInWithPopup(auth, provider)
    .then(async (result) => {
      const item = { displayName: result.user.displayName };
      update(dref(db, `users/${result.user.displayName}`), {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
      });
      localStorage.setItem("user", JSON.stringify(item));
      getUser();
      getFavoriteItem();
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleWebSignOut = async () => {
  if (localStorage.user) {
    message.success("已成功登出！");
    signOut(auth)
      .then(async () => {
        await update(dref(db, `users/${userStore.userName}`), {
          uid: null,
          name: null,
          email: null,
        });
        localStorage.removeItem("user");
        userStore.userName = "";
        userStore.favoriteSum = 0;
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const handleUpdateShow = (show: boolean) => {
  if (show) userStore.showCar = true;
  else userStore.showCar = false;
};

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
          : (showModal.value = true);
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

const handleDelete = (SelectId: string, Weight: string, Package: string) => {
  if (favoriteItem.value) {
    favoriteItem.value?.forEach(async (item) => {
      if (item.id === SelectId && item.weight === Weight && item.package === Package) {
        await update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${item.name}_${item.weight}_${item.package}`
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
        );
      }
    });
  }
  showModal.value = false;
};

const handleClear = async () => {
  showLoading.value = true;
  await update(dref(db), { [`users/${userStore.userName}/favorites`]: null });
  showLoading.value = false;
  userStore.showCar = false;
};

const handleToCheckout = () => {
  userStore.showCar = false;
  router.push("/checkout/step1");
};

const getUser = () => {
  if (localStorage.user) {
    const { displayName } = JSON.parse(localStorage.user);
    userStore.userName = displayName;
  }
};

const getItem = () => {
  const teaRef = dref(db, `teas/`);
  onValue(teaRef, (snapshot) => {
    if (snapshot.exists()) {
      items.value = [...snapshot.val()];
    }
  });
};

const getFavoriteItem = () => {
  const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
  onValue(favoriteRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as FavoriteItem[];
      favoriteItem.value = data.filter((item) => item);
      userStore.favoriteSum = data.filter((item) => item).length;
    } else {
      favoriteItem.value = [];
      userStore.favoriteSum = 0;
    }
  });
  const carRef = dref(db, `users/${userStore.userName}/`);
  onValue(carRef, (snapshot) => {
    if (snapshot.exists()) {
      userStore.carWeight = snapshot.val().carWeight;
      userStore.carMaxSum = snapshot.val().carMaxSum;
      userStore.carId = snapshot.val().carId;
    }
  });
};

onMounted(() => {
  getItem();
  getUser();
  getFavoriteItem();
});

watchEffect(() => {
  if (items.value) {
    items.value.forEach((item) => {
      if (item.id === userStore.carId) {
        item.items.forEach(async (element) => {
          if (element.item === userStore.carWeight) {
            await update(dref(db, `users/${userStore.userName}/`), {
              carMaxSum: element.maxSum,
            });
            userStore.carMaxSum = element.maxSum;
          }
        });
      }
    });
  }
});
</script>

<template>
  <header
    class="lg:w-full lg:h-[13vh] flex justify-evenly items-center text-[#5C6E58] shadow-[0_4px_2px_0px_rgba(187,187,187,.25)]"
  >
    <div class="menu lg:w-1/2 flex justify-around items-center text-sm font-semibold">
      <RouterLink :to="{ name: 'Home' }" class="logo">
        <img
          class="lg:w-[3.75rem] lg:h-[3.75rem] object-contain cursor-pointer"
          src="/img/header/logo.png"
          alt=""
        />
      </RouterLink>
      <div class="lg:w-full flex justify-evenly">
        <RouterLink :to="{ name: 'AllTea' }">所有商品</RouterLink>
        <RouterLink :to="{ name: 'GiftBox' }">茶葉禮盒</RouterLink>
        <RouterLink :to="{ name: 'SeasonLimited' }">季節限定</RouterLink>
        <RouterLink :to="{ name: 'MountainTea' }">高山茶</RouterLink>
        <RouterLink :to="{ name: 'BlackTea' }">紅茶</RouterLink>
        <RouterLink :to="{ name: 'Contact' }">聯絡我們</RouterLink>
      </div>
    </div>
    <div class="lg:w-auto flex justify-evenly items-center font-['Noto_Sans_TC']">
      <div class="relative">
        <input
          type="text"
          id="search"
          name="search"
          autocomplete="off"
          maxlength="10"
          class="lg:w-[20rem] lg:h-[2rem] border-1 border-[#E0E0E0] rounded-[2.9375rem] shadow-[1px_1px_3px_1px_rgba(0,0,0,.25)] px-[1vw]"
        />
        <img
          src="/img/header/search.png"
          class="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-3 object-contain"
          alt=""
        />
      </div>
      <NBadge :value="userStore.favoriteSum" :max="999">
        <NPopover
          placement="bottom-end"
          trigger="manual"
          :show-arrow="false"
          :show="userStore.showCar"
          @update:show="handleUpdateShow"
        >
          <template #trigger>
            <img
              src="/img/header/car.png"
              class="lg:mx-[1vw] object-contain cursor-pointer"
              @click="userStore.showCar = !userStore.showCar"
            />
          </template>
          <NSpin :show="showLoading">
            <div v-if="userStore.favoriteSum" class="car">
              <div
                v-for="item of favoriteItem"
                :key="item.id"
                class="w-fit flex justify-center items-center"
              >
                <div class="my-[1vh]">
                  <img :src="item.img" class="w-[5rem] h-[5rem]" alt="" />
                </div>
                <div class="mx-[1vw]">
                  <div class="text-base text-[#5C6E58]">
                    {{ item.name }}
                  </div>
                  <div class="text-[#9E9E9E]">{{ item.weight }} / {{ item.package }}</div>
                  <div class="w-fit flex justify-center items-center">
                    <div class="text-[#9E9E9E]">數量：</div>
                    <div class="flex">
                      <img
                        src="/img/header/minus.png"
                        class="cursor-pointer"
                        @click="handleMinusCount(item.id, item.weight, item.package)"
                      />
                      <NModal
                        v-model:show="showModal"
                        v-bind:close-on-esc="false"
                        class="header"
                      >
                        <NCard
                          style="width: 300px"
                          title="是否刪除此品項？"
                          size="medium"
                          role="card"
                          aria-modal="true"
                        >
                          <template #footer>
                            <div class="flex justify-evenly items-center">
                              <div>
                                <button
                                  type="button"
                                  class="lg:px-[1.5vw] lg:py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                                  @click="showModal = false"
                                >
                                  取消
                                </button>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  class="lg:px-[1.5vw] lg:py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#8F2E17]"
                                  @click="
                                    handleDelete(item.id, item.weight, item.package)
                                  "
                                >
                                  確定
                                </button>
                              </div>
                            </div>
                          </template>
                        </NCard>
                      </NModal>
                      <div class="lg:mx-[.5vw] lg:my-auto">{{ item.sum }}</div>
                      <img
                        src="/img/header/plus.png"
                        class="cursor-pointer"
                        @click="handlePlusCount(item.id, item.weight, item.package)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-end lg:my-[1vh]">
                <button
                  class="lg:px-[1vw] lg:py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                  @click="handleClear"
                >
                  全部清空
                </button>
                <button
                  type="button"
                  class="lg:px-[1vw] lg:py-[.5vh] lg:ml-[.5vw] rounded-[5px] text-[#F5F5F5] bg-[#5C6E58]"
                  @click="handleToCheckout"
                >
                  訂單結帳
                </button>
              </div>
            </div>
            <div v-else>尚無商品</div>
          </NSpin>
        </NPopover>
      </NBadge>
      <div class="flex justify-center items-center text-lg">
        <img
          v-show="!userStore.userName"
          src="/img/header/member.png"
          class="object-contain cursor-pointer"
          alt=""
          @click="handleSignIn"
        />
        <NDropdown trigger="click" :options="options" @select="handleWebSignOut">
          <button class="mt-[1vh]">{{ userStore.userName }}</button>
        </NDropdown>
      </div>
    </div>
  </header>
</template>

<style>
.menu a {
  padding: 20px 0px;
}

.n-badge .n-badge-sup {
  height: 15px !important;
  line-height: 15px !important;
  padding: 0 6px !important;
  left: 65%;
}

.n-popover {
  width: auto !important;
  height: auto !important;
  padding: 2vh 1vw !important;
  margin: 1vh 1vw !important;
  border-radius: 1.25rem 0rem 1.25rem 1.25rem !important;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.25) !important;
}

.header {
  --n-border-radius: 5px !important;
  --n-title-text-color: #757575 !important;
  font-size: 16px !important;
  text-align: center;
}

.n-modal-mask {
  background-color: rgba(0, 0, 0, 0.3) !important;
}

.n-spin-container {
  --n-color: #8aa899 !important;
  --n-text-color: #8aa899 !important;
}

.router-link-exact-active {
  background: url("/img/header/triangle.png") no-repeat top center;
}
</style>
