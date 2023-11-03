import { serverSupabaseClient } from "#supabase/server"

export default defineEventHandler(
    async (event) => {
        // Supabase :)
        const supa = await serverSupabaseClient(event);

        // Grabs all of the courses' departments, as we don't want to provide filters that don't have data assoc. with them
        const {data, error} = await supa.from("professors")
            .select("name, prof_id");
          
        if (error) {
          throw new Error(error)
        }
        return data
    } 
)