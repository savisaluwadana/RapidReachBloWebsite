import type { Post } from "@/lib/types";

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function rankPostsForTopics(posts: Post[], topics: string[]) {
  const wanted = topics.map(normalized).filter(Boolean);
  if (!wanted.length) return posts;

  return [...posts]
    .map((post) => {
      const category = normalized(post.category);
      const tags = post.tags.map(normalized);
      const searchable = normalized(`${post.title} ${post.summary}`);
      const score = wanted.reduce((total, topic) => {
        if (category === topic) return total + 8;
        if (tags.includes(topic)) return total + 6;
        if (tags.some((tag) => tag.includes(topic) || topic.includes(tag))) return total + 3;
        if (searchable.includes(topic)) return total + 1;
        return total;
      }, 0);
      return { post, score };
    })
    .sort((a, b) => b.score - a.score || new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime())
    .map(({ post }) => post);
}

export function relatedPostsFor(post: Post, posts: Post[], limit = 3) {
  const sourceTags = post.tags.map(normalized);
  return posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const candidateTags = candidate.tags.map(normalized);
      let score = normalized(candidate.category) === normalized(post.category) ? 6 : 0;
      for (const tag of candidateTags) {
        if (sourceTags.includes(tag)) score += 4;
        else if (sourceTags.some((sourceTag) => tag.includes(sourceTag) || sourceTag.includes(tag))) score += 2;
      }
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.candidate.publishedAt).getTime() - new Date(a.candidate.publishedAt).getTime())
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
