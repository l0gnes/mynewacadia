import { serverSupabaseClient } from "#supabase/server";
export default defineEventHandler(async (event) => {
  const supa = await serverSupabaseClient(event);
  let query = supa.from("courses").select("course_id, department, code");
  const { data, error } = await query;
  return data;
});
