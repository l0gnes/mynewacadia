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

// The Mapping for the CourseView table
const courseViewCols = [
    {
        key: "section",
        label : "Section",
    },
    {
        key: "prof_name",
        label: "Professor"
    },
    {
        key: "times",
        label: "Times"
    },
    {
        key: "vacancy",
        label: "Occupants"
    },
    {
        key: "enroll" // This is handle via custom slots
    }
]

// Actual data stores for the filter
const filterDepartment = ref([]);   // department list
const searchBarContent = ref('');   // search bar reactive var

const subjects = ref([]);           // all the different subjects we have in the database
const courses = ref([]);            // all of the different courses we are serving

// Data for the CourseView
const expandedViewCourseData = ref({});     // JSON data served from the API
const expandCourseView = ref(false);        // Reactive variable to actually show the CourseView modal

// A list of all of the courses that the user is enrolled in
const enrolledCourses = ref([]);

// Use this for D.O.W. reference
const dayMapping = {
    0 : "Mon",
    1 : "Tue",
    2 : "Wed",
    3 : "Thu",
    4 : "Fri",
    5 : "Sat",
    6 : "Sun"
}

// Takes an integer array and converts it into the shortened D.O.W.
// via the mapping above.
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

// Utility function for generating a string to indicate section vacancy
const generateVacancyString = (seat_count, student_count) => {
    if(student_count > seat_count)
    {
        return `${seat_count} Seats, ${student_count - seat_count} Waitlisted`;
    }
    else
    {
        return `${seat_count} Seats, ${seat_count - student_count} Available`;
    }
}

const generateTimeString = (dow, start_time, end_time) => {
    const daysOfWeek = calculateDaysOfWeek(dow);                    // Calculates the humanized abbr. of Days of Week
    return `${daysOfWeek.join('/')}\n${start_time} - ${end_time}`   // Returns a string used for the table
}

// This method generates the section table for the CourseView
const getSectionDataForTable = () => {
    let formattedData = [];

    expandedViewCourseData.value.sections.forEach(
        (s) => {
            formattedData.push(
                {
                    "section_id" : s.section_id,
                    "section": ((s.term == 0) ? "FA" : "WI") + s.number.toString().padStart(2, '0'),
                    "prof_name": s.professors.name,
                    "vacancy": generateVacancyString(s.seat_count, s.student_count),
                    "times": generateTimeString(s.days, s.start_time, s.end_time),
                    "is_waitlisted" : (s.seat_count < s.student_count)  // Used in detemining Button text in the CourseView (E.g., Enroll/Waitlist)
                }
            )
        }
    );

    return formattedData;
}

// Active filtering code
watch([filterDepartment, searchBarContent], async ([n_sel, n_ser], [o_sel, o_ser]) => {
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

// Calling this resupplies the displayed courses in respect to our filters
const fetchCourseListUsingFilters = async () => {

    let query = {}

    if(searchBarContent.value.length > 0)
        { query["search"] = searchBarContent.value; }

    if(filterDepartment.value.length > 0)
        { query["dept"] = filterDepartment.value; }

    await $fetch("/api/courses", { query: query }).then(
        (r) => { courses.value = r; }
    );

}

// Fetching data from backend on page mount, this should really only be used for the filter list.
// This also does the initial query to propogate the course catalogue list.
onMounted(async () => {

    await $fetch("/api/subjects").then(
        (r) => {subjects.value = r}
    );
    
    await fetchEnrolledCourses();
    await fetchCourseListUsingFilters();

})

// Calling this opens the CourseView modal, and displays `course_id` Course's information.
const showCourseInformation = async (course_id) => {
    
    // Query the data first.
    await $fetch(`/api/courses/${course_id}`).then(
        (r) => {
            expandedViewCourseData.value = r;
            expandCourseView.value = true; // Show the CourseView afterwards.
        }
    );
}

// Calling this with a section_id enrolls a user in a course
// It also closes the course view if it is open
// TODO: Make some sort of indicator that the user actually did enroll in the course (e.g., a toast or a message etc.)
const enrollInCourse = async (section_id) => {

    await useFetch(
        "/api/calendar/events/courses",
        {
            method: "PUT",
            body: {
                "section_id": section_id
            },
            lazy: false
        }
    ).then(
        async (o) => {
            expandCourseView.value = false;         // Close the course view if it's open
            await fetchEnrolledCourses()            // Refetch enrolled courses
        }
    );
}

// This function fetches all of the sections that a user is enrolled into and 
// loads it into a variable that is used to detect whether or not a user
// is enrolling or dropping a class
const fetchEnrolledCourses = async () => {
    
    // If user isn't authenticated, then don't return any enrolled courses
    if(!is_authenticated)
    {
        return;
    }

    const {data} = await useFetch("/api/user/section_list", { lazy: false });

    enrolledCourses.value = data;
}

const dropSection = async (section_id) => {
    if(!is_authenticated)
    {
        return;
    }

    await useFetch(`/api/calendar/events/courses/${section_id}`, {method: 'DELETE', lazy: false})
        .then(
            async (resp) => {
                expandCourseView.value = false;                
                await fetchEnrolledCourses();
            }
        )
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
                        <UCheckbox :key="s.code" :value="s.code" :name="s.name" v-bind="s" v-model="filterDepartment" :ref="s.code" v-for="s in subjects">
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
            <UInput icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search Course Catalogue..." class="mb-3" color="gray" variant="outline" v-model="searchBarContent"></UInput>
            <div v-if="courses.length > 0">
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

    <UModal v-model="expandCourseView" :ui="{ width: 'sm:max-w-3xl' }">
        <UCard class="max-w-full">
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

            <UTable :columns="courseViewCols" :rows="getSectionDataForTable()">

                <template #enroll-data="{ row }">

                    <div v-if="!enrolledCourses.value.includes(row.section_id)">
                        <UTooltip text="You must be logged in to do this" :prevent="is_authenticated">
                            <UButton
                                :color="!is_authenticated ? 'gray' : 'primary'"
                                :disabled="!is_authenticated"
                                :variant="row.is_waitlisted ? 'outline' : 'solid'"  
                                class="w-full justify-center" 
                                @click="enrollInCourse(row.section_id)"
                            >
                                {{ row.is_waitlisted ? "Waitlist" : "Enroll" }}
                            </UButton>
                        </UTooltip>
                    </div>
                    <div v-else>
                        <UButton 
                            color="gray"
                            @click="dropSection(row.section_id)"
                        >
                            {{ row.is_waitlisted ? "Unwaitlist" : "Drop" }}
                        </UButton>
                    </div>

                
                </template>

            </UTable>

            <template #footer>
                <UButton color="gray" @click="expandCourseView = false">
                    Close
                </UButton>
            </template>
        </UCard>
    </UModal>
</template>