import { supabase } from '../lib/supabase';

export interface Project {
  id: number;
  userId: number;
  name: string;
  type?: string;
  status: string;
  progress: number;
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
  reviewStatus?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  attachments?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patent {
  id: number;
  userId: number;
  patentName?: string;
  patentNumber?: string;
  applicant?: string;
  inventor?: string;
  applyDate?: string;
  publishDate?: string;
  patentType?: string;
  abstract?: string;
  claims?: string;
  status: string;
  category?: string;
  tags?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: number;
  userId: number;
  originalName: string;
  storedName?: string;
  mimeType?: string;
  size: number;
  path?: string;
  url?: string;
  hash?: string;
  status: string;
  module?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  type?: string;
  time?: string;
  eventDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content?: string;
  read: boolean;
  icon?: string;
  type?: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 字段名转换：snake_case 到 camelCase
const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  });
  return result;
};

// 字段名转换：camelCase 到 snake_case
const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  });
  return result;
};

// ============ Projects CRUD ============

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const projectData = toSnakeCase({
      ...project,
      createdAt: now,
      updatedAt: now
    });

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create project error:', error);
    return null;
  }
};

export const getProjects = async (userId: number): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => toCamelCase(row)) as Project[];
  } catch (error) {
    console.error('Get projects error:', error);
    return [];
  }
};

export const getProjectById = async (id: number, userId: number): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    return toCamelCase(data[0]) as Project;
  } catch (error) {
    console.error('Get project error:', error);
    return null;
  }
};

export const updateProject = async (id: number, userId: number, updates: Partial<Project>): Promise<boolean> => {
  try {
    const updateData = toSnakeCase(updates);
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update project error:', error);
    return false;
  }
};

export const deleteProject = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete project error:', error);
    return false;
  }
};

// ============ Patents CRUD ============

export const createPatent = async (patent: Omit<Patent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const patentData = toSnakeCase({
      ...patent,
      createdAt: now,
      updatedAt: now
    });

    const { data, error } = await supabase
      .from('patents')
      .insert(patentData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create patent error:', error);
    return null;
  }
};

export const getPatents = async (userId: number): Promise<Patent[]> => {
  try {
    const { data, error } = await supabase
      .from('patents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => toCamelCase(row)) as Patent[];
  } catch (error) {
    console.error('Get patents error:', error);
    return [];
  }
};

export const updatePatent = async (id: number, userId: number, updates: Partial<Patent>): Promise<boolean> => {
  try {
    const updateData = toSnakeCase(updates);
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('patents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update patent error:', error);
    return false;
  }
};

export const deletePatent = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete patent error:', error);
    return false;
  }
};

// ============ Files CRUD ============

export const createFile = async (file: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const fileData = toSnakeCase({
      ...file,
      createdAt: now,
      updatedAt: now
    });

    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create file error:', error);
    return null;
  }
};

export const getFiles = async (userId: number): Promise<FileRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => toCamelCase(row)) as FileRecord[];
  } catch (error) {
    console.error('Get files error:', error);
    return [];
  }
};

export const updateFile = async (id: number, userId: number, updates: Partial<FileRecord>): Promise<boolean> => {
  try {
    const updateData = toSnakeCase(updates);
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('files')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update file error:', error);
    return false;
  }
};

export const deleteFile = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
};

// ============ Events CRUD ============

export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const eventData = toSnakeCase({
      ...event,
      createdAt: now,
      updatedAt: now
    });

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create event error:', error);
    return null;
  }
};

export const getEvents = async (userId: number): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...toCamelCase(row),
      isCompleted: Boolean(row.is_completed)
    })) as CalendarEvent[];
  } catch (error) {
    console.error('Get events error:', error);
    return [];
  }
};

export const updateEvent = async (id: number, userId: number, updates: Partial<CalendarEvent>): Promise<boolean> => {
  try {
    const updateData = toSnakeCase(updates);
    if (updates.isCompleted !== undefined) {
      updateData.is_completed = updates.isCompleted ? 1 : 0;
    }
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Update event error:', error);
    return false;
  }
};

export const deleteEvent = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete event error:', error);
    return false;
  }
};

// ============ Notifications CRUD ============

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const notificationData = toSnakeCase({
      ...notification,
      createdAt: now
    });

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

export const getNotifications = async (userId: number): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...toCamelCase(row),
      read: Boolean(row.read)
    })) as Notification[];
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

export const markNotificationRead = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Mark notification read error:', error);
    return false;
  }
};

export const deleteNotification = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    return false;
  }
};

// ============ Team Members CRUD ============

