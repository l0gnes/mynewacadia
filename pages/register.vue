<script setup>

const supa = useSupabaseClient();

const errors = ref([]);

const registerUser = async (state) => {

    errors.value = [];

    const {data, err} = await supa.auth.signUp({
        email: state.data.email,
        password: state.data.password
    })

    if(!err)
    {
        return navigateTo('/');
    }
    else{
        errors.value.push({message : error.message})
    }

}

const validateForm = (state) => {
    const errors = [];

    // All of these fields are required lmao
    if(!state.email){ errors.push({path : "email", message : "This field is required"}); }
    if(!state.password){ errors.push({path : "password", message : "This field is required"}); }
    if(!state.confirmed_password){ errors.push({path : "confirm_password", message : "This field is required"}); }

    // Ensure that the passwords are similar
    if(state.password!==state.confirmed_password)
    {
        errors.push({path : "confirm_password", message : "Passwords do not match!"});
    }

    return errors;

}

const formState = ref({
    email : '',
    password : '',
    confirmed_password : ''
})

</script>

<template>
    <div>
        
        <div class="w-96 p-4 bg-gray-900 rounded-lg mx-auto my-32">

            <h1 class="mb-4 text-lg">Create an Account</h1>
    
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
                :validate="validateForm"
                @submit="registerUser"
            >
    
            <UFormGroup label="Email" name="email">
                <UInput v-model="formState.email"/>
            </UFormGroup>
    
            <UFormGroup label="Password" name="password">
                <UInput v-model="formState.password" type="password"/>
            </UFormGroup>

            <UFormGroup label="Confirm Password" name="confirm_password">
                <UInput v-model="formState.confirmed_password" type="password"/>
            </UFormGroup>
    
            <UButton class="mt-4 w-full justify-center" type="Submit" label="Register"/>
    
            </UForm>

            <hr class="my-4"/>

            <UButton color="gray" class="w-full justify-center" @click="navigateTo('/login')">
                Already have an account? Login here!
            </UButton>
            

        </div>

    </div>
</template>