<script setup>

// These need to stay in this specific order.
const dow = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
]

const event_title = ref('');

const start_time = ref('');
const end_time = ref('');

const selected_boxes = ref([]);

const reset_table = () => {
    event_title.value = '';
    start_time.value = '';
    end_time.value = '';
    selected_boxes.value = [];
}

</script>

<template>

<UCard>

    <template #header>
        Create Custom Event
    </template>

    <FormKit
        type="text"
        label="Event Title"
        placeholder="My Custom Event"
        v-model="event_title"
        help="Ex: Soccer Practice"
        :classes="{
            input: 'rounded-md py-1 px-3 w-full',
            outer: 'p-1',
            label: 'font-semibold text-lg mx-1.5',
            help: 'font-thin text-sm mx-1.5'
        }"
    />

    <div class="flex flex-row">
        <FormKit
            type="time"
            label="Start Time"
            v-model="start_time"
            :classes="{
                input: 'rounded-md py-1 px-3 w-full',
                wrapper: 'w-full',
                outer: 'p-1 w-1/2 inline-flex',
                label: 'font-semibold text-lg mx-1.5',
                help: 'font-thin text-sm mx-1.5'
            }"
        />
        
        <FormKit
        type="time"
        label="End Time"
        v-model="end_time"
        :classes="{
                input: 'rounded-md py-1 px-3 w-full',
                wrapper: 'w-full',
                outer: 'p-1 w-1/2 inline-flex',
                label: 'font-semibold text-lg mx-1.5',
                help: 'font-thin text-sm mx-1.5'
            }"
        />
    </div>

    <div class="flex flex-row w-full mt-6">
        <FormKit 
            type="checkbox"
            :options="dow"
            v-model="selected_boxes"
            :classes="{
                outer: 'flex-grow',
                input: 'flex-grow',
                label: 'block',
                inner: 'inline-flex',
                wrapper: 'flex-grow text-center',
                option: 'inline-flex flex-grow',
                options: 'flex flex-grow'
            }"
        />
    </div>

    <template #footer>
        <UButton class="mr-2">
            Create Custom Event
        </UButton>
        <UButton color="gray" @click.prevent.stop="reset_table">
            Clear Settings
        </UButton>
    </template>

</UCard>

</template>