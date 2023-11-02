import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(
    async (event) => {
        const supa = await serverSupabaseClient(event);
        const {data : udat, error : uerr} = await supa.auth.getUser();

        if(!udat)
        {
            return createError(
                {
                    statusCode: 401,
                    statusMessage: "User not logged in."
                }
            );
        }

        const {data : dbdat, error : dberr} = await supa.from('events')
            .select()
            .eq('for_user', udat.user.id);

        return dbdat;

    }
)