export const createTeamMember = async (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    const memberData = toSnakeCase({
      ...member,
      createdAt: now,
      updatedAt: now
    });

    const { data, error } = await supabase
      .from('team_members')
      .insert(memberData)
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create team member error:', error);
    return null;
  }
};

export const getTeamMembers = async (userId: number): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => toCamelCase(row)) as TeamMember[];
  } catch (error) {
    console.error('Get team members error:', error);
    return [];
  }
};

export const deleteTeamMember = async (id: number, userId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete team member error:', error);
    return false;
  }
};

// ============ Statistics ============

export const getUserStats = async (userId: number) => {
  try {
    const [
      { count: projectCount },
      { count: patentCount },
      { count: fileCount },
      { count: teamMemberCount },
      { count: eventCount }
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('patents').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('files').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    return {
      projects: projectCount || 0,
      patents: patentCount || 0,
      files: fileCount || 0,
      teamMembers: teamMemberCount || 0,
      events: eventCount || 0,
      searches: 0,
      alerts: 0
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return {
      projects: 0,
      patents: 0,
      files: 0,
      teamMembers: 0,
      events: 0,
      searches: 0,
      alerts: 0
    };
  }
};

// ============ AI使用统计（全局，所有用户互通）============

export const recordUsage = async (
  userId: number,
  moduleId: number,
  actionType: string
): Promise<number | null> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('usage_records')
      .insert({
        user_id: userId,
        module_id: moduleId,
        action_type: actionType,
        created_at: now
      })
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Record usage error:', error);
    return null;
  }
};

// 获取全局使用统计（所有用户的使用次数总和，用于实时运营指标）
export const getGlobalModuleUsageStats = async () => {
  try {
    // 获取每个模块的总使用次数
    const { data: stats, error } = await supabase
      .from('usage_records')
      .select('module_id')
      .order('module_id');

    if (error) throw error;

    // 统计每个模块的使用次数
    const result: Record<number, number> = {};
    (stats || []).forEach((row: any) => {
      const moduleId = row.module_id;
      result[moduleId] = (result[moduleId] || 0) + 1;
    });

    // 近7天统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: last7DaysData } = await supabase
      .from('usage_records')
      .select('module_id')
      .gte('created_at', sevenDaysAgo.toISOString());

    const last7Days: Record<number, number> = {};
    (last7DaysData || []).forEach((row: any) => {
      const moduleId = row.module_id;
      last7Days[moduleId] = (last7Days[moduleId] || 0) + 1;
    });

    // 近30天统计
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: last30DaysData } = await supabase
      .from('usage_records')
      .select('module_id')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const last30Days: Record<number, number> = {};
    (last30DaysData || []).forEach((row: any) => {
      const moduleId = row.module_id;
      last30Days[moduleId] = (last30Days[moduleId] || 0) + 1;
    });

    return {
      module1: result[1] || 0,
      module2: result[2] || 0,
      module3: result[3] || 0,
      module4: result[4] || 0,
      module5: result[5] || 0,
      last7Days: last7Days,
      last30Days: last30Days
    };
  } catch (error) {
    console.error('Get global module usage stats error:', error);
    return { 
      module1: 0, module2: 0, module3: 0, module4: 0, module5: 0,
      last7Days: {}, last30Days: {}
    };
  }
};

// 获取用户个人使用统计
export const getModuleUsageStats = async (userId: number) => {
  try {
    const { data: stats, error } = await supabase
      .from('usage_records')
      .select('module_id')
      .eq('user_id', userId)
      .order('module_id');

    if (error) throw error;

    const result: Record<number, number> = {};
    (stats || []).forEach((row: any) => {
      const moduleId = row.module_id;
      result[moduleId] = (result[moduleId] || 0) + 1;
    });

    return {
      module1: result[1] || 0,
      module2: result[2] || 0,
      module3: result[3] || 0,
      module4: result[4] || 0,
      module5: result[5] || 0
    };
  } catch (error) {
    console.error('Get module usage stats error:', error);
    return { module1: 0, module2: 0, module3: 0, module4: 0, module5: 0 };
  }
};

export const getTodayUsage = async (userId: number) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today);

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error('Get today usage error:', error);
    return 0;
  }
};

// 获取近7天和近30天的全局使用统计
export const getGlobalUsageStats = async () => {
  try {
    // 近7天总使用次数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: last7DaysCount } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // 近30天总使用次数
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: last30DaysCount } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      last7Days: last7DaysCount || 0,
      last30Days: last30DaysCount || 0
    };
  } catch (error) {
    console.error('Get global usage stats error:', error);
    return { last7Days: 0, last30Days: 0 };
  }
};
