<script setup lang="ts">
import { ref, watch } from 'vue';

interface Text {
    id: string
    title: string
    des: string
}

const animate = ref<boolean>(false)
const scrollTop = ref<number>(0)
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

const handleScroll = (event) => {
    scrollTop.value = event.target.scrollTop
}
watch(scrollTop, (newVal, oldVal) => {
    if (newVal > oldVal)
        animate.value = true
    else
        animate.value = false
})
</script>

<template>
    <div class="about w-full h-[100vh] flex bg-[#778168] text-[#FAFAFA] sm:relative">
        <div class="w-[45%] sm:w-full sm:h-[65vh] lg:flex lg:flex-col lg:justify-evenly py-[5vh] sm:py-[0] sm:my-[2vh] px-[5vw] mx-[5vw] sm:overflow-y-scroll sm:overflow-x-hidden"
            @scroll="handleScroll">
            <div v-for="data of texts" :key="data.id" class="sm:py-[2vh]">
                <div class="text-xl mb-[1vh] tracking-[.25rem]">{{ data.title }}</div>
                <ul v-show="data.id === '3'" class="px-[1.5vw] sm:px-[5vw] list-disc text-sm tracking-[.15rem]">
                    <li>環境清幽： 店鋪周圍環繞著大自然的美景， 讓您在品茗的同時感受大自然的恬靜與寧靜。</li>
                    <li>專業品茶： 我們的店員擁有豐富的茶葉知識，將為您提供專業的品茶建議，讓您挑選到最適合自己口味的茶葉。</li>
                </ul>
                <div class="text-sm whitespace-pre-line tracking-[.15rem]">{{ data.des }}</div>
                <div v-show="data.id === '4'" class="w-[80px] flex justify-between mt-[1vh]">
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
        <div class="w-[55%] relative sm:hidden">
            <img src="/img/all-item/cloud-one.png" class="w-[250px] absolute top-1/2 right-[15%] " alt="">
            <img src="/img/all-item/cloud-two.png" class="w-[250px] absolute top-[70%] right-1/2 z-10" alt="">
            <img src="/img/all-item/circle.png" class="w-[200px] absolute top-[55%] right-[10%]" alt="">
            <img src="/img/all-item/mountain.png" class="absolute bottom-0" alt="">
        </div>
        <img src="/img/all-item/cloud-one.png"
            :class="animate ? 'right-[10%] -translate-x-full' : 'right-[10%] translate-x-[0%]'"
            class="animate w-[150px] absolute top-[73%] text-base lg:hidden" alt="">
        <img src="/img/all-item/cloud-two.png" :class="animate ? 'translate-x-full' : '-translate-x-[0%]'"
            class="animate w-[150px] absolute top-[85%] right-1/2 z-10 lg:hidden" alt="">
        <img src="/img/all-item/circle.png" class="w-[100px] absolute top-[75%] right-[8%] lg:hidden" alt="">
        <img src="/img/all-item/mountain.png" class="absolute bottom-0 lg:hidden" alt="">
    </div>
</template>



<style scoped>
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-thumb {
    background: hsl(84, 12%, 67%, .5);
    border-radius: 50px;
}

.animate {
    transition: all .5s ease;
}
</style>