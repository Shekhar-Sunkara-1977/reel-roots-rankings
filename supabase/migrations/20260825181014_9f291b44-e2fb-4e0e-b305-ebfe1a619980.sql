-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TYPE public.industry AS ENUM ('Bollywood','Tollywood','Kollywood','Mollywood','Sandalwood','Bengali','Other');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)) || '_' || substr(NEW.id::text,1,4));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- MOVIES
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  original_title TEXT,
  industry public.industry NOT NULL DEFAULT 'Other',
  release_year INTEGER,
  poster_url TEXT,
  backdrop_url TEXT,
  runtime INTEGER,
  genres TEXT[] NOT NULL DEFAULT '{}',
  synopsis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.movies TO anon;
GRANT SELECT ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies public read" ON public.movies FOR SELECT USING (true);
CREATE POLICY "movies admin write" ON public.movies FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER movies_updated BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX movies_industry_idx ON public.movies (industry);
CREATE INDEX movies_year_idx ON public.movies (release_year);

-- PEOPLE
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.people TO anon;
GRANT SELECT ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "people public read" ON public.people FOR SELECT USING (true);
CREATE POLICY "people admin write" ON public.people FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER people_updated BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MOVIE_PEOPLE
CREATE TABLE public.movie_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES public.movies ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people ON DELETE CASCADE,
  role_on_film TEXT NOT NULL,
  character_name TEXT,
  billing_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (movie_id, person_id, role_on_film)
);
GRANT SELECT ON public.movie_people TO anon;
GRANT SELECT ON public.movie_people TO authenticated;
GRANT ALL ON public.movie_people TO service_role;
ALTER TABLE public.movie_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credits public read" ON public.movie_people FOR SELECT USING (true);
CREATE POLICY "credits admin write" ON public.movie_people FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- RATINGS
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 10),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
GRANT SELECT ON public.ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings public read" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings owner insert" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings owner update" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings owner delete" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER ratings_updated BEFORE UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX ratings_movie_idx ON public.ratings (movie_id);

-- LISTS
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lists TO authenticated;
GRANT ALL ON public.lists TO service_role;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lists public read" ON public.lists FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "lists owner insert" ON public.lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lists owner update" ON public.lists FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lists owner delete" ON public.lists FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER lists_updated BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.list_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (list_id, movie_id)
);
GRANT SELECT ON public.list_movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_movies TO authenticated;
GRANT ALL ON public.list_movies TO service_role;
ALTER TABLE public.list_movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "list items read" ON public.list_movies FOR SELECT USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND (l.is_public OR l.user_id = auth.uid())));
CREATE POLICY "list items owner write" ON public.list_movies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_year INTEGER,
  industry public.industry NOT NULL DEFAULT 'Other',
  cast_text TEXT,
  director_text TEXT,
  synopsis TEXT,
  poster_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  moderator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions own read" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "submissions own insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "submissions own update" ON public.submissions FOR UPDATE TO authenticated USING (auth.uid() = submitted_by AND status = 'pending') WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "submissions admin update" ON public.submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "submissions own delete" ON public.submissions FOR DELETE TO authenticated USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER submissions_updated BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('review','submission')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports admin read" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR auth.uid() = reporter_id);
CREATE POLICY "reports insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WEIGHTED RANKING VIEW (bayesian)
CREATE VIEW public.movie_stats
WITH (security_invoker = true) AS
SELECT m.id AS movie_id,
       COUNT(r.id)::int AS vote_count,
       COALESCE(AVG(r.score),0)::numeric(4,2) AS avg_score,
       CASE WHEN COUNT(r.id) = 0 THEN 0
         ELSE ROUND(((COUNT(r.id)::numeric * AVG(r.score)) + (5 * 6.5)) / (COUNT(r.id) + 5), 2)
       END AS weighted_score
FROM public.movies m
LEFT JOIN public.ratings r ON r.movie_id = m.id
GROUP BY m.id;
GRANT SELECT ON public.movie_stats TO anon, authenticated, service_role;

