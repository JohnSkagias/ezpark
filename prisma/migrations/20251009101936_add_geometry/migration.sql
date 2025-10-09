create extension if not exists postgis;
alter table roads add column if not exists geom geometry(LINESTRING, 4326);
create index if not exists roads_geom_gix on roads using gist (geom);