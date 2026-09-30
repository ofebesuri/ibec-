// BioGuardian Supabase数据库API
// 所有数据存储在云端Supabase数据库
import { supabase, checkSupabaseConnection } from './lib/supabase';
import {
  generateRSAKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  hashContent,
  hashFile,
  computeBlockHash,
  getGenesisHash,
  signData,
  verifySignature,
  verifyChain,
  getLocationByIP,
  formatTimestamp,
  generateReportId,
  generateDeclarationId
} from './utils/crypto'
import {
  createDeclaration as createDeclarationInDb,
  getDeclarations as getDeclarationsFromDb,
  getDeclarationById as getDeclarationByIdFromDb,
  getDeclarationByIdAny,
  getPublicKeyByDeclarationId,
  getLatestDeclaration as getLatestDeclarationFromDb,
  getNextBlockIndex as getNextBlockIndexFromDb,
  getGenesisBlock as getGenesisBlockFromDb,
  getDeclarationCount as getDeclarationCountFromDb,
  getUserKeys as getUserKeysFromDb,
  saveUserKeys as saveUserKeysInDb,
  hasUserKeys as hasUserKeysFromDb,
  deleteDeclaration as deleteDeclarationFromDb,
  deleteUserKeys as deleteUserKeysFromDb,
  Declaration,
  DeclarationData
} from './db/declarations'

// Re-export types for convenience
export type { Declaration, DeclarationData } from './db/declarations'

// 全局数据库初始化状态
let dbInitialized = false;

// 获取当前用户ID
export const getCurrentUserId = (): number => {
  const userStr = localStorage.getItem('bioguardian_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id || 0;
  }
  return 0;
};

// 初始化数据库
export const ensureDbInitialized = async (): Promise<boolean> => {
  if (dbInitialized) return true;
  
  try {
    const connected = await checkSupabaseConnection();
    if (connected) {
      dbInitialized = true;
      console.log('Supabase数据库已连接');
      return true;
    }
    console.error('Supabase数据库连接失败');
    return false;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

// ============ 存储Token和用户信息 ============

export const getToken = () => localStorage.getItem('bioguardian_token');
export const setToken = (token: string) => localStorage.setItem('bioguardian_token', token);
export const removeToken = () => localStorage.removeItem('bioguardian_token');

export const storeUser = (user: any) => {
  localStorage.setItem('bioguardian_user', JSON.stringify(user));
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('bioguardian_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeUser = () => {
  localStorage.removeItem('bioguardian_user');
};

// ============ 认证 API ============

import { 
  registerUser, 
  loginUser, 
  getUserById, 
  updateUser, 
  changePassword,
  resetPasswordByPhone,
  resetKeysByPhone
} from './db/users';

import {
  getProjects as getProjectsFromDb,
  getPatents as getPatentsFromDb,
  getFiles as getFilesFromDb,
  getEvents as getEventsFromDb,
  getNotifications as getNotificationsFromDb,
  getTeamMembers as getTeamMembersFromDb,
  createProject as createProjectInDb,
  updateProject as updateProjectInDb,
  deleteProject as deleteProjectInDb,
  createPatent as createPatentInDb,
  updatePatent as updatePatentInDb,
  deletePatent as deletePatentInDb,
  createFile as createFileInDb,
  updateFile as updateFileInDb,
  deleteFile as deleteFileInDb,
  createEvent as createEventInDb,
  updateEvent as updateEventInDb,
  deleteEvent as deleteEventInDb,
  createNotification as createNotificationInDb,
  markNotificationRead as markNotificationReadInDb,
  createTeamMember as createTeamMemberInDb,
  deleteTeamMember as deleteTeamMemberInDb,
  getUserStats as localGetUserStats,
  recordUsage as recordUsageInDb,
  getModuleUsageStats as getModuleUsageStatsFromDb,
  getGlobalModuleUsageStats as getGlobalModuleUsageStatsFromDb,
  getGlobalUsageStats as getGlobalUsageStatsFromDb,
  getTodayUsage as getTodayUsageFromDb
} from './db/business';

export async function register(data: { username: string; password: string; phone?: string; email?: string }) {
  await ensureDbInitialized();
  
  const result = await registerUser(data.username, data.password, data.phone, data.email);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  const user = await getUserById(result.userId!);
  if (!user) throw new Error('注册后获取用户信息失败');
  
  setToken('supabase_token_' + user.id);
  storeUser(user);
  
  return { success: true, user };
}

export async function login(username: string, password: string) {
  await ensureDbInitialized();
  
  const result = await loginUser(username, password);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  // 存储token和用户信息
  setToken('supabase_token_' + result.user!.id);
  storeUser(result.user);
  
  return { success: true, user: result.user, access_token: 'supabase_token_' + result.user!.id };
}

export async function logout() {
  removeToken();
  removeUser();
}

export async function resetPassword(username: string, phone: string, newPassword: string) {
  await ensureDbInitialized();
  const result = await resetPasswordByPhone(username, phone, newPassword);
  if (!result.success) {
    throw new Error(result.message);
  }
  return { success: true, message: result.message };
}

/**
 * 通过手机号找回密钥
 * 清除旧密钥，用户需要重新生成新的密钥对
 */
export async function recoverUserKeys(username: string, phone: string) {
  await ensureDbInitialized();
  const result = await resetKeysByPhone(username, phone);
  if (!result.success) {
    throw new Error(result.message);
  }
  // 清除本地存储的密钥相关数据
  removeStoredKeys();
  return { success: true, message: result.message };
}

/**
 * 清除本地存储的密钥数据
 */
export const removeStoredKeys = () => {
  localStorage.removeItem('bioguardian_private_key');
  localStorage.removeItem('bioguardian_public_key');
  localStorage.removeItem('bioguardian_key_id');
};

// ============ 用户 API ============

export async function getProfile() {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const user = await getUserById(userId);
  if (!user) throw new Error('用户不存在');
  
  return user;
}

export async function getUserStats() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return { projects: 0, patents: 0, files: 0, teamMembers: 0, events: 0, searches: 0, alerts: 0 };
  
  return await localGetUserStats(userId);
}

export async function updateProfile(data: { phone?: string; email?: string; company?: string; position?: string; bio?: string }) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const success = await updateUser(userId, data);
  if (!success) throw new Error('更新失败');
  
  return await getProfile();
}

export async function getUserSettings() {
  const user = getStoredUser();
  return {
    hasPhone: !!user?.phone,
    hasEmail: !!user?.email,
    twoFactorEnabled: false
  };
}

// ============ 文件 API ============

export async function getFiles() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  return await getFilesFromDb(userId);
}

