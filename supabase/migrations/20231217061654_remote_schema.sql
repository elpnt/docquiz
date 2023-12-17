
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."quiz" (
    "id" "text" NOT NULL,
    "quizset_id" "text" NOT NULL,
    "answer_index" smallint NOT NULL,
    "explanation" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "question" "text" NOT NULL
);

ALTER TABLE "public"."quiz" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."quiz_option" (
    "id" "text" NOT NULL,
    "quiz_id" "text" NOT NULL,
    "index" smallint NOT NULL,
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."quiz_option" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."quiz_set" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."quiz_set" OWNER TO "postgres";

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."quiz_option"
    ADD CONSTRAINT "quiz_option_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."quiz"
    ADD CONSTRAINT "quiz_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."quiz_set"
    ADD CONSTRAINT "quiz_set_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."quiz_option"
    ADD CONSTRAINT "quiz_option_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."quiz"
    ADD CONSTRAINT "quiz_quizset_id_fkey" FOREIGN KEY ("quizset_id") REFERENCES "public"."quiz_set"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."quiz_set"
    ADD CONSTRAINT "quiz_set_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

CREATE POLICY "Enable insert for users based on user_id" ON "public"."quiz" FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."quiz_option" FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."quiz_set" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."quiz" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."quiz_option" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."quiz_set" FOR SELECT USING (true);

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."quiz" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."quiz_option" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."quiz_set" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."quiz" TO "anon";
GRANT ALL ON TABLE "public"."quiz" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz" TO "service_role";

GRANT ALL ON TABLE "public"."quiz_option" TO "anon";
GRANT ALL ON TABLE "public"."quiz_option" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_option" TO "service_role";

GRANT ALL ON TABLE "public"."quiz_set" TO "anon";
GRANT ALL ON TABLE "public"."quiz_set" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_set" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