-- SEED CATALOGUE
INSERT INTO public.movies (title, industry, release_year, runtime, genres, synopsis) VALUES
('Sholay','Bollywood',1975,204,'{Action,Adventure,Drama}','Two small-time crooks are hired by a retired police officer to capture the ruthless dacoit Gabbar Singh.'),
('Dilwale Dulhania Le Jayenge','Bollywood',1995,189,'{Romance,Drama}','Raj and Simran fall in love on a Europe trip, but her father has other plans.'),
('Lagaan','Bollywood',2001,224,'{Drama,Sport}','Villagers in colonial India stake their taxes on a game of cricket against their British rulers.'),
('Gangs of Wasseypur','Bollywood',2012,321,'{Crime,Drama}','A sprawling coal-mafia blood feud across three generations in Dhanbad.'),
('Andhadhun','Bollywood',2018,139,'{Thriller,Comedy}','A blind pianist becomes entangled in a murder he may or may not have witnessed.'),
('Baahubali: The Beginning','Tollywood',2015,159,'{Action,Fantasy,Drama}','A young man discovers his royal lineage and the war for the throne of Mahishmati.'),
('RRR','Tollywood',2022,187,'{Action,Drama}','Two revolutionaries forge an explosive friendship in 1920s colonial India.'),
('Arjun Reddy','Tollywood',2017,182,'{Drama,Romance}','A brilliant but self-destructive surgeon spirals after losing the woman he loves.'),
('Jersey','Tollywood',2019,157,'{Drama,Sport}','A failed cricketer attempts a comeback in his late thirties for his son.'),
('Nayakan','Kollywood',1987,145,'{Crime,Drama}','A Tamil slum boy in Bombay rises to become a beloved and feared don.'),
('Vikram','Kollywood',2022,175,'{Action,Thriller}','A black-ops squad hunts a masked vigilante gang through a narcotics underworld.'),
('Anbe Sivam','Kollywood',2003,160,'{Drama,Comedy}','Two strangers on a forced road trip discover radically different worldviews.'),
('96','Kollywood',2018,158,'{Romance,Drama}','School sweethearts reunite twenty-two years later for one bittersweet night.'),
('Drishyam','Mollywood',2013,160,'{Thriller,Crime}','A cable operator goes to extraordinary lengths to shield his family from a crime.'),
('Kumbalangi Nights','Mollywood',2019,135,'{Drama,Comedy}','Four estranged brothers in a coastal village slowly rebuild their bond.'),
('Jallikattu','Mollywood',2019,91,'{Thriller,Drama}','A runaway buffalo unleashes primal chaos on a hill village.'),
('Premam','Mollywood',2015,156,'{Romance,Drama}','Three chapters of love across the life of a young man in Kerala.'),
('KGF: Chapter 1','Sandalwood',2018,156,'{Action,Drama}','A ruthless enforcer infiltrates a brutal gold-mining empire in Kolar.'),
('Kantara','Sandalwood',2022,148,'{Action,Thriller,Drama}','A Kambala champion clashes with forest authority as divine tradition stirs.'),
('Lucia','Sandalwood',2013,130,'{Thriller,Drama}','An insomniac usher buys pills that let him live the life he dreams of.'),
('Pather Panchali','Bengali',1955,125,'{Drama}','A poor Bengali family''s life in rural Nischindipur, seen through young Apu.'),
('Charulata','Bengali',1964,117,'{Drama,Romance}','A lonely wife in 1870s Calcutta finds intellectual kinship with her husband''s cousin.'),
('Meghe Dhaka Tara','Bengali',1960,126,'{Drama}','A self-sacrificing young woman holds up a refugee family in post-Partition Calcutta.');

INSERT INTO public.people (name, bio) VALUES
('Amitabh Bachchan','Actor'),('Ramesh Sippy','Director'),('R. D. Burman','Music Director'),
('Shah Rukh Khan','Actor'),('Aditya Chopra','Director'),('Aamir Khan','Actor'),('Ashutosh Gowariker','Director'),
('A. R. Rahman','Music Director'),('Anurag Kashyap','Director'),('Nawazuddin Siddiqui','Actor'),
('Ayushmann Khurrana','Actor'),('Sriram Raghavan','Director'),
('S. S. Rajamouli','Director'),('Prabhas','Actor'),('N. T. Rama Rao Jr.','Actor'),('Ram Charan','Actor'),
('M. M. Keeravani','Music Director'),('Vijay Deverakonda','Actor'),('Sandeep Reddy Vanga','Director'),('Nani','Actor'),
('Kamal Haasan','Actor'),('Mani Ratnam','Director'),('Ilaiyaraaja','Music Director'),('Lokesh Kanagaraj','Director'),
('Anirudh Ravichander','Music Director'),('Sudha Kongara','Director'),('Vijay Sethupathi','Actor'),('C. Prem Kumar','Director'),
('Mohanlal','Actor'),('Jeethu Joseph','Director'),('Fahadh Faasil','Actor'),('Madhu C. Narayanan','Director'),
('Lijo Jose Pellissery','Director'),('Nivin Pauly','Actor'),('Alphonse Puthren','Director'),
('Yash','Actor'),('Prashanth Neel','Director'),('Ravi Basrur','Music Director'),('Rishab Shetty','Actor'),('Pawan Kumar','Director'),
('Satyajit Ray','Director'),('Ravi Shankar','Music Director'),('Soumitra Chatterjee','Actor'),('Madhabi Mukherjee','Actor'),
('Ritwik Ghatak','Director'),('Supriya Devi','Actor');

