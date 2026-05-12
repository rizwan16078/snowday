import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = 'src/content/blog';
const outputFilePath = 'src/lib/generated-blog-data.ts';

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'));
const generatedPosts = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
  const { data, content: body } = matter(content);
  
  generatedPosts.push({
    slug: file.replace('.mdx', ''),
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    readTime: data.readTime,
    category: data.category,
    image: data.image,
    imageAlt: data.imageAlt,
    metaTitle: data.title, // using title as metaTitle
    metaDescription: data.excerpt,
    content: body
  });
}

// Sort posts by date descending
generatedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const fileContent = `
import type { BlogPost } from "./blog-data";

export const generatedBlogPosts: BlogPost[] = ${JSON.stringify(generatedPosts, null, 2)};
`;

fs.writeFileSync(outputFilePath, fileContent);
console.log("Successfully generated " + generatedPosts.length + " blog posts into " + outputFilePath);