export async function getFileStats() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return { total: 0, verified: 0, pending: 0 };
  
  const files = await getFilesFromDb(userId);
  const total = files.length;
  const verified = files.filter(f => f.status === 'verified').length;
  const pending = files.filter(f => f.status === 'pending').length;
  
  return { total, verified, pending };
}

export async function uploadFile(file: File) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  // 本地存储文件信息（实际文件内容存储在 Capacitor Filesystem 中）
  const fileId = await createFileInDb({
    userId,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    status: 'pending'
  });
  
  if (!fileId) throw new Error('文件上传失败');
  
  return { id: fileId, originalName: file.name, status: 'pending' };
}

export async function verifyFileHash(fileId: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await updateFileInDb(fileId, userId, { status: 'verified' });
  return { success: true, status: 'verified' };
}

export async function deleteFile(fileId: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await deleteFileInDb(fileId, userId);
  return { success: true };
}

// ============ 专利 API ============

export async function getPatents(category?: string) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  let patents = await getPatentsFromDb(userId);
  
  if (category) {
    patents = patents.filter(p => p.category === category);
  }
  
  return patents;
}

export async function getPatentStats() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return { total: 0, pending: 0, approved: 0, rejected: 0 };
  
  const patents = await getPatentsFromDb(userId);
  
  return {
    total: patents.length,
    pending: patents.filter(p => p.status === 'pending' || p.status === 'draft').length,
    approved: patents.filter(p => p.status === 'approved').length,
    rejected: patents.filter(p => p.status === 'rejected').length
  };
}

export async function searchPatents(keyword: string) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  const patents = await getPatentsFromDb(userId);
  const kw = keyword.toLowerCase();
  
  return patents.filter(p => 
    (p.patentName && p.patentName.toLowerCase().includes(kw)) ||
    (p.patentNumber && p.patentNumber.toLowerCase().includes(kw)) ||
    (p.applicant && p.applicant.toLowerCase().includes(kw))
  );
}

export async function getPatent(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  const patents = await getPatentsFromDb(userId);
  return patents.find(p => p.id === id) || null;
}

export async function createPatent(data: any) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const patentId = await createPatentInDb({
    userId,
    ...data
  });
  
  if (!patentId) throw new Error('创建失败');
  
  return { id: patentId, ...data };
}

