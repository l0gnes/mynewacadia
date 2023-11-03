<script setup>

const emits = defineEmits(['cancelled', 'dropped'])
const props = defineProps({section_id : 'number'});

const section_id = props.section_id;

const courseInfo = ref(null);

const {data, error} = await useAsyncData(`course:${section_id}`, async () => {
    return await $fetch(`/api/sections/${section_id}`)
})

const dropCourse = async () => {

    await useFetch(
        `/api/calendar/events/courses/${section_id}`,
        {
            method: "DELETE"
        }
    );

} 

</script>

<template>
    <UCard>

        <p>
            Are you sure you want to drop <span class="font-semibold">{{ data.course.title }}</span>?
        </p>

        <template #footer>
            <div class="flex">
                <div class="flex-grow"/>
                <div>
                    <UButton @click="this.$emit('dropped');dropCourse()">Confirm</UButton>
                    <UButton color="gray" @click="this.$emit('cancelled')" class="ml-2">Cancel</UButton>
                </div>
            </div>
        </template>

    </UCard>
</template>