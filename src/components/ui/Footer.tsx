'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Award,
  Home,
  Mail,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Shield,
  Globe,
  Zap,
  FileText,
  Lock,
} from 'lucide-react'

const navigation = {
  main: [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Credentials', href: '/credentials', icon: Award },
  ],
  resources: [
    { name: 'Documentation', href: '#', icon: FileText },
    { name: 'Whitepaper', href: '#', icon: FileText },
    { name: 'Privacy Policy', href: '#', icon: Lock },
    { name: 'Terms of Service', href: '#', icon: Shield },
  ],
  networks: [
    { name: 'Sepolia Testnet', href: 'https://sepolia.etherscan.io', icon: Zap },
    { name: 'Ethereum Mainnet', href: 'https://etherscan.io', icon: Zap },
  ],
}

const socialLinks = [
  {
    name: 'Twitter',
    href: '#',
    icon: Twitter,
    color: 'hover:text-blue-400',
  },
  {
    name: 'GitHub',
    href: '#',
    icon: Github,
    color: 'hover:text-gray-300',
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: Linkedin,
    color: 'hover:text-blue-500',
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-20 border-t border-white/10">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-btcu-dark via-transparent to-transparent opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative flex-shrink-0"
              >
                <GraduationCap
                  className="w-8 h-8 sm:w-10 sm:h-10 text-btcu-primary"
                  strokeWidth={2.5}
                />
                <motion.div
                  className="absolute inset-0 bg-btcu-primary/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-btcu-primary to-btcu-accent bg-clip-text text-transparent">
                  Bitcoin University
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 -mt-0.5 sm:-mt-1">
                  Decentralized Education
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Democratizing higher education through blockchain technology.
              Own your credentials, control your future.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 sm:p-2 rounded-lg frosted-card glass-hover text-gray-400 ${social.color} transition-colors`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
              Navigation
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-btcu-primary transition-colors group text-xs sm:text-sm"
                  >
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-btcu-primary transition-colors group text-xs sm:text-sm"
                  >
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Networks & Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-btcu-primary flex-shrink-0" />
              Networks
            </h3>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {navigation.networks.map((network) => (
                <li key={network.name}>
                  <a
                    href={network.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-btcu-primary transition-colors group text-xs sm:text-sm"
                  >
                    <network.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="truncate">{network.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="pt-3 sm:pt-4 border-t border-white/10">
              <h4 className="text-white font-semibold mb-2 sm:mb-3 text-xs sm:text-sm">Contact</h4>
              <a
                href="mailto:info@bitcoinuniversity.org"
                className="flex items-center gap-2 text-gray-400 hover:text-btcu-primary transition-colors group text-xs sm:text-sm break-all"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="break-all">info@bitcoinuniversity.org</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              <p>
                © {currentYear} Bitcoin University. All rights reserved.
              </p>
              <span className="hidden sm:inline">•</span>
              <p className="flex items-center gap-1">
                Built on{' '}
                <span className="text-btcu-primary font-semibold">Blockchain</span>
              </p>
              <span className="hidden sm:inline">•</span>
              <p>
                Made by <span className="text-btcu-primary font-semibold">Vaiosx</span>
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-center">Decentralized • Open Source • Transparent</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

