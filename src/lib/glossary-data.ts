export interface GlossaryTerm {
  /** URL-safe slug used as the anchor (e.g. #petrichor). */
  slug: string;
  /** Display term, e.g. "Petrichor". */
  term: string;
  /** A short, definitional sentence (1-3 sentences). */
  definition: string;
  /** Optional category for filtering. */
  category: "snow" | "cold" | "weather-science" | "storm" | "atmospheric" | "phenomenon" | "safety";
  /** Optional related blog slug — drives the "Learn more" CTA. */
  relatedBlog?: string;
}

/**
 * The full SnowSense weather & snow glossary. Each term gets its own anchor
 * (`/weather-terms#<slug>`) and is included in DefinedTermSet schema so
 * Google can surface entries in featured snippets.
 */
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // A
  {
    slug: "advisory",
    term: "Advisory",
    definition:
      "A National Weather Service alert issued for weather conditions that are inconvenient but not severe enough to warrant a warning. Common examples include winter weather advisories and wind advisories.",
    category: "safety",
  },
  {
    slug: "anvil-cloud",
    term: "Anvil Cloud",
    definition:
      "The flat, spreading top of a fully-developed cumulonimbus cloud, shaped like a blacksmith's anvil. The presence of an anvil cloud is one of the strongest visual indicators of a severe thunderstorm.",
    category: "phenomenon",
    relatedBlog: "first-indicator-bad-weather",
  },
  {
    slug: "atmospheric-pressure",
    term: "Atmospheric Pressure",
    definition:
      "The weight of the air pressing down on the Earth's surface. Drops in atmospheric pressure precede most major storms and are responsible for the joint and ear discomfort many people feel before bad weather.",
    category: "atmospheric",
    relatedBlog: "can-cold-weather-make-arthritis-worse",
  },

  // B
  {
    slug: "barometric-pressure",
    term: "Barometric Pressure",
    definition:
      "Another name for atmospheric pressure, measured by a barometer. Falling barometric pressure typically signals incoming rain or snow, while rising pressure usually means clear, stable weather is on the way.",
    category: "atmospheric",
    relatedBlog: "can-cold-weather-make-arthritis-worse",
  },
  {
    slug: "black-ice",
    term: "Black Ice",
    definition:
      "A thin, transparent layer of ice that forms on roads and sidewalks, usually when temperatures hover near freezing and moisture refreezes. It is nearly invisible against dark pavement, making it one of the most dangerous winter driving hazards.",
    category: "safety",
  },
  {
    slug: "blizzard",
    term: "Blizzard",
    definition:
      "A severe winter storm officially defined by sustained winds over 35 mph, considerable falling or blowing snow, and visibility under a quarter-mile for at least three hours. Snow accumulation is not part of the criteria.",
    category: "snow",
  },
  {
    slug: "blowing-snow",
    term: "Blowing Snow",
    definition:
      "Snow lifted from the surface by wind, typically reducing visibility to under seven miles. Blowing snow is a primary driver of school and road closures even when no new snow is falling.",
    category: "snow",
  },

  // C
  {
    slug: "cold-front",
    term: "Cold Front",
    definition:
      "The aggressive boundary where a colder air mass forces a warmer air mass upward. Cold fronts move quickly, produce sharp temperature drops, and often trigger thunderstorms or snow squalls along the leading edge.",
    category: "weather-science",
    relatedBlog: "science-olympiad-weather-or-not",
  },
  {
    slug: "cold-urticaria",
    term: "Cold Urticaria",
    definition:
      "A real medical allergy to cold air or cold water in which exposure triggers histamine release, causing hives, swelling, and in rare cases anaphylaxis. Severe cases can react to holding an iced drink or jumping into cold water.",
    category: "safety",
    relatedBlog: "allergic-to-cold-weather",
  },
  {
    slug: "convective-heat-loss",
    term: "Convective Heat Loss",
    definition:
      "The process by which moving air strips heat from a warm surface, including human skin. Convective heat loss is why a windy 40°F day feels far colder than a calm 40°F day.",
    category: "atmospheric",
  },
  {
    slug: "cumulonimbus",
    term: "Cumulonimbus",
    definition:
      "Tall, dense storm clouds that produce thunderstorms, heavy rain, hail, and tornadoes. They appear dark from below because thick water content blocks sunlight from reaching the bottom of the cloud.",
    category: "phenomenon",
    relatedBlog: "first-indicator-bad-weather",
  },
  {
    slug: "curing",
    term: "Curing (Concrete & Paint)",
    definition:
      "The chemical reaction by which concrete and paint reach full strength. Both processes are temperature-sensitive: pouring concrete or applying paint when overnight temperatures drop below freezing can permanently weaken the result.",
    category: "weather-science",
    relatedBlog: "can-you-pour-concrete-cold-weather",
  },

  // D
  {
    slug: "danger-zone",
    term: "Danger Zone (Food Safety)",
    definition:
      "The temperature range between 40°F and 140°F in which bacteria multiply rapidly. Critical for hunters: a deer carcass left to hang in 50°F weather is in the Danger Zone and should be cooled mechanically.",
    category: "safety",
    relatedBlog: "how-long-can-deer-hang-50-degrees",
  },
  {
    slug: "deep-freeze",
    term: "Deep Freeze",
    definition:
      "An extended period of unusually cold temperatures, typically below 0°F, that threatens infrastructure such as plumbing, vehicles, and the power grid. Deep freezes trigger primal anxiety because everyday systems become fragile.",
    category: "cold",
    relatedBlog: "does-cold-weather-make-you-nervous",
  },
  {
    slug: "dew-point",
    term: "Dew Point",
    definition:
      "The temperature at which the air becomes saturated and water vapor condenses into liquid. A high dew point on a hot day produces oppressive humidity; a low dew point makes the air feel dry.",
    category: "atmospheric",
  },
  {
    slug: "doppler-radar",
    term: "Doppler Radar",
    definition:
      "A radar system that detects precipitation and measures its movement using the Doppler effect. It powers nearly all live storm tracking, including the radar used in modern snow day predictions.",
    category: "weather-science",
  },
  {
    slug: "downdraft",
    term: "Downdraft",
    definition:
      "A column of cold air rushing downward out of a thunderstorm. The sudden cold gust you feel before a summer storm hits is a downdraft from miles away.",
    category: "phenomenon",
    relatedBlog: "first-indicator-bad-weather",
  },

  // E
  {
    slug: "el-nino",
    term: "El Niño",
    definition:
      "A periodic warming of the central and eastern Pacific Ocean that disrupts global weather patterns, often producing wetter winters in the southern United States and milder winters in the north.",
    category: "weather-science",
  },
  {
    slug: "evaporative-cooling",
    term: "Evaporative Cooling",
    definition:
      "The process by which sweat evaporates off the skin, removing heat and cooling the body. Synthetic running fabrics enable this process; cotton blocks it.",
    category: "atmospheric",
    relatedBlog: "what-to-wear-running-in-50-degree-weather",
  },

  // F
  {
    slug: "flash-freeze",
    term: "Flash Freeze",
    definition:
      "A rapid, dramatic temperature drop that turns wet roads and surfaces into solid ice within minutes. Flash freezes typically follow rain showers as a strong cold front moves through.",
    category: "cold",
  },
  {
    slug: "freeze-thaw-cycle",
    term: "Freeze-Thaw Cycle",
    definition:
      "The repeated freezing and thawing of trapped water in cracks and seams. Water expands roughly 9% as it freezes, slowly destroying concrete, paint, and outdoor furniture from the inside out.",
    category: "phenomenon",
    relatedBlog: "weather-resistant-patio-furniture",
  },
  {
    slug: "freezing-rain",
    term: "Freezing Rain",
    definition:
      "Rain that falls as liquid but freezes on contact with cold surfaces. It coats roads, trees, and power lines with a glaze of ice and is one of the most disruptive winter precipitation types.",
    category: "snow",
  },
  {
    slug: "frostbite",
    term: "Frostbite",
    definition:
      "Tissue damage caused when skin and underlying tissues freeze, most commonly affecting fingers, toes, ears, and nose. Wind chill can cause frostbite in under 30 minutes at extreme cold temperatures.",
    category: "safety",
    relatedBlog: "why-do-ears-hurt-cold-weather",
  },

  // H
  {
    slug: "heat-index",
    term: "Heat Index",
    definition:
      "A measure of how hot the air actually feels when humidity is factored in with the air temperature. A 90°F day with 70% humidity has a heat index near 105°F.",
    category: "atmospheric",
  },
  {
    slug: "high-pressure-system",
    term: "High-Pressure System",
    definition:
      "An area where atmospheric pressure is higher than its surroundings, characterized by sinking air, clear skies, and stable weather. High-pressure systems usually mean dry, calm conditions.",
    category: "atmospheric",
  },
  {
    slug: "humidity",
    term: "Humidity",
    definition:
      "The amount of water vapor in the air, usually expressed as relative humidity. High humidity makes hot weather feel hotter and cold weather feel sharper.",
    category: "atmospheric",
    relatedBlog: "is-silk-good-for-hot-weather",
  },
  {
    slug: "hydration-reaction",
    term: "Hydration Reaction (Concrete)",
    definition:
      "The chemical reaction between water and cement that gives concrete its strength. The reaction is heavily temperature-dependent and can lose up to 50% of final strength if interrupted by freezing.",
    category: "weather-science",
    relatedBlog: "can-you-pour-concrete-cold-weather",
  },
  {
    slug: "hypothermia",
    term: "Hypothermia",
    definition:
      "A medical emergency in which the body's core temperature drops below 95°F. Wet clothing, especially cotton, dramatically accelerates heat loss and is the leading contributor to hypothermia in mild cold conditions.",
    category: "safety",
    relatedBlog: "what-to-wear-running-in-40-degree-weather",
  },

  // I
  {
    slug: "ice-dam",
    term: "Ice Dam",
    definition:
      "A wall of ice that forms at the edge of a roof when melted snow refreezes in the gutters. Ice dams trap melting water under shingles, where it can leak through ceilings and rot the roof deck.",
    category: "safety",
    relatedBlog: "maintain-roof-harsh-weather",
  },
  {
    slug: "ice-storm",
    term: "Ice Storm",
    definition:
      "A storm that produces freezing rain heavy enough to coat surfaces with at least a quarter-inch of ice. Ice storms are infamous for crippling power grids by snapping tree limbs and power lines.",
    category: "storm",
  },
  {
    slug: "isobars",
    term: "Isobars",
    definition:
      "Lines on a weather map connecting points of equal atmospheric pressure. Tightly-packed isobars indicate strong winds and rapidly-changing weather.",
    category: "weather-science",
  },

  // J
  {
    slug: "jet-stream",
    term: "Jet Stream",
    definition:
      "A narrow band of fast-moving air high in the atmosphere that steers weather systems across continents. Dips in the jet stream pull frigid Arctic air south, producing North America's most severe winter outbreaks.",
    category: "weather-science",
  },

  // L
  {
    slug: "la-nina",
    term: "La Niña",
    definition:
      "A cooling of the central and eastern Pacific Ocean — the opposite phase of El Niño. La Niña often produces colder, snowier winters in the northern United States and drier conditions in the south.",
    category: "weather-science",
  },
  {
    slug: "lake-effect-snow",
    term: "Lake-Effect Snow",
    definition:
      "Heavy, localized snowfall produced when cold air passes over warmer lake water, picking up moisture that falls as snow downwind. Cities like Buffalo, NY can receive several feet of snow from a single lake-effect band while areas just miles away see nothing.",
    category: "snow",
  },
  {
    slug: "low-pressure-system",
    term: "Low-Pressure System",
    definition:
      "An area where atmospheric pressure is lower than its surroundings, characterized by rising air, cloud formation, and unstable weather. Low-pressure systems are responsible for most rain and snow events.",
    category: "atmospheric",
  },

  // M
  {
    slug: "microclimate",
    term: "Microclimate",
    definition:
      "A small area with weather distinctly different from its surroundings, often caused by elevation, water bodies, or urban heat. Hawaii's islands famously contain dozens of microclimates within a few miles.",
    category: "phenomenon",
    relatedBlog: "hawaii-weather-in-october",
  },

  // N
  {
    slug: "noreaster",
    term: "Nor'easter",
    definition:
      "A powerful storm system that strikes the U.S. East Coast with strong northeasterly winds. Nor'easters are notorious for producing blizzards in winter and damaging coastal flooding year-round.",
    category: "storm",
  },

  // O
  {
    slug: "occluded-front",
    term: "Occluded Front",
    definition:
      "A weather front formed when a fast-moving cold front overtakes a slower warm front. Occluded fronts typically produce extended periods of precipitation as the system winds down.",
    category: "weather-science",
  },

  // P
  {
    slug: "petrichor",
    term: "Petrichor",
    definition:
      "The earthy scent that rises from dry soil right before rain. It is produced by plant oils and bacterial compounds released when humidity spikes — one of the most reliable physical indicators of an incoming storm.",
    category: "phenomenon",
    relatedBlog: "first-indicator-bad-weather",
  },
  {
    slug: "polar-vortex",
    term: "Polar Vortex",
    definition:
      "A large mass of cold air normally circling the Arctic in the upper atmosphere. When the vortex weakens, frigid Arctic air spills southward into North America and Europe, producing dangerous deep freezes.",
    category: "cold",
    relatedBlog: "does-cold-weather-make-you-nervous",
  },
  {
    slug: "precipitation",
    term: "Precipitation",
    definition:
      "Any form of water — liquid or solid — that falls from clouds to the ground, including rain, snow, sleet, hail, and freezing rain.",
    category: "atmospheric",
  },

  // R
  {
    slug: "radar",
    term: "Radar (Weather)",
    definition:
      "An electronic system that bounces radio waves off precipitation to map storm location, intensity, and motion. Modern Doppler radar is the foundation of nearly all real-time storm tracking.",
    category: "weather-science",
  },

  // S
  {
    slug: "sea-breeze",
    term: "Sea Breeze",
    definition:
      "A wind that blows from a cool body of water onto warmer land during the day. Sea breezes are why coastal beaches can feel surprisingly chilly even on hot summer afternoons.",
    category: "phenomenon",
    relatedBlog: "may-outer-banks-weather",
  },
  {
    slug: "sleet",
    term: "Sleet",
    definition:
      "Frozen pellets of ice formed when raindrops refreeze before hitting the ground. Sleet bounces on impact, unlike freezing rain, which coats surfaces.",
    category: "snow",
  },
  {
    slug: "snow-day",
    term: "Snow Day",
    definition:
      "A day on which schools or workplaces close due to heavy snow, ice, or dangerous wind chill. Closure decisions depend on accumulation rate, road conditions, and the timing of the storm relative to the morning commute.",
    category: "snow",
  },
  {
    slug: "snow-squall",
    term: "Snow Squall",
    definition:
      "A brief, intense burst of heavy snow accompanied by gusty winds that drops visibility to near zero. Snow squalls are notoriously dangerous on highways and trigger emergency advisories from the National Weather Service.",
    category: "snow",
  },
  {
    slug: "snowfall-accumulation",
    term: "Snowfall Accumulation",
    definition:
      "The total depth of snow on the ground after a storm, typically measured in inches. The rate of accumulation often matters more than the total: 4 inches in an hour is far more disruptive than 8 inches over a full day.",
    category: "snow",
  },
  {
    slug: "snowpack",
    term: "Snowpack",
    definition:
      "The layer of accumulated snow that builds up over a winter season, especially in mountain regions. Snowpack is critical for spring water supply and is closely monitored by water resource agencies.",
    category: "snow",
  },
  {
    slug: "stratus-cloud",
    term: "Stratus Cloud",
    definition:
      "A flat, gray, layered cloud that blankets the entire sky. Stratus clouds typically produce drizzle or light, steady snow and signal stable but dreary weather.",
    category: "phenomenon",
  },
  {
    slug: "subzero",
    term: "Subzero",
    definition:
      "Air or wind chill temperatures below 0°F. Subzero conditions can cause frostbite within minutes of exposure to bare skin and are the threshold at which schools commonly close for cold alone.",
    category: "cold",
  },

  // T
  {
    slug: "thunderstorm",
    term: "Thunderstorm",
    definition:
      "A storm produced by cumulonimbus clouds, accompanied by thunder, lightning, heavy rain, and often hail or strong winds. Severe thunderstorms can spawn tornadoes.",
    category: "storm",
  },
  {
    slug: "tornado",
    term: "Tornado",
    definition:
      "A violently rotating column of air extending from a thunderstorm to the ground. Tornadoes can produce winds over 300 mph and remain the most destructive small-scale weather phenomenon on Earth.",
    category: "storm",
  },

  // V
  {
    slug: "visibility",
    term: "Visibility",
    definition:
      "The distance at which an object can be clearly seen. Snowstorms and fog can drop visibility to near zero, which is the legal trigger for many winter driving advisories and school closures.",
    category: "safety",
  },

  // W
  {
    slug: "warm-front",
    term: "Warm Front",
    definition:
      "The gradual boundary where a warmer air mass slides over a cooler one. Warm fronts produce extended periods of light rain or snow rather than the sharp storms typical of cold fronts.",
    category: "weather-science",
    relatedBlog: "science-olympiad-weather-or-not",
  },
  {
    slug: "wind-chill",
    term: "Wind Chill",
    definition:
      "The apparent temperature your skin perceives when wind speed strips heat from your body. Wind chill is what makes a 20°F day with strong wind feel like -5°F, and it is the primary measure used in cold-weather school closure decisions.",
    category: "cold",
    relatedBlog: "why-do-ears-hurt-cold-weather",
  },
  {
    slug: "wind-shear",
    term: "Wind Shear",
    definition:
      "A change in wind speed or direction over a short distance. Strong wind shear in the atmosphere is a key ingredient in severe thunderstorms and tornado formation.",
    category: "weather-science",
  },
  {
    slug: "winter-storm-warning",
    term: "Winter Storm Warning",
    definition:
      "A National Weather Service alert issued when severe winter weather is occurring, imminent, or highly likely. Warnings are more serious than watches and indicate that travel will become dangerous.",
    category: "safety",
  },
  {
    slug: "winter-storm-watch",
    term: "Winter Storm Watch",
    definition:
      "A National Weather Service alert issued when severe winter weather is possible within 48 hours. A watch means conditions are favorable; a warning means it is happening.",
    category: "safety",
  },
];

/** Returns all unique starting letters present in the glossary, sorted A-Z. */
export function getGlossaryLetters(): string[] {
  const set = new Set(GLOSSARY_TERMS.map((t) => t.term[0].toUpperCase()));
  return Array.from(set).sort();
}

/** Group terms by their first letter. */
export function groupGlossaryByLetter(): Record<string, GlossaryTerm[]> {
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (const t of GLOSSARY_TERMS) {
    const letter = t.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  }
  for (const letter of Object.keys(grouped)) {
    grouped[letter].sort((a, b) => a.term.localeCompare(b.term));
  }
  return grouped;
}