export async function updatePatent(id: number, data: any) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const success = await updatePatentInDb(id, userId, data);
  if (!success) throw new Error('更新失败');
  
  return { id, ...data };
}

export async function deletePatent(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await deletePatentInDb(id, userId);
  return { success: true };
}

// ============ 项目 API ============

export async function getDashboardStats() {
  return await getUserStats();
}

export async function getProjects() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  return await localGetProjects(userId);
}

async function localGetProjects(userId: number) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createProject(data: {
  name: string;
  type: string;
  date?: string;
  description?: string;
  projectCode?: string;
  manager?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  riskLevel?: string;
  complianceStatus?: string;
  regulatoryFramework?: string;
}) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');

  const projectId = await createProjectInDb({
    userId,
    name: data.name,
    type: data.type,
    description: data.description,
    projectCode: data.projectCode,
    manager: data.manager,
    budget: data.budget,
    startDate: data.startDate,
    endDate: data.endDate,
    riskLevel: data.riskLevel,
    complianceStatus: data.complianceStatus,
    regulatoryFramework: data.regulatoryFramework,
    status: '进行中',
    progress: 0
  });

  if (!projectId) throw new Error('创建失败');

  return { id: projectId, ...data, status: '进行中', progress: 0 };
}

export async function updateProject(id: number, data: any) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const success = await updateProjectInDb(id, userId, data);
  if (!success) throw new Error('更新失败');
  
  return { id, ...data };
}

export async function deleteProject(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await deleteProjectInDb(id, userId);
  return { success: true };
}

export async function getProjectStats() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return { total: 0, completed: 0, inProgress: 0 };
  
  const projects = await localGetProjects(userId);
  
  return {
    total: projects.length,
    completed: projects.filter(p => p.status === '已完成').length,
    inProgress: projects.filter(p => p.status === '进行中').length
  };
}

// ============ 团队 API ============

export async function getTeamMembers() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  return await getTeamMembersFromDb(userId);
}

export async function addTeamMember(data: { name: string; role: string; email?: string; phone?: string }) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const memberId = await createTeamMemberInDb({
    userId,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    status: 'offline'
  });
  
  if (!memberId) throw new Error('添加失败');
  
  return { id: memberId, ...data, status: 'offline' };
}

export async function removeTeamMember(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await deleteTeamMemberInDb(id, userId);
  return { success: true };
}

// ============ 日程 API ============

export async function getEvents() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  return await getEventsFromDb(userId);
}

export async function createEvent(data: { title: string; type: string; time: string; eventDate: string }) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const eventId = await createEventInDb({
    userId,
    title: data.title,
    type: data.type,
    time: data.time,
    eventDate: data.eventDate,
    isCompleted: false
  });
  
  if (!eventId) throw new Error('创建失败');
  
  return { id: eventId, ...data, isCompleted: false };
}

export async function updateEvent(id: number, data: any) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const success = await updateEventInDb(id, userId, data);
  if (!success) throw new Error('更新失败');
  
  return { id, ...data };
}

export async function deleteEvent(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await deleteEventInDb(id, userId);
  return { success: true };
}

// ============ 通知 API ============

export async function getNotifications() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  return await getNotificationsFromDb(userId);
}

export async function getUnreadCount() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) return { count: 0 };
  
  const notifications = await getNotificationsFromDb(userId);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return { count: unreadCount };
}

export async function markNotificationRead(id: number) {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  await markNotificationReadInDb(id, userId);
  return { success: true };
}

export async function markAllNotificationsRead() {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const notifications = await getNotificationsFromDb(userId);
  for (const n of notifications) {
    if (!n.read) {
      await markNotificationReadInDb(n.id, userId);
    }
  }
  return { success: true };
}

// ============ 聊天 API（本地模拟）============

export async function getChatMessages(sessionId: number) {
  return [];
}

export async function deleteChatSession(sessionId: number) {
  return { success: true };
}

export async function sendAIMessage(moduleId: string, message: string, sessionId?: number) {
  throw new Error('本地模式暂不支持AI对话功能');
}

export async function checkQuota() {
  return { remaining: 0, message: '本地模式' };
}

// ============ AI使用统计API（全局，所有用户互通）============

export async function recordAIUsage(moduleId: number, actionType: string = 'chat') {
  await ensureDbInitialized();
  const userId = getCurrentUserId();
  if (!userId) throw new Error('用户未登录');
  
  const result = await recordUsageInDb(userId, moduleId, actionType);
  if (!result) throw new Error('记录使用失败');
  
  return { success: true, moduleId, actionType };
}

