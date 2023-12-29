<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { useUserStore } from "@/stores/user";
import { getDatabase, ref as dref, onValue } from "firebase/database";
import { useMessage } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Step {
    id: number;
    text: string;
    process: boolean
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
const total = ref<number | any>(0);
const fare = ref<number>(60);

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

const handleSubmit = () => {
    const nameRule = /^[\u4E00-\u9FA5]+$/
    const phoneRule = /^09[0-9]{8}$/
    const mailRule = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    if (!firstName.value || !lastName.value || !phone.value || !mail.value) {
        message.info("尚有空格未輸入")
    }
    else if (!nameRule.test(firstName.value) || !nameRule.test(lastName.value)) {
        message.info("姓名只能輸入中文")
    }
    else if (!phoneRule.test(String(phone.value))) {
        message.info("手機號碼格式不對")
    } else if (!mailRule.test(mail.value)) {
        message.info("信箱格式不對")
    }
    else {
        router.push('/checkout/step3')
    }
}

const getFavoriteItem = () => {
    const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
    onValue(favoriteRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = Object.values(snapshot.val()).filter((item) => item) as FavoriteItem[];
            total.value = data.reduce((acc, cur) => acc.price * acc.sum + cur.price * cur.sum as any);
        }
    });
};

onMounted(() => {
    getFavoriteItem()
})
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
                <div v-show="step.id !== 3" :class="step.text === '訂單確認' ? 'bg-[#9E9E9E]' : 'bg-[#E0E0E0]'"
                    class="absolute w-[13vw] h-[3px] left-full"></div>
            </div>
        </div>
        <div class="flex lg:w-[80vw] lg:h-[50vh] lg:my-[2vh]">
            <div class="flex flex-col lg:w-[45vw] lg:mx-[2vw]">
                <div class="bg-[#8AA899] text-[#FAFAFA] lg:py-[2vh] lg:px-[2vw] text-lg">聯絡資訊</div>
                <div class="bg-[#FAFAFA] lg:pb-[4vh] lg:px-[2vw]">
                    <div class="flex justify-evenly lg:mx-[1vw] lg:my-[2vh]">
                        <input v-model.trim="lastName" type="text" placeholder="姓氏"
                            class="lg:w-full lg:px-[1vw] lg:mr-[.5vw] lg:h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
                        <input v-model.trim="firstName" type="text" placeholder="名字"
                            class="lg:w-full lg:px-[1vw] lg:ml-[.5vw] lg:h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
                    </div>
                    <div class="lg:mx-[1vw] lg:my-[2vh]">
                        <input v-model.trim="phone" pattern="/^1[34578]\d{9}$/" type="tel" placeholder="手機號碼"
                            class="lg:w-full lg:px-[1vw] lg:h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
                    </div>
                    <div class="lg:mx-[1vw] lg:my-[2vh]">
                        <input v-model.trim="mail" type="mail" placeholder="電子郵件"
                            class="lg:w-full lg:px-[1vw] lg:h-[5vh] rounded-md  bg-[#FFFFFF] border-2 border-[#8AA899]">
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-center lg:w-[35vw] text-base">
                <div
                    class="lg:w-[90%] lg:mx-auto lg:py-[2vh] text-xl text-[#616161] text-center border-b border-[#BDBDBD] bg-[#FAFAFA]">
                    付款金額
                </div>
                <div class="lg:w-[90%] lg:py-[2vh] text-[#9E9E9E] bg-[#FAFAFA]">
                    <div class="flex justify-between lg:px-[2vw]">
                        <div>合計</div>
                        <div>NT $ {{ total }}</div>
                    </div>
                    <div class="flex justify-between lg:my-[2vh] lg:px-[2vw]">
                        <div>運費</div>
                        <div>NT $ {{ fare }}</div>
                    </div>
                    <div class="flex justify-between lg:px-[2vw]">
                        <div>折扣</div>
                        <div>- 0</div>
                    </div>
                </div>
                <div
                    class="flex justify-between lg:w-[90%] lg:py-[2vh] lg:px-[2vw] text-[#5C6E58] border-t border-[#BDBDBD] bg-[#FAFAFA]">
                    <div>總金額</div>
                    <div>NT $ {{ total - fare }}</div>
                </div>
            </div>
        </div>
        <div class="flex justify-end lg:w-[80vw] lg:my-[2vh]">
            <button class="lg:w-[250px] lg:py-[.8vh] text-[#616161] bg-[#F2D349] rounded-[0.3125rem]" type="submit"
                @click="handleSubmit">
                下單
            </button>
        </div>
    </div>
</template>



<style scoped></style>