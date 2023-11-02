<script setup>
import moment from 'moment';

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

// The title of the custom event which will be passed through to the calendar
const event_title = ref('');

// The start and end time of the custom event.
// TODO: Consider making this a start_time and a duration (?)
const start_time = ref('');
const end_time = ref('');

// Holds a set of [0-6] numbers which are associated with which days the event will be held on
const selected_boxes = ref([]);

// Clears all of the fields in the table.
const reset_table = () => {
    event_title.value = '';
    start_time.value = '';
    end_time.value = '';
    selected_boxes.value = [];
}

// Runs the query to push the formdata through to the backend
// TODO: This doesn't actually do anything still, but it still makes a call to the backend which is important.
const pushNewCustomEvent = async () => {

    const {body} = await useFetch(
        "/api/calendar/events/custom",
        {
            method: "PUT",
            body : {
                name : event_title.value,
                start_time : start_time.value,
                end_time : end_time.value,
                days : selected_boxes.value.map((d) => dow.indexOf(d))
            },
            lazy: true,
        }
    ).then(
        (v) => {console.log(v.data)}
    );
}

// Validates the the end_time comes after start_time
const validateTimes = (node) => {
    let st_mom = moment(start_time.value, "hh:mm");
    let et_mom = moment(node.value, "hh:mm");

    return et_mom.isAfter(st_mom);
}

</script>

<template>

<UCard>

    <template #header>
        Create Custom Event
    </template>

    <FormKit
        type="form"
        id="custom-event-form"
        @submit="pushNewCustomEvent"
        :actions="false"
        :classes="{
            messages: 'my-2',
            message: 'text-red-400'
        }"
    >

        <!-- Be careful with the formatting classes of the FormKit things, they're very volatile -->

        <FormKit
            type="text"
            label="Event Title"
            placeholder="My Custom Event"
            validation="required|length:3"
            v-model="event_title"
            help="Ex: Soccer Practice"
            :classes="{
                input: 'rounded-md py-1 px-3 w-full',
                outer: 'p-1',
                label: 'font-semibold text-lg mx-1.5',
                help: 'font-thin text-sm mx-1.5',
                message: 'text-red-400'
            }"
        />

        <div class="flex flex-row">
            <FormKit
                type="time"
                label="Start Time"
                validation="required"
                v-model="start_time"
                :classes="{
                    input: 'rounded-md py-1 px-3 w-full',
                    wrapper: 'w-full block',
                    outer: 'p-1 w-1/2 block',
                    label: 'font-semibold text-lg mx-1.5',
                    help: 'font-thin text-sm mx-1.5',
                    messages: 'block',
                    message: 'text-red-400'
                }"
            />
            
            <FormKit
            type="time"
            label="End Time"
            :validation-rules="{ validateTimes }"
            validation="required|validateTimes"
            validation-visbility="live"
            :validation-messages="{
                validateTimes: 'Event must start before it ends, please double-check your event times'
            }"
            v-model="end_time"
            :classes="{
                    input: 'rounded-md py-1 px-3 w-full',
                    wrapper: 'w-full block',
                    outer: 'p-1 w-1/2 block',
                    label: 'font-semibold text-lg mx-1.5',
                    help: 'font-thin text-sm mx-1.5',
                    messages: 'block',
                    message: 'text-red-400'
                }"
            />
        </div>

        <div class="flex flex-row w-full mt-6">
            <FormKit 
                type="checkbox"
                :options="dow"
                name="dows"
                validation="require_one:dows"
                v-model="selected_boxes"
                :classes="{
                    outer: 'flex-grow',
                    input: 'flex-grow',
                    label: 'block',
                    inner: 'inline-flex',
                    wrapper: 'flex-grow text-center',
                    option: 'inline-flex flex-grow',
                    options: 'flex flex-grow',
                    message: 'text-red-400'
                }"
                :validation-messages="{
                    require_one: () => 'Please select a day of the week for this event'
                }"
            />
        </div>

        <hr class="my-4"/>

        <UButton class="mr-4" @click="this.$formkit.submit('custom-event-form')">
            Submit
        </UButton>
        <UButton @click="this.$formkit.reset('custom-event-form')" color="gray">
            Clear
        </UButton>
        
    </FormKit>

</UCard>

</template>