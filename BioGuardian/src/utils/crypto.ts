// 密码学工具函数 - 专利时间证据链系统核心
import CryptoJS from 'crypto-js'

// 创世区块哈希（固定值，用于哈希链起点）
const GENESIS_HASH = 'bio_guardian_genesis_block_2024_sha256'

/**
 * 计算字符串的SHA-256哈希
 */
export function sha256Hash(content: string): string {
  return CryptoJS.SHA256(content).toString()
}

/**
 * 计算ArrayBuffer的SHA-256哈希（用于文件）
 */
export async function sha256HashFromBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 计算文件SHA-256哈希
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return sha256HashFromBuffer(buffer)
}

/**
 * 计算内容哈希（文本）
 */
export async function hashContent(content: string): Promise<string> {
  return sha256Hash(content)
}

/**
 * 计算区块哈希
 * 区块数据 = 内容哈希 + 前一区块哈希 + 时间戳
 */
export async function computeBlockHash(
  contentHash: string,
  previousHash: string,
  timestamp: string
): Promise<string> {
  const blockData = `${contentHash}|${previousHash}|${timestamp}`
  return sha256Hash(blockData)
}

/**
 * 获取创世区块哈希
 */
export function getGenesisHash(): string {
  return sha256Hash(GENESIS_HASH)
}

/**
 * 计算创世区块哈希
 */
export function computeGenesisHash(): string {
  return getGenesisHash()
}

/**
 * 生成RSA密钥对（使用Web Crypto API）
 */
export async function generateRSAKeyPair(): Promise<{
  publicKey: string   // PEM格式公钥
  privateKey: string  // PEM格式私钥
}> {
  try {
    // 生成RSA-OAEP密钥对，2048位
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true, // 可提取
      ['encrypt', 'decrypt']
    )

    // 导出公钥
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const publicKeyArray = new Uint8Array(publicKeyBuffer)
    const publicKeyBase64 = btoa(String.fromCharCode(...publicKeyArray))
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${formatBase64(publicKeyBase64)}\n-----END PUBLIC KEY-----`

    // 导出私钥
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    const privateKeyArray = new Uint8Array(privateKeyBuffer)
    const privateKeyBase64 = btoa(String.fromCharCode(...privateKeyArray))
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${formatBase64(privateKeyBase64)}\n-----END PRIVATE KEY-----`

    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem
    }
  } catch (error) {
    console.error('生成RSA密钥对失败:', error)
    throw new Error('生成RSA密钥对失败')
  }
}

/**
 * 格式化Base64字符串（每64字符换行）
 */
function formatBase64(str: string): string {
  const result: string[] = []
  for (let i = 0; i < str.length; i += 64) {
    result.push(str.slice(i, i + 64))
  }
  return result.join('\n')
}

/**
 * 使用RSA-OAEP加密数据
 */
export async function rsaEncrypt(data: string, publicKeyPem: string): Promise<string> {
  try {
    const publicKey = await importPublicKey(publicKeyPem)
    const encodedData = new TextEncoder().encode(data)
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encodedData
    )
    const encryptedArray = new Uint8Array(encryptedBuffer)
    return btoa(String.fromCharCode(...encryptedArray))
  } catch (error) {
    console.error('RSA加密失败:', error)
    throw new Error('RSA加密失败')
  }
}

/**
 * 使用RSA-OAEP解密数据
 */
export async function rsaDecrypt(encryptedData: string, privateKeyPem: string): Promise<string> {
  try {
    const privateKey = await importPrivateKey(privateKeyPem)
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedBuffer
    )
    return new TextDecoder().decode(decryptedBuffer)
  } catch (error) {
    console.error('RSA解密失败:', error)
    throw new Error('RSA解密失败')
  }
}

/**
 * 导入公钥
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '')
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
}

/**
 * 导入私钥
 */
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  )
}

/**
 * RSA签名（使用RSA-PSS）
 */
export async function signData(
  data: string,
  privateKeyPem: string
): Promise<string> {
  try {
    const privateKey = await importPrivateKeyForSign(privateKeyPem)
    const encodedData = new TextEncoder().encode(data)
    const signatureBuffer = await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 32 },
      privateKey,
      encodedData
    )
    const signatureArray = new Uint8Array(signatureBuffer)
    return btoa(String.fromCharCode(...signatureArray))
  } catch (error) {
    console.error('RSA签名失败:', error)
    throw new Error('RSA签名失败')
  }
}

