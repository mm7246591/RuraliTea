<script setup lang="ts">
import firebaseConfig from '@/config/firebaseConfig'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { onMounted } from 'vue'
import { NBadge, NDropdown, useMessage } from 'naive-ui'
import { useUserStore } from "@/stores/user";


firebaseConfig
const db = getDatabase();
const userStore = useUserStore();
const provider = new GoogleAuthProvider();
const auth = getAuth();
const message = useMessage()
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

const getUser = () => {
    if (localStorage.user) {
        const { displayName } = JSON.parse(localStorage.user)
        userStore.userName = displayName
        const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
        onValue(favoriteRef, (snapshot) => {
            const data = snapshot.val()
            userStore.favoriteSum = data.length
        });
    }
}

onMounted(() => {
    getUser()
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
            <NBadge :value="userStore.favoriteSum">
                <img src="/img/header/car.png" class="lg:mx-[1vw] object-contain cursor-pointer" alt="">
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
    transform: translateX(-100%) !important;
}

.router-link-exact-active {
    background: url('/img/header/triangle.png') no-repeat top center;
}
</style>