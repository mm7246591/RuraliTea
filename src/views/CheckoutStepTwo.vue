<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { useUserStore } from "@/stores/user";
import { getDatabase, ref as dref, onValue, update } from "firebase/database";
import { useMessage } from 'naive-ui';
import { onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

interface Step {
  id: number;
  text: string;
  process: boolean
}

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

interface SelectedItem {
  name: string;
  weight: string;
  package: string;
  sum: number;
  availableSum: number
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
const userStore = useUserStore();
const router = useRouter()
const message = useMessage()
const firstName = ref<string | null>(null)
const lastName = ref<string | null>(null)
const phone = ref<number | null>(null)
const mail = ref<string | null>(null)
const getFirstName = ref<string | null>(null)
const getLastName = ref<string | null>(null)
const getPhone = ref<number | null>(null)
const getMail = ref<string | null>(null)
const getStore = ref<string | null>(null)
const supermarket = ref<string>('7-ELEVEN')
const sameInfo = ref<boolean>(false)
const total = ref<number | any>(0);
const fare = ref<number>(60);
const lastNameRef = ref<HTMLInputElement | null>(null)
const steps = ref<Step[]>([
  {
    id: 1,
    text: "訂單確認",
    process: true,
  },
  {
    id: 2,
    text: "結帳",
    process: true,
  },
  {
    id: 3,
    text: "完成訂購",
    process: false,
  },
]);
const items = ref<Item[] | null>(null);
const selectedItem = ref<SelectedItem[]>([])
const handleSubmit = async () => {
  // const ChineseRule = /^[\u4E00-\u9FA5]+$/
  // const phoneRule = /^09[0-9]{8}$/
  // const mailRule = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  // if (!firstName.value || !lastName.value || !phone.value || !mail.value || !getFirstName.value || !getLastName.value || !getPhone.value || !getMail.value || !getStore.value) {
  //   message.info("尚有空格未輸入")
  // }
  // else if (!ChineseRule.test(firstName.value) || !ChineseRule.test(lastName.value) || !ChineseRule.test(getFirstName.value) || !ChineseRule.test(getLastName.value) || !ChineseRule.test(getStore.value)) {
  //   message.info("只能輸入中文")
  // }
  // else if (!phoneRule.test(String(phone.value)) || !phoneRule.test(String(getPhone.value))) {
  //   message.info("手機號碼格式不對")
  // } else if (!mailRule.test(mail.value) || !mailRule.test(getMail.value)) {
  //   message.info("信箱格式不對")
  // }
  // else {
  //   const data = [{
  //     infoName: `${getLastName.value}${getFirstName.value}`,
  //     phone: getPhone.value,
  //     mail: getMail.value,
  //     store: `${getStore.value} 全家`,
  //     total: total.value - fare.value
  //   }, ...selectedItem.value]
  //   await update(dref(db, `users/${userStore.userName}/`), {
  //     info: data
  //   });
  //   selectedItem.value.forEach(async (item) => {
  //     await update(
  //       dref(
  //         db,
  //         `/teas/${item.name}/items/${item.weight}`
  //       ),
  //       {
  //         maxSum: item.availableSum
  //       }
  //     )
  //   })
  //   await update(dref(db, `users/${userStore.userName}/`), {
  //     carId: null,
  //     carMaxSum: null,
  //     carWeight: null,
  //   });
  //   await update(dref(db, `users/${userStore.userName}/`), {
  //     favorites: null
  //   }
  //   );
  //   router.push('/checkout/step3')
  // }
  const data = [{
    infoName: `${getLastName.value}${getFirstName.value}`,
    phone: getPhone.value,
    mail: getMail.value,
    store: `${getStore.value} 全家`,
    total: total.value - fare.value
  }, ...selectedItem.value]
  await update(dref(db, `users/${userStore.userName}/`), {
    info: data
  });
  router.push('/checkout/step3')
}

const getItem = () => {
  const teaRef = dref(db, `/teas`);
  onValue(teaRef, (snapshot) => {
    if (snapshot.exists()) {
      items.value = Object.values(snapshot.val()) as Item[]
    }
  });
};

const getFavoriteItem = () => {
  const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
  onValue(favoriteRef, async (snapshot) => {
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val()) as FavoriteItem[];
      data.forEach(item => {
        selectedItem.value.push({ name: item.name, weight: item.weight, package: item.package, sum: item.sum, availableSum: item.availableSum })
      })
      total.value = data.reduce((acc, cur) =>
        acc + cur.price * cur.sum, 0
      )
    }
  });
};

