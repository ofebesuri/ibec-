// 声明和密钥相关的数据库操作
import { supabase } from '../lib/supabase'
import { getGenesisHash } from '../utils/crypto'

// ============ 类型定义 ============

export interface Declaration {
  id: number
  userId: number
  declarationType: string       // text/file/link
  contentText?: string          // 文字内容
  fileId?: number               // 上传文件的ID
  fileHash?: string            // 文件哈希
  linkUrl?: string             // 文献链接
  linkType?: string            // patent/doi/paper
  knowledgeTopic?: string       // 知晓主题
  knowledgeCategory?: string    // 构思/现有技术/侵权线索
  contentSummary?: string      // AI生成的内容摘要
  blockHash: string            // 当前区块哈希
  previousHash: string         // 前一区块哈希
  blockIndex: number           // 区块序号
  // 注意：server_timestamp 在数据库中为 VARCHAR 类型，确保时间字符串完全一致
  // 这样可以避免 TIMESTAMPTZ 类型时区转换导致哈希不匹配的问题
  serverTimestamp: string      // ISO格式精确时间字符串
  timestampString: string      // 格式化时间字符串（显示用）
  signature?: string           // RSA签名
  locationCity?: string        // 城市
  ipAddress?: string           // IP地址
  patentCaseId?: string        // 关联专利案件ID
  createdAt: string
}

export interface DeclarationData {
  userId: number
  declarationType: string
  contentText?: string
  fileId?: number
  fileHash?: string
  linkUrl?: string
  linkType?: string
  knowledgeTopic?: string
  knowledgeCategory?: string
  contentSummary?: string
  blockHash: string
  previousHash: string
  blockIndex: number
  serverTimestamp: string
  timestampString: string
  signature?: string
  locationCity?: string
  ipAddress?: string
  patentCaseId?: string
}

export interface UserKeys {
  id: number
  userId: number
  publicKey: string
  encryptedPrivateKey: string
  keyCreatedAt: string
}

// ============ 字段名转换 ============

const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {}
  Object.entries(obj).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = value
  })
  return result
}

const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {}
  Object.entries(obj).forEach(([key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    result[snakeKey] = value
  })
  return result
}

// ============ 声明 CRUD ============

/**
 * 创建知晓声明
 */
export const createDeclaration = async (
  data: DeclarationData
): Promise<number | null> => {
  try {
    const declarationData = toSnakeCase(data)

    const { data: result, error } = await supabase
      .from('declarations')
      .insert(declarationData)
      .select()
      .single()

    if (error) throw error
    return result?.id || null
  } catch (error) {
    console.error('创建声明失败:', error)
    return null
  }
}

/**
 * 获取用户的所有声明
 */
export const getDeclarations = async (userId: number): Promise<Declaration[]> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('user_id', userId)
      .order('block_index', { ascending: false })

    if (error) throw error
    return (data || []).map((row: any) => toCamelCase(row) as Declaration)
  } catch (error) {
    console.error('获取声明列表失败:', error)
    return []
  }
}

/**
 * 根据ID获取声明
 */
export const getDeclarationById = async (
  id: number,
  userId: number
): Promise<Declaration | null> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null
    return toCamelCase(data[0]) as Declaration
  } catch (error) {
    console.error('获取声明详情失败:', error)
    return null
  }
}

/**
 * 根据ID获取任意声明（用于验证他人声明）
 */
export const getDeclarationByIdAny = async (
  id: number
): Promise<Declaration | null> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', id)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null
    return toCamelCase(data[0]) as Declaration
  } catch (error) {
    console.error('获取声明详情失败:', error)
    return null
  }
}

/**
 * 获取用户最新的声明
 */
export const getLatestDeclaration = async (
  userId: number
): Promise<Declaration | null> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('user_id', userId)
      .order('block_index', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null
    return toCamelCase(data[0]) as Declaration
  } catch (error) {
    console.error('获取最新声明失败:', error)
    return null
  }
}

