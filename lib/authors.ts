export type AuthorProfile = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  sameAs: string[];
};

const knownAuthors: Record<string, Omit<AuthorProfile, "slug">> = {
  "rapidreach-editorial": {
    name: "RapidReach Editorial",
    role: "Editorial desk",
    bio: "RapidReach Editorial covers developer tools, AI engineering, cloud-native infrastructure, open source, platform engineering, and the workflows changing how software gets built.",
    sameAs: [],
  },
  "savi-saluwadana": {
    name: "Savi Saluwadana",
    role: "Founder and editor",
    bio: "Savi Saluwadana writes about developer tools, AI engineering, cloud-native infrastructure, platform engineering, open source, and software delivery.",
    sameAs: [
      "https://github.com/savisaluwadana",
      "https://bsky.app/profile/savisaluwadana.bsky.social",
      "https://savisaluwadana.github.io/",
    ],
  },
};

export function authorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAuthorProfile(name: string): AuthorProfile {
  const slug = authorSlug(name);
  const known = knownAuthors[slug];
  if (known) return { slug, ...known };

  return {
    slug,
    name,
    role: "Contributor",
    bio: `${name} contributes reporting and analysis to RapidReach.`,
    sameAs: [],
  };
}

export function getKnownAuthorProfiles() {
  return Object.entries(knownAuthors).map(([slug, profile]) => ({ slug, ...profile }));
}
