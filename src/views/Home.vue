<script setup lang="ts">

const data = [
    {
        id: "1",
        img: "./src/assets/img/home/black-tea.jpg",
    },
    {
        id: "2",
        img: "./src/assets/img/home/gift-box.jpg",
    },
    {
        id: "3",
        img: "./src/assets/img/home/mountain-tea.jpg",
    },
]

</script>

<template>
    <div class="lg:w-[90vw]  flex flex-col items-center mx-auto">
        <div class="lg:w-full flex justify-center lg:my-[2vh]">
            <img src="@/assets/img/home/bg.jpg" class="object-contain" alt="">
        </div>
        <div class="lg:w-full flex justify-evenly flex-wrap">
            <div v-for="item of data" :key="item.id" class="lg:w-[24vw] ">
                <img :src="item.img" class="w-full h-full object-contain">
            </div>
        </div>
    </div>
</template>


<style scoped></style>