<script setup lang="ts">
import firebaseConfig from '@/config/firebaseConfig'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted, ref } from 'vue'
import { NModal, NCard, NBadge, NDropdown, NPopover, NIcon, NSpin, useMessage } from 'naive-ui'
import { Close } from '@vicons/ionicons5'
import { useUserStore } from "@/stores/user";

interface Item {
    id: string
    img: string
    name: string
    weight: string
    package: string
    sum: number
}

firebaseConfig
const db = getDatabase();
const userStore = useUserStore();
const provider = new GoogleAuthProvider();
const auth = getAuth();
const message = useMessage()
const favoriteItem = ref<Item[] | null>(null)
const showModal = ref<boolean>(false)
const selected = ref<number | null>(null)
const showLoading = ref<boolean>(false)
const options = [
    {
        label: '登出',
        key: '登出',
    },
]

const handleSignIn = async () => {
    await signInWithPopup(auth, provider)
        .then(async (result) => {
            const item = { "displayName": result.user.displayName }
            update(dref(db, `users/${result.user.displayName}`),
                {
                    uid: result.user.uid,
                    displayName: result.user.displayName,
                    email: result.user.email
                });
            localStorage.setItem("user", JSON.stringify(item))
            getUser()
        }).catch((error) => {
            console.log(error)
        });
}

const handleWebSignOut = async () => {
    if (localStorage.user) {
        message.success("已成功登出！")
        signOut(auth).then(async () => {
            await update(dref(db, `users/${userStore.userName}`), {
                uid: null,
                name: null,
                email: null
            });
            localStorage.removeItem("user")
            userStore.userName = ""
            userStore.favoriteSum = 0
        }).catch((error) => {
            console.log(error)
        });
    }
}

const handleUpdateShow = (show: boolean) => {
    if (show)
        userStore.showCar = true
    else
        userStore.showCar = false
}

const handleMinusCount = (selectId: string) => {
    console.log(selectId)
    // if (selectSum === 1) {
    //     showModal.value = true
    //     return
    // }
    // update(dref(db, `users/${userStore.userName}/favorites/${selectId}`), {
    //     sum: selectSum -= 1
    // });
}

const handlePlusCount = (selectId: string) => {
    // update(dref(db, `users/${userStore.userName}/favorites/${selectId}`), {
    //     sum: selectSum += 1
    // });
}

const handleToSubmit = async () => {
    await update(dref(db, `users/${userStore.userName}/favorites/${selected.value}`), {
        id: null,
        img: null,
        name: null,
        package: null,
        weight: null,
        sum: null
    });
    showLoading.value = true
    showModal.value = false
}

const getUser = () => {
    if (localStorage.user) {
        const { displayName } = JSON.parse(localStorage.user)
        userStore.userName = displayName
        const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
        onValue(favoriteRef, (snapshot) => {
            const data = snapshot.val()
            if (data)
                userStore.favoriteSum = data.length
        });
    }
}

const getItem = () => {
    const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
    onValue(favoriteRef, (snapshot) => {
        // console.log(snapshot.val())
        // favoriteItem.value = [...snapshot.val()]
        // console.log(favoriteItem.value)
    });
}

onMounted(() => {
    getUser()
    getItem()
})

</script>

