import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Set MONGODB_URI before running npm run seed"); process.exit(1); }
const dbName = process.env.MONGODB_DB || "rapidreach";

const posts = [
  { slug:"the-new-default-for-developer-tools-is-composable", title:"The new default for developer tools is composable", summary:"Developer tooling is shifting from all-in-one platforms toward smaller primitives that can be assembled around a team’s existing workflow.", content:"The best developer tools increasingly behave like building blocks rather than destinations. Teams want APIs, events, automation hooks, and portable data before they want another dashboard.\n\nThat changes how products should be evaluated. The question is no longer only whether a tool has the right feature. It is whether the feature can be composed into the delivery system a team already trusts.\n\nThis favors products that expose clear interfaces, keep ownership boundaries visible, and make migration boring. A polished UI still matters, but the durable advantage is interoperability.", category:"DevTools", author:"RapidReach Editorial", publishedAt:"2026-09-08T08:00:00.000Z", readingMinutes:4, tags:["developer tools","platform engineering","apis"], keyTakeaways:["APIs and events are becoming product features, not integrations added later.","Interoperability can matter more than the size of a feature list.","The strongest tools fit existing workflows instead of forcing a total replacement."], likes:0, status:"published" },
  { slug:"why-developer-portals-are-moving-closer-to-the-workflow", title:"Why developer portals are moving closer to the workflow", summary:"The useful developer portal is becoming less of a catalog and more of a context layer that connects code, environments, ownership, and delivery actions.", content:"A software catalog is useful, but it is rarely the end state. Developers care about the next action: understand an owner, inspect a deployment, trace a failure, request an environment, or ship a change.\n\nThat is why portal design is moving toward workflow context. The portal becomes a place where information from different systems is made understandable without pretending those systems no longer exist.\n\nThe practical design rule is simple: keep the portal thin, keep platform APIs explicit, and avoid burying operational ownership in custom UI glue.", category:"Cloud", author:"RapidReach Editorial", publishedAt:"2026-09-07T08:00:00.000Z", readingMinutes:5, tags:["backstage","developer portals","cloud native"], keyTakeaways:["Catalogs are most valuable when they lead directly to useful actions.","A portal should expose platform context without becoming the platform itself.","Thin experience layers are easier to evolve than deeply coupled portals."], likes:0, status:"published" },
  { slug:"ai-coding-tools-need-better-context-not-more-prompts", title:"AI coding tools need better context, not more prompts", summary:"The next improvement in coding agents is likely to come from reliable repository, runtime, and platform context rather than larger prompt templates.", content:"Coding agents can already generate a large amount of code. The bottleneck is knowing what code is appropriate for a specific system.\n\nRepository conventions, service ownership, deployment constraints, observability signals, and internal APIs all change what a correct answer looks like. When that context is machine-readable, an agent can make fewer assumptions.\n\nFor engineering teams, this makes documentation architecture part of AI readiness. Structured metadata, stable APIs, searchable decision records, and explicit boundaries help humans and agents at the same time.", category:"AI", author:"RapidReach Editorial", publishedAt:"2026-09-06T08:00:00.000Z", readingMinutes:4, tags:["ai coding","agents","developer experience"], keyTakeaways:["Agent quality depends heavily on trustworthy engineering context.","Machine-readable documentation benefits both developers and coding agents.","Repository and platform conventions should be explicit rather than tribal knowledge."], likes:0, status:"published" }
];

const categories = [
  ["ai","AI","post","AI engineering, coding agents, models, and developer workflows."],
  ["cloud","Cloud","post","Cloud native, platform engineering, infrastructure, and operations."],
  ["devtools","DevTools","post","Developer tools, IDEs, APIs, frameworks, and engineering workflows."],
  ["ai-devtools","AI DevTools","tool","AI-native products for software builders."],
  ["platform-engineering","Platform Engineering","tool","Internal developer platforms, portals, and platform tooling."],
  ["observability","Observability","tool","Logs, metrics, traces, profiling, and reliability tools."],
  ["cicd","CI/CD","tool","Build, test, release, and deployment tooling."],
  ["databases","Databases","tool","Databases, data platforms, caches, and storage systems."],
  ["security","Security","tool","Application, cloud, dependency, and developer security tooling."]
].map(([slug,name,kind,description]) => ({ slug,name,kind,description,createdAt:new Date().toISOString() }));

const tools = [
  { slug:"openchoreo", name:"OpenChoreo", tagline:"Open-source platform engineering for building, deploying, and operating applications.", description:"OpenChoreo provides platform abstractions, developer experience, deployment workflows, and observability on top of Kubernetes. It is designed for teams that want a composable internal developer platform rather than a monolithic developer portal.", website:"https://openchoreo.dev", github:"https://github.com/openchoreo/openchoreo", maker:"OpenChoreo Community", pricing:"open-source", openSource:true, category:"platform-engineering", tags:["kubernetes","platform engineering","backstage","open source"], featured:true, status:"published", launchedAt:"2026-01-01T00:00:00.000Z", upvotes:0 },
  { slug:"opentelemetry", name:"OpenTelemetry", tagline:"Vendor-neutral observability instrumentation and telemetry standards.", description:"OpenTelemetry gives developers a common way to generate, collect, and export traces, metrics, and logs across distributed systems. It has become a foundational layer in modern observability stacks.", website:"https://opentelemetry.io", github:"https://github.com/open-telemetry", maker:"OpenTelemetry Community", pricing:"open-source", openSource:true, category:"observability", tags:["observability","tracing","metrics","logs"], featured:true, status:"published", launchedAt:"2026-01-02T00:00:00.000Z", upvotes:0 },
  { slug:"github-actions", name:"GitHub Actions", tagline:"Automate software workflows directly from GitHub repositories.", description:"GitHub Actions provides hosted and self-hosted workflow automation for CI, delivery, testing, releases, and repository operations using versioned workflow files.", website:"https://github.com/features/actions", maker:"GitHub", pricing:"freemium", openSource:false, category:"cicd", tags:["ci/cd","automation","github"], featured:false, status:"published", launchedAt:"2026-01-03T00:00:00.000Z", upvotes:0 }
];

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
await db.collection("posts").createIndex({ slug:1 }, { unique:true });
await db.collection("posts").createIndex({ status:1, publishedAt:-1 });
await db.collection("comments").createIndex({ postSlug:1, createdAt:-1 });
await db.collection("categories").createIndex({ kind:1, slug:1 }, { unique:true });
await db.collection("tools").createIndex({ slug:1 }, { unique:true });
await db.collection("tools").createIndex({ status:1, featured:-1, launchedAt:-1 });
await db.collection("tools").createIndex({ category:1, status:1, launchedAt:-1 });
for (const post of posts) await db.collection("posts").updateOne({ slug:post.slug }, { $setOnInsert:post }, { upsert:true });
for (const category of categories) await db.collection("categories").updateOne({ kind:category.kind, slug:category.slug }, { $setOnInsert:category }, { upsert:true });
for (const tool of tools) await db.collection("tools").updateOne({ slug:tool.slug }, { $setOnInsert:tool }, { upsert:true });
console.log(`Seeded ${posts.length} posts, ${categories.length} categories, and ${tools.length} tools into ${dbName}`);
await client.close();
