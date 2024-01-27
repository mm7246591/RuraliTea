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
    <div class="lg:w-[90vw] flex flex-col items-center mx-auto lg:mb-[10vh]">
        <div class="lg:w-full flex justify-center lg:my-[2vh]">
            <img src="/img/all-item/bg.jpg" class="object-contain">
        </div>
        <div class="lg:w-full flex justify-evenly flex-wrap">
            <div v-for="item of data" :key="item.id" class="lg:w-[24vw] ">
                <img :src="item.img" class="img w-full h-full object-contain">
            </div>
        </div>
    </div>
    <footer class="lg:w-full lg:h-[20vh] bg-[rgba(97,97,97,.6)]">
        <div class="lg:h-full flex flex-col justify-center items-center text-base text-[#FAFAFA] tracking-[.2em]">
            <div>丘山茗坊</div>
            <div class="lg:mt-[1vh]">聯絡資訊</div>
            <div class="lg:my-[1vh]">E-mail：ruralitea@gmail.com</div>
            <div class="lg:w-[8vw] flex justify-evenly">
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