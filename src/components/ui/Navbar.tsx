'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  Award, 
  Menu, 
  X,
  Home
} from 'lucide-react'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { NetworkSwitcher } from '@/components/web3/NetworkSwitcher'
import { useInstallPWA } from '@/hooks/useInstallPWA'
import { Download } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Credentials', href: '/credentials', icon: Award },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { install, isInstallable } = useInstallPWA()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'frosted-card border-b border-white/10 shadow-glass' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 group"
              onClick={closeMenu}
            >
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
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-btcu-primary to-btcu-accent bg-clip-text text-transparent truncate">
                  Bitcoin University
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 -mt-0.5 sm:-mt-1 hidden xs:block">Decentralized Education</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 xl:gap-2 px-2 xl:px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-btcu-primary'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-btcu-primary/20 rounded-lg border border-btcu-primary/30"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon 
                      className={`w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0 ${isActive ? 'text-btcu-primary' : ''}`} 
                    />
                    <span className="font-medium relative z-10 text-sm xl:text-base">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4">
              {isInstallable && (
                <motion.button
                  onClick={install}
                  className="flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg bg-btcu-primary/20 hover:bg-btcu-primary/30 border border-btcu-primary/30 text-btcu-primary font-medium transition-all text-sm xl:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Install PWA</span>
                </motion.button>
              )}
              <NetworkSwitcher />
              <ConnectButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg frosted-card glass-hover"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 sm:top-20 right-0 bottom-0 w-72 sm:w-80 max-w-[85vw] frosted-card border-l border-white/10 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Mobile Navigation Links */}
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname?.startsWith(item.href))
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-btcu-primary/20 text-btcu-primary border border-btcu-primary/30'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}

                <div className="pt-6 border-t border-white/10 space-y-4">
                  {isInstallable && (
                    <div className="px-4">
                      <p className="text-sm text-gray-400 mb-3 font-medium">Install App</p>
                      <motion.button
                        onClick={() => {
                          install()
                          closeMenu()
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-btcu-primary/20 hover:bg-btcu-primary/30 border border-btcu-primary/30 text-btcu-primary font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-5 h-5" />
                        <span>Install PWA</span>
                      </motion.button>
                    </div>
                  )}
                  <div className="px-4">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Network</p>
                    <NetworkSwitcher />
                  </div>
                  
                  <div className="px-4">
                    <p className="text-sm text-gray-400 mb-3 font-medium">Wallet</p>
                    <div className="w-full">
                      <ConnectButton />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  )
}

