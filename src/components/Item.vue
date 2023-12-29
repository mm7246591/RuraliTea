<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { NRadioGroup, NRadioButton, NModal, NCard, NIcon, useMessage } from "naive-ui";
import { CheckmarkSharp } from "@vicons/ionicons5";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

interface SelectItem {
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

interface Weight {
  value: string;
  label: string;
}

interface Props {
  id: string | null;
}

const db = getDatabase();
const userStore = useUserStore();
const router = useRouter();
const props = defineProps<Props>();
const message = useMessage();
const selectItem = ref<SelectItem[] | null>(null);
const favoriteItem = ref<FavoriteItem[] | null>(null);
const scaleImg = ref<string>("");
const notAvailableItem = ref<string>("");
const alreadyMaxItem = ref<string>("");
const selectWeight = ref<string | null>(null);
const selectPackage = ref<string | null>(null);
const count = ref<number>(1);
const maxSum = ref<number>(1);
const availableSum = ref<number>(1);
const showModal = ref<boolean>(false);
const isAlreadyHave = ref<boolean>(false);
const isNotAvailable = ref<boolean>(false);

const weight = ref<Weight[]>([]);

const packages = [
  {
    value: "真空袋",
    label: "真空袋",
  },
  {
    value: "罐裝",
    label: "罐裝",
  },
];

const handleScale = (SelectIdImg: string) => {
  scaleImg.value = SelectIdImg;
};

const handleMinusCount = () => {
  count.value > 1 ? (count.value -= 1) : count.value;
};

const handlePlusCount = () => {
  if (availableSum.value > count.value) {
    count.value += 1;
  }
};

const handleAddCar = async () => {
  if (localStorage.user && selectItem.value) {
    if (selectWeight.value && selectPackage.value) {
      showModal.value = true;
      const selected = selectItem.value[0];
      const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
      onValue(
        favoriteRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = Object.values(snapshot.val()) as FavoriteItem[];
            data.forEach(async (item) => {
              if (
                item.weight === selectWeight.value &&
                item.package === selectPackage.value &&
                maxSum.value - count.value >= 0
              ) {
                isAlreadyHave.value = true;
                await update(
                  dref(
                    db,
                    `users/${userStore.userName}/favorites/${selected.name}_${selectWeight.value}_${selectPackage.value}`
                  ),
                  {
                    sum: (item.sum += count.value),
                    availableSum: maxSum.value - item.sum
                  }
                );
              }
            });
          }
        },
        {
          onlyOnce: true,
        }
      );
      if (!isAlreadyHave.value) {
        await update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${selected.name}_${selectWeight.value}_${selectPackage.value}`
          ),
          {
            id: selected.id,
            img: selected.img,
            name: selected.name,
            price: selected.price,
            weight: selectWeight.value,
            package: selectPackage.value,
            sum: count.value,
            availableSum: maxSum.value - count.value
          }
        );
      }
      isAlreadyHave.value = false;
      setTimeout(() => {
        showModal.value = false;
      }, 1500);
    } else {
      message.warning("請選擇商品");
    }
  } else {
    message.warning("請先登入會員！");
  }
};

const handleSubmit = async () => {
  if (localStorage.user && selectItem.value) {
    if (selectWeight.value && selectPackage.value) {
      const selected = selectItem.value[0];
      const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
      onValue(
        favoriteRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = Object.values(snapshot.val()) as FavoriteItem[];
            data.forEach(async (item) => {
              if (
                item.weight === selectWeight.value &&
                item.package === selectPackage.value &&
                maxSum.value - count.value >= 0
              ) {
                isAlreadyHave.value = true;
                await update(
                  dref(
                    db,
                    `users/${userStore.userName}/favorites/${selected.name}_${selectWeight.value}_${selectPackage.value}`
                  ),
                  {
                    sum: item.sum += count.value,
                    availableSum: maxSum.value - item.sum
                  }
                );
              }
            });
          }
        },
        {
          onlyOnce: true,
        }
      );
      if (!isAlreadyHave.value) {
        await update(
          dref(
            db,
            `users/${userStore.userName}/favorites/${selected.name}_${selectWeight.value}_${selectPackage.value}`
          ),
          {
            id: selected.id,
            img: selected.img,
            name: selected.name,
            price: selected.price,
            weight: selectWeight.value,
            package: selectPackage.value,
            sum: count.value,
            availableSum: maxSum.value - count.value
          }
        );
      }
      isAlreadyHave.value = false;
      router.push("/checkout");
    } else {
      message.warning("請選擇商品");
    }
  } else {
    message.warning("請先登入會員！");
  }
};

const getItem = () => {
  const teaRef = dref(db, `/teas`);
  onValue(teaRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as SelectItem[]
      selectItem.value = data.filter(item => item.id === props.id)
      selectItem.value.forEach(item => {
        scaleImg.value = item.pictures[0].img;
        item.items.forEach(element => {
          weight.value.push({ value: element.item, label: element.item });
        })
      })
    }
  });
};

const getFavoriteItem = () => {
  const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
  onValue(favoriteRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as FavoriteItem[];
      favoriteItem.value = data;
    } else {
      availableSum.value = maxSum.value
    }
  });
};

onMounted(() => {
  getItem();
  getFavoriteItem();
});

watchEffect(() => {
  if (selectItem.value) {
    selectItem.value.forEach((item) => {
      item.items.forEach((element) => {
        if (element.maxSum === 0) {
          notAvailableItem.value = element.item;
          isNotAvailable.value = true;
        }
        if (element.item === selectWeight.value) {
          count.value = 1;
          maxSum.value = element.maxSum;
        }
        if (favoriteItem.value) {
          favoriteItem.value.forEach((item) => {
            if (item.id === props.id && item.weight === selectWeight.value) {
              availableSum.value = item.availableSum
            }
            if (item.id === props.id && item.weight !== selectWeight.value) {
              availableSum.value = maxSum.value
            }
            if (
              item.id === props.id &&
              item.weight === selectWeight.value &&
              item.sum >= maxSum.value
            ) {
              alreadyMaxItem.value = item.weight;
            }
            if (
              item.id === props.id &&
              item.weight === selectWeight.value &&
              item.sum < maxSum.value
            ) {
              alreadyMaxItem.value = "";
            }
          });
        } else {
          availableSum.value = maxSum.value
        }
      });
    });
  }
});
</script>

<template>
  <div class="lg:w-full lg:h-[80vh] flex justify-center items-center">
    <div v-for="item of selectItem" :key="item.id" class="lg:h-full flex flex-col lg:mx-[5vw]">
      <div class="lg:mx-auto">
        <img :src="scaleImg" class="w-[500px] object-contain" />
      </div>
      <div class="lg:w-[510px] flex lg:mx-auto">
        <div v-for="picture of item.pictures" :key="picture.id" class="lg:mx-[.25vw] lg:my-[1vh]">
          <img :src="picture.img" :class="
            scaleImg === picture.img
              ? 'opacity-50 cursor-auto'
              : 'opacity-100  cursor-pointer'
          " class="object-contain" @click="handleScale(picture.img)" />
        </div>
      </div>
    </div>
    <div v-for="item of selectItem" :key="item.id" class="lg:w-[40vw] lg:h-full flex flex-col text-left lg:mx-[2.5vw]">
      <div class="text-2xl text-[#8F2E17]">{{ item.name }}</div>
      <div class="lg:py-[2vh] text-base text-[#757575]">{{ item.intro }}</div>
      <div class="border border-[#8AA899]"></div>
      <div class="lg:my-[2vh] text-2xl text-[#D0310C] font-bold">
        NT$ {{ item.price }}
      </div>
      <div>
        <div class="group lg:h-[20vh] lg:mb-[2vh]">
          <div class="text-lg text-[#424242]">購買克數：</div>
          <NRadioGroup v-model:value="selectWeight" name="weight">
            <NRadioButton v-for="item of weight" :key="item.value" :value="item.value" :label="item.label"
              :disabled="notAvailableItem === item.label && isNotAvailable" />
          </NRadioGroup>
        </div>
        <div class="package">
          <div class="lg:mb-[2vh] text-lg text-[#424242]">包裝方式：</div>
          <div class="flex justify-between items-center">
            <NRadioGroup v-model:value="selectPackage" name="packages">
              <NRadioButton v-for="item of packages" :key="item.value" :value="item.value" :label="item.label" />
            </NRadioGroup>
            <div class="flex justify-center items-end">
              <div class="flex">
                <img src="/img/all-item/minus.png" class="cursor-pointer" @click="handleMinusCount" />
                <div class="lg:mx-[1vw] lg:my-auto text-lg">{{ count }}</div>
                <img src="/img/all-item/plus.png" class="cursor-pointer" @click="handlePlusCount" />
              </div>
            </div>
          </div>
          <div class="flex justify-end lg:my-[1vh] lg:mx-[1vw]">
            <div class="lg:my-auto text-sm text-[#757575]">剩餘數量{{ maxSum }}</div>
          </div>
          <div class="lg:w-full flex justify-end lg:mt-[1vh]">
            <button type="button" class="lg:px-[2vw] lg:py-[1vh] lg:mx-[1vw] rounded-[5px] text-[#F5F5F5] bg-[#5C6E58]"
              :class="alreadyMaxItem === selectWeight ? 'opacity-50' : 'opacity-100'"
              :disabled="alreadyMaxItem === selectWeight" @click="handleAddCar">
              加入購物車
            </button>
            <NModal v-model:show="showModal" :mask-closable="false" v-bind:close-on-esc="false" class="item">
              <NCard style="width: 600px" :bordered="false" size="huge" role="card">
                商品已加入購物車！
                <template #footer>
                  <NIcon size="40">
                    <CheckmarkSharp class="text-[green]" />
                  </NIcon>
                </template>
              </NCard>
            </NModal>
            <button type="button" class="lg:px-[2vw] lg:py-[1vh] rounded-[5px] text-[#F5F5F5] bg-[#8F2E17]"
              @click="handleSubmit">
              立即購買
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.n-radio-group {
  --n-font-size: 16px !important;
  --n-button-border-color: #757575 !important;
  --n-button-border-color-active: #757575 !important;
  --n-button-border-radius: 0.3125rem !important;
  --n-button-box-shadow-focus: #757575 !important;
  --n-button-text-color-hover: #757575 !important;
  --n-button-text-color-active: #757575 !important;
  --n-button-text-color: #757575 !important;
}

.group .n-radio-group {
  display: flex;
  flex-wrap: wrap;
  width: 300px;
}

.group .n-radio-group .n-radio-button {
  border: 1px solid #757575;
  margin: 1vh 1vw 1vh 0vw;
  border-radius: 0.32125rem;
  transition: none;
}

.package .n-radio-group .n-radio-button {
  border: 1px solid #757575;
  margin: 0vh 1vw 0vh 0vw;
  border-radius: 0.32125rem;
  transition: none;
}

.n-radio-group.n-radio-group--button-group .n-radio-group__splitor {
  display: none;
}

.n-radio-group .n-radio-button:first-child,
.n-radio-group .n-radio-button:last-child {
  border: 1px solid #757575;
}

.n-radio-group .n-radio-button.n-radio-button--checked {
  border: 1px solid #8aa899;
  background: #8aa899;
  color: #f5f5f5;
}

.n-radio-group .n-radio-button.n-radio-button--checked .n-radio-button--focus {
  border: 1px solid #8aa899;
  background: #8aa899;
  color: #f5f5f5;
}

.n-radio-group .n-radio-button:not(.n-radio-button--disabled):hover:not(.n-radio-button--checked) {
  color: #757575;
}

.item {
  text-align: center;
  --n-font-size: 20px !important;
}
</style>
