set nocount on;
set xact_abort on;

update tutorProfiles
set Achievements = replace(replace(Achievements, 'Lumora', 'Mentora'), 'LUMORA', 'MENTORA')
where Achievements like '%Lumora%' or Achievements like '%LUMORA%';

update tutorProfiles
set Tagline = replace(replace(Tagline, 'Lumora', 'Mentora'), 'LUMORA', 'MENTORA')
where Tagline like '%Lumora%' or Tagline like '%LUMORA%';
