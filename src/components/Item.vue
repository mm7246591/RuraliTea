<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as dref, onValue } from "firebase/database";

interface Item {
    id: string
    img: string
    name: string
    maxSum: number
    pictures: { id: string, img: string }[]
}
const db = getDatabase();
const route = useRoute()
const items = ref<Item[] | null>(null)
const scaleImg = ref<string>("")

const filterItem = computed(() => {
    if (items.value) {
        return items.value.filter(item => item.id === route.params.id)
    }
})

const handleToScale = (selectIdImg: string) => {
    scaleImg.value = selectIdImg
}

const getItem = () => {
    const teaRef = dref(db, `/teas`);
    onValue(teaRef, (snapshot) => {
        items.value = [...snapshot.val()]
        scaleImg.value = items.value[0].img
    });
}

onMounted(() => {
    getItem()
})
</script>

<template>
    <div class="lg:w-full flex justify-around items-center lg:my-[2vh]">
        <div v-for="item of filterItem" :key="item.id" class="lg:w-[50vw] flex flex-col">
            <div class="lg:mx-auto">
                <img :src="scaleImg" class="w-[500px] object-contain">
            </div>
            <div class="lg:w-[510px] flex lg:mx-auto">
                <div v-for="picture of item.pictures" :key="picture.id" class="lg:mx-[.25vw] lg:my-[1vh]">
                    <img :src="picture.img" class="object-contain cursor-pointer" @click="handleToScale(picture.img)">
                </div>
            </div>
        </div>
        <div class="lg:w-[30vw]">123</div>
    </div>
</template>



<style scoped></style>