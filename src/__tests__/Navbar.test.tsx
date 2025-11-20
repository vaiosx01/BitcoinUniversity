/**
 * @jest-environment jsdom
 * @eslint-disable
 */

/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from '@/components/ui/Navbar'
import { useInstallPWA } from '@/hooks/useInstallPWA'

// Mock the hook
jest.mock('@/hooks/useInstallPWA')
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock ConnectButton and NetworkSwitcher
jest.mock('@/components/web3/ConnectButton', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}))

jest.mock('@/components/web3/NetworkSwitcher', () => ({
  NetworkSwitcher: () => <div>Network Switcher</div>,
}))

describe('Navbar - Install PWA Button', () => {
  const mockInstall = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useInstallPWA as jest.Mock).mockReturnValue({
      install: mockInstall,
      isInstallable: true,
      isInstalled: false,
    })
  })

  it('should render Install PWA button when PWA is installable', () => {
    render(<Navbar />)
    
    const installButton = screen.getByText('Install PWA')
    expect(installButton).toBeInTheDocument()
  })

  it('should not render Install PWA button when PWA is not installable', () => {
    ;(useInstallPWA as jest.Mock).mockReturnValue({
      install: mockInstall,
      isInstallable: false,
      isInstalled: false,
    })

    render(<Navbar />)
    
    const installButton = screen.queryByText('Install PWA')
    expect(installButton).not.toBeInTheDocument()
  })

  it('should call install function when Install PWA button is clicked', async () => {
    mockInstall.mockResolvedValue(true)
    
    render(<Navbar />)
    
    const installButton = screen.getByText('Install PWA')
    fireEvent.click(installButton)

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalledTimes(1)
    })
  })

  it('should have Download icon in Install PWA button', () => {
    render(<Navbar />)
    
    const installButton = screen.getByText('Install PWA')
    const button = installButton.closest('button')
    
    expect(button).toBeInTheDocument()
    // Check that the button contains the Download icon (SVG)
    expect(button?.querySelector('svg')).toBeInTheDocument()
  })
})

