'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Cloud, Terminal, Layers, GitBranch, Shield } from 'lucide-react'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const glassStyle = "backdrop-blur-xl bg-white/5 border border-white/10"

export default function HeroBentoGrid() {
  return (
    <section className="relative min-h-screen bg-deep-charcoal overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-lime/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Kinetic Typography Hero */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="px-4 py-2 rounded-full bg-gradient-cyber text-white text-sm font-semibold shadow-glow-cyber">
              🚀 The Future of DevOps is Here
            </span>
          </motion.div>

          <h1 className="text-display-md md:text-display-lg font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-electric-cyan to-cyber-lime bg-clip-text text-transparent animate-kinetic-text">
              RapidReach
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Master <span className="text-electric-cyan font-semibold">Kubernetes</span>,{' '}
            <span className="text-cyber-lime font-semibold">Platform Engineering</span>, and{' '}
            <span className="text-electric-cyan font-semibold">Cloud Native</span> development.
            <br />
            Real-time infrastructure news, interactive learning paths, and expert insights.
          </p>

          <motion.div
            className="flex gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(50, 108, 229, 0.8)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl bg-gradient-cyber text-white font-semibold text-lg shadow-glow-md hover:shadow-glow-lg transition-all duration-300 flex items-center gap-2"
              >
                Explore Content
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/learning-paths">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-2xl ${glassStyle} text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300`}
              >
                Learning Paths
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Bento Grid 2.0 Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
        >
          {/* Large Feature - Live Infrastructure Feed */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-2 lg:row-span-2 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-8 h-full shadow-bento hover:shadow-glow-md transition-all duration-500 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-electric-cyan/20">
                    <Zap className="w-6 h-6 text-electric-cyan" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Live Infrastructure Feed</h3>
                </div>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Real-time updates on Kubernetes releases, Terraform providers, AWS/GCP/Azure announcements.
                  Never miss a critical update.
                </p>

                {/* Mock Live Feed Items */}
                <div className="space-y-3">
                  {[
                    { title: 'Kubernetes 1.30 Released', time: '2m ago', color: 'electric-cyan' },
                    { title: 'Terraform AWS Provider 5.x', time: '15m ago', color: 'cyber-lime' },
                    { title: 'Istio 1.21 Security Update', time: '1h ago', color: 'electric-cyan' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={`p-4 rounded-xl ${glassStyle} hover:bg-white/10 transition-all cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-${item.color} animate-pulse`} />
                          <span className="text-white font-medium">{item.title}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{item.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ x: 5 }}
                  className="mt-6 text-electric-cyan flex items-center gap-2 font-semibold hover:gap-3 transition-all"
                >
                  View All Updates
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Interactive Code Sandbox */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 lg:row-span-1 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-cyber-lime/20">
                  <Terminal className="w-5 h-5 text-cyber-lime" />
                </div>
                <h3 className="text-lg font-bold text-white">Code Playground</h3>
              </div>
              
              <div className="bg-deep-charcoal-300 rounded-xl p-4 font-mono text-sm mb-4">
                <div className="text-gray-500"># Deploy to K8s</div>
                <div className="text-cyber-lime">kubectl apply -f</div>
                <div className="text-electric-cyan ml-2">deployment.yaml</div>
              </div>

              <p className="text-gray-400 text-sm">
                Live, copyable YAML & Go snippets with syntax highlighting
              </p>
            </div>
          </motion.div>

          {/* Learning Paths */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 lg:row-span-1 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-electric-cyan/20">
                  <Layers className="w-5 h-5 text-electric-cyan" />
                </div>
                <h3 className="text-lg font-bold text-white">Learning Paths</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="h-2 bg-electric-cyan/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-full bg-electric-cyan"
                  />
                </div>
                <p className="text-gray-400 text-xs">K8s Mastery - 65% Complete</p>
              </div>

              <p className="text-gray-400 text-sm">
                Personalized roadmaps for Platform Engineering excellence
              </p>
            </div>
          </motion.div>

          {/* Cloud Providers */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-cyber-lime/20">
                  <Cloud className="w-5 h-5 text-cyber-lime" />
                </div>
                <h3 className="text-lg font-bold text-white">Multi-Cloud</h3>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {['AWS', 'GCP', 'Azure'].map((cloud) => (
                  <span
                    key={cloud}
                    className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-sm border border-white/10"
                  >
                    {cloud}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CI/CD Pipeline */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-electric-cyan/20">
                  <GitBranch className="w-5 h-5 text-electric-cyan" />
                </div>
                <h3 className="text-lg font-bold text-white">CI/CD</h3>
              </div>
              
              <p className="text-gray-400 text-sm">
                GitOps workflows & automation pipelines
              </p>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-cyber-lime/20">
                  <Shield className="w-5 h-5 text-cyber-lime" />
                </div>
                <h3 className="text-lg font-bold text-white">Security</h3>
              </div>
              
              <p className="text-gray-400 text-sm">
                Zero-trust architecture & compliance
              </p>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-1 lg:col-span-2 relative group"
          >
            <div className={`${glassStyle} rounded-3xl p-6 h-full shadow-bento hover:shadow-glow-md transition-all duration-500`}>
              <h3 className="text-lg font-bold text-white mb-6">Platform Stats</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '1,200+', label: 'Articles' },
                  { value: '50K+', label: 'Developers' },
                  { value: '24/7', label: 'Live Updates' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Command Palette Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            Press <kbd className="px-2 py-1 rounded bg-white/10 text-white font-mono text-xs">⌘K</kbd> to open command palette
          </p>
        </motion.div>
      </div>
    </section>
  )
}
