const { DISCOVERY_PAGES } = require('./src/config/discover-pages');

const slugs = Object.keys(DISCOVERY_PAGES);
console.log('Total slugs:', slugs.length);

const duplicatedSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicatedSlugs.length > 0) {
  console.log('Duplicated slugs found:', duplicatedSlugs);
}

slugs.forEach(slug => {
  const config = DISCOVERY_PAGES[slug];
  if (!config) {
    console.log('Missing config for slug:', slug);
  } else if (!config.title || !config.description || !config.slug) {
    console.log('Incomplete config for slug:', slug);
  }
});

console.log('Audit complete');
