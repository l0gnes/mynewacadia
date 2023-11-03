<script setup>
import moment from "moment";
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';


definePageMeta(
    {
        middleware: ['auth']
    }
);

const user = useSupabaseUser();

const userCourseData = ref([]);
const filteredUserCourseData = computed(() => userCourseData.value.filter(v => v.section.term == selectedTerm.value))

const createCustomEventIsOpened = ref(false);

const dropCourseModalIsOpened = ref(false);
const dropCourseSection = ref(null);

const selectedTerm = ref(0);

const events = ref([]);

const termTabs = [
    {
        label: 'Fall',
        icon: 'i-mingcute-leaf-line'
    },
    {
        label: 'Winter',
        icon: 'i-mingcute-snow-line'
    }
]

const generateTimeString = (dow, start_time, end_time) => {
    const daysOfWeek = calculateDaysOfWeek(dow);                    // Calculates the humanized abbr. of Days of Week
    return `${daysOfWeek.join('/')}\n${start_time} - ${end_time}`   // Returns a string used for the table
}

// Use this for D.O.W. reference
const dayMapping = {
    0: "Mon",
    1: "Tue",
    2: "Wed",
    3: "Thu",
    4: "Fri",
    5: "Sat",
    6: "Sun"
}

// Takes an integer array and converts it into the shortened D.O.W.
// via the mapping above.
const calculateDaysOfWeek = (days) => {
    let formattedDays = [];

    if (!Array.isArray(days)) {
        throw Error;
    }

    days.forEach(
        (v) => formattedDays.push(dayMapping[v])
    )

    return formattedDays
}

const loadCourseData = async () => {

    await useFetch(
        "/api/calendar/events/courses",
        {
            lazy : false
        }
    ).then(
        ({data}) => {
            userCourseData.value = data.value;
        }
    );

}

const openDropCourseDialogue = (section_id) => {
    dropCourseModalIsOpened.value = true;
    dropCourseSection.value = section_id;
}

const droppedCourseCallback = async () => {
    dropCourseModalIsOpened.value = false;
    await loadCourseData();
    await getCalendarData();
}

onMounted(async () => {
    await loadCourseData();
    await getCalendarData();
})

const generateEventTimeString = (dow, t) => {
    const p = moment(t, "hh:mm:ss").day(dow+1).format("YYYY-MM-DD HH:mm")
    return p;
}

const getCalendarData = async () => {

    const {data} = await useFetch('/api/calendar/events');

    let tmpEventData = [];


    const term_based = data.value.filter((e) => (e.event_type == 1 || e.section.term == selectedTerm.value)); 

    term_based.forEach(
        (event) => {
            event.days.forEach(
                (d) => {
                    tmpEventData.push(
                        {
                            "title" : event.event_type ? event.custom_metadata.name : event.section.course.title,
                            "start" : generateEventTimeString(d, event.start_time),
                            "end" : generateEventTimeString(d, event.end_time)
                        }
                    );
                }
            )
        }
    )

    events.value = tmpEventData;
}

watch(selectedTerm, () => {
    getCalendarData();
})

</script>

<template>
    <div class="">
        <UCard class="m-2">
            <h1 class="text-2xl">Welcome Back!</h1>

            <template #footer>
                <UButton color="gray" icon="i-heroicons-book-open" @click="navigateTo('/')">
                    View Course Catalogue
                </UButton>
            </template>

        </UCard>

        <div class="flex flex-row">

            <div class="w-1/4 m-2">
                <UCard class="h-full">
                    <template #header>
                        <h1 class="text-xl">My Courses</h1>
                    </template>

                    <div v-if="filteredUserCourseData.length > 0">

                        <UCard v-bind:key="c.event_id" v-for="c in filteredUserCourseData" :ui="{body : {padding : 'px-2 py-3 sm:p-4'}}" class="mb-3">
                            <h1 class="text-lg font-semibold">{{ c.section.course.title }} <span class="text-xs text-gray-400 ml-1">{{ ((c.section.term == 0) ? "FA" : "WI") + c.section.number.toString().padStart(2, '0') }}</span></h1>
    
                            <ul class="my-1">
                                <li class="text-sm text-gray-400"><UIcon name="i-mingcute-alarm-2-line" /> {{ generateTimeString(c.days, c.start_time, c.end_time) }}</li>
                                <li class="text-sm text-gray-400"><UIcon name="i-mingcute-building-1-line" /> Beveridge Arts Room 000</li>
                            </ul>
    
                            <UAccordion 
                                :items="[{'slot' : 'more-info', label: 'View More Info'}]"
                                color="primary"
                                variant="ghost"
                                size="sm"
                            >
    
                                <template #more-info>
                                    <ul>
                                        <li><UIcon name="i-mingcute-mortarboard-line" /> Instructor: {{ c.section.professor.name }}</li>
                                        <li><UIcon name="i-mingcute-copper-coin-line" /> Credits: {{ c.section.course.credits }}</li>
                                    </ul>
    
                                    <UButton 
                                        variant="outline" 
                                        class="w-full justify-center mt-2"
                                        @click="openDropCourseDialogue(c.section_id)"
                                    >
                                        Drop Section
                                    </UButton>
                                </template>
    
                            </UAccordion>
    
                        </UCard>

                    </div>

                    <div v-else class="justify-center text-center">
                        <p>You're not enrolled in any courses this term!</p>
                        <UButton color="gray" class="mt-2" @click="navigateTo('/')">
                            View Course Catalogue
                        </UButton>
                    </div>

                </UCard>
            </div>

            <div class="w-3/4 m-2">
                <UCard>
                    
                    <template #header>
                        <div class="flex">
                            <h1 class="flex text-xl">My Schedule</h1>
    
                            <!-- This pushes all of the stuff to the right side of the header -->
                            <div class="flex-grow"></div>

                            <UTabs :items="termTabs" :ui="{'container': 'hidden', tab: 'hidden'}" class="mr-2" v-model="selectedTerm">

                                <template #default="{ item }">
                                    <div class="flex items-center gap-2 relative truncate">
                                        <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />

                                        <span class="truncate">{{ item.label }}</span>

                                    </div>
                                </template>

                            </UTabs>

                            <UButton class="inline-flex" @click="createCustomEventIsOpened = true">
                                <UIcon name="i-mingcute-calendar-add-line" /> Add Custom Event
                            </UButton>
                        </div>

                    </template>

                    <VueCal
                        hide-view-selector
                        hide-title-bar
                        active-view="week"
                        :timeStep="30"
                        :disable-views="['years', 'year', 'day', 'month']"
                        :timeFrom="8 * 60"
                        :timeTo="23 * 60"
                        small
                        :events="events"
                        @ready="getCalendarData"
                        @view-change="getCalendarData"
                    />

                </UCard>
            </div>

        </div>

        <UModal v-model="createCustomEventIsOpened">
            <CreateCustomEvent />
        </UModal>

        <UModal v-model="dropCourseModalIsOpened">
            <ConfirmDropCourse 
                :section_id="dropCourseSection" 
                @cancelled="dropCourseModalIsOpened=false" 
                @dropped="droppedCourseCallback"/>
        </UModal>

    </div>
</template>