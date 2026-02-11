import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogFilterClient from '@/components/BlogFilterClient'
import { getPosts } from '@/lib/actions/posts'

export default async function BlogPage() {
  const allPosts = await getPosts({ status: 'published' })
  
  return (
    <main className="min-h-screen bg-deep-charcoal">
      <Navbar />
      
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        
        <div className="relative container mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent">
                All Articles
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Comprehensive guides, tutorials, and insights on DevOps and Cloud Native technologies.
            </p>
          </div>
          
          {/* Interactive Filter & Articles */}
          <BlogFilterClient initialPosts={allPosts} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
