<script setup>

definePageMeta(
    {
        middleware: ['auth']
    }
);

const user = useSupabaseUser();

</script>

<template>
    <div class="p-4">
        <UCard>
            <h1 class="text-2xl">Welcome Back!</h1>

            <template #footer>
                <UButton color="gray" icon="i-heroicons-book-open" @click="navigateTo('/')">
                    View Course Catalogue
                </UButton>
            </template>

        </UCard>

        <CourseView :is_open="true" :course_id="1"></CourseView>
    </div>
</template>