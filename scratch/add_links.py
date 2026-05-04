import re

with open('src/config/discover-pages.ts', 'r') as f:
    text = f.read()

# Add to trending-now
text = re.sub(
    r'("trending-now": \{.*?relatedSlugs: \[)(.*?)(\],)',
    r'\1\2, "must-watch-movies-2024", "best-action-thrillers-2024"\3',
    text,
    flags=re.DOTALL
)

# Add to netflix
text = re.sub(
    r'("netflix": \{.*?relatedSlugs: \[)(.*?)(\],)',
    r'\g<1>"what-to-watch-on-netflix", \2\3',
    text,
    flags=re.DOTALL
)

# hbo-max
text = re.sub(
    r'("hbo-max": \{.*?relatedSlugs: \[)(.*?)(\],)',
    r'\1\2, "best-movies-on-peacock", "best-movies-on-paramount-plus", "best-movies-on-apple-tv-plus"\3',
    text,
    flags=re.DOTALL
)

# feel-good-movies doesn't have relatedSlugs? Wait...
# let's write a function to inject relatedSlugs if missing
def add_related(slug, additions):
    global text
    # Check if relatedSlugs exists
    pattern = r'("' + slug + r'": \{.*?)(content: \{)'
    
    def repl(m):
        block = m.group(1)
        if 'relatedSlugs:' in block:
            return re.sub(r'(relatedSlugs: \[)(.*?)(\],)', r'\1\2, ' + ', '.join(f'"{s}"' for s in additions) + r'\3', block) + m.group(2)
        else:
            return block + f'relatedSlugs: [{", ".join(f"{repr(s)}" for s in additions)}],\n    ' + m.group(2)
            
    text = re.sub(pattern, repl, text, flags=re.DOTALL)

add_related("best-sci-fi-movies", ["best-sci-fi-thrillers", "best-sci-fi-epics"])
add_related("best-comedy-movies", ["feel-good-comedies", "movies-to-make-you-cry"])
add_related("disney-plus", ["nostalgic-childhood-movies", "best-movies-on-disney-plus-pixar"])
add_related("critically-acclaimed-gems", ["best-indie-dramas"])
add_related("feel-good-movies", ["inspiring-success-stories"])

with open('src/config/discover-pages.ts', 'w') as f:
    f.write(text)

