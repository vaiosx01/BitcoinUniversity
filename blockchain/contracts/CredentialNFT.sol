// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CredentialNFT
 * @author Bitcoin University
 * @notice ERC-721 Soulbound Token (SBT) representing academic credentials
 * @dev Implements ERC-5192 for minimal Soulbound Token standard.
 *      Credentials are non-transferable NFTs that represent academic achievements.
 *      Supports issuance, revocation, and verification of credentials.
 */
contract CredentialNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Burnable, 
    AccessControl, 
    Pausable,
    ReentrancyGuard 
{
    /// @notice Interface ID for ERC-5192 (Minimal Soulbound Token)
    bytes4 public constant SOULBOUND_INTERFACE_ID = 0xb45a3c0e;
    
    /// @notice Role identifier for addresses that can issue credentials
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    /// @notice Role identifier for addresses that can verify credentials
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /// @notice Counter for generating unique token IDs
    uint256 private _nextTokenId;

    // Custom Errors - More gas efficient than require strings
    /// @notice Thrown when recipient address is zero
    error InvalidRecipient();
    /// @notice Thrown when credential type is empty
    error InvalidCredentialType();
    /// @notice Thrown when field is empty
    error InvalidField();
    /// @notice Thrown when expiration timestamp is invalid
    error InvalidExpiration();
    /// @notice Thrown when credential does not exist
    error CredentialNotFound();
    /// @notice Thrown when credential is already revoked
    error AlreadyRevoked();
    /// @notice Thrown when attempting to transfer a soulbound token
    error SoulboundToken();

    /**
     * @notice Credential structure storing all credential information
     * @dev Packed efficiently to minimize storage costs
     */
    struct Credential {
        string credentialType;        // Type: "Bachelor", "Master", "PhD", "Certificate"
        string field;                 // Field of study: "Computer Science", "Business", etc.
        address recipient;            // Address of the credential recipient
        address issuer;               // Address of the credential issuer
        uint256 issuedAt;             // Timestamp when credential was issued
        uint256 expiresAt;            // Expiration timestamp (0 for non-expiring)
        bool revoked;                 // Whether the credential has been revoked
        bytes32 metadataHash;         // IPFS hash of full credential metadata
    }

    // Storage Mappings
    /// @notice Mapping from token ID to Credential struct
    mapping(uint256 => Credential) public credentials;
    /// @notice Mapping from recipient address to array of their credential token IDs
    mapping(address => uint256[]) private _recipientCredentials;

    // Events
    /// @notice Emitted when a new credential is issued
    /// @param tokenId The unique identifier of the issued credential
    /// @param recipient The address receiving the credential
    /// @param issuer The address issuing the credential
    /// @param credentialType The type of credential issued
    /// @param field The field of study
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string credentialType,
        string field
    );

    /// @notice Emitted when a credential is revoked
    /// @param tokenId The unique identifier of the revoked credential
    /// @param revoker The address that revoked the credential
    event CredentialRevoked(uint256 indexed tokenId, address indexed revoker);
    
    /// @notice Emitted when a credential is verified
    /// @param tokenId The unique identifier of the verified credential
    /// @param verifier The address that verified the credential
    event CredentialVerified(uint256 indexed tokenId, address indexed verifier);

    /**
     * @notice Initializes the contract with default admin roles
     * @dev Grants DEFAULT_ADMIN_ROLE, ISSUER_ROLE, and VERIFIER_ROLE to deployer
     */
    constructor() ERC721("Bitcoin University Credential", "BTCU-CRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Issues a new credential to a recipient
     * @dev Only issuers can issue credentials. Credential must have valid type, field, and expiration.
     * @param recipient The address receiving the credential (must not be zero)
     * @param credentialType The type of credential (e.g., "Bachelor", "Master", "PhD", "Certificate")
     * @param field The field of study (e.g., "Computer Science", "Business")
     * @param credentialURI IPFS URI containing credential metadata JSON
     * @param metadataHash Keccak256 hash of the full credential data for verification
     * @param expiresAt Expiration timestamp (0 for non-expiring credentials)
     * @return tokenId The unique identifier of the newly issued credential
     */
    function issueCredential(
        address recipient,
        string memory credentialType,
        string memory field,
        string memory credentialURI,
        bytes32 metadataHash,
        uint256 expiresAt
    ) external onlyRole(ISSUER_ROLE) whenNotPaused nonReentrant returns (uint256) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (bytes(credentialType).length == 0) revert InvalidCredentialType();
        if (bytes(field).length == 0) revert InvalidField();
        if (expiresAt != 0 && expiresAt <= block.timestamp) revert InvalidExpiration();

        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, credentialURI);

        credentials[tokenId] = Credential({
            credentialType: credentialType,
            field: field,
            recipient: recipient,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false,
            metadataHash: metadataHash
        });

        _recipientCredentials[recipient].push(tokenId);

        emit CredentialIssued(tokenId, recipient, msg.sender, credentialType, field);

        return tokenId;
    }

    /**
     * @notice Revokes a credential, marking it as invalid
     * @dev Only issuers can revoke credentials. Credential must exist and not already be revoked.
     * @param tokenId The unique identifier of the credential to revoke
     */
    function revokeCredential(uint256 tokenId) 
        external 
        onlyRole(ISSUER_ROLE) 
        whenNotPaused 
    {
        if (_ownerOf(tokenId) == address(0)) revert CredentialNotFound();
        if (credentials[tokenId].revoked) revert AlreadyRevoked();

        credentials[tokenId].revoked = true;

        emit CredentialRevoked(tokenId, msg.sender);
    }

    /**
     * @notice Verifies the validity of a credential
     * @dev Checks if credential exists, is not revoked, and not expired
     * @param tokenId The unique identifier of the credential to verify
     * @return valid True if credential is valid, false otherwise
     */
    function verifyCredential(uint256 tokenId) 
        external 
        view 
        returns (bool valid) 
    {
        if (_ownerOf(tokenId) == address(0)) return false;
        
        Credential memory cred = credentials[tokenId];
        
        // Check if revoked
        if (cred.revoked) return false;
        
        // Check if expired
        if (cred.expiresAt != 0 && cred.expiresAt < block.timestamp) return false;

        return true;
    }

    /**
     * @notice Verifies a credential and emits a verification event
     * @dev Only verifiers can call this function. Emits CredentialVerified event.
     * @param tokenId The unique identifier of the credential to verify
     * @return valid True if credential is valid, false otherwise
     */
    function verifyCredentialWithEvent(uint256 tokenId)
        external
        onlyRole(VERIFIER_ROLE)
        returns (bool valid)
    {
        valid = this.verifyCredential(tokenId);
        if (valid) {
            emit CredentialVerified(tokenId, msg.sender);
        }
        return valid;
    }

    /**
     * @notice Gets all credential token IDs for a recipient
     * @param recipient The address of the recipient
     * @return tokenIds Array of token IDs owned by the recipient
     */
    function getCredentialsByRecipient(address recipient) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _recipientCredentials[recipient];
    }

    /**
     * @notice Gets detailed information about a specific credential
     * @param tokenId The unique identifier of the credential
     * @return credential The Credential struct containing all credential data
     */
    function getCredential(uint256 tokenId) 
        external 
        view 
        returns (Credential memory) 
    {
        if (_ownerOf(tokenId) == address(0)) revert CredentialNotFound();
        return credentials[tokenId];
    }

    /**
     * @notice Gets the total number of credentials issued
     * @return The total number of credentials
     */
    function getTotalCredentials() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice ERC-5192: Returns whether a token is soulbound (locked)
     * @dev All tokens are soulbound (locked = true) as they cannot be transferred
     * @param tokenId The token ID to check
     * @return locked Always returns true for soulbound tokens
     */
    function locked(uint256 tokenId) external view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Soulbound: Override transfer functions to make tokens non-transferable
     * @dev Implements ERC-5192 by preventing transfers between addresses.
     *      Allows minting (from == address(0)) and burning (to == address(0)).
     * @param to The address receiving the token
     * @param tokenId The token ID being transferred
     * @param auth The address authorized to make the transfer
     * @return The address of the previous owner
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // But prevent transfers between addresses (ERC-5192 Soulbound)
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Pauses the contract, disabling most functionality
     * @dev Only admins can pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract, re-enabling functionality
     * @dev Only admins can unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Required overrides
    /**
     * @notice Returns the URI for a given token ID
     * @dev Overrides both ERC721 and ERC721URIStorage
     * @param tokenId The token ID to query
     * @return The token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Checks if the contract supports a given interface
     * @dev Implements ERC-165 interface detection. Also supports ERC-5192 (Soulbound).
     * @param interfaceId The interface ID to check
     * @return True if the interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return interfaceId == SOULBOUND_INTERFACE_ID || super.supportsInterface(interfaceId);
    }
}

