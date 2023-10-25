<script setup>

// Database & Authentication Stuff
const user = useSupabaseUser();
const supa = useSupabaseClient();
const is_authenticated = ref(!!user.value);

// Items used for the filter accordian
const accordianItems = [
    {
        label: 'Departments',
        icon: 'i-heroicons-building-library',
        defaultOpen: false,
        slot: 'departments'
    },
    {
        label: "Terms",
        icon: 'i-heroicons-clock',
        defaultOpen: false,
        slot: 'terms'
    }
];

// Actual data stores for the filter
const selected = ref([]);
const subjects = ref([]);
const courses = ref([]);

const expandedViewCourseData = ref({});
const expandCourseView = ref(false);

const dayMapping = {
    0 : "Mon",
    1 : "Tue",
    2 : "Wed",
    3 : "Thu",
    4 : "Fri",
    5 : "Sat",
    6 : "Sun"
}

const calculateDaysOfWeek = (days) => {
    let formattedDays = [];

    if(!Array.isArray(days))
    {
        throw Error;
    }

    days.forEach(
        (v) => formattedDays.push(dayMapping[v])
    )

    return formattedDays
}

const sectionTableData = computed(
    () => {
        let allSectionData = expandedViewCourseData.sections;
        let allFormattedData = [];

        for(let i = 0; i < allSectionData.length; i++)
        {
            let currentItem = allSectionData[i];

            allFormattedData.push(
                {
                    "title" : ((currentItem.term == 0) ? "FA" : "WI") + currentItem.number,
                    "prof" : currentItem.prof_id,
                    "professor" : currentItem.professors.name,
                    "seat_count" : currentItem.seat_count,
                    "waitlisted" : currentItem.student_count > currentItem.seat_count ? currentItem.student_count - currentItem.seat_count : false,
                    "open_seats" : currentItem.seat_count - currentItem.student_count,
                    "start_time" : currentItem.start_time,
                    "end_time" : currentItem.end_time,
                    "days" : calculateDaysOfWeek(currentItem.days)
                }
            );

            return allFormattedData;
        }
    }
)

// Active filtering code
watch(selected, async (n, o) => {
    await fetchCourseListUsingFilters();
});

// Code for the logout button
const logout = async () => {
    const {err} = await supa.auth.signOut();

    if(!err)
    {
        is_authenticated.value = false;
    }
}

const fetchCourseListUsingFilters = async () => {

    await $fetch("/api/courses",
    {
        query: {
            "dept" : selected.value
        }
    }).then(
        (r) => { courses.value = r }
    );

}

// Fetching data from backend on page mount
onMounted(async () => {

    await $fetch("/api/subjects").then(
        (r) => {subjects.value = r}
    );
    
    await fetchCourseListUsingFilters();

})

const showCourseInformation = async (course_id) => {
    
    // Query the data first.
    await $fetch(`/api/courses/${course_id}`).then(
        (r) => {
            expandedViewCourseData.value = r;
            expandCourseView.value = true; // Show the CourseView afterwards.
        }
    );
}

</script>

<template>

    <UCard class="m-4 bg-black">
        <template #header>
            <div class="py-4">
                <h1 class="text-4xl font-semibold">My New Acadia</h1>
                <h2 class="text-2xl text-gray-500 my-2">A robust course planning tool for Acadia Students</h2>
            </div>
        </template>

        <div v-if="!is_authenticated">
            <UButton class="mr-2" variant="outline" @click="navigateTo('login')">Login</UButton>
            <UButton @click="navigateTo('/register')">Register</UButton>
        </div>
        <div v-else>
            <UButton icon="i-heroicons-calendar-days" color="gray" @click="navigateTo('/dashboard')">View My Schedule</UButton>

            <UButton icon="i-heroicons-arrow-left-on-rectangle" variant="outline" @click="logout" class="float-right">Logout</UButton>
            <UButton icon="i-heroicons-cog-6-tooth" variant="outline" color="gray" @click="logout" class="float-right mr-2">Account Settings</UButton>
        </div>

    </UCard>

    <div class="flex flex-row">

        <div class="w-1/4 px-4 py-4 sticky">
            <UCard>
                <template #header>
                    <h1 class="font-semibold text-xl">Filter Options</h1>
                    <h3 class="text-gray-600 text-sm">{{ courses.length }} results found</h3>
                </template>

                <UAccordion :items="accordianItems">
                    
                    <template #departments>
                        <UCheckbox :key="s.code" :value="s.code" :name="s.name" v-bind="s" v-model="selected" :ref="s.code" v-for="s in subjects">
                            <template #label>
                                <span>{{ s.name }}</span> <UBadge size="sm" variant="outline">{{ s.count }}</UBadge>
                            </template>
                        </UCheckbox>
                        
                    </template>

                    <template #terms>
                        <UCheckbox label="Fall"></UCheckbox>
                        <UCheckbox label="Winter"></UCheckbox>
                    </template>

                </UAccordion>


            </UCard>
        </div>

        <div class="w-3/4 px-4 py-4">
            <div v-if="courses.length > 0">
                <UInput icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search Course Catalogue..." class="mb-3" color="gray" variant="outline"></UInput>
                <UCard v-bind:key="d.code" v-for="d in courses" class="mb-3">
                    <div class="flex flex-row">
                        <div class="flex-grow">
                            <div class="float-right">
                                <UButton :disabled="d.sections.length <= 0" :color="d.sections.length <= 0 ? 'gray' : 'primary'" @click="showCourseInformation(d.course_id)">
                                    {{ d.sections.length <= 0 ? "No Sections Available" : `View Sections (${d.sections.length})` }}
                                </UButton>
                            </div>
                            <h2 class="text-xs">{{ d.department }}-{{ d.code }} • {{ d.credits }} Credits</h2>
                            <h1 class="font-semibold text-xl">{{ d.title }}</h1>
                            <div class="box-content">
                                <p class="m-2 text-gray-400">{{ d.description }}</p>
                            </div>
                            <div v-if="d.requisties">
                                <span class="font-bold">Requisites:</span>
                                <a v-bind:key="r" v-for="r in d.requisites" href="#" class="text-primary underline ml-2">
                                    {{ r }}
                                </a>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <div v-else>
                <h2 class="text-xlg my-4 text-center">
                    No courses found with those filters 😢
                </h2>
            </div>
        </div>

    </div>

    <UModal v-model="expandCourseView">
        <UCard>
            <template #header>
                <h3 class="text-sm text-gray-500">{{ expandedViewCourseData.department }}-{{ expandedViewCourseData.code }} • {{ expandedViewCourseData.credits }} Credits</h3>
                <h1 class="text-2xl">{{ expandedViewCourseData.title }}</h1>

                <!-- Idk why this would happen, but we will put it here anyways :p -->
                <UAlert 
                    v-if="expandedViewCourseData.sections.length < 1"
                    icon="i-heroicons-exclamation-triangle"
                    description="There are no sections available for this course this year!"
                    color="yellow"
                    class="my-3"/>

            </template>

            <p>
                {{ expandedViewCourseData.description }}
            </p>

            <hr class="my-4 border-gray-700" />

            <UTable>

            </UTable>

            <template #footer>
                <UButton color="gray" @click="expandCourseView = false">
                    Close
                </UButton>
            </template>
        </UCard>
    </UModal>
</template>