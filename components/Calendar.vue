<script setup>
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

const props = defineProps({'events' : 'object'});

</script>

<template>

    <div>
        <VueCal
            hide-view-selector
            hide-title-bar
            active-view="week"
            :timeStep="30"
            :disable-views="['years', 'year', 'day', 'month']"
            :timeFrom="8 * 60"
            :timeTo="23 * 60"
            small
            :events="props.events"
        />
    </div>

</template>