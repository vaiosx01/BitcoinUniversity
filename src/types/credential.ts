export interface CredentialMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
  credentialType: string
  field: string
  issuedAt: string
  issuer: string
  recipient: string
}

