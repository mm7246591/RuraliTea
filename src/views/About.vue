<script setup lang="ts">
import { ref } from 'vue';

interface Text {
    id: string
    title: string
    des: string
}

const texts = ref<Text[]>([
    {
        id: "1",
        title: "關於我們",
        des: "丘山茗坊座落於南投鹿谷凍頂山下，海拔平均約600公尺，四周被美麗的自然環境所環繞，包括著名的麒麟潭等景點。我們是一家專注於提供優質茶葉的零售店，擁有豐富的茶葉種類，為您帶來極致的品茗體驗。"
    },
    {
        id: "2",
        title: "我們的茶葉",
        des: "在丘山茗坊，我們致力於挑選高品質的茶葉，包括烏龍茶、紅茶等各式口味。所有茶葉都來自優秀的茶農，經過精心製作，確保每一杯茶都充滿風味與深度。"
    },
    {
        id: "3",
        title: "本店特色",
        des: ""
    },
    {
        id: "4",
        title: "聯絡我們",
        des: "歡迎您親臨丘山茗坊，一同品味茶的美好！如有任何疑問或需要協助，請隨時聯絡我們。期待與您共享茶的樂趣！\n Email：ruralitea@gmail.com"
    }
])

</script>

<template>
    <div class="lg:w-full lg:h-[100vh] flex bg-[#778168] text-[#FAFAFA]">
        <div class="lg:w-[45%] flex flex-col justify-evenly lg:py-[5vh] lg:px-[5vw]">
            <div v-for="data of texts" :key="data.id" class="">
                <div class="lg:text-xl lg:mb-[1vh] tracking-[.25rem]">{{ data.title }}</div>
                <ul v-show="data.id === '3'" class="relative lg:px-[1vw] list-disc lg:text-sm tracking-[.15rem]">
                    <li>環境清幽： 店鋪周圍環繞著大自然的美景， 讓您在品茗的同時感受大自然的恬靜與寧靜。</li>
                    <li>專業品茶： 我們的店員擁有豐富的茶葉知識，將為您提供專業的品茶建議，讓您挑選到最適合自己口味的茶葉。</li>
                </ul>
                <div class="lg:text-sm whitespace-pre-line tracking-[.15rem]">{{ data.des }}</div>
                <div v-show="data.id === '4'" class="flex lg:mt-[1vh]">
                    <div>
                        <a href="https://www.facebook.com/RuraliTea">
                            <img src="/img/all-item/fb.png" class="w-[32px]" alt="">
                        </a>
                    </div>
                    <div>
                        <a href="https://www.instagram.com/ruralitea/?hl=zh-tw">
                            <img src="/img/all-item/ig.png" class="w-[32px] lg:mx-[1vw]" alt="">
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="lg:w-[55%] relative">
            <div class="">
                <img src="/img/all-item/cloud-one.png" class="w-[250px] absolute top-1/2 right-[15%] " alt="">
                <img src="/img/all-item/cloud-two.png" class="w-[250px] absolute top-[70%] right-1/2 z-10" alt="">
                <img src="/img/all-item/circle.png" class="w-[200px] absolute top-[55%] right-[10%]" alt="">
                <img src="/img/all-item/mountain.png" class="absolute bottom-0" alt="">
            </div>
        </div>
    </div>
</template>



<style scoped></style>