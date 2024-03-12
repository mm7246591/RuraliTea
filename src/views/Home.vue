<script setup lang="ts">

const data = [
    {
        id: "1",
        img: "/img/all-item/black-tea-one.jpg",
    },
    {
        id: "2",
        img: "/img/all-item/Lishan.jpg",
    },
    {
        id: "3",
        img: "/img/all-item/oolong-tea-one.jpg",
    },
]

</script>

<template>
    <div class="w-[90vw] flex flex-col items-center mx-auto lg:mb-[10vh]">
        <div class="sm:hidden w-full flex justify-center my-[2vh]">
            <img src="/img/all-item/bg.jpg" class="object-contain">
        </div>
        <div class="lg:hidden w-full flex justify-center relative pb-[2vh]">
            <img src="/img/all-item/phone-bg.jpg" class="lg:hidden object-contain">
            <div
                class="absolute bottom-0 -translate-y-1/3 2sm:-translate-y-5 h-a flex flex-col items-center text-base text-[#FAFAFA] tracking-[.2em]">
                <div>丘山茗坊</div>
                <div class="mt-[1vh]">聯絡資訊</div>
                <div class="my-[1vh] break-all 2sm:text-sm">E-mail：ruralitea@gmail.com</div>
                <div class="w-[35vw] flex justify-evenly">
                    <div>
                        <a href="https://www.facebook.com/RuraliTea">
                            <img src="/img/all-item/fb.png" class="w-[32px]" alt="">
                        </a>
                    </div>
                    <div>
                        <a href="https://www.instagram.com/ruralitea/?hl=zh-tw">
                            <img src="/img/all-item/ig.png" class="w-[32px]" alt="">
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full sm:hidden flex justify-evenly flex-wrap">
            <div v-for="item of data" :key="item.id" class="w-[24vw] ">
                <img :src="item.img" class="img w-full h-full object-contain">
            </div>
        </div>
    </div>
    <footer class="sm:hidden w-full h-[20vh] bg-[rgba(97,97,97,.6)] sm:bg-[#5C6E58]">
        <div class="h-full flex flex-col justify-center items-center text-base text-[#FAFAFA] tracking-[.2em]">
            <div>丘山茗坊</div>
            <div class="mt-[1vh]">聯絡資訊</div>
            <div class="my-[1vh]">E-mail：ruralitea@gmail.com</div>
            <div class="w-[8vw] flex justify-evenly">
                <div class="">
                    <a href="https://www.facebook.com/RuraliTea">
                        <img src="/img/all-item/fb.png" class="w-[32px]" alt="">
                    </a>
                </div>
                <div>
                    <a href="https://www.instagram.com/ruralitea/?hl=zh-tw">
                        <img src="/img/all-item/ig.png" class="w-[32px]" alt="">
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>


<style scoped>
.img {
    opacity: 1;
    transition: .3s;
}

.img:hover {
    opacity: .7;
}
</style>