<template>
    <header
        class="lg:w-full lg:h-[13vh] flex justify-evenly items-center text-[#5C6E58] shadow-[0_4px_2px_0px_rgba(187,187,187,.25)]">
        <div class="menu lg:w-1/2 flex justify-around items-center text-sm font-semibold">
            <RouterLink :to="{ name: 'Home' }" class="logo">
                <img class="lg:w-[3.75rem] lg:h-[3.75rem] object-contain cursor-pointer" src="/img/header/logo.png" alt="">
            </RouterLink>
            <div class=" lg:w-full flex justify-evenly">
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
                <input type="text" id="search" name="search" autocomplete="off" maxlength="10"
                    class="lg:w-[20rem] lg:h-[2rem] border-1 border-[#E0E0E0] rounded-[2.9375rem] shadow-[1px_1px_3px_1px_rgba(0,0,0,.25)] px-[1vw]">
                <img src="/img/header/search.png"
                    class="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-3 object-contain" alt="">
            </div>
            <NBadge :value="userStore.favoriteSum" :max="999">
                <NPopover placement="bottom-end" trigger="manual" :show-arrow="false" :show="userStore.showCar"
                    @update:show="handleUpdateShow">
                    <template #trigger>
                        <img src="/img/header/car.png" class="lg:mx-[1vw] object-contain cursor-pointer"
                            @click="userStore.showCar = !userStore.showCar">
                    </template>
                    <div v-if="userStore.favoriteSum" class="car relative">
                        <div class="absolute top-0 right-0 -translate-y-1/4 translate-x-1/3">
                            <NIcon size="25">
                                <Close class="text-[#9E9E9E] cursor-pointer" @click="userStore.showCar = false" />
                            </NIcon>
                        </div>
                        <div v-for="item of favoriteItem" :key="item.id" class="w-fit flex justify-center items-center">
                            <div class="my-[1vh]">
                                <img :src="item.img" class="w-[5rem] h-[5rem]" alt="">
                            </div>
                            <div class="mx-[1vw]">
                                <div class="text-base text-[#5C6E58]">
                                    {{ item.name }}
                                </div>
                                <div class="text-[#9E9E9E]">
                                    {{ item.weight }} / {{ item.package }}
                                </div>
                                <div class="w-fit flex justify-center items-center">
                                    <div class="text-[#9E9E9E]">數量：</div>
                                    <div class="flex">
                                        <img src="/img/header/minus.png" class="cursor-pointer"
                                            @click="handleMinusCount(item.id)">
                                        <div class="lg:mx-[.5vw] lg:my-auto">{{ item.sum }}</div>
                                        <img src="/img/header/plus.png" class="cursor-pointer"
                                            @click="handlePlusCount(item.id)">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end lg:my-[1vh]">
                            <button class="lg:w-[5vw] lg:p-2 rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]">全部清空</button>
                            <NModal v-model:show="showModal" v-bind:close-on-esc="false">
                                <NCard style="width: 300px" title="是否刪除此品項？" size="medium" role="card" aria-modal="true">
                                    <template #footer>
                                        <div class="flex justify-evenly items-center">
                                            <div>
                                                <button class="lg:w-[5vw] lg:p-1 rounded-[5px] text-[#F5F5F5] bg-[#BDBDBD]"
                                                    @click="showModal = false">取消</button>
                                            </div>
                                            <div>
                                                <button class="lg:w-[5vw] lg:p-1 rounded-[5px] text-[#F5F5F5] bg-[#8F2E17]"
                                                    @click="handleToSubmit">確定</button>
                                            </div>
                                        </div>
                                    </template>
                                </NCard>
                            </NModal>
                            <button
                                class="lg:w-[5vw] lg:p-2 lg:mx-[1vw] rounded-[5px] text-[#F5F5F5] bg-[#5C6E58]">訂單結帳</button>
                            <!-- <NSpin size="medium" :show="showLoading"></NSpin> -->
                        </div>
                    </div>
                    <div v-else>
                        尚無商品
                    </div>
                </NPopover>
            </NBadge>
            <div class="flex justify-center items-center text-lg">
                <img v-show="!userStore.userName" src="/img/header/member.png" class="object-contain cursor-pointer" alt=""
                    @click="handleSignIn">
                <NDropdown trigger="click" :options="options" @select="handleWebSignOut">
                    <button class="mt-[1vh]">{{
                        userStore.userName
                    }}</button>
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

.n-card.n-modal {
    --n-border-radius: 5px !important;
    --n-title-text-color: #757575 !important;
    font-size: 16px !important;
    text-align: center;
}

.router-link-exact-active {
    background: url('/img/header/triangle.png') no-repeat top center;
}
</style>