/**
 * 获取用户的下一个区块序号
 */
export const getNextBlockIndex = async (userId: number): Promise<number> => {
  try {
    const latest = await getLatestDeclaration(userId)
    return latest ? latest.blockIndex + 1 : 1
  } catch (error) {
    console.error('获取区块序号失败:', error)
    return 1
  }
}

/**
 * 获取全局最新的声明（用于获取前一个哈希）
 */
export const getGlobalLatestDeclaration = async (): Promise<Declaration | null> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .order('block_index', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null
    return toCamelCase(data[0]) as Declaration
  } catch (error) {
    console.error('获取全局最新声明失败:', error)
    return null
  }
}

/**
 * 获取创世区块哈希
 */
export const getGenesisBlock = async (): Promise<{ hash: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('declarations')
      .select('block_hash')
      .eq('block_index', 0)
      .limit(1)

    if (error) throw error
    if (data && data.length > 0) {
      return { hash: data[0].block_hash }
    }
    // 如果没有创世区块，返回默认哈希
    return { hash: getGenesisHash() }
  } catch (error) {
    console.error('获取创世区块失败:', error)
    return { hash: getGenesisHash() }
  }
}

/**
 * 获取用户的声明数量
 */
export const getDeclarationCount = async (userId: number): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('declarations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('获取声明数量失败:', error)
    return 0
  }
}

/**
 * 删除声明
 */
export const deleteDeclaration = async (
  id: number,
  userId: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('declarations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('删除声明失败:', error)
    return false
  }
}

// ============ 密钥 CRUD ============

/**
 * 保存用户密钥对
 */
export const saveUserKeys = async (
  userId: number,
  publicKey: string,
  encryptedPrivateKey: string
): Promise<number | null> => {
  try {
    // 先删除旧密钥（如果有）
    await supabase
      .from('user_keys')
      .delete()
      .eq('user_id', userId)

    const { data, error } = await supabase
      .from('user_keys')
      .insert({
        user_id: userId,
        public_key: publicKey,
        encrypted_private_key: encryptedPrivateKey,
        key_created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data?.id || null
  } catch (error) {
    console.error('保存密钥失败:', error)
    return null
  }
}

/**
 * 获取用户密钥对
 */
export const getUserKeys = async (
  userId: number
): Promise<{ publicKey: string; encryptedPrivateKey: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('user_keys')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) return null

    return {
      publicKey: data[0].public_key,
      encryptedPrivateKey: data[0].encrypted_private_key
    }
  } catch (error) {
    console.error('获取密钥失败:', error)
    return null
  }
}

/**
 * 根据声明ID获取创建者的公钥（用于验证他人声明）
 */
export const getPublicKeyByDeclarationId = async (
  declarationId: number
): Promise<{ publicKey: string; userId: number } | null> => {
  try {
    // 先获取声明的用户ID
    const { data: declaration, error: declError } = await supabase
      .from('declarations')
      .select('user_id')
      .eq('id', declarationId)
      .limit(1)

    if (declError || !declaration || declaration.length === 0) {
      return null
    }

    const userId = declaration[0].user_id

    // 再获取该用户的公钥
    const { data: keys, error: keyError } = await supabase
      .from('user_keys')
      .select('public_key, user_id')
      .eq('user_id', userId)
      .limit(1)

    if (keyError || !keys || keys.length === 0) {
      return null
    }

    return {
      publicKey: keys[0].public_key,
      userId: keys[0].user_id
    }
  } catch (error) {
    console.error('获取声明者公钥失败:', error)
    return null
  }
}

/**
 * 检查用户是否有密钥对
 */
export const hasUserKeys = async (userId: number): Promise<boolean> => {
  try {
    const keys = await getUserKeys(userId)
    return keys !== null
  } catch (error) {
    console.error('检查密钥失败:', error)
    return false
  }
}

/**
 * 删除用户密钥对
 */
export const deleteUserKeys = async (userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_keys')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('删除密钥失败:', error)
    return false
  }
}
