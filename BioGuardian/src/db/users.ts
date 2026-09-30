import CryptoJS from 'crypto-js';
import { supabase } from '../lib/supabase';

const PASSWORD_KEY = 'bioguardian_secret_key_2024';

export interface User {
  id: number;
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, PASSWORD_KEY).toString();
};

const decryptPassword = (encryptedPassword: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, PASSWORD_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
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

// 字段名转换：snake_case 到 camelCase
const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  });
  return result;
};

export const registerUser = async (
  username: string,
  password: string,
  phone?: string,
  email?: string
): Promise<{ success: boolean; message: string; userId?: number }> => {
  try {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
    }

    if (!phone || phone.length !== 11) {
      return { success: false, message: '请填写11位手机号码' };
    }

    if (password.length < 6) {
      return { success: false, message: '密码长度至少6位' };
    }

    // 检查用户名是否已存在
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, message: '用户名已存在' };
    }

    // 检查手机号是否已存在
    const { data: existingByPhone, error: phoneCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .limit(1);

    if (phoneCheckError) throw phoneCheckError;

    if (existingByPhone && existingByPhone.length > 0) {
      return { success: false, message: '该手机号已注册' };
    }

    const encryptedPassword = encryptPassword(password);
    const now = new Date().toISOString();

    // 插入新用户
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password: encryptedPassword,
        phone: phone || null,
        email: email || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      message: '注册成功', 
      userId: data?.id 
    };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: '注册失败，请重试' };
  }
};

export const loginUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    if (!username || !password) {
      return { success: false, message: '用户名和密码不能为空' };
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const userData = toCamelCase(users[0]);
    const user = userData as User;
    const decryptedPassword = decryptPassword(user.password || '');

    if (decryptedPassword !== password) {
      return { success: false, message: '密码错误' };
    }

    const { password: _, ...userWithoutPassword } = user;
    return { 
      success: true, 
      message: '登录成功', 
      user: userWithoutPassword 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: '登录失败，请重试' };
  }
};

export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return null;
    }

    const userData = toCamelCase(users[0]);
    const user = userData as User;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const updateUser = async (
  userId: number,
  updates: Partial<User>
): Promise<boolean> => {
  try {
    const allowedFields: (keyof User)[] = ['phone', 'email', 'company', 'position', 'bio'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Update user error:', error);
    return false;
  }
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = users[0];
    const decryptedPassword = decryptPassword(user.password);

    if (decryptedPassword !== oldPassword) {
      return { success: false, message: '原密码错误' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度至少6位' };
    }

    const encryptedPassword = encryptPassword(newPassword);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: encryptedPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, message: '密码修改成功' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: '密码修改失败' };
  }
};

export const resetPasswordByPhone = async (
  username: string,
  phone: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!username || !phone || !newPassword) {
      return { success: false, message: '请填写用户名、手机号和新密码' };
    }
    if (phone.length !== 11) {
      return { success: false, message: '请填写11位手机号码' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度至少6位' };
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .eq('phone', phone)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, message: '用户名与手机号不匹配，请核对后重试' };
    }

    const encryptedPassword = encryptPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: encryptedPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', users[0].id);

    if (updateError) throw updateError;

    return { success: true, message: '密码已重置，请使用新密码登录' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: '找回密码失败，请重试' };
  }
};

/**
 * 通过手机号找回密钥（清除旧密钥，重新生成）
 * 注意：此操作会删除旧密钥，用户需要重新生成新的密钥对
 */
export const resetKeysByPhone = async (
  username: string,
  phone: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!username || !phone) {
      return { success: false, message: '请填写用户名和手机号' };
    }
    if (phone.length !== 11) {
      return { success: false, message: '请填写11位手机号码' };
    }

    // 验证用户名和手机号是否匹配
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, phone')
      .eq('username', username)
      .eq('phone', phone)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, message: '用户名与手机号不匹配，请核对后重试' };
    }

    const userId = users[0].id;

    // 删除旧密钥
    const { error: deleteError } = await supabase
      .from('user_keys')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('删除旧密钥失败:', deleteError);
      // 继续执行，不阻止操作
    }

    console.log(`用户 ${username} 的密钥已成功清除`);
    return { success: true, message: '密钥已清除，请重新登录并生成新密钥' };
  } catch (error) {
    console.error('密钥找回失败:', error);
    return { success: false, message: '密钥找回失败，请稍后重试' };
  }
};
