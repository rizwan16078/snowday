
# Define the templates and categories
categories = {
    "watch-intent": [
        ("what-to-watch-this-weekend", "Top Movies to Watch This Weekend", "Make the most of your weekend with these must-see movies. Curated picks for every type of film lover.", {"sort_by": "popularity.desc"}),
        ("best-movies-to-binge-watch", "Best Movies to Binge Watch This Week", "Ready for a marathon? These gripping movie franchises and trilogies are perfect for a long binge session.", {"sort_by": "popularity.desc", "vote_count.gte": 5000}),
        ("must-watch-movies-2024", "Must-Watch Movies of 2024: The Essential List", "Don't miss out on the biggest hits of the year. Here is the essential list of must-watch movies in 2024.", {"primary_release_year": 2024, "sort_by": "popularity.desc"}),
        ("what-to-watch-on-hulu", "Top Rated Movies to Watch on Hulu Today", "Explore the best cinematic offerings on Hulu. From exclusive titles to classics, find what to watch now.", {"with_watch_providers": 15, "watch_region": "US"}),
        ("what-to-watch-on-amazon-prime", "What to Watch on Amazon Prime Video", "Browse the top-rated films available on Amazon Prime. A curated selection of high-quality streaming options.", {"with_watch_providers": 119, "watch_region": "US"}),
        ("what-to-watch-on-apple-tv", "Top Movies to Watch on Apple TV Plus", "Experience premium storytelling with the best movies on Apple TV+. High-quality picks for enthusiasts.", {"with_watch_providers": 2, "watch_region": "US"}),
        ("latest-movies-to-watch", "New & Latest Movies to Watch This Month", "Stay up to date with the newest releases. Here are the latest movies you need to see this month.", {"sort_by": "primary_release_date.desc", "vote_count.gte": 100}),
        ("popular-movies-this-week", "Most Popular Movies to Watch This Week", "See what everyone is talking about. Discover the most popular and trending movies of the week.", {"sort_by": "popularity.desc"}),
        ("what-to-watch-with-family", "Best Family Movies to Watch Together", "Heartwarming and fun choices for the whole family. Discover movies that kids and adults will love.", {"with_genres": 10751, "sort_by": "popularity.desc"}),
        ("what-to-watch-on-hbo-max", "Best Movies to Stream on HBO Max Right Now", "From blockbuster hits to prestige cinema, check out the best movies currently available on HBO Max.", {"with_watch_providers": 384, "watch_region": "US"}),
        ("what-to-watch-when-sad", "Comforting Movies to Watch When You're Sad", "Lift your spirits with these heartwarming and comforting films. The perfect pick-me-up for a blue day.", {"with_genres": "35,10751", "sort_by": "vote_average.desc"}),
        ("what-to-watch-when-tired", "Easy Movies to Watch When You're Tired", "Too tired for complex plots? Enjoy these light, engaging movies that are easy to watch and enjoy.", {"with_runtime.lte": 100, "sort_by": "popularity.desc"}),
        ("new-movies-to-stream", "Best New Movies to Stream Online Today", "Fresh releases at your fingertips. Discover the best new movies available for streaming right now.", {"sort_by": "primary_release_date.desc", "vote_average.gte": 6.0}),
    ],
    "genre": [
        ("best-sci-fi-movies", "Best Sci-Fi Movies: Epic Science Fiction", "Explore the future and beyond. These are the most groundbreaking sci-fi films in cinematic history.", {"with_genres": 878}),
        ("best-drama-movies", "Most Powerful Drama Movies of All Time", "Emotional stories and incredible acting. Discover the dramas that left a lasting impact on cinema.", {"with_genres": 18}),
        ("best-romance-movies", "Best Romance Movies for Your Next Date", "Feel the love with these iconic romantic films. Perfect for date night or a cozy evening in.", {"with_genres": 10749}),
        ("best-documentary-movies", "Best Documentary Movies to Expand Your Mind", "Learn something new with the most compelling documentaries. Real stories that are stranger than fiction.", {"with_genres": 99}),
        ("best-animation-movies", "Best Animated Movies for All Ages", "From Pixar to Ghibli, discover the world's most beautiful and engaging animated masterpieces.", {"with_genres": 16}),
        ("best-fantasy-movies", "Best Fantasy Movies: Epic Worlds and Magic", "Step into another world. The best fantasy films featuring magic, dragons, and epic adventures.", {"with_genres": 14}),
        ("best-mystery-movies", "Best Mystery Movies with Mind-Bending Twists", "Can you solve the puzzle? These mystery movies will keep you guessing until the very last frame.", {"with_genres": 9648}),
        ("best-crime-movies", "Best Crime Movies: Grit, Gangsters & Gossips", "Dive into the criminal underworld. The most intense and realistic crime dramas ever produced.", {"with_genres": 80}),
        ("best-war-movies", "Most Realistic War Movies & Military Epics", "Powerful portrayals of conflict and heroism. Discover the most impactful war films in cinema.", {"with_genres": 10752}),
        ("best-western-movies", "Best Western Movies: Classic & Modern Picks", "Revisit the frontier. From classic Sergio Leone to modern hits, these are the best Western films.", {"with_genres": 37}),
        ("best-history-movies", "Best Historical Movies & Period Dramas", "Travel back in time with these meticulously crafted historical epics and stunning period dramas.", {"with_genres": 36}),
        ("best-family-movies-list", "Top Rated Family Movies Everyone Will Love", "Create memories with these top-rated family films. Safe, fun, and engaging for viewers of all ages.", {"with_genres": 10751}),
        ("best-musical-movies", "Best Musical Movies: Songs and Stories", "If you love a good tune, check out these iconic musical films that combine great music with drama.", {"with_genres": 10402}),
        ("best-adventure-movies", "Best Adventure Movies for Explorers", "Epic journeys and daring quests. These adventure movies are perfect for those who love to explore.", {"with_genres": 12}),
        ("top-slasher-movies", "Best Slasher Movies for Horror Fans", "Classic slashers and modern kills. Discover the most iconic films in the slasher horror subgenre.", {"with_genres": 27, "with_keywords": "12339"}),
        ("best-biopic-movies", "Best Biopic Movies: True Stories of Icons", "Incredible true stories of legendary people. Watch these powerful biographical films today.", {"with_genres": 18, "with_keywords": "5565"}),
    ]
}

# (I will generate more categories in the same way)

def generate_entry(slug, title, desc, cat, params):
    return f"""  "{slug}": {{
    slug: "{slug}",
    title: "{title}",
    description: "{desc}",
    category: "{cat}",
    tmdbParams: {params},
    content: {{
      intro: "Explore the very best {title.lower()} that cinema has to offer. Our curated selection brings you the top-rated and most influential films in this category.",
      whyItMatters: "Understanding the depth and variety of these films helps viewers appreciate the craft of filmmaking and the power of storytelling.",
      selectionLogic: "We use a combination of TMDB ratings, popularity metrics, and historical significance to ensure each pick is of the highest quality.",
      closing: "Whether you're a long-time fan or a curious newcomer, these movies are sure to provide an unforgettable viewing experience."
    }}
  }},"""

for cat, entries in categories.items():
    for slug, title, desc, params in entries:
        print(generate_entry(slug, title, desc, cat, params))
