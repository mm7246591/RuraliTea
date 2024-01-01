<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { onMounted, ref } from 'vue';

interface Step {
    id: number;
    text: string;
    process: boolean
}
const message = useMessage()
const steps = ref<Step[]>([
    {
        id: 1,
        text: "訂單確認",
        process: true,
    },
    {
        id: 2,
        text: "結帳",
        process: true,
    },
    {
        id: 3,
        text: "完成訂購",
        process: true,
    },
]);

onMounted(async () => {
    message.success("已完成訂單！！！")
})

</script>

<template>
    <div class="flex flex-col justify-center items-center">
        <div class="lg:w-[60vw] lg:h-[20vh] flex justify-evenly items-center lg:mx-auto">
            <div v-for="step of steps" :key="step.id" :class="step.process ? 'bg-[#5C6E58]' : 'bg-[#BDBDBD]'"
                class="relative test lg:w-[55px] lg:h-[55px] flex justify-center items-center rounded-full">
                <div class="text-3xl text-[#F5F5F5]">{{ step.id }}</div>
                <div :class="step.process ? 'text-[#5C6E58]' : 'text-[#BDBDBD]'"
                    class="absolute w-[8vw] text-center -bottom-3 translate-y-full text-base">
                    {{ step.text }}
                </div>
                <div v-show="step.id !== 3" :class="step.process === true ? 'bg-[#9E9E9E]' : 'bg-[#E0E0E0]'"
                    class="absolute w-[13vw] h-[3px] left-full"></div>
            </div>
        </div>
    </div>
</template>



<style scoped></style>