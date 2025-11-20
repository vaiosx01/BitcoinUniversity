import { NextRequest, NextResponse } from 'next/server'
import { uploadToIPFS } from '@/lib/utils/ipfs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      )
    }

    const ipfsHash = await uploadToIPFS(body.data)
    
    return NextResponse.json({ ipfsHash })
  } catch (error: any) {
    console.error('IPFS upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload to IPFS' },
      { status: 500 }
    )
  }
}

