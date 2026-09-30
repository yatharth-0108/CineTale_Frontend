// DEMO DATA ONLY — shown when TMDB is not configured. Fictional titles, no artwork.
const m = (id, title, y, genres, r, runtime, overview) => ({ id, title, release_date: `${y}-06-01`, genres, vote_average: r, runtime, overview, poster_path: null, backdrop_path: null });
export const MOCK_MOVIES = [
  m(1, 'Midnight Orchard', 2023, ['Drama'], 7.9, 118, 'A widowed farmer discovers her late husband’s secret notebooks hidden among the trees.'),
  m(2, 'The Salt Cartographer', 2021, ['Adventure'], 7.4, 132, 'A mapmaker follows a vanishing coastline to find a city that no chart admits exists.'),
  m(3, 'Paper Satellites', 2024, ['Sci-Fi'], 8.1, 124, 'Two students launch handmade satellites and begin receiving replies.'),
  m(4, 'Long Way to Lisbon', 2019, ['Romance', 'Comedy'], 7.2, 104, 'Two strangers share a missed train and an improbable road trip.'),
  m(5, 'Quiet Machines', 2022, ['Sci-Fi', 'Thriller'], 7.7, 110, 'A factory’s maintenance robots start keeping secrets from their engineers.'),
  m(6, 'A Field of Lanterns', 2020, ['Fantasy', 'Family'], 7.0, 98, 'A child tends a field of lanterns that only glow for the lost.'),
  m(7, 'Harbor Lights', 2018, ['Crime', 'Drama'], 7.5, 121, 'A night-shift dockworker witnesses something he was never meant to see.'),
  m(8, 'The Last Projectionist', 2025, ['Drama'], 8.3, 127, 'The final film-reel operator in a small town screens one last mystery.'),
  m(9, 'Static Bloom', 2024, ['Mystery', 'Sci-Fi'], 7.6, 115, 'A radio astronomer hears a signal that sounds like a lullaby.'),
  m(10, 'Everything Loud', 2022, ['Comedy'], 6.9, 96, 'A family reunion collides with a neighbourhood talent show.'),
  m(11, 'Iron Weather', 2017, ['Action', 'Adventure'], 7.1, 129, 'A storm-chaser crew races a hurricane across a continent.'),
  m(12, 'The Quiet Hour', 2021, ['Horror', 'Mystery'], 7.3, 101, 'Every night at 3 a.m., the house goes silent, and something listens.'),
];