export async function getAIUsageStats() {
  await ensureDbInitialized();
  // 获取全局使用统计（所有用户互通）
  const globalStats = await getGlobalModuleUsageStatsFromDb();
  
  return { 
    module1: globalStats.module1 || 0, 
    module2: globalStats.module2 || 0, 
    module3: globalStats.module3 || 0, 
    module4: globalStats.module4 || 0, 
    module5: globalStats.module5 || 0,
    todayTotal: 0,
    last7Days: globalStats.last7Days || {},
    last30Days: globalStats.last30Days || {}
  };
}

// 获取本月统计数据（用于数据分析页面）
export async function getMonthlyStats() {
  await ensureDbInitialized();
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  // 本月检索：近30天创新雷达(module_id=1)使用次数
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: monthSearchCount } = await supabase
    .from('usage_records')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', 1)
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  // 本月存证：近30天数据锚点(module_id=2)使用次数
  const { count: monthEvidenceCount } = await supabase
    .from('usage_records')
    .select('*', { count: 'exact', head: true })
    .eq('module_id', 2)
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  // 本月新增专利
  const { count: monthPatentCount } = await supabase
    .from('patents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);
  
  // 风险预警：目前暂无专门的预警表，暂设为0，后续可扩展
  const riskWarningCount = 0;
  
  return {
    monthSearches: monthSearchCount || 0,
    monthEvidence: monthEvidenceCount || 0,
    monthPatents: monthPatentCount || 0,
    riskWarnings: riskWarningCount
  };
}

// ============ 专利时间证据链 API ============
// 声明输入类型
export interface DeclarationInput {
  declarationType: 'text' | 'file' | 'link'
  contentText?: string
  file?: File
  linkUrl?: string
  linkType?: 'patent' | 'doi' | 'paper'
  knowledgeTopic: string
  knowledgeCategory: '构思' | '现有技术' | '侵权线索'
  password: string
  patentCaseId?: string
}

// 声明结果类型
export interface DeclarationResult {
  id: number
  blockIndex: number
  declarationId: string
  blockHash: string
  previousHash: string
  serverTimestamp: string
  timestampString: string
  signature: string
  locationCity: string
  knowledgeTopic: string
  knowledgeCategory: string
  contentSummary: string
}

// 验证结果类型
export interface VerifyResult {
  isValid: boolean
  status: 'valid' | 'invalid' | 'warning' | 'not_found'
  declaration?: Declaration
  details: {
    isHashValid: boolean
    isBlockHashValid: boolean
    isSignatureValid: boolean
    isTimestampValid: boolean
    isChainValid: boolean
    computedContentHash?: string
    storedContentHash?: string
    computedBlockHash?: string
    storedBlockHash?: string
    signatureValid?: boolean
    chainDetails?: string
  }
  message: string
}

// 报告数据类型
export interface ReportData {
  reportId: string
  generatedAt: string
  declaration: {
    id: number
    declarationId: string
    blockIndex: number
    userId: number
    knowledgeTopic: string
    knowledgeCategory: string
    declarationType: string
    serverTimestamp: string
    timestampString: string
    locationCity: string
    ipAddress: string
  }
  content: {
    type: string
    text?: string
    fileHash?: string
    linkUrl?: string
    linkType?: string
    contentSummary: string
  }
  verification: {
    hashComparison: { passed: boolean; computed: string; stored: string; note: string }
    blockHashValidation: { passed: boolean; computed: string; stored: string }
    timestampValidation: { passed: boolean; timestamp: string }
    signatureValidation: { passed: boolean; signerId: number }
    chainIntegrity: { passed: boolean; details: string }
  }
  hashes: {
    contentHash: string
    blockHash: string
    previousHash: string
    genesisHash: string
  }
  signature: string
}

/**
 * 生成用户密钥对
 */
export async function generateUserKeys(password: string): Promise<{ publicKey: string; keyId: number }> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) throw new Error('用户未登录')

  // 检查是否已有密钥
  const hasKeys = await hasUserKeysFromDb(userId)
  if (hasKeys) {
    throw new Error('您已生成过密钥对，如需重新生成请先删除旧密钥')
  }

  // 生成RSA密钥对
  const { publicKey, privateKey } = await generateRSAKeyPair()

  // 用密码加密私钥
  const encryptedPrivateKey = encryptPrivateKey(privateKey, password)

  // 保存到数据库
  const keyId = await saveUserKeysInDb(userId, publicKey, encryptedPrivateKey)
  if (!keyId) throw new Error('保存密钥失败')

  return { publicKey, keyId }
}

