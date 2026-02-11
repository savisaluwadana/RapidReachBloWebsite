import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import { TrendingUp, Zap, BookOpen } from 'lucide-react'
import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

const sampleKubernetesYAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.24
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"`

export default async function Home() {
  // Fetch featured post
  const featuredPosts = await getPosts({ featured: true, status: 'published', limit: 1 })
  const featuredArticle = featuredPosts[0]

  // Fetch recent articles
  const recentPosts = await getPosts({ status: 'published', limit: 6 })
  
  // Fetch trending articles
  const trendingPosts = await getPosts({ trending: true, status: 'published', limit: 3 })
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-lime/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                Master DevOps & Cloud Native
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              In-depth articles, tutorials, and insights on Kubernetes, Platform Engineering,
              and Cloud Native technologies. Written by practitioners, for practitioners.
            </p>
          </div>


        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-deep-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore by Category</h2>
            <p className="text-gray-400">Deep dive into the topics that matter most to you</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Kubernetes */}
            <Link
              href="/blog?category=kubernetes"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 256 249" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M128.025 0C121.443 0 114.861 1.678 109.278 5.034L30.088 50.646C18.922 57.358 12.34 69.404 12.34 82.452v91.223c0 13.049 6.582 25.094 17.748 31.807l79.19 45.611c11.166 6.713 24.932 6.713 36.098 0l79.19-45.611c11.166-6.713 17.748-18.758 17.748-31.807V82.452c0-13.048-6.582-25.094-17.748-31.806L145.376 5.034C139.607 1.678 132.839 0 128.025 0z" fill="#326CE5"/>
                  <path d="M128.025 23.632a9.86 9.86 0 0 0-3.07.498c-.093.03-.181.073-.273.107a9.932 9.932 0 0 0-1.97.994l-.107.073-79.19 45.611-.07.04c-.09.054-.174.116-.262.172a9.924 9.924 0 0 0-4.14 6.17c-.024.108-.059.213-.08.322a9.865 9.865 0 0 0-.195 1.955v91.227c0 .67.073 1.325.192 1.968.02.106.053.208.076.313a9.89 9.89 0 0 0 4.16 6.2c.076.05.148.106.226.154l.08.047 79.192 45.611.098.064a9.92 9.92 0 0 0 2.014 1.014c.08.03.155.067.236.094a9.874 9.874 0 0 0 6.149 0c.08-.027.155-.064.236-.094a9.92 9.92 0 0 0 2.014-1.014l.098-.064 79.192-45.611.08-.048c.078-.047.15-.103.225-.153a9.89 9.89 0 0 0 4.16-6.2c.024-.106.057-.208.077-.314.119-.643.192-1.298.192-1.968V79.574c0-.67-.073-1.326-.192-1.968-.02-.107-.053-.208-.077-.314a9.89 9.89 0 0 0-4.16-6.2c-.076-.05-.147-.105-.225-.153l-.08-.048-79.19-45.611-.1-.064a9.914 9.914 0 0 0-2.013-1.013c-.081-.031-.157-.068-.237-.095a9.86 9.86 0 0 0-3.08-.498v.021z" fill="#fff"/>
                  <path d="M128.025 58.853c-2.379 0-4.326 1.673-4.572 3.858l-2.478 19.224c-7.267 1.38-13.92 4.12-19.825 7.985l-16.14-10.57a4.59 4.59 0 0 0-5.81.724L67.064 92.21a4.59 4.59 0 0 0-.143 5.873l12.614 15.14c-3.01 5.9-5.122 12.33-6.049 19.133l-18.644 3.955a4.572 4.572 0 0 0-3.527 4.778l1.38 16.963a4.572 4.572 0 0 0 4.303 4.07l19.153 1.024c2.476 6.446 5.977 12.325 10.295 17.474l-9.066 17.184a4.572 4.572 0 0 0 1.488 5.675l14.058 9.862a4.572 4.572 0 0 0 5.83-.697l12.876-14.342c5.788 2.505 12.068 4.076 18.671 4.504l4.99 18.512a4.572 4.572 0 0 0 4.778 3.394l16.828-1.963a4.572 4.572 0 0 0 3.872-4.525l-.129-19.16c6.221-2.76 11.86-6.523 16.712-11.088l16.81 8.318a4.572 4.572 0 0 0 5.57-1.618l9.335-14.38a4.572 4.572 0 0 0-.975-5.865l-14.96-11.737c2.135-5.937 3.348-12.3 3.434-18.92l18.063-5.86a4.572 4.572 0 0 0 3.085-5.005l-2.543-16.697a4.572 4.572 0 0 0-4.627-3.76l-19.076.653c-3.236-5.795-7.381-11.035-12.239-15.512l7.86-17.87a4.572 4.572 0 0 0-1.86-5.537l-14.634-8.668a4.572 4.572 0 0 0-5.725 1.046l-12.268 14.916c-5.5-1.661-11.332-2.578-17.373-2.68V62.71a4.572 4.572 0 0 0-4.572-3.858z" fill="#326CE5"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">Kubernetes</h3>
            </Link>

            {/* Terraform */}
            <Link
              href="/blog?category=terraform"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 256 289" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M89.727 54.915v82.07L0 91.949V9.879l89.727 45.036z" fill="#5C4EE5"/>
                  <path d="M166.182 99.951v82.07l-76.455-45.036V54.915l76.455 45.036z" fill="#4040B2"/>
                  <path d="M166.182 9.879v82.07l76.455-45.035V9.879L166.182 54.915V9.879z" fill="#5C4EE5"/>
                  <path d="M166.182 197.057v82.07l-76.455-45.036v-82.07l76.455 45.036z" fill="#4040B2"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">Terraform</h3>
            </Link>

            {/* CI/CD */}
            <Link
              href="/blog?category=cicd"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="128" cy="128" r="128" fill="#FC6D26"/>
                  <path d="M128 34.86L96.47 131.14h63.06L128 34.86z" fill="#E24329"/>
                  <path d="M128 220.14l31.53-89H96.47L128 220.14z" fill="#FCA326"/>
                  <path d="M61.94 131.14L51.7 162.62a7.15 7.15 0 0 0 2.6 8l73.7 53.56-66.06-93.04z" fill="#FC6D26"/>
                  <path d="M61.94 131.14h34.53L77.63 74.34a3.58 3.58 0 0 0-6.82 0L61.94 131.14z" fill="#E24329"/>
                  <path d="M194.06 131.14l10.24 31.48a7.15 7.15 0 0 1-2.6 8L128 224.18l66.06-93.04z" fill="#FC6D26"/>
                  <path d="M194.06 131.14h-34.53l18.84-56.8a3.58 3.58 0 0 1 6.82 0l8.87 56.8z" fill="#E24329"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">CI/CD</h3>
            </Link>

            {/* Security */}
            <Link
              href="/blog?category=security"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">Security</h3>
            </Link>

            {/* Cloud (AWS/GCP/Azure) */}
            <Link
              href="/blog?category=aws"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 256 171" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M76.8 148.2c-6.1 4.6-14.7 5.8-22.2 3.3C47 149 41 143.5 38.4 136.2c-6.3 1-12.8-.5-17.8-4.2-5-3.8-8.2-9.5-8.8-15.7C5 117.3 0 111.5 0 104.6c0-5.5 3-10.5 7.8-13.2-.8-6.8 1.8-13.6 7-18.2 5.2-4.6 12.3-6.3 18.9-4.6C37.3 59.5 46 52.8 56.2 51c10.2-1.7 20.7 2 28.1 9.8 3-1 6.3-1.1 9.3-.3 3 .8 5.7 2.6 7.5 5.1 7.2-2.2 15-1.3 21.3 2.6 6.3 3.8 10.5 10.2 11.5 17.4 5.2 1.3 9.6 4.8 12 9.5 2.3 4.7 2.5 10.2.4 15C152 113 155 117 156.3 121.6c1.3 4.7.8 9.7-1.3 14.1-5 9.3-15.5 14.5-26.1 12.7-3.7 6-10.4 9.3-17.2 8.5-6.8-.8-12.5-5.4-14.8-11.7-5.8 4.8-13.6 6.6-20.1 3z" fill="#60A5FA"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">Cloud</h3>
            </Link>

            {/* Platform Engineering */}
            <Link
              href="/blog?category=platform-engineering"
              className="group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-glow-md"
            >
              <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3 className="text-white font-bold text-center">Platform Engineering</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gradient-dark">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Featured Article */}
              {featuredArticle && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-cyber-lime" />
                    Featured Article
                  </h2>
                  <ArticleCard
                    title={featuredArticle.title}
                    excerpt={featuredArticle.excerpt}
                    author={{
                      name: featuredArticle.author?.full_name || 'Anonymous',
                      avatar: featuredArticle.author?.avatar_url || '/avatars/default.png',
                      role: featuredArticle.author?.role || 'Contributor',
                    }}
                    category={featuredArticle.category}
                    readTime={`${featuredArticle.read_time} min read`}
                    date={new Date(featuredArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    image={featuredArticle.cover_image_url || '/blog/default.jpg'}
                    slug={featuredArticle.slug}
                    featured={featuredArticle.featured}
                    trending={featuredArticle.trending}
                  />
                </div>
              )}

              {/* Latest Articles */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-electric-cyan" />
                  Latest Articles
                </h2>
                {recentPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentPosts.map((article) => (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        excerpt={article.excerpt}
                        author={{
                          name: article.author?.full_name || 'Anonymous',
                          avatar: article.author?.avatar_url || '/avatars/default.png',
                          role: article.author?.role || 'Contributor',
                        }}
                        category={article.category}
                        readTime={`${article.read_time} min read`}
                        date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        image={article.cover_image_url || '/blog/default.jpg'}
                        slug={article.slug}
                        trending={article.trending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Articles Yet</h3>
                    <p className="text-gray-400 mb-4">Check back soon for exciting DevOps content!</p>
                    <p className="text-sm text-electric-cyan">💡 Configure Supabase to load real posts (see SETUP_GUIDE.md)</p>
                  </div>
                )}
              </div>

              {/* Trending This Week */}
              {trendingPosts.length > 0 && (
                <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-br from-electric-cyan/10 to-cyber-lime/10 border border-electric-cyan/20 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-electric-cyan" />
                    Trending This Week
                  </h2>
                  <div className="space-y-4">
                    {trendingPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-cyber flex items-center justify-center text-white font-bold text-xl">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-electric-cyan transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{post.author?.full_name || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{post.view_count} views</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Example Section */}
              <div className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Learn by Example: Kubernetes Deployments
                </h2>
                <CodeSandbox
                  code={sampleKubernetesYAML}
                  language="yaml"
                  title="Production NGINX Deployment"
                  description="A production-ready configuration with 3 replicas and resource limits"
                  runnable={true}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Newsletter */}
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl backdrop-blur-xl bg-gradient-cyber p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Stay Updated
                  </h3>
                  <p className="text-white/90 mb-6">
                    Get weekly insights on Kubernetes, Platform Engineering, and Cloud Native tech.
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder:text-white/60 mb-3 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="w-full px-6 py-3 rounded-xl bg-white text-electric-cyan font-semibold hover:bg-white/90 transition-colors">
                    Subscribe Now
                  </button>
                </div>

                {/* Live Feed */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 h-[600px] overflow-hidden">
                  <LiveInfrastructureFeed />
                </div>

                {/* Popular Topics */}
                <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kubernetes', 'Terraform', 'GitOps', 'Docker', 'Istio', 'ArgoCD', 'AWS', 'Platform Engineering'].map((topic) => (
                      <Link
                        key={topic}
                        href={`/blog?category=${encodeURIComponent(topic.toLowerCase())}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-electric-cyan/20 hover:text-electric-cyan transition-colors"
                      >
                        #{topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-20" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Level Up Your DevOps Skills?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Start learning Kubernetes, Platform Engineering, and Cloud Native best practices today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-xl bg-gradient-cyber text-white font-semibold shadow-glow-lg hover:shadow-glow-xl transition-all hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                href="/blog"
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Browse Articles
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-deep-charcoal border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-4">RapidReach</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted source for DevOps, Platform Engineering, and Cloud Native expertise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Content</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/blog" className="hover:text-electric-cyan transition-colors">All Articles</Link></li>
                <li><Link href="/learning-paths" className="hover:text-electric-cyan transition-colors">Learning Paths</Link></li>
                <li><Link href="/news" className="hover:text-electric-cyan transition-colors">News & Updates</Link></li>
                <li><Link href="/blog?category=tutorials" className="hover:text-electric-cyan transition-colors">Tutorials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Code Examples</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Community</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Newsletter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Write for Us</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-electric-cyan transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 RapidReach. Made with ❤️ for the DevOps community.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Press <kbd className="px-2 py-1 rounded bg-white/10 text-gray-400 font-mono">⌘K</kbd> for quick navigation
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

