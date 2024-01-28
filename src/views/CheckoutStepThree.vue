<script setup lang="ts">
import firebaseConfig from "@/config/firebaseConfig";
import { useUserStore } from "@/stores/user";
import { getDatabase, ref as dref, onValue } from "firebase/database";
import { useMessage, NSpin } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';

interface Step {
    id: number;
    text: string;
    process: boolean
}

interface Info {
    infoName: string
    mail: string;
    phone: number;
    store: string;
    total: number;
    name: string;
    weight: string;
    package: string;
    sum: number;
    availableSum: number
}

firebaseConfig;
const db = getDatabase();
const userStore = useUserStore();
const message = useMessage()
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
        process: true,
    },
]);
const getName = ref<string | null>(null)
const getPhone = ref<number | null>(null)
const getMail = ref<string | null>(null)
const getStore = ref<string | null>(null)
const getTotal = ref<number | null>(null)
const showLoading = ref<boolean>(false)
const info = ref<Info[] | null>(null)

const filterInfo = computed(() => {
    return info.value?.filter((_data, index) => index !== 0)
})

const getInfo = (() => {
    showLoading.value = true
    const infoRef = dref(db, `users/${userStore.userName}/info`);
    onValue(infoRef, (snapshot) => {
        if (snapshot.exists()) {
            info.value = Object.values(snapshot.val())
            getName.value = info.value[0].infoName
            getPhone.value = info.value[0].phone
            getMail.value = info.value[0].mail
            getStore.value = info.value[0].store
            getTotal.value = info.value[0].total
            showLoading.value = false
        }
    });
})

onMounted(() => {
    getInfo()
    message.success("已完成訂單！！！")
})

</script>

<template>
    <NSpin :show="showLoading">
        <div class="flex flex-col justify-center items-center">
            <div class="lg:w-[60vw] lg:h-[20vh] flex justify-evenly items-center lg:mx-auto">
                <div v-for="data of steps" :key="data.id" :class="data.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
                    class="relative test lg:w-[55px] lg:h-[55px] flex justify-center items-center rounded-full">
                    <div class="text-3xl text-[#F5F5F5]">{{ data.id }}</div>
                    <div :class="data.process ? 'text-[#5C6E58]' : 'text-[#BDBDBD]'"
                        class="absolute w-[8vw] text-center -bottom-3 translate-y-full text-base">
                        {{ data.text }}
                    </div>
                    <div v-show="data.id !== 3" :class="data.process === true ? 'bg-[#9E9E9E]' : 'bg-[#E0E0E0]'"
                        class="absolute w-[13vw] h-[3px] left-full"></div>
                </div>
            </div>
        </div>
        <div class="flex justify-evenly lg:py-[6.1vh]">
            <div>
                <div><img src="/img/all-item/step-three.png" class="w-[90%] object-contain" alt=""></div>
            </div>
            <div class="bg-[#FAFAFA]">
                <div class="lg:w-[35vw] lg:h-full flex flex-col">
                    <div class="text-lg lg:px-[2vw] lg:py-[2vh] bg-[#455A64] text-[#FAFAFA]">
                        訂購明細
                    </div>
                    <div class="lg:px-[2vw] lg:py-[2vh] text-sm tracking-[.1vw] text-[#9E9E9E]">
                        <div>收件人姓名：{{ getName }}</div>
                        <div class="lg:py-[.5vh]">收件人手機號碼：{{ getPhone }}</div>
                        <div>收件人電子郵件： {{ getMail }}</div>
                        <div class="lg:py-[.5vh]">收件門市：{{ getStore }}</div>
                        <div class="flex">
                            <div>購買商品：</div>
                            <div>
                                <div v-for="data of filterInfo" :key="data.name" class="lg:pb-[.5vh]">
                                    <div>{{ data.name }}({{ data.weight }}) / {{ data.package }} * {{ data.sum }}</div>
                                </div>
                            </div>
                        </div>
                        <div>總金額：NT ${{ getTotal }}</div>
                    </div>
                    <div
                        class="flex justify-center items-center lg:h-full lg:mx-[2vw] lg:py-[2vh] border-t border-[#BDBDBD] text-center text-[#455A64]">
                        商品於下單後約1~2天內寄出，請務必記得領取商品<br />若要有其他問題可於IG或FB粉專私訊
                    </div>
                </div>
            </div>
        </div>
    </NSpin>
</template>



<style scoped></style>