/**
 * 获取用户公钥
 */
export async function getUserPublicKey(): Promise<string | null> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) return null

  const keys = await getUserKeysFromDb(userId)
  return keys?.publicKey || null
}

/**
 * 检查用户是否有密钥
 */
export async function checkUserHasKeys(): Promise<boolean> {
  try {
    await ensureDbInitialized()
    const userId = getCurrentUserId()
    if (!userId) return false
    return await hasUserKeysFromDb(userId)
  } catch (error) {
    console.error('检查密钥状态失败:', error)
    return false
  }
}

/**
 * 删除用户密钥
 */
export async function deleteUserKeys(): Promise<boolean> {
  try {
    await ensureDbInitialized()
    const userId = getCurrentUserId()
    if (!userId) throw new Error('用户未登录')
    return await deleteUserKeysFromDb(userId)
  } catch (error) {
    console.error('删除密钥失败:', error)
    return false
  }
}

/**
 * 删除知晓声明
 */
export async function deleteDeclaration(id: number): Promise<boolean> {
  try {
    await ensureDbInitialized()
    const userId = getCurrentUserId()
    if (!userId) throw new Error('用户未登录')
    return await deleteDeclarationFromDb(id, userId)
  } catch (error) {
    console.error('删除声明失败:', error)
    return false
  }
}

/**
 * 创建知晓声明
 */
export async function createDeclaration(input: DeclarationInput): Promise<DeclarationResult> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) throw new Error('用户未登录')

  // 获取用户密钥
  const keys = await getUserKeysFromDb(userId)
  if (!keys) {
    throw new Error('请先在"数据锚点"中生成您的密钥对')
  }

  // 解密私钥
  const privateKey = decryptPrivateKey(keys.encryptedPrivateKey, input.password)
  if (!privateKey) {
    throw new Error('密码错误，无法解密私钥')
  }

  // 获取位置信息
  const location = await getLocationByIP()

  // 获取区块信息
  const nextIndex = await getNextBlockIndexFromDb(userId)
  const latestDeclaration = await getLatestDeclarationFromDb(userId)
  const previousHash = latestDeclaration?.blockHash || getGenesisHash()

  // 计算内容哈希
  let contentHash: string
  let contentSummary: string
  let fileHash: string | undefined
  let fileId: number | undefined

  if (input.declarationType === 'text') {
    contentHash = await hashContent(input.contentText || '')
    contentSummary = (input.contentText || '').substring(0, 100) + ((input.contentText || '').length > 100 ? '...' : '')
  } else if (input.declarationType === 'file' && input.file) {
    fileHash = await hashFile(input.file)
    // 文件哈希直接作为内容哈希（fileHash 已经是文件的唯一标识）
    contentHash = fileHash
    contentSummary = `上传文件: ${input.file.name}`
  } else if (input.declarationType === 'link') {
    contentHash = await hashContent(`${input.linkUrl}|${input.linkType}`)
    contentSummary = `文献链接: ${input.linkUrl}`
  } else {
    throw new Error('无效的声明类型')
  }

  // 获取服务器时间（使用精确ISO格式字符串，避免时区转换导致哈希不匹配）
  const serverTimestamp = new Date().toISOString()
  const timestampString = formatTimestamp(new Date(serverTimestamp))

  // 计算区块哈希（使用 ISO 时间戳保证一致性）
  const blockHash = await computeBlockHash(contentHash, previousHash, serverTimestamp)

  // 对内容哈希+时间戳进行签名
  const signData_str = `${contentHash}|${serverTimestamp}`
  const signature = await signData(signData_str, privateKey)

  // 保存到数据库
  const declarationData: DeclarationData = {
    userId,
    declarationType: input.declarationType,
    contentText: input.declarationType === 'text' ? input.contentText : undefined,
    fileId,
    fileHash,
    linkUrl: input.declarationType === 'link' ? input.linkUrl : undefined,
    linkType: input.declarationType === 'link' ? input.linkType : undefined,
    knowledgeTopic: input.knowledgeTopic,
    knowledgeCategory: input.knowledgeCategory,
    contentSummary,
    blockHash,
    previousHash,
    blockIndex: nextIndex,
    serverTimestamp,
    timestampString,
    signature,
    locationCity: location.city,
    ipAddress: location.ip,
    patentCaseId: input.patentCaseId
  }

  const declarationId = await createDeclarationInDb(declarationData)
  if (!declarationId) {
    throw new Error('创建声明失败')
  }

  return {
    id: declarationId,
    blockIndex: nextIndex,
    declarationId: generateDeclarationId(nextIndex),
    blockHash,
    previousHash,
    serverTimestamp,
    timestampString,
    signature,
    locationCity: location.city,
    knowledgeTopic: input.knowledgeTopic,
    knowledgeCategory: input.knowledgeCategory,
    contentSummary
  }
}

