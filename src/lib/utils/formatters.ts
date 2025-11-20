export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatEther(value: bigint | string): string {
  const num = typeof value === 'string' ? BigInt(value) : value
  return (Number(num) / 1e18).toFixed(4)
}

export function formatDate(timestamp: number | bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

