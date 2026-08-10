-- ─── Supabase schema for 점과 잔 ──────────────────────────────
-- Run this in the Supabase SQL Editor before seeding.
-- Requires: pgvector extension (enabled by default on Supabase).

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Whiskeys table
create table if not exists whiskeys (
  id                      text primary key,
  name                    text not null,
  description             text,
  profile_type            text,
  flavor_vector           vector(7) not null,
  image                   text,
  compounds               text[]   default '{}',
  aroma                   text[]   default '{}',
  taste                   text[]   default '{}',
  abv                     numeric  not null,
  history                 text,
  expert_nose             text,
  expert_palate           text,
  expert_finish           text,
  recommended_drink       text,
  price_daily_shot        int,
  price_gs25              int,
  price_cu                int,
  price_duty_free_usd     numeric,
  price_best_buy_strategy text,
  price_category          text,    -- 'entry' | 'middle' | 'high-end'
  trivia                  text[]   default '{}',
  x_pos                   numeric, -- pre-computed 2D flavor-map x ∈ [-1, 1]
  y_pos                   numeric  -- pre-computed 2D flavor-map y ∈ [-1, 1]
);

-- 3. ivfflat index for fast approximate nearest-neighbour (cosine)
--    lists = 50 is appropriate for ~300 rows; raise to 100 if DB grows past 1 000 rows.
create index if not exists whiskeys_flavor_vector_idx
  on whiskeys using ivfflat (flavor_vector vector_cosine_ops)
  with (lists = 50);

-- 4. Row Level Security — public read-only
alter table whiskeys enable row level security;

drop policy if exists "public read" on whiskeys;
create policy "public read"
  on whiskeys for select
  using (true);

-- 5. RPC: top_whiskey_by_tier
--    Returns the single best-matching whiskey for each price tier
--    (entry / middle / high-end) ranked by cosine similarity.
create or replace function top_whiskey_by_tier(query_vector vector(7))
returns table (
  id                      text,
  name                    text,
  description             text,
  profile_type            text,
  flavor_vector           vector(7),
  image                   text,
  compounds               text[],
  aroma                   text[],
  taste                   text[],
  abv                     numeric,
  history                 text,
  expert_nose             text,
  expert_palate           text,
  expert_finish           text,
  recommended_drink       text,
  price_daily_shot        int,
  price_gs25              int,
  price_cu                int,
  price_duty_free_usd     numeric,
  price_best_buy_strategy text,
  price_category          text,
  trivia                  text[],
  tier                    text,
  similarity              float8
)
language sql stable
as $$
  with ranked as (
    select
      w.*,
      case
        when coalesce(w.price_daily_shot, 70000) < 100000  then 'entry'
        when w.price_daily_shot < 300000                   then 'middle'
        else                                                    'high-end'
      end as _tier,
      1 - (w.flavor_vector <=> query_vector) as _sim,
      row_number() over (
        partition by case
          when coalesce(w.price_daily_shot, 70000) < 100000 then 'entry'
          when w.price_daily_shot < 300000                  then 'middle'
          else                                                   'high-end'
        end
        order by w.flavor_vector <=> query_vector
      ) as rn
    from whiskeys w
  )
  select
    id, name, description, profile_type, flavor_vector, image,
    compounds, aroma, taste, abv, history,
    expert_nose, expert_palate, expert_finish, recommended_drink,
    price_daily_shot, price_gs25, price_cu, price_duty_free_usd,
    price_best_buy_strategy, price_category, trivia,
    _tier  as tier,
    _sim   as similarity
  from ranked
  where rn = 1
  order by case _tier
    when 'entry'    then 1
    when 'middle'   then 2
    else                 3
  end
$$;

-- 6. RPC: flavor_map_whiskeys
--    Lightweight projection for the flavour-map canvas (all rows, minimal columns).
create or replace function flavor_map_whiskeys()
returns table (
  id               text,
  name             text,
  abv              numeric,
  image            text,
  price_daily_shot int,
  x_pos            numeric,
  y_pos            numeric
)
language sql stable
as $$
  select id, name, abv, image, price_daily_shot, x_pos, y_pos
  from whiskeys
$$;