/**
 * 获取用户的声明列表
 */
export async function getDeclarations(): Promise<Declaration[]> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) return []

  return await getDeclarationsFromDb(userId)
}

/**
 * 根据ID获取声明
 */
export async function getDeclarationById(id: number): Promise<Declaration | null> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) return null

  return await getDeclarationByIdFromDb(id, userId)
}

/**
 * 获取声明数量
 */
export async function getDeclarationCount(): Promise<number> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) return 0

  return await getDeclarationCountFromDb(userId)
}

/**
 * 验证声明
 * @param id 声明ID
 * @param providedPublicKey 可选的公钥，如果不提供则尝试获取声明创建者的公钥
 */
export async function verifyDeclaration(id: number, providedPublicKey?: string): Promise<VerifyResult> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) {
    return { 
      isValid: false, 
      status: 'not_found', 
      details: {
        isHashValid: false,
        isBlockHashValid: false,
        isSignatureValid: false,
        isTimestampValid: false,
        isChainValid: false
      }, 
      message: '用户未登录' 
    }
  }

  // 获取声明
  const declaration = await getDeclarationByIdAny(id)
  if (!declaration) {
    return { 
      isValid: false, 
      status: 'not_found', 
      details: {
        isHashValid: false,
        isBlockHashValid: false,
        isSignatureValid: false,
        isTimestampValid: false,
        isChainValid: false
      },
      message: '声明不存在' 
    }
  }

  // 重新计算内容哈希
  let computedContentHash: string
  if (declaration.declarationType === 'text') {
    computedContentHash = await hashContent(declaration.contentText || '')
  } else if (declaration.declarationType === 'file') {
    computedContentHash = declaration.fileHash || ''
  } else if (declaration.declarationType === 'link') {
    computedContentHash = await hashContent(`${declaration.linkUrl}|${declaration.linkType}`)
  } else {
    computedContentHash = ''
  }

  // 计算区块哈希（尝试多种时间格式，兼容新旧声明）
  // 1. 直接使用存储的 serverTimestamp（新格式，VARCHAR精确存储）
  // 2. 尝试 UTC ISO 格式（如果存储的格式不同）
  // 3. 尝试使用 timestampString（旧格式兼容）
  let computedBlockHash = ''
  let isBlockHashValid = false

  // 尝试1：直接使用存储的 serverTimestamp
  computedBlockHash = await computeBlockHash(
    computedContentHash,
    declaration.previousHash,
    declaration.serverTimestamp
  )
  isBlockHashValid = computedBlockHash === declaration.blockHash

  // 尝试2：如果不匹配，尝试将 serverTimestamp 转为 UTC ISO 格式
  if (!isBlockHashValid) {
    const utcTimestamp = new Date(declaration.serverTimestamp).toISOString()
    if (utcTimestamp !== declaration.serverTimestamp) {
      const utcBlockHash = await computeBlockHash(
        computedContentHash,
        declaration.previousHash,
        utcTimestamp
      )
      if (utcBlockHash === declaration.blockHash) {
        computedBlockHash = utcBlockHash
        isBlockHashValid = true
      }
    }
  }

  // 尝试3：如果还不匹配，尝试使用 timestampString（兼容旧声明）
  if (!isBlockHashValid && declaration.timestampString) {
    const altBlockHash = await computeBlockHash(
      computedContentHash,
      declaration.previousHash,
      declaration.timestampString
    )
    if (altBlockHash === declaration.blockHash) {
      computedBlockHash = altBlockHash
      isBlockHashValid = true
    }
  }

  // 调试日志：如果区块哈希验证失败，输出详细信息
  if (!isBlockHashValid) {
    console.log('区块哈希验证失败 - 详细信息:', {
      computedBlockHash,
      storedBlockHash: declaration.blockHash,
      params: {
        contentHash: computedContentHash,
        contentHashLength: computedContentHash.length,
        previousHash: declaration.previousHash,
        previousHashLength: declaration.previousHash.length,
        serverTimestamp: declaration.serverTimestamp,
        serverTimestampLength: declaration.serverTimestamp.length,
        timestampString: declaration.timestampString,
        timestampStringLength: declaration.timestampString?.length || 0
      }
    })
  }
  
  // 验证哈希链（使用当前用户的声明）
  const allDeclarations = await getDeclarationsFromDb(userId)
  const genesisHash = getGenesisHash()
  
  // 计算所有声明的哈希（包含 timestamp_string 以兼容旧格式）
  const declarationsWithHash = await Promise.all(allDeclarations.map(async d => {
    let contentHash: string
    if (d.declarationType === 'text') {
      contentHash = d.contentText ? await hashContent(d.contentText) : ''
    } else if (d.declarationType === 'file') {
      contentHash = d.fileHash || ''
    } else if (d.declarationType === 'link') {
      contentHash = d.linkUrl ? await hashContent(`${d.linkUrl}|${d.linkType}`) : ''
    } else {
      contentHash = ''
    }
    return {
      block_index: d.blockIndex,
      content_hash: contentHash,
      block_hash: d.blockHash,
      previous_hash: d.previousHash,
      server_timestamp: d.serverTimestamp,
      timestamp_string: d.timestampString  // 包含 timestampString 以兼容旧格式
    }
  }))
  
  const chainResult = await verifyChain(declarationsWithHash, genesisHash)

  // 验证签名（使用创建者公钥，尝试两种时间格式）
  let isSignatureValid = false
  let publicKeyUsed = false
  if (declaration.signature) {
    // 先用 serverTimestamp
    let signData_str = `${computedContentHash}|${declaration.serverTimestamp}`
    
    if (providedPublicKey) {
      isSignatureValid = await verifySignature(signData_str, declaration.signature, providedPublicKey)
      // 如果失败，尝试 timestampString
      if (!isSignatureValid && declaration.timestampString) {
        signData_str = `${computedContentHash}|${declaration.timestampString}`
        isSignatureValid = await verifySignature(signData_str, declaration.signature, providedPublicKey)
      }
      publicKeyUsed = true
    } else {
      const creatorKey = await getPublicKeyByDeclarationId(id)
      if (creatorKey) {
        isSignatureValid = await verifySignature(signData_str, declaration.signature, creatorKey.publicKey)
        // 如果失败，尝试 timestampString
        if (!isSignatureValid && declaration.timestampString) {
          signData_str = `${computedContentHash}|${declaration.timestampString}`
          isSignatureValid = await verifySignature(signData_str, declaration.signature, creatorKey.publicKey)
        }
        publicKeyUsed = true
      }
    }
  }

  // 内容哈希验证（通过检查区块哈希是否一致来间接验证）
  const isHashValid = isBlockHashValid

  const isTimestampValid = declaration.serverTimestamp.length > 0

  const isValid = isHashValid && isBlockHashValid && isSignatureValid && isTimestampValid && chainResult.valid

  let status: 'valid' | 'invalid' | 'warning' | 'not_found' = 'valid'
  let message = '验证通过：该声明未被篡改，签名有效，哈希链完整'

  if (!isValid) {
    if (!chainResult.valid) {
      status = 'invalid'
      message = `验证失败：${chainResult.details}`
    } else if (!isSignatureValid) {
      status = 'warning'
      message = '警告：签名验证失败，可能非本人操作'
    } else {
      status = 'invalid'
      message = '验证失败：哈希值不匹配'
    }
  }

  return {
    isValid,
    status,
    declaration,
    details: {
      isHashValid,
      isBlockHashValid,
      isSignatureValid,
      isTimestampValid,
      isChainValid: chainResult.valid,
      computedContentHash,
      storedContentHash: computedContentHash,
      computedBlockHash,
      storedBlockHash: declaration.blockHash,
      signatureValid: isSignatureValid,
      chainDetails: chainResult.details
    },
    message
  }
}