/**
 * RSA验签
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKeyPem: string
): Promise<boolean> {
  try {
    const publicKey = await importPublicKeyForVerify(publicKeyPem)
    const encodedData = new TextEncoder().encode(data)
    const signatureArray = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
    return await crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      publicKey,
      signatureArray,
      encodedData
    )
  } catch (error) {
    console.error('RSA验签失败:', error)
    return false
  }
}

/**
 * 导入私钥（用于签名）
 */
async function importPrivateKeyForSign(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false, // 签名密钥不可加密
    ['sign']
  )
}

/**
 * 导入公钥（用于验签）
 */
async function importPublicKeyForVerify(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '')
  const binaryString = atob(pemContents)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false, // 验签密钥不需要可提取
    ['verify']
  )
}

/**
 * AES加密私钥
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
  return CryptoJS.AES.encrypt(privateKey, password).toString()
}

/**
 * AES解密私钥
 */
export function decryptPrivateKey(encrypted: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, password)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * 验证哈希链完整性
 */
export async function verifyChain(
  declarations: Array<{
    block_index: number
    content_hash: string
    block_hash: string
    previous_hash: string
    server_timestamp: string
    timestamp_string?: string  // 可选：兼容旧格式
  }>,
  genesisHash: string
): Promise<{ valid: boolean; brokenAt?: number; details?: string }> {
  if (declarations.length === 0) {
    return { valid: true, details: '无声明记录' }
  }

  // 按区块序号排序
  const sorted = [...declarations].sort((a, b) => a.block_index - b.block_index)

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const expectedPreviousHash = i === 0 ? genesisHash : sorted[i - 1].block_hash

    // 检查前一哈希是否匹配
    if (current.previous_hash !== expectedPreviousHash) {
      return {
        valid: false,
        brokenAt: current.block_index,
        details: `区块 ${current.block_index} 的前驱哈希不匹配：期望 ${expectedPreviousHash}，实际 ${current.previous_hash}`
      }
    }

    // 重新计算区块哈希并验证（尝试两种时间格式）
    let computedHash = await computeBlockHash(
      current.content_hash,
      current.previous_hash,
      current.server_timestamp
    )
    
    // 如果不匹配，尝试 timestampString（兼容旧声明）
    let hashMatches = computedHash === current.block_hash
    if (!hashMatches && current.timestamp_string) {
      const altHash = await computeBlockHash(
        current.content_hash,
        current.previous_hash,
        current.timestamp_string
      )
      if (altHash === current.block_hash) {
        computedHash = altHash
        hashMatches = true
      }
    }
    
    if (!hashMatches) {
      // 调试日志：输出详细信息帮助诊断
      console.log('verifyChain 区块哈希不匹配:', {
        blockIndex: current.block_index,
        computedHash,
        storedHash: current.block_hash,
        contentHash: current.content_hash,
        previousHash: current.previous_hash,
        serverTimestamp: current.server_timestamp,
        timestampString: current.timestamp_string
      })
      
      return {
        valid: false,
        brokenAt: current.block_index,
        details: `区块 ${current.block_index} 的哈希不匹配：期望 ${computedHash.substring(0, 20)}...，实际 ${current.block_hash.substring(0, 20)}...`
      }
    }
  }

  return { valid: true, details: '哈希链完整，所有区块未被篡改' }
}

/**
 * 获取IP地理位置
 */
export async function getLocationByIP(): Promise<{
  city: string
  ip: string
  country?: string
}> {
  try {
    // 使用 ip-api.com 免费API (使用https确保移动端兼容)
    const response = await fetch('https://ip-api.com/json/?fields=query,city,country')
    if (!response.ok) {
      throw new Error('获取位置信息失败')
    }
    const data = await response.json()
    return {
      ip: data.query || '未知',
      city: data.city || '未知',
      country: data.country || '未知'
    }
  } catch (error) {
    console.error('获取IP位置失败:', error)
    return {
      ip: '未知',
      city: '未知',
      country: '未知'
    }
  }
}

/**
 * 生成时间戳字符串
 */
export function formatTimestamp(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

/**
 * 生成唯一报告ID
 */
export function generateReportId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `BG-RPT-${timestamp}-${random}`.toUpperCase()
}

/**
 * 生成声明ID
 */
export function generateDeclarationId(blockIndex: number): string {
  const timestamp = Date.now().toString(36)
  return `BG-DEC-${blockIndex.toString().padStart(6, '0')}-${timestamp}`.toUpperCase()
}
