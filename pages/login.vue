<script setup>

const supa = useSupabaseClient();

const signIn = async (state) => {

    errors.value = [];

    const {data, error} = await supa.auth.signInWithPassword({
        email: state.data.email,
        password: state.data.password
    });

    if(!error)
    {
        navigateTo('/dashboard')
    }
    else
    {
        errors.value.push({
            message: error.message
        })
    }

    // console.log(JSON.stringify(error));

}

const formState = ref({
    email : '',
    password : ''
})

const errors = ref([]);

</script>

<template>
    <div>
        
        <div class="w-96 p-4 bg-gray-900 rounded-lg mx-auto my-32">

            <h1 class="mb-4 text-lg">Login</h1>
            
            <UAlert 
                v-bind:key="e" v-for="e in errors" 
                title="Uh Oh!" 
                :description="e.message" 
                icon="i-heroicons-exclamation-circle"
                color="red"
                variant="outline"
                class="mb-4"
            />
    
            <UForm
                :state="formState"
                @submit="signIn"
            >
    
            <UFormGroup label="Email" name="email">
                <UInput v-model="formState.email"/>
            </UFormGroup>
    
            <UFormGroup label="Password" name="password">
                <UInput v-model="formState.password" type="password"/>
            </UFormGroup>
    
            <UButton class="mt-4 w-full justify-center" type="Submit" label="Login"/>
    
            </UForm>

            <hr class="my-4"/>

            <UButton color="gray" class="w-full justify-center" @click="navigateTo('/register')">
                Create an Account
            </UButton>
            

        </div>

    </div>
</template>