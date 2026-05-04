import re

with open('src/config/discover-pages.ts', 'r') as f:
    text = f.read()

# Find all slugs
slugs = re.findall(r'^\s*"([^"]+)":\s*\{', text, re.MULTILINE)

# Find all relatedSlugs lists
related_matches = re.findall(r'relatedSlugs:\s*\[(.*?)\]', text, re.DOTALL)
linked_slugs = set()
for match in related_matches:
    slug_in_list = re.findall(r'"([^"]+)"', match)
    linked_slugs.update(slug_in_list)

# Also add footer/navbar linked slugs
footer_nav = ["movies", "trending-now", "hidden-gems", "free-movies", "netflix", "disney-plus", "hbo-max", "hulu"]
linked_slugs.update(footer_nav)

orphans = set(slugs) - linked_slugs

print("Total Slugs:", len(slugs))
print("Linked Slugs:", len(linked_slugs))
print("Orphan Slugs:", orphans)
