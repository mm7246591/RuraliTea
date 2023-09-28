<script setup lang="ts">
import firebaseConfig from '@/config/firebaseConfig'
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted, ref, watchEffect } from 'vue';
import { NSpin } from 'naive-ui';
import { useUserStore } from '@/stores/user';

interface Step {
    id: string
    step: number
    process: boolean
}
interface FavoriteItem {
    id: string
    img: string
    name: string
    price: number
    weight: string
    package: string
    sum: number
}

const steps = ref<Step[]>([
    {
        id: '1',
        step: 1,
        process: true,
    },
    {
        id: '2',
        step: 2,
        process: false,
    },
    {
        id: '3',
        step: 3,
        process: false,
    }
])
const favoriteItem = ref<FavoriteItem[] | null>(null)
const showLoading = ref<boolean>(false)

firebaseConfig
const db = getDatabase();
const userStore = useUserStore();

const getFavoriteItem = () => {
    const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
    onValue(favoriteRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = Object.values(snapshot.val()) as FavoriteItem[]
            favoriteItem.value = data.filter(item => item)
        }
    });
}

onMounted(() => {
    getFavoriteItem()
})

watchEffect(() => {
    if (userStore.favoriteSum) {
        getFavoriteItem()
    }
    if (userStore.favoriteSum === 0) {
        favoriteItem.value = null
    }
})
</script>

<template>
    <div class="flex flex-col justify-center items-center">
        <div class="lg:w-[60vw] lg:h-[20vh] flex justify-evenly items-center lg:mx-auto">
            <div v-for="step of steps" :key="step.id" :class="step.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
                class="relative lg:w-[4.1875rem] lg:h-[4.1875rem] flex justify-center items-center rounded-full text-3xl text-[#F5F5F5] ">
                <div class="">{{ step.step }}</div>
                <div v-show="step.step !== 3" :class="step.step >= 2 && step.process ? 'bg-[#9E9E9E]' : 'bg-[#E0E0E0]'"
                    class="absolute w-[8vw] h-[2px] translate-x-full"></div>
            </div>
        </div>
        <NSpin :show="showLoading">
            <div class="lg:w-[80vw] flex flex-col">
                <div class="lg:py-[2vh] flex items-center text-xl text-[#FAFAFA] bg-[#8AA899]">
                    <div class="mx-[2vw]">購物車商品 ({{ userStore.favoriteSum }} 件)</div>
                </div>
                <div class="lg:py-[2vh] flex items-center text-base border-b border-[#E0E0E0] text-[#616161] bg-[#FAFAFA]">
                    <div class="lg:w-full flex justify-between lg:mx-[2vw] tracking-wider">
                        <div>商品資料</div>
                        <div class="lg:w-[40vw] flex justify-around lg:mx-[8vw]">
                            <div>價格</div>
                            <div>購買數量</div>
                            <div>小計</div>
                        </div>
                    </div>
                </div>
                <div v-for="item of favoriteItem" :key="item.id"
                    class="flex justify-between items-center text-lg text-[#616161] lg:my-[2vh]">
                    <div class="flex justify-center items-center lg:mx-[2vw]">
                        <div>
                            <img :src="item.img" class="w-[5rem] h-[5rem]">
                        </div>
                        <div class="lg:mx-[1vw] ">
                            <div class="!text-base  !text-[#5C6E58] lg:mb-[1vh]">{{ item.name }}</div>
                            <div class="!text-sm !text-[#9E9E9E]">{{ item.weight }} / {{ item.package }}</div>
                        </div>
                    </div>
                    <div class="lg:w-[50vw] flex justify-around items-center tracking-wider">
                        <div>
                            NT$ {{ item.price }}
                        </div>
                        <div>
                            <div class="flex">
                                <img src="/img/all-item/minus.jpg" class="cursor-pointer">
                                <div class="lg:mx-[1vw] lg:my-auto text-lg">{{ 1 }}</div>
                                <img src="/img/all-item/plus.jpg" class="cursor-pointer">
                            </div>
                        </div>
                        <div>
                            NT$ {{ item.price * item.sum }}
                        </div>
                        <div>
                            <img src="/img/all-item/delete.jpg" class="cursor-pointer">
                        </div>
                    </div>
                </div>
            </div>
        </NSpin>
    </div>
</template>

<style scoped></style>