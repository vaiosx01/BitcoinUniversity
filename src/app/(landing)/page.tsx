'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap,
  Shield,
  Globe,
  Users,
  Award,
  BookOpen,
  Zap,
  Lock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Network,
  Smartphone,
  TrendingUp,
  FileCheck,
  Wallet,
  Layers,
  Code,
  Rocket,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ConnectButton } from '@/components/web3/ConnectButton'
import Link from 'next/link'

const features = [
  {
    icon: Award,
    title: 'Soulbound NFT Credentials',
    description: 'Immutable, verifiable academic credentials stored on-chain. Your achievements are permanent and cannot be forged.',
    color: 'from-btcu-primary to-orange-600',
  },
  {
    icon: BookOpen,
    title: 'Decentralized Course Registry',
    description: 'Transparent course management with on-chain enrollment. All records are publicly verifiable and tamper-proof.',
    color: 'from-btcu-secondary to-blue-600',
  },
  {
    icon: Network,
    title: 'Ethereum Network Support',
    description: 'Deployed on Sepolia Testnet and Ethereum Mainnet. Secure, reliable, and accessible to everyone.',
    color: 'from-btcu-accent to-teal-600',
  },
  {
    icon: Lock,
    title: 'Secure & Transparent',
    description: 'Built with OpenZeppelin contracts. Reentrancy protection, access control, and comprehensive security audits.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Smartphone,
    title: 'Progressive Web App',
    description: 'Install on any device. Works offline, updates automatically, and provides a native app-like experience.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: Wallet,
    title: 'Web3 Native',
    description: 'Seamless wallet integration with Reown AppKit. Connect with MetaMask, WalletConnect, and more.',
    color: 'from-green-500 to-emerald-600',
  },
]

const benefits = [
  {
    icon: CheckCircle,
    title: 'Own Your Credentials',
    description: 'Your academic achievements belong to you. No institution can revoke or modify your verified credentials.',
  },
  {
    icon: CheckCircle,
    title: 'Global Verification',
    description: 'Employers and institutions can instantly verify your credentials on-chain, eliminating fraud and bureaucracy.',
  },
  {
    icon: CheckCircle,
    title: 'Lower Costs',
    description: 'Blockchain technology reduces administrative overhead, making quality education more accessible and affordable.',
  },
  {
    icon: CheckCircle,
    title: 'Borderless Education',
    description: 'Access courses from anywhere in the world. No geographic restrictions or traditional barriers.',
  },
  {
    icon: CheckCircle,
    title: 'Transparent Governance',
    description: 'Decentralized decision-making ensures academic freedom and prevents institutional overreach.',
  },
  {
    icon: CheckCircle,
    title: 'Future-Proof',
    description: 'Your credentials are stored on immutable blockchain networks that will outlast any single institution.',
  },
]

const stats = [
  { value: '2', label: 'Blockchain Networks', icon: Layers },
  { value: '100%', label: 'On-Chain Verification', icon: FileCheck },
  { value: '24/7', label: 'Global Access', icon: Globe },
  { value: '0', label: 'Forgery Risk', icon: Shield },
]

const howItWorks = [
  {
    step: '01',
    title: 'Connect Your Wallet',
    description: 'Link your Web3 wallet using Reown AppKit. Support for MetaMask, WalletConnect, and more.',
    icon: Wallet,
  },
  {
    step: '02',
    title: 'Browse Courses',
    description: 'Explore our decentralized course catalog. All courses are registered on-chain with transparent pricing.',
    icon: BookOpen,
  },
  {
    step: '03',
    title: 'Enroll & Learn',
    description: 'Complete your enrollment transaction on-chain. Access course materials and track your progress.',
    icon: GraduationCap,
  },
  {
    step: '04',
    title: 'Earn Credentials',
    description: 'Upon completion, receive your Soulbound NFT credential. Permanent, verifiable, and owned by you.',
    icon: Award,
  },
]

const technologies = [
  { name: 'Next.js 14', description: 'Modern React framework with App Router' },
  { name: 'Solidity 0.8.24', description: 'Smart contract language' },
  { name: 'Ethereum Networks', description: 'Sepolia Testnet & Mainnet' },
  { name: 'IPFS', description: 'Decentralized storage for metadata' },
  { name: 'OpenZeppelin', description: 'Battle-tested security standards' },
  { name: 'Wagmi + Viem', description: 'Type-safe Web3 integration' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full frosted-card border border-btcu-primary/30"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-btcu-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">
                Decentralized Education Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight px-2">
              <span className="bg-gradient-to-r from-btcu-primary via-btcu-secondary to-btcu-accent bg-clip-text text-transparent">
                Bitcoin University
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Democratizing higher education through blockchain technology.
              <br className="hidden sm:block" />
              <span className="text-btcu-primary"> Own your credentials, control your future.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4 px-4">
              <ConnectButton />
              <Link href="/courses" className="w-full sm:w-auto">
                <motion.button
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 frosted-card glass-hover font-semibold rounded-xl text-white group text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8 sm:pt-12 max-w-4xl mx-auto px-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="frosted-card p-3 sm:p-4"
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-btcu-primary mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-btcu-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 px-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Built with cutting-edge blockchain technology to revolutionize education
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard hover className="h-full">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 px-4">
              Why Choose Bitcoin University?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Experience the future of education with blockchain-powered credentials
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl frosted-card"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-btcu-primary/20 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-btcu-primary" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Get started in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <GlassCard className="h-full text-center">
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-btcu-primary to-btcu-accent flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl bg-gradient-to-br from-btcu-primary/20 to-btcu-accent/20 flex items-center justify-center">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-btcu-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </GlassCard>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-btcu-primary to-transparent transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 px-4">
              Built on Modern Technology
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Leveraging the best tools and frameworks for a secure, scalable platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="frosted-card p-4 sm:p-6 text-center"
              >
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-btcu-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">{tech.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <GlassCard className="p-6 sm:p-8 lg:p-12 xl:p-16">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-4 sm:mb-6"
              >
                <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-btcu-primary mx-auto" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join the future of education. Connect your wallet and start your learning journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <ConnectButton />
                <Link href="/courses" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-btcu-primary to-btcu-accent text-white font-semibold rounded-xl glow-orange text-sm sm:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Browse Courses</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
