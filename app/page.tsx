import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import LiveInfrastructureFeed from '@/components/LiveInfrastructureFeed'
import CodeSandbox from '@/components/CodeSandbox'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import Footer from '@/components/Footer'
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Kubernetes */}
            <Link
              href="/blog?category=kubernetes"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(50,108,229,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#326CE5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 256 249" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M128.025 0C121.443 0 114.861 1.678 109.278 5.034L30.088 50.646C18.922 57.358 12.34 69.404 12.34 82.452v91.223c0 13.049 6.582 25.094 17.748 31.807l79.19 45.611c11.166 6.713 24.932 6.713 36.098 0l79.19-45.611c11.166-6.713 17.748-18.758 17.748-31.807V82.452c0-13.048-6.582-25.094-17.748-31.806L145.376 5.034C139.607 1.678 132.839 0 128.025 0z" fill="#326CE5"/>
                  <path d="M128.025 23.632a9.86 9.86 0 0 0-3.07.498c-.093.03-.181.073-.273.107a9.932 9.932 0 0 0-1.97.994l-.107.073-79.19 45.611-.07.04c-.09.054-.174.116-.262.172a9.924 9.924 0 0 0-4.14 6.17c-.024.108-.059.213-.08.322a9.865 9.865 0 0 0-.195 1.955v91.227c0 .67.073 1.325.192 1.968.02.106.053.208.076.313a9.89 9.89 0 0 0 4.16 6.2c.076.05.148.106.226.154l.08.047 79.192 45.611.098.064a9.92 9.92 0 0 0 2.014 1.014c.08.03.155.067.236.094a9.874 9.874 0 0 0 6.149 0c.08-.027.155-.064.236-.094a9.92 9.92 0 0 0 2.014-1.014l.098-.064 79.192-45.611.08-.048c.078-.047.15-.103.225-.153a9.89 9.89 0 0 0 4.16-6.2c.024-.106.057-.208.077-.314.119-.643.192-1.298.192-1.968V79.574c0-.67-.073-1.326-.192-1.968-.02-.107-.053-.208-.077-.314a9.89 9.89 0 0 0-4.16-6.2c-.076-.05-.147-.105-.225-.153l-.08-.048-79.19-45.611-.1-.064a9.914 9.914 0 0 0-2.013-1.013c-.081-.031-.157-.068-.237-.095a9.86 9.86 0 0 0-3.08-.498v.021z" fill="#fff"/>
                  <path d="M128.025 58.853c-2.379 0-4.326 1.673-4.572 3.858l-2.478 19.224c-7.267 1.38-13.92 4.12-19.825 7.985l-16.14-10.57a4.59 4.59 0 0 0-5.81.724L67.064 92.21a4.59 4.59 0 0 0-.143 5.873l12.614 15.14c-3.01 5.9-5.122 12.33-6.049 19.133l-18.644 3.955a4.572 4.572 0 0 0-3.527 4.778l1.38 16.963a4.572 4.572 0 0 0 4.303 4.07l19.153 1.024c2.476 6.446 5.977 12.325 10.295 17.474l-9.066 17.184a4.572 4.572 0 0 0 1.488 5.675l14.058 9.862a4.572 4.572 0 0 0 5.83-.697l12.876-14.342c5.788 2.505 12.068 4.076 18.671 4.504l4.99 18.512a4.572 4.572 0 0 0 4.778 3.394l16.828-1.963a4.572 4.572 0 0 0 3.872-4.525l-.129-19.16c6.221-2.76 11.86-6.523 16.712-11.088l16.81 8.318a4.572 4.572 0 0 0 5.57-1.618l9.335-14.38a4.572 4.572 0 0 0-.975-5.865l-14.96-11.737c2.135-5.937 3.348-12.3 3.434-18.92l18.063-5.86a4.572 4.572 0 0 0 3.085-5.005l-2.543-16.697a4.572 4.572 0 0 0-4.627-3.76l-19.076.653c-3.236-5.795-7.381-11.035-12.239-15.512l7.86-17.87a4.572 4.572 0 0 0-1.86-5.537l-14.634-8.668a4.572 4.572 0 0 0-5.725 1.046l-12.268 14.916c-5.5-1.661-11.332-2.578-17.373-2.68V62.71a4.572 4.572 0 0 0-4.572-3.858z" fill="#326CE5"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">Kubernetes</h3>
            </Link>

            {/* Terraform */}
            <Link
              href="/blog?category=terraform"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(92,78,229,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C4EE5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 256 289" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M89.727 54.915v82.07L0 91.949V9.879l89.727 45.036z" fill="#5C4EE5"/>
                  <path d="M166.182 99.951v82.07l-76.455-45.036V54.915l76.455 45.036z" fill="#4040B2"/>
                  <path d="M166.182 9.879v82.07l76.455-45.035V9.879L166.182 54.915V9.879z" fill="#5C4EE5"/>
                  <path d="M166.182 197.057v82.07l-76.455-45.036v-82.07l76.455 45.036z" fill="#4040B2"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">Terraform</h3>
            </Link>

            {/* Docker */}
            <Link
              href="/blog?category=docker"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(33,150,243,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#2196F3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 256 185" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <g fill="#2196F3">
                    <path d="M39 82h22v21H39zm26 0h23v21H65zm26 0h22v21H91zm25 0h23v21h-23z"/>
                    <path d="M13 100h22v21H13zm26 0h23v21H39zm26 0h22v21H65zm25 0h23v21H90zm26 0h23v21h-23z"/>
                    <path d="M39 118h22v21H39zm26 0h23v21H65z"/>
                  </g>
                  <path d="M228.8 95.8c-6.5-4.5-21.5-6.2-33.1-4.1-1.3-9.5-6.8-17.8-16.5-25.1l-5.6-4-3.7 5.7c-4.7 7.2-6.8 16.6-5.7 26 1.2 9.7 5.5 17.8 12.5 23.6-5.5 2.9-14.5 7.1-27.2 6.9H0c-1.6 43.3 26 82.6 84.7 82.6 78.1 0 140.5-36.8 146.2-124.9 9.5.6 29.9 2.4 40.2-19.7.3-.6 2.9-6.1 3.8-7.9l-46.1-24.1zM39 64h22v21H39zm26 0h23v21H65z" fill="#2196F3"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">Docker</h3>
            </Link>

            {/* GitHub Actions */}
            <Link
              href="/blog?category=cicd"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(33,136,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#2188FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 256 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M128 0C57.3 0 0 57.3 0 128c0 56.6 36.7 104.5 87.5 121.5 6.4 1.2 8.7-2.8 8.7-6.2v-21.7c-35.6 7.7-43.1-17.2-43.1-17.2-5.8-14.8-14.2-18.7-14.2-18.7-11.6-7.9.9-7.7.9-7.7 12.8.9 19.5 13.1 19.5 13.1 11.4 19.5 29.9 13.9 37.2 10.6 1.2-8.2 4.5-13.9 8.1-17.1-28.4-3.2-58.3-14.2-58.3-63.2 0-14 5-25.4 13.2-34.3-1.3-3.2-5.7-16.3 1.2-34 0 0 10.7-3.4 35 13.1 10.2-2.8 21-4.2 31.8-4.3 10.8.1 21.6 1.5 31.8 4.3 24.3-16.5 35-13.1 35-13.1 6.9 17.7 2.5 30.8 1.2 34 8.2 8.9 13.2 20.3 13.2 34.3 0 49.1-29.9 60-58.4 63.2 4.6 4 8.7 11.8 8.7 23.8v35.3c0 3.4 2.3 7.5 8.8 6.2C219.3 232.5 256 184.6 256 128 256 57.3 198.7 0 128 0z" fill="#2188FF"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">GitHub Actions</h3>
            </Link>

            {/* AWS */}
            <Link
              href="/blog?category=aws"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,153,0,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9900]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 256 153" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M72.392 55.438c0 3.137.34 5.68.9 7.519.633 1.838 1.446 3.786 2.604 5.845.424.633.563 1.266.563 1.838 0 .786-.487 1.573-1.51 2.36l-4.997 3.321c-.712.474-1.425.686-2.078.686-.813 0-1.626-.397-2.44-1.13-1.157-1.216-2.137-2.52-2.925-3.882-.787-1.408-1.574-2.985-2.424-4.835-6.094 7.152-13.756 10.73-22.986 10.73-6.566 0-11.795-1.878-15.631-5.568-3.836-3.691-5.78-8.609-5.78-14.767 0-6.54 2.314-11.838 7.007-15.84 4.691-4.002 10.931-6.011 18.765-6.011 2.603 0 5.291.211 8.091.58 2.8.369 5.684.976 8.695 1.668v-5.512c0-5.738-1.199-9.75-3.541-12.147-2.4-2.397-6.481-3.567-12.298-3.567-2.646 0-5.375.316-8.215.99-2.84.673-5.596 1.519-8.271 2.575-1.225.475-2.135.738-2.688.843-.554.106-1.073.16-1.448.16-1.265 0-1.897-.923-1.897-2.822v-4.438c0-1.465.185-2.554.605-3.215.42-.66 1.159-1.32 2.34-1.927 2.646-1.361 5.82-2.49 9.468-3.386 3.647-.95 7.547-1.4 11.698-1.4 8.933 0 15.473 2.028 19.677 6.083 4.12 4.055 6.237 10.202 6.237 18.494v24.301h.056zm-31.74 11.888c2.518 0 5.122-.46 7.894-1.425 2.772-.966 5.234-2.734 7.278-5.258.026-.08.185-.475.316-1.108.13-.633.265-1.293.265-2.044V51.79c-2.173-.529-4.432-.949-6.832-1.293-2.398-.342-4.796-.502-7.221-.502-5.122 0-8.878 1.003-11.379 3.065-2.501 2.061-3.725 4.98-3.725 8.82 0 3.627 1.012 6.386 2.982 8.342 2.023 1.9 4.848 2.876 8.422 2.876v.026zm62.911 8.527c-1.62 0-2.72-.29-3.384-0.925-.664-.634-1.244-1.902-1.693-3.747l-18.819-61.845c-.448-1.53-.672-2.555-.672-3.03 0-1.214.607-1.848 1.877-1.848h7.67c1.702 0 2.856.29 3.465.925.663.634 1.189 1.902 1.638 3.747l13.45 53.02 12.496-53.02c.395-1.583.921-2.85 1.53-3.484.664-.633 1.848-.925 3.55-.925h6.257c1.703 0 2.857.29 3.52.925.664.634 1.19 1.9 1.585 3.747l12.654 53.706 13.872-53.704c.448-1.583 1.028-2.85 1.692-3.484.663-.634 1.847-.925 3.465-.925h7.279c1.268 0 1.93.633 1.93 1.847 0 .372-.055.765-.158 1.186-.104.422-.263.976-.553 1.848l-19.33 61.845c-.448 1.583-1.028 2.85-1.692 3.485-.663.634-1.792.925-3.411.925h-6.727c-1.703 0-2.857-.29-3.52-.925-.664-.634-1.19-1.955-1.585-3.8l-12.441-51.754-12.363 51.649c-.395 1.584-.921 2.852-1.531 3.485-.664.634-1.846.925-3.549.925h-6.728l-.002-.002zm100.678 2.243c-4.056 0-8.112-.475-12.06-1.426-3.95-.95-7.013-2.026-9.178-3.2-1.292-.71-2.17-1.476-2.486-2.19-.316-.713-.474-1.478-.474-2.454v-4.598c0-1.897.712-2.82 2.082-2.82.527 0 1.08.105 1.586.29.528.185 1.32.5 2.4.922 3.307 1.425 6.882 2.557 10.671 3.323 3.843.765 7.63 1.16 11.44 1.16 6.071 0 10.777-1.053 14.065-3.214 3.287-2.16 4.958-5.21 4.958-9.159 0-2.68-.873-4.915-2.646-6.705-1.77-1.79-5.08-3.397-9.944-4.835l-14.276-4.464c-7.226-2.267-12.532-5.61-15.842-10.08-3.31-4.411-5.001-9.317-5.001-14.633 0-4.228.898-7.995 2.693-11.247 1.794-3.252 4.24-6.08 7.252-8.397 3.01-2.344 6.513-4.108 10.51-5.322 3.997-1.213 8.213-1.795 12.639-1.795 1.768 0 3.6.106 5.423.369 1.875.264 3.6.58 5.265.948 1.617.369 3.18.765 4.639 1.214 1.459.448 2.646.896 3.574 1.345 1.158.58 2.024 1.212 2.527 1.924.502.713.766 1.74.766 3.108v4.228c0 1.898-.712 2.876-2.135 2.876-.712 0-1.847-.316-3.363-.976-5.002-2.293-10.616-3.425-16.823-3.425-5.502 0-9.865.897-12.95 2.744-3.087 1.847-4.666 4.624-4.666 8.45 0 2.68 1.003 4.94 2.963 6.783 1.96 1.846 5.503 3.61 10.617 5.269l13.978 4.386c7.116 2.24 12.268 5.373 15.395 9.37 3.127 3.995 4.664 8.608 4.664 13.819 0 4.332-.897 8.266-2.666 11.677-1.768 3.41-4.214 6.396-7.279 8.87-3.063 2.502-6.779 4.41-11.092 5.703-4.367 1.293-9.125 1.951-14.252 1.951" fill="#FF9900"/>
                  <path d="M230.993 120.964c-27.237 20.103-66.763 30.779-100.71 30.779-47.63 0-90.524-17.604-122.94-46.898-2.55-2.293-.265-5.426 2.788-3.635 34.877 20.286 78.058 32.477 122.573 32.477 30.048 0 63.096-6.226 93.488-19.098 4.585-1.95 8.45 3.03 4.8 6.375" fill="#FF9900"/>
                  <path d="M242.42 107.395c-3.48-4.465-23.054-2.11-31.846-1.057-2.673.318-3.082-2.002-.673-3.687 15.578-10.965 41.17-7.805 44.147-4.122 2.977 3.715-.79 29.466-15.502 41.778-2.262 1.898-4.42.896-3.416-1.634 3.284-8.186 10.642-26.512 7.28-31.278" fill="#FF9900"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">AWS</h3>
            </Link>

            {/* Observability */}
            <Link
              href="/blog?category=observability"
              className="group relative rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#F472B6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  <line x1="22" y1="2" x2="12" y2="12"/>
                  <path d="M18 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                </svg>
              </div>
              <h3 className="relative text-white font-bold text-center text-sm">Observability</h3>
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
                      avatar: featuredArticle.author?.avatar_url || '',
                      role: featuredArticle.author?.role || 'Contributor',
                    }}
                    category={featuredArticle.category}
                    readTime={`${featuredArticle.estimated_read_time || 5} min read`}
                    date={new Date(featuredArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    image={featuredArticle.cover_image_url || ''}
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
                          avatar: article.author?.avatar_url || '',
                          role: article.author?.role || 'Contributor',
                        }}
                        category={article.category}
                        readTime={`${article.estimated_read_time || 5} min read`}
                        date={new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        image={article.cover_image_url || ''}
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

      <Footer />
    </main>
  )
}
