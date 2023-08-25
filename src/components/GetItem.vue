<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NSelect, NModal, NCard, NIcon, useMessage } from 'naive-ui';
import { Triangle, CheckmarkSharp } from '@vicons/ionicons5'
import { getDatabase, ref as dref, update, onValue } from "firebase/database";
import { useUserStore } from "@/stores/user";
import { useRoute, useRouter } from 'vue-router';

interface Item {
    id: string
    img: string
    name: string
    maxSum: number
    category: string
    pictures: { id: string, img: string }[]
}

const db = getDatabase();
const userStore = useUserStore();
const route = useRoute()
const router = useRouter()
const message = useMessage()
const items = ref<Item[] | null>(null)
const selected = ref<string | null>("")
const showModal = ref<boolean>(false)
const isAlreadyHave = ref<boolean>(false)
const options = [
    {
        label: "400~1500/一斤",
        value: '400~1500/一斤',
    },
    {
        label: '500~1600/一斤',
        value: '500~1600/一斤'
    },
    {
        label: '600~1700/一斤',
        value: '600~1700/一斤'
    },
]

const filterItem = computed(() => {
    if (items.value)
        return items.value?.filter(item => item.category.includes(route.meta.name as string))
})

const handleFilterItem = (value: string) => {
    console.log(value)
}

const handleAddCar = async (selectId: string) => {
    if (localStorage.user && items.value) {
        showModal.value = true
        const selectItem = items.value.filter(item => item.id === selectId)[0]
        const favoriteRef = dref(db, `users/${userStore.userName}/favorites`);
        onValue(favoriteRef, (snapshot) => {
            snapshot.val().forEach((item, index) => {
                if (item.id === selectId && selectItem.maxSum > 0) {
                    isAlreadyHave.value = true
                    update(dref(db, `users/${userStore.userName}/favorites/${index}`), {
                        sum: item.sum += 1
                    });
                }
            })
        }, {
            onlyOnce: true
        });
        if (!isAlreadyHave.value) {
            update(dref(db, `users/${userStore.userName}/favorites/${Number(selectId) - 1}`), {
                id: selectId,
                name: selectItem.name,
                sum: 1
            });
        }
        isAlreadyHave.value = false
        setTimeout(() => {
            showModal.value = false
        }, 1500)
    }
    else {
        message.warning("請先登入會員！")
    }
}

const handleToItem = (selectId: string) => {
    router.push({ path: `${route.fullPath}/${selectId}` })
}

const getItem = () => {
    const teaRef = dref(db, `/teas`);
    onValue(teaRef, (snapshot) => {
        items.value = [...snapshot.val()]
    });
}

onMounted(() => {
    getItem()
    selected.value = options[0].value
})
</script>

<template>
    <div class="lg:w-full">
        <div class="lg:w-[86vw] flex justify-end items-center mx-auto lg:my-[2vh]">
            <div>價位：</div>
            <div class="lg:w-[10vw]">
                <NSelect v-model:value="selected" :options="options" :default-value="options[0].value"
                    @update:value="handleFilterItem">
                    <template #arrow>
                        <Triangle />
                    </template>
                </NSelect>
            </div>
        </div>
        <div>
            <div class="lg:w-[90vw] flex flex-wrap mx-auto">
                <div v-for="item of filterItem" :key="item.id"
                    class="relative lg:w-[28vw] flex flex-col items-center lg:mx-[1vw] lg:my-[5vh]">
                    <div class="relative">
                        <img :src="item.img" class="object-contain cursor-pointer" @click="handleToItem(item.id)">
                        <div v-show="item.maxSum === 0"
                            class="flex justify-center items-center absolute top-0 left-0 w-full h-full text-3xl text-[red] bg-[rgba(255,255,255,.5)] z-10 ">
                            已全數售出！
                        </div>
                    </div>
                    <div class="text-base text-[#757575] lg:my-[1vh]">
                        {{ item.name }}
                    </div>
                    <div class="absolute bottom-[6vh] right-[2vw]">
                        <img src="/img/all-item/card-add.png" class="w-[48px] object-contain cursor-pointer"
                            @click="handleAddCar(item.id)">
                        <NModal v-model:show="showModal" :mask-closable="false" v-bind:close-on-esc="false">
                            <NCard style="width: 600px" :bordered="false" size="huge" role="card" aria-modal="true">
                                商品已加入購物車！
                                <template #footer>
                                    <NIcon size="40">
                                        <CheckmarkSharp />
                                    </NIcon>
                                </template>
                            </NCard>
                        </NModal>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style>
.n-base-selection .n-base-suffix {
    transform: translateY(-50%) rotate(180deg) !important
}

.n-modal-mask {
    background-color: rgba(0, 0, 0, .1) !important;
}

.n-card>.n-card__content {
    text-align: center !important;
    font-size: 20px !important
}

.n-card>.n-card__content,
.n-card>.n-card__footer {
    text-align: center !important;
}

.n-icon {
    color: green !important;
}

.n-base-selection {
    --n-border-active: 1px solid #E0E0E0 !important;
    --n-border-focus: 1px solid #E0E0E0 !important;
    --n-border-hover: 1px solid #E0E0E0 !important;
    --n-box-shadow-active: 0 0 0 1px #E0E0E0 !important;
    --n-box-shadow-focus: 0 0 0 1px #E0E0E0 !important;
    --n-caret-color: #E0E0E0 !important;
    --n-loading-color: white !important;
    --border: 1px solid #E0E0E0 !important;
    --n-border-radius: 0.625rem !important;
    --n-color: #F5F5F5 !important;
}

.n-base-select-menu {
    --n-option-check-color: #5C6E58 !important;
    --n-option-text-color-active: #5C6E58 !important;
    --n-option-text-color-pressed: #5C6E58 !important;
    --n-loading-color: #5C6E58 !important;
}
</style>