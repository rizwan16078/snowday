import re

with open('src/config/discover-pages.ts', 'r') as f:
    text = f.read()

# Replace single quotes with double quotes in relatedSlugs
text = re.sub(r"relatedSlugs: \[(.*?)\]", lambda m: "relatedSlugs: [" + m.group(1).replace("'", '"') + "]", text)

with open('src/config/discover-pages.ts', 'w') as f:
    f.write(text)

