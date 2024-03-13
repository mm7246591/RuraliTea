<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted, ref, watchEffect } from "vue";
import { NModal, NCard, NBadge, NDropdown, NPopover, NSpin, useMessage } from "naive-ui";
import { useUserStore } from "@/stores/user";
import { useRoute, useRouter } from "vue-router";

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
  availableSum: number
}

firebaseConfig;
const db = getDatabase();
const route = useRoute()
const router = useRouter();
const userStore = useUserStore();
const provider = new GoogleAuthProvider();
const auth = getAuth();
const message = useMessage();
const items = ref<Item[] | null>(null);
const favoriteItem = ref<FavoriteItem[] | null>(null);
const selectId = ref<string | null>(null)
const selectWeight = ref<string | null>(null)
const selectPackage = ref<string | null>(null)
const navbar = [
  {
    title: "所有商品",
    urlName: "AllTea",
  }, {
    title: "茶葉禮盒",
    urlName: "GiftBox",
  }, {
    title: "季節限定",
    urlName: "SeasonLimited",
  }, {
    title: "高山茶",
    urlName: "MountainTea",
  }, {
    title: "紅茶",
    urlName: "BlackTea",
  }, {
    title: "聯絡我們",
    urlName: "About",
  }]
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
        mail: result.user.email,
      });
      localStorage.setItem("user", JSON.stringify(item));
      getUser();
      getFavoriteItem();
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleSignOut = async () => {
  if (localStorage.user) {
    message.success("已成功登出！");
    signOut(auth)
      .then(async () => {
        await update(dref(db, `users/${userStore.userName}`), {
          uid: null,
          name: null,
          mail: null,
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
  if (show)
    userStore.showCar = true;
};

const handleMinusCount = async (SelectId: string, Weight: string, Package: string) => {
  if (favoriteItem.value) {
    await update(dref(db, `users/${userStore.userName}/`), {
      carId: SelectId,
    });
    await update(dref(db, `users/${userStore.userName}/`), {
      carWeight: Weight,
    });
    selectId.value = SelectId
    selectWeight.value = Weight
    selectPackage.value = Package
    favoriteItem.value.forEach(async (item) => {
      if (item.id === SelectId && item.weight === Weight && item.package === Package && item.sum === 1) {
        showModal.value = true
      } else if (item.id === SelectId && item.weight === Weight && item.package === Package && item.sum > 1) {
        await update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${item.name}_${item.weight}_${item.package}`
          ),
          {
            sum: (item.sum -= 1),
            availableSum: item.availableSum += 1
          }
        )
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
      if (item.id === SelectId && item.weight === Weight && item.package === Package && item.sum < userStore.carMaxSum) {
        update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${item.name}_${item.weight}_${item.package}`
          ),
          {
            sum: (item.sum += 1),
            availableSum: item.availableSum -= 1
          }
        )
      }
    });
  }
};

const handleDelete = () => {
  if (favoriteItem.value) {
    favoriteItem.value.forEach(async (item) => {
      if (item.id === selectId.value && item.weight === selectWeight.value && item.package === selectPackage.value) {
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
            availableSum: null
          }
        ).then(() => {
          showModal.value = false;
        });
      }
    });
  }
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

const getItem = () => {
  const teaRef = dref(db, `teas/`);
  onValue(teaRef, (snapshot) => {
    if (snapshot.exists()) {
      items.value = [...Object.values(snapshot.val()) as Item[]]
    }
  });
};

const getUser = () => {
  if (localStorage.user) {
    const { displayName } = JSON.parse(localStorage.user);
    userStore.userName = displayName;
  }
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
        Object.values(item.items).forEach(async (element) => {
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
    class="w-full sm:w-[90vw] h-[13vh] sm:h-[8vh] flex justify-evenly sm:justify-between items-center sm:mx-auto text-[#5C6E58] lg:shadow-[0_4px_2px_0px_rgba(187,187,187,.25)]">
    <div class="logo hidden sm:flex items-center">
      <RouterLink :to="{ name: 'Home' }">
        <img class="w-[32px] object-contain cursor-pointer" src="/img/header/logo.png" alt="" />
      </RouterLink>
      <div class="ml-[2vw] font-semibold tracking-[.2em]">關於山丘</div>
    </div>
    <div class="menu sm:hidden w-1/2 flex justify-around items-center text-sm font-semibold">
      <RouterLink :to="{ name: 'Home' }" class="logo">
        <img class="w-[56px] object-contain cursor-pointer" src="/img/header/logo.png" alt="" />
      </RouterLink>
      <div v-for="(data, index) of navbar" :key="data.urlName" class="flex justify-evenly" v-show="index > 0">
        <RouterLink :to="{ name: data.urlName }">{{ data.title }}</RouterLink>
      </div>
    </div>
    <div class="w-auto flex justify-evenly items-center">
      <div class="relative sm:hidden">
        <input type="text" id="search" name="search" autocomplete="off" maxlength="10"
          class="w-[20rem] h-[2rem] border-1 border-[#E0E0E0] rounded-[2.9375rem] shadow-[1px_1px_3px_1px_rgba(0,0,0,.25)] px-[1vw]" />
        <img src="/img/header/search.png"
          class="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-3 object-contain" alt="" />
      </div>
      <div class="flex items-center">
        <NBadge :value="userStore.favoriteSum" :max="999">
          <NPopover placement="bottom-end" trigger="click" :show-arrow="false" :show="userStore.showCar"
            @update:show="handleUpdateShow">
            <template #trigger>
              <img src="/img/header/car.png" class="mx-[1vw] sm:mx-[1.5vw] object-contain cursor-pointer"
                @click="userStore.showCar = !userStore.showCar" />
            </template>
            <NSpin :show="showLoading">
              <div v-if="userStore.favoriteSum" class="car">
                <div v-for="data of favoriteItem" :key="data.id" class="w-fit flex justify-center items-center">
                  <div class="my-[1vh]">
                    <img :src="data.img" class="w-[5rem] h-[5rem]" alt="" />
                  </div>
                  <div class="mx-[1vw]">
                    <div class="text-base text-[#5C6E58]">
                      {{ data.name }}
                    </div>
                    <div class="text-[#9E9E9E]">{{ data.weight }} / {{ data.package }}</div>
                    <div class="w-fit flex justify-center items-center">
                      <div class="text-[#9E9E9E]">數量：</div>
                      <div class="flex">
                        <img src="/img/header/minus.png" class="cursor-pointer"
                          @click="handleMinusCount(data.id, data.weight, data.package)" />
                        <NModal v-model:show="showModal" v-bind:close-on-esc="false" class="header">
                          <NCard style="width: 300px" title="是否刪除此品項？" size="medium" role="card" aria-modal="true">
                            <template #footer>
                              <div class="flex justify-evenly items-center">
                                <div>
                                  <button type="button"
                                    class="px-[1.5vw] py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                                    @click="showModal = false">
                                    取消
                                  </button>
                                </div>
                                <div>
                                  <button type="button"
                                    class="px-[1.5vw] py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#8F2E17]"
                                    @click="handleDelete">
                                    確定
                                  </button>
                                </div>
                              </div>
                            </template>
                          </NCard>
                        </NModal>
                        <div class="mx-[.5vw] my-auto">{{ data.sum }}</div>
                        <img src="/img/header/plus.png" class="cursor-pointer"
                          @click="handlePlusCount(data.id, data.weight, data.package)" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-end my-[1vh]">
                  <button class="px-[1vw] sm:px-[2vw] py-[.5vh] rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                    @click="handleClear">
                    全部清空
                  </button>
                  <button type="button"
                    class="px-[1vw] sm:px-[2vw] sm:mx-[2vw] py-[.5vh] mx-[.5vw] rounded-[5px] text-[#F5F5F5] bg-[#5C6E58]"
                    @click="handleToCheckout">
                    訂單結帳
                  </button>
                </div>
              </div>
              <div v-else>尚無商品</div>
            </NSpin>
          </NPopover>
        </NBadge>
        <div class="flex justify-center items-center text-lg">
          <img v-show="!userStore.userName" src="/img/header/member.png" class="object-contain cursor-pointer" alt=""
            @click="handleSignIn" />
          <NDropdown trigger="click" :options="options" @select="handleSignOut">
            <button>{{ userStore.userName }}</button>
          </NDropdown>
        </div>
      </div>
    </div>
  </header>
  <div :class="route.meta.name === '結帳' ? 'hidden' : 'flex'" class="lg:hidden navbar my-[2vh]">
    <div class="flex w-[100vw] overflow-x-scroll overflow-y-hidden">
      <div v-for="data of navbar" :key="data.urlName">
        <RouterLink :to="{ name: data.urlName }"
          class="flex justify-center items-center w-[20vw] 2sm:w-[25vw] px-[1vw] py-[.5vh] mx-[1vw] text-center border border-[#5C6E58] font-semibold rounded-[33px] bg-[#F5F5F5] text-[#5C6E58]">
          {{ data.title }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style>
.navbar ::-webkit-scrollbar {
  display: none;
}

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
  background-color: rgba(0, 0, 0, 0.2) !important;
}

.n-spin-container {
  --n-color: #8aa899 !important;
  --n-text-color: #8aa899 !important;
}

.menu .router-link-exact-active {
  background: url("/img/header/triangle.png") no-repeat top center;
}

.navbar .router-link-exact-active {
  color: #F5F5F5;
  background-color: #5C6E58;
  font-weight: normal;
}
</style>
