<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NRadioGroup, NRadioButton } from 'naive-ui';
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
const selectGroup = ref<string | null>(null)
const selectPackage = ref<string | null>(null)
const groups = [
    {
        value: "四兩 (150克)",
        label: "四兩 (150克)"
    },
    {
        value: '半斤 (300克)',
        label: '半斤 (300克)'
    },
    {
        value: '一斤 (600克)',
        label: '一斤 (600克)'
    },
    {
        value: '三斤',
        label: '三斤'
    },
    {
        value: '五斤',
        label: '五斤'
    }
]

const packages = [
    {
        value: "真空袋",
        label: "真空袋"
    },
    {
        value: '罐裝',
        label: '罐裝'
    },
]

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
        scaleImg.value = items.value[0].pictures[0].img
    });
}

onMounted(() => {
    getItem()
})
</script>

<template>
    <div class="lg:w-full lg:h-[80vh] flex justify-center items-center lg:mt-[10vh]">
        <div v-for="item of filterItem" :key="item.id" class="lg:h-full flex flex-col lg:mx-[5vw]">
            <div class="lg:mx-auto">
                <img :src="scaleImg" class="w-[500px] object-contain">
            </div>
            <div class="lg:w-[510px] flex lg:mx-auto">
                <div v-for="picture of item.pictures" :key="picture.id" class="lg:mx-[.25vw] lg:my-[1vh]">
                    <img :src="picture.img" :class="scaleImg === picture.img ? 'opacity-50' : 'opacity-100'"
                        class="object-contain cursor-pointer" @click="handleToScale(picture.img)">
                </div>
            </div>
        </div>
        <div v-for="item of filterItem" :key="item.id" class="lg:h-full flex flex-col lg:mx-[5vw]">
            <div class="text-lg text-[#8F2E17]">{{ item.name }}</div>
            <div></div>
            <div>
                <div>購買克數</div>
                <div class="group lg:h-[20vh]">
                    <NRadioGroup v-model:value="selectGroup" name="groups">
                        <NRadioButton v-for="item of groups" :key="item.value" :value="item.value" :label="item.label" />
                    </NRadioGroup>
                </div>
                <div class="package">
                    <NRadioGroup v-model:value="selectPackage" name="packages">
                        <NRadioButton v-for="item of packages" :key="item.value" :value="item.value" :label="item.label" />
                    </NRadioGroup>
                </div>
            </div>
        </div>
    </div>
</template>



<style>
.group .n-radio-group {
    display: flex;
    flex-wrap: wrap;
    width: 300px;
    --n-button-box-shadow-focus: #757575 !important;
}

.package .n-radio-group {
    --n-button-box-shadow-focus: #757575 !important;
}

.group .n-radio-group .n-radio-button {
    border: 1px solid #757575;
    margin: 1vh .5vw;
    border-radius: 0.32125rem;
    transition: none;
}

.package .n-radio-group .n-radio-button {
    border: 1px solid #757575;
    margin: 0 .5vw;
    border-radius: 0.32125rem;
    transition: none;
}

.n-radio-group.n-radio-group--button-group .n-radio-group__splitor {
    display: none;
}

.n-radio-group .n-radio-button:first-child,
.n-radio-group .n-radio-button:last-child {
    border: 1px solid #757575;
}

.n-radio-group .n-radio-button.n-radio-button--checked {
    border: 1px solid #8AA899;
    background: #8AA899;
    color: #F5F5F5
}

.n-radio-group .n-radio-button.n-radio-button--checked .n-radio-button--focus {
    border: 1px solid #8AA899;
    background: #8AA899;
    color: #F5F5F5
}

.n-radio-group .n-radio-button:not(.n-radio-button--disabled):hover:not(.n-radio-button--checked) {
    color: black;
}
</style>