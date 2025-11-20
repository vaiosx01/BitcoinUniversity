const projectId = process.env.NEXT_PUBLIC_PINATA_API_KEY
const projectSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: projectId!,
        pinata_secret_api_key: projectSecret!,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS')
    }

    const result = await response.json()
    return `ipfs://${result.IpfsHash}`
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}

export function getIPFSUrl(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${uri.replace('ipfs://', '')}`
  }
  return uri
}

