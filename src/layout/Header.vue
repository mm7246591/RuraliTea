<script setup lang="ts">
</script>

<template>
    <header
        class="lg:w-full lg:h-[13vh] flex justify-evenly items-center text-[#5C6E58] shadow-[0_4px_2px_0px_rgba(187,187,187,.25)]">
        <div class="menu lg:w-1/2 flex justify-around items-center text-sm font-semibold">
            <RouterLink :to="{ name: 'Home' }" class="logo">
                <img class="lg:w-[3.75rem] lg:h-[3.75rem] object-contain cursor-pointer" src="@/assets/img/header/logo.png"
                    alt="">
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
        <div class="lg:w-auto flex justify-evenly font-['Noto_Sans_TC']">
            <div class="relative flex">
                <input type="text" id="search" name="search" autocomplete="off" maxlength="10"
                    class="lg:w-[20rem] lg:h-[2rem] border-1 border-[#E0E0E0] rounded-[2.9375rem] shadow-[1px_1px_3px_1px_rgba(0,0,0,.25)] px-[1vw]">
                <img src="@/assets/img/header/search.png" class="absolute top-0 right-3 object-contain" alt="">
            </div>
            <img src="@/assets/img/header/cart.png" class="lg:mx-[1vw] object-contain cursor-pointer" alt="">
            <img src="@/assets/img/header/member.png" class="object-contain cursor-pointer" alt="">
        </div>
    </header>
</template>

<style scoped>
.menu a {
    padding: 20px 0px;
}

.router-link-exact-active {
    background: url('@/assets/img/header/triangle.png') no-repeat top center;
}
</style>