INSERT INTO public.movie_people (movie_id, person_id, role_on_film, billing_order)
SELECT m.id, p.id, v.role, v.ord FROM (VALUES
('Sholay','Amitabh Bachchan','actor',1),('Sholay','Ramesh Sippy','director',0),('Sholay','R. D. Burman','music_director',0),
('Dilwale Dulhania Le Jayenge','Shah Rukh Khan','actor',1),('Dilwale Dulhania Le Jayenge','Aditya Chopra','director',0),
('Lagaan','Aamir Khan','actor',1),('Lagaan','Ashutosh Gowariker','director',0),('Lagaan','A. R. Rahman','music_director',0),
('Gangs of Wasseypur','Nawazuddin Siddiqui','actor',1),('Gangs of Wasseypur','Anurag Kashyap','director',0),
('Andhadhun','Ayushmann Khurrana','actor',1),('Andhadhun','Sriram Raghavan','director',0),
('Baahubali: The Beginning','Prabhas','actor',1),('Baahubali: The Beginning','S. S. Rajamouli','director',0),('Baahubali: The Beginning','M. M. Keeravani','music_director',0),
('RRR','N. T. Rama Rao Jr.','actor',1),('RRR','Ram Charan','actor',2),('RRR','S. S. Rajamouli','director',0),('RRR','M. M. Keeravani','music_director',0),
('Arjun Reddy','Vijay Deverakonda','actor',1),('Arjun Reddy','Sandeep Reddy Vanga','director',0),
('Jersey','Nani','actor',1),
('Nayakan','Kamal Haasan','actor',1),('Nayakan','Mani Ratnam','director',0),('Nayakan','Ilaiyaraaja','music_director',0),
('Vikram','Kamal Haasan','actor',1),('Vikram','Vijay Sethupathi','actor',2),('Vikram','Lokesh Kanagaraj','director',0),('Vikram','Anirudh Ravichander','music_director',0),
('Anbe Sivam','Kamal Haasan','actor',1),
('96','Vijay Sethupathi','actor',1),('96','C. Prem Kumar','director',0),
('Drishyam','Mohanlal','actor',1),('Drishyam','Jeethu Joseph','director',0),
('Kumbalangi Nights','Fahadh Faasil','actor',1),('Kumbalangi Nights','Madhu C. Narayanan','director',0),
('Jallikattu','Lijo Jose Pellissery','director',0),
('Premam','Nivin Pauly','actor',1),('Premam','Alphonse Puthren','director',0),
('KGF: Chapter 1','Yash','actor',1),('KGF: Chapter 1','Prashanth Neel','director',0),('KGF: Chapter 1','Ravi Basrur','music_director',0),
('Kantara','Rishab Shetty','actor',1),('Kantara','Rishab Shetty','director',0),('Kantara','Ravi Basrur','music_director',0),
('Lucia','Pawan Kumar','director',0),
('Pather Panchali','Satyajit Ray','director',0),('Pather Panchali','Ravi Shankar','music_director',0),
('Charulata','Satyajit Ray','director',0),('Charulata','Soumitra Chatterjee','actor',1),('Charulata','Madhabi Mukherjee','actor',2),
('Meghe Dhaka Tara','Ritwik Ghatak','director',0),('Meghe Dhaka Tara','Supriya Devi','actor',1)
) AS v(movie, person, role, ord)
JOIN public.movies m ON m.title = v.movie
JOIN public.people p ON p.name = v.person;