onMounted(() => {
  getItem()
  getFavoriteItem()
  lastNameRef.value && lastNameRef.value.focus()
})

watchEffect(() => {
  if (sameInfo.value && firstName.value && lastName.value && phone.value && mail.value) {
    getFirstName.value = firstName.value
    getLastName.value = lastName.value
    getPhone.value = phone.value
    getMail.value = mail.value
  }
})
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <div class="w-[60vw] sm:w-[85vw] h-[15vh] flex justify-evenly sm:justify-between">
      <div v-for="data of steps" :key="data.id" :class="data.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
        class="relative w-[55px] sm:w-[48px] h-[55px] sm:h-[48px] flex justify-center items-center rounded-full">
        <div class="text-3xl text-[#F5F5F5]">{{ data.id }}</div>
        <div :class="data.process ? 'text-[#5C6E58]' : 'text-[#BDBDBD]'"
          class="absolute w-[8vw] sm:w-[20vw] text-center -bottom-3 translate-y-full text-base">
          {{ data.text }}
        </div>
        <div v-show="data.id !== 3" :class="data.text === '訂單確認' ? 'bg-[#9E9E9E]' : 'bg-[#E0E0E0]'"
          class="absolute w-[13vw] sm:w-[28vw] h-[3px] left-full"></div>
      </div>
    </div>
    <div class="w-[80vw] sm:w-[90vw] my-[2vh] sm:my-0 flex sm:flex-col">
      <div class="flex flex-col">
        <div class="flex flex-col w-[45vw] sm:w-full mx-[2vw] sm:mx-0 sm:my-[2vh]">
          <div class="bg-[#8AA899] text-[#FAFAFA] py-[2vh] px-[2vw] sm:px-[4vw] text-lg">聯絡資訊</div>
          <div class="bg-[#FAFAFA] px-[2vw]">
            <div class="flex sm:hidden justify-evenly mx-[1vw] my-[2vh]">
              <input v-model.trim="lastName" type="text" placeholder="姓氏" ref="lastNameRef"
                class="w-full px-[1vw] mr-[1vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
              <input v-model.trim="firstName" type="text" placeholder="名字"
                class="w-full px-[1vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="lg:hidden mx-[2vw] my-[2vh]">
              <input v-model.trim="lastName" type="text" placeholder="姓氏" ref="lastNameRef"
                class="w-full px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="lg:hidden mx-[2vw] my-[2vh]">
              <input v-model.trim="firstName" type="text" placeholder="名字"
                class="w-full px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="mx-[1vw] sm:mx-[2vw] my-[2vh]">
              <input v-model.trim="phone" pattern="/^1[34578]\d{9}$/" type="tel" placeholder="手機號碼"
                class="w-full px-[1vw] sm:px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="mx-[1vw] sm:mx-[2vw] my-[2vh]">
              <input v-model.trim="mail" type="mail" placeholder="電子郵件"
                class="w-full px-[1vw] sm:px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
          </div>
        </div>
        <div class="flex flex-col w-[45vw] sm:w-full mx-[2vw] sm:mx-0 my-[2vh]">
          <div class="bg-[#8AA899] text-[#FAFAFA] py-[2vh] px-[2vw] sm:px-[4vw] text-lg">寄送方式（僅超商貨到付款）</div>
          <div class="bg-[#FAFAFA] px-[2vw]">
            <div class="flex sm:mx-[2vw] my-[2vh]">
              <input type="radio" id="seven" name="supermarket" value="7-ELEVEN" v-model="supermarket" checked />
              <label for="seven"
                :class="supermarket === '7-ELEVEN' ? 'bg-[#8AB0B5] text-[#FAFAFA]' : 'bg-[#FFFFFF] text-[#9E9E9E]'"
                class="flex items-center w-full px-[1vw] sm:px-[2vw] mx-[1vw] h-[5vh] rounded-md border-2 border-[#8AA899]">7-ELEVEN（統一超商）</label>
            </div>
            <div class="flex sm:mx-[2vw] my-[2vh]">
              <input type="radio" id="family" name="supermarket" value="全家" v-model="supermarket" />
              <label for="family"
                :class="supermarket === '全家' ? 'bg-[#8AB0B5] text-[#FAFAFA]' : 'bg-[#FFFFFF] text-[#9E9E9E]'"
                class="flex items-center w-full px-[1vw] sm:px-[2vw] mx-[1vw] h-[5vh] rounded-md border-2 border-[#8AA899]">全家便利商店</label>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-[45vw] sm:w-full mx-[2vw] sm:mx-0 my-[2vh]">
          <div class="bg-[#8AA899] text-[#FAFAFA] py-[2vh] px-[2vw] text-lg">收件資訊</div>
          <div class="bg-[#FAFAFA] px-[2vw]">
            <div class="flex sm:hidden justify-evenly mx-[1vw] my-[2vh]">
              <input v-model.trim="getLastName" type="text" placeholder="收件人姓氏"
                class="w-full px-[1vw] mr-[1vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
              <input v-model.trim="getFirstName" type="text" placeholder="收件人名字"
                class="w-full px-[1vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="lg:hidden mx-[2vw] my-[2vh]">
              <input v-model.trim="getLastName" type="text" placeholder="收件人姓氏"
                class="w-full px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="lg:hidden mx-[2vw] my-[2vh]">
              <input v-model.trim="getFirstName" type="text" placeholder="收件人名字"
                class="w-full px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="mx-[1vw] sm:mx-[2vw] my-[2vh]">
              <input v-model.trim="getPhone" pattern="/^1[34578]\d{9}$/" type="tel" placeholder="收件人手機號碼"
                class="w-full px-[1vw] sm:px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="mx-[1vw] sm:mx-[2vw] my-[2vh]">
              <input v-model.trim="getMail" type="mail" placeholder="收件人電子郵件"
                class="w-full px-[1vw] sm:px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="mx-[1vw] sm:mx-[2vw] my-[2vh]">
              <input v-model.trim="getStore" type="mail" placeholder="7-ELEVEN 門市名稱"
                class="w-full px-[1vw] sm:px-[4vw] h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
            </div>
            <div class="flex justify-end mx-[1vw] sm:mx-[2vw] sm:my-[1vh]">
              <input type="checkbox" id="same" name="same" v-model="sameInfo" />
              <label for="same" class="mx-[.5vw] text-[#9E9E9E]">收件資訊同聯絡資訊</label>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center w-[35vw] sm:w-full text-base sm:-order-1">
        <div class="w-full mx-auto py-[2vh] text-xl text-[#616161] text-center border-b border-[#BDBDBD] bg-[#FAFAFA]">
          付款金額
        </div>
        <div class="w-full py-[2vh] text-[#9E9E9E] bg-[#FAFAFA]">
          <div class="flex justify-between px-[2vw]">
            <div>合計</div>
            <div>NT $ {{ total }}</div>
          </div>
          <div class="flex justify-between my-[2vh] px-[2vw]">
            <div>運費</div>
            <div>NT $ {{ fare }}</div>
          </div>
          <div class="flex justify-between px-[2vw]">
            <div>折扣</div>
            <div>- 0</div>
          </div>
        </div>
        <div
          class="flex justify-between w-full py-[2vh] px-[2vw] text-[#5C6E58] border-t border-[#BDBDBD] bg-[#FAFAFA]">
          <div>總金額</div>
          <div>NT $ {{ total - fare }}</div>
        </div>
      </div>
    </div>
    <div class="flex justify-end sm:justify-around w-[80vw] sm:w-[90vw] my-[2vh]">
      <RouterLink :to="{ name: 'CheckoutStepOne' }">
        <button class="lg:hidden w-[250px] sm:w-[150px] py-[.8vh] text-[#F5F5F5] bg-[#BDBDBD] rounded-[0.3125rem]"
          type="submit" @click="router.push('/checkout/step1')">
          返回上一步
        </button>
      </RouterLink>
      <button class="w-[250px] sm:w-[150px] py-[.8vh] text-[#616161] bg-[#F2D349] rounded-[0.3125rem]" type="submit"
        @click="handleSubmit">
        下單
      </button>
    </div>
  </div>
</template>



<style scoped>
#seven,
#family,
#same {
  accent-color: #639377;
}
</style>