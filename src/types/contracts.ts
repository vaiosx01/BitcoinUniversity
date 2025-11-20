export interface Credential {
  credentialType: string
  field: string
  recipient: `0x${string}`
  issuer: `0x${string}`
  issuedAt: bigint
  expiresAt: bigint
  revoked: boolean
  metadataHash: `0x${string}`
}

export interface Course {
  id: bigint
  title: string
  description: string
  educator: `0x${string}`
  duration: bigint
  price: bigint
  active: boolean
  metadataURI: string
  createdAt: bigint
  enrollmentCount: bigint
}

export interface Enrollment {
  student: `0x${string}`
  courseId: bigint
  enrolledAt: bigint
  completedAt: bigint
  completed: boolean
  grade: number
}