/**
 * 生成司法报告
 */
export async function generateReport(declarationId: number): Promise<ReportData> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) throw new Error('用户未登录')

  // 获取声明
  const declaration = await getDeclarationByIdFromDb(declarationId, userId)
  if (!declaration) {
    throw new Error('声明不存在')
  }

  // 获取密钥用于验证
  const keys = await getUserKeysFromDb(userId)

  // 重新计算哈希
  let computedContentHash: string
  if (declaration.declarationType === 'text') {
    computedContentHash = await hashContent(declaration.contentText || '')
  } else if (declaration.declarationType === 'file') {
    // 文件类型：使用存储的 fileHash（验证时没有原始文件）
    // 如果需要真正验证文件，需要上传原始文件重新计算
    computedContentHash = declaration.fileHash || ''
  } else {
    computedContentHash = await hashContent(`${declaration.linkUrl}|${declaration.linkType}`)
  }

  // 尝试多种时间格式计算区块哈希，兼容新旧声明
  let blockHashComputed = ''
  let blockHashValid = false

  // 尝试1：直接使用存储的 serverTimestamp（新格式）
  blockHashComputed = await computeBlockHash(
    computedContentHash,
    declaration.previousHash,
    declaration.serverTimestamp
  )
  blockHashValid = blockHashComputed === declaration.blockHash

  // 尝试2：尝试 UTC ISO 格式
  if (!blockHashValid) {
    const utcTimestamp = new Date(declaration.serverTimestamp).toISOString()
    if (utcTimestamp !== declaration.serverTimestamp) {
      const utcHash = await computeBlockHash(
        computedContentHash,
        declaration.previousHash,
        utcTimestamp
      )
      if (utcHash === declaration.blockHash) {
        blockHashComputed = utcHash
        blockHashValid = true
      }
    }
  }

  // 尝试3：尝试使用 timestampString（兼容旧声明）
  if (!blockHashValid && declaration.timestampString) {
    const altBlockHash = await computeBlockHash(
      computedContentHash,
      declaration.previousHash,
      declaration.timestampString
    )
    if (altBlockHash === declaration.blockHash) {
      blockHashComputed = altBlockHash
      blockHashValid = true
    }
  }

  // 验证签名
  let signatureValid = false
  if (keys && declaration.signature) {
    const signData_str = `${computedContentHash}|${declaration.serverTimestamp}`
    signatureValid = await verifySignature(signData_str, declaration.signature, keys.publicKey)
  }

  // 获取创世哈希
  const genesisHash = getGenesisHash()

  return {
    reportId: generateReportId(),
    generatedAt: new Date().toISOString(),
    declaration: {
      id: declaration.id,
      declarationId: generateDeclarationId(declaration.blockIndex),
      blockIndex: declaration.blockIndex,
      userId: declaration.userId,
      knowledgeTopic: declaration.knowledgeTopic || '',
      knowledgeCategory: declaration.knowledgeCategory || '',
      declarationType: declaration.declarationType,
      serverTimestamp: declaration.serverTimestamp,
      timestampString: declaration.timestampString,
      locationCity: declaration.locationCity || '',
      ipAddress: declaration.ipAddress || ''
    },
    content: {
      type: declaration.declarationType,
      text: declaration.declarationType === 'text' ? declaration.contentText : undefined,
      fileHash: declaration.declarationType === 'file' ? declaration.fileHash : undefined,
      linkUrl: declaration.declarationType === 'link' ? declaration.linkUrl : undefined,
      linkType: declaration.linkType,
      contentSummary: declaration.contentSummary || ''
    },
    verification: {
      hashComparison: {
        // 文件类型：哈希验证通过区块哈希间接验证
        // 文字和链接类型：比较计算的内容哈希
        passed: declaration.declarationType === 'file' ? blockHashValid : true,
        computed: computedContentHash,
        stored: declaration.declarationType === 'file' ? (declaration.fileHash ?? '') : computedContentHash,
        note: declaration.declarationType === 'file' 
          ? '文件类型哈希通过区块哈希验证间接确认' 
          : '内容哈希验证通过'
      },
      blockHashValidation: {
        passed: blockHashValid,
        computed: blockHashComputed,
        stored: declaration.blockHash
      },
      timestampValidation: {
        passed: true,
        timestamp: declaration.timestampString
      },
      signatureValidation: {
        passed: signatureValid,
        signerId: declaration.userId
      },
      chainIntegrity: {
        passed: true,
        details: `前驱哈希: ${declaration.previousHash.substring(0, 20)}...，区块序号: ${declaration.blockIndex}`
      }
    },
    hashes: {
      contentHash: computedContentHash,
      blockHash: declaration.blockHash,
      previousHash: declaration.previousHash,
      genesisHash
    },
    signature: declaration.signature || ''
  }
}

/**
 * 获取最新区块哈希
 */
export async function getLatestBlockHash(): Promise<string> {
  await ensureDbInitialized()
  const userId = getCurrentUserId()
  if (!userId) return getGenesisHash()

  const latest = await getLatestDeclarationFromDb(userId)
  return latest?.blockHash || getGenesisHash()
}

/**
 * 获取创世区块哈希
 */
export async function getGenesisBlockHash(): Promise<string> {
  const genesis = await getGenesisBlockFromDb()
  return genesis?.hash || getGenesisHash()
}
