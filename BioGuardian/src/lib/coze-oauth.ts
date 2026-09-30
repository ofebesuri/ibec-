/**
 * Coze OAuth 认证模块
 * 使用 RSA 私钥在前端生成 JWT，换取 Coze Access Token
 * 实现用户会话隔离
 */
import {KJUR} from 'jsrsasign';

// Coze OAuth 配置接口
export interface CozeOAuthConfig {
  botId: string          // Bot ID
  appId: string          // OAuth App ID (即 OAuth ID)
  keyId: string          // 公钥指纹 (Key ID)
  privateKey: string     // RSA 私钥 (PEM 格式)
  name: string           // Bot 名称
  color: string          // 主题色
}

// Coze Bot OAuth 配置 (从扣子配置获取)
export const COZE_BOTS_CONFIG: Record<number, CozeOAuthConfig | null> = {
  // 创新雷达
  1: {
    botId: '7606000324104683574',
    appId: '1196329124805',
    keyId: 'IV1mh7g1TEbuQhtyc_Q8JpCCtC4LJvfMFwhTQBm1HQU',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDcO50Emtwhcd7x
TpB72WdVnWaaUWW5Y1SI6TAV1nRHOheqGDvy+mcFFniwYHCu4lhKuIcTzQDjXxw2
UHGf9TC7de3ajYaj6QCJ7vonyFQN75uiHl17RsjXyI/Rm4dGIyoWG9gpKjeBHboL
Mr/qKlqtz9F0fa6hnwwk3paSYyWt1ntJpZlH4VmtVbpu9L0WIm05NzC5VSSOwUZl
JWHQ57LdK/B2f32Gwn5zl6rYB5r47QRbIFX8xFze7y9ydC/fEFyfdpvwGseZrFex
F/LD4In2LzienB5Zv481M/3nU3Tnpt0HBC98T2gkbsW/wyj4i7t/S5bHGJXHVXmM
0XFYhuUdAgMBAAECggEAOzRDZ8OBvfPwrQojyUeOgfOIa5/KKuZLCWs2pAg8xhEV
34IYS5+JJlL+KtwiLsFmXt/wYCBSRs2AthE2Gnw9l4eCY6h8M4Alxu7ZjOxLvFtX
iWOEWemTgH7IOt8GpJI7dCoUGCzjMvCc3PnNodO1ANjHQ/utgIFTMG4uKDhDHtH0
M4LIPaAn3eW3sK+0zLFIGoypyboSC+yNf9+vZBtvmhJ8SrpOAoXYdW7QxBXME37I
cBLmOdkVrLCnvpXxHmBFw5Ns4RosEMPuNdLuBWzDJgoQ0AEFukgKlTJogknYFsMh
uTruNl/xwv/iaOynzZw67tsYaqd+FUnSXYxgu/RquQKBgQDvkuDyOguhBlmEwkeW
3fIJT56H19m37flY+BlEoFR/Lbdzc6TekupxhyQc09qwx66oC5gxvC+tjA6+u96H
Yyv9tiYsVG5pfwHcPdTQR6RLqs7Wy9qt5YDaFj+l9oYRhzFtQx/tC8qQ+I/sh58F
BVP4R9A3AH4d09WPNc81UL+NkwKBgQDrVUDr+zNsBGTV/8zVXY9++I071mlwUaN+
O05xPNsafxiP/+GOSdaN2Xwnas+2lwhOyOak7KIPWF1PVTvzV0ioq77Nwjjj+bXr
DHw+AEcpeZhe4xclBXeRVB89+pc94QlouiWJ/45Ije2XU2oFoqjjzr64Lv4UYE5f
ACnA7B/wjwKBgExEBsY1wkP1oIPJ0T5u00ExjncSOOX7pPg0qt6U57FA3XisZNzS
Cj4v1kgzDRhfyPMIFeAnV0o5HuyLJBEXegafeNF941REMVRqfpf7ZosMCiKI7MmV
GQrUMFjl/NIRpqNwzfYJXef+qNqUZgQUKSINwnPv/TYDnKWlbJw9Y21vAoGAZrkl
CJzzGkBkv6DUCYK4g2T9SVRTXArWweAjYnx863j1AM5h55lFhU+cyRvvpTUSFEnP
m8gLCYW53UpIS/Uaqz2koO4ZpTG3/ezKQsoeRfVk1G5uCOP1CEPfC0/aOtGDKOqw
PieGNRd20WpAykrxS9dQGtewYraTHxbUIvkvC/MCgYAKOP6ALUFw4COxvefbzqlt
WI+4Iht7Z9CLf3K1rzAx/W7uJ9d8z8KjxMuhir8w7PuagocRYediBPldxA4guysM
RN405j4Sht8SXyv1TpwiuI+r9QlAdqDyJl/Cc90aJk7LgBY8g6ykKdxCcd0um5ct
d6LdsV9N7wVSb2xKejmt8A==
-----END PRIVATE KEY-----`,
    name: '创新雷达',
    color: '#00E5FF'
  },
  // 数据锚点 (不使用Coze对话)
  2: null,
  // 策略魔方
  3: {
    botId: '7606399531299356682',
    appId: '1184206367100',
    keyId: '91xlz6tjepP6g630UcuMJwSjVQN4vfrOOTeStVSGx4U',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCodcoFIfcuEWXT
5S/wgreKyS1V7QwMcRRu6drOgAOeRK6tUJqmEZcMGgypiid8JvrcxWTaaP3N/LLL
yGdr1+6qOqEwq7TTRpjRAszCfDFio7CBm/qsEaMIHpb7wONc+taCb1VKZuLZ1gNf
f0ksj6dQoikDZg7zymEZSw9KbTmaYRHL3I2BGr7+PZZDLKIBZCy4J6rYqo9rct/x
L7elYRo2ZUOm3eM7lhg06pGsatlfln1xAADCvwPKG5UogWBkkt4pfewVFp8w2ROu
572HO87XOqXyELTPRgFv/cGEot/t+fAOJW5og0i/rHXbDIP0gk/MwMvORseulaHr
l71Cr1dfAgMBAAECgf8gC+HifnoHL+GvINCxCcZ6U5fMQMvwXsXRIHhl0Ces2mP5
+ttwiOgZftsc/xGD2YASsq2WeJXPs1xQAYLeTejMRifKNBMYhG8nU63TUZmtEHac
/ijLLI+9e63W0CejohQsiM4w2S6BqIGVXFSo2KsVK8QH+xV2sYktk2aiDr7M6/Tz
fez2nhjU1CJ5/DJuAS10OYjHAL0tigiJib53FPv+TW//P2HucKTpXrnzD+NLn51Z
xZG0tQ+XzEeowziRSQgMQoUtXN+XHuTObSlChEEdKgXVBso1pJHOS8NKcxc2DpCL
WmRPSNi7OOKhP8vNeDcKA1Jl/iQmLM/wXGYPB3ECgYEA0QH+TEeT+nxaaeLvPCXO
s4JtNHEulkcpWjNlkYV/Z/TgQrJ97/XAB6SxG0iz5crb3eH+VlrymRumlfwiB5wz
Q6PQO4wAHPU6QoYaoOIhpTK3YiGAJwEoJ47xUyeLDSpGQMxCJVHtnJzwMQ2JNViP
6aB1lEu4TRDnm4h0xKwOAjECgYEAzlX3FU3M48pLbxvMhMtHovSIle7pOeZfipie
F2OOYW7Lzn4tl+rG8trLZf3LyCyWTKOUOPqVZWxwaIgkDO2pumndKtI+uBj1HDAN
8I+qpYoh0tDUxmM77IwSYMQO+/kR6AXeXUJW0m0EuTolE3ZHdvLZWiTpNg8jc6cW
ruRIfo8CgYB7T9vDEXADFx8Y3eUb7Yp4ankXubcsvqttJmnEY6j5ooY1k62tx6YW
XFqJqGlLKFZ0IIO4W0xKfP/Z+bnyF3w/agTPPRhL/Xr0CL7pMMF8/+EmKnG7kXkp
bbJ/xxLJH6n3TQuxjRbNkeI8bqoHKUsvIZZ9efcwsMqU/vs1lfVl4QKBgQCBdJIH
Pb7VFDDrzwcsMdYKOV4Qo8qUVyOOc16M0hucqcUZEzVL4TNdX0TKAsf+GWtbPi5a
6W0eK0EDdJcZvWsF2DG5EhvjqVTvkH7OdXTdU6MQ/5Dfv5bzPJazO48jLAu+BSCU
ZnDOqTOTexWT9lu0F32i/xGKp0jY4PZsWDHbpQKBgQCRfNwU7maZVK7EPhzKHjQo
fCeoO4eFVl5WzCdTgAjQQapDHeVW7n6YdDjXwum98wIxXjukbhGlfpiSzjWBa+eh
PwnFi6riYReNi9qKlsloDpq90zmr82PPRMaqTcFNoo8io6PRtvPR0J/uHG8xAMGu
osJhxjJskQ7hR0yZA378Wg==
-----END PRIVATE KEY-----`,
    name: '策略魔方',
    color: '#FF4081'
  },
  // 价值引擎
  4: {
    botId: '7606240448894107702',
    appId: '1107042633189',
    keyId: '0tUFLGQqaxn7xfUxQLWLxFBLK_N18GpUOe__4E4ld-o',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMPpe3/na7vATV
mntPM+C8ncUtPMaMooEMjEL/f24HOqE/+GFdu8g7mIg8CSL8R8al5lIQzEgg6jsW
kcdfNIQz+4SwahaT75+/8mS2ufRDSRs+j2M1E9WFwjqeKJ6T6qgq6+RjDv/PwPOV
UzK4Y0ehZi/cy/s+khjObS10sYyf8mMk8N3DjQjsBUu270TscX5K96bZJUCVgziL
HNifkXxBjDx9H8hzU4+QbBGxbYAx9zduf3lBoxIDuWr0sng/ncDDIj2cBgRgUc33
s2IBXJcckB6GMYBa+AztiW3gUfLMas7PM/3Wjz87f1ATrP9syc6w9mhcvApbfR7A
H/S7OUTHAgMBAAECggEATBEjwErtPY4Q3tzh/+V6VcUMooR4DfiXx2yVp0J2YArd
8002Ngqx0EBGvNVKSlsRCMh21/q9AkU6LHWuoy6T7ihGis14CzC7dml4SPWIm2am
1u3gLOxuIZrs6eqG5OAIMbQZIyt66o0aKwsJYNLY4quEN99gezU+N+NBgqx9izO4
ecCTJl58boHr2cbQSdbW4VDlFSaqjYhInk8K2OA4wq5atMl95NyIWQdfwwdK+X5Y
S5m6woYhfK0i+rwb+yC7D2rbnEvv90dgsQHCI8vo5nBPkvIHAFHwa5GAd4JN13y3
y3JR5HZc+Av9gcucRoRE2MrA3hyZp3tHKrvR/6+EgQKBgQDtCarHCRchdNQRmxyC
hz+laioltiskyZSgbJ1JQIDrj0AIXeIvU0e0Eil0YHoX5IX5lBVNVYzINiG4sMsD
P8/N4VcgFln/wOAHnDz+FGVyyYL33J+aPhx/9T2ufIpSxv8htqYu9UBul7npIMhE
3lHfig20lt42RRLZa4AA6OLwLwKBgQDclVjqmroB2AnEGMZRyQ2Xg1Uy3zmLmbnW
DqS3+6/NqpZnm6FrVEt89KfhwlGn5UzOp/cnAtEF5Jj1ZGK60VrDeRlz3wmdDEdR
eI1uhgg1qyQUFbWJ9VPdi/Ov2zvyppQ18kUsMobvB9yrhiNtbHsA4x3MQ8DiDqTa
Hk5C6Ll26QKBgEOZWCy++Ou/p6MFu1G2RH5mEnMCyrcJDevaTdjQHnQPPFGmhJS+
iVpfO5dG1ErwDw0oIBMX7LhER8WmFZ9tmVO7id9KwIvhc4J4GiTTqELeGQ2ay6Fv
SS1swRR7y+7jdWsl7arCoodnmctUYAjT5kF724C+7cxIUqHSuISJ5f5dAoGAJoSd
xjnGiVPkQK3i0508Fl0En6GDNvFdFhfwg4Abrto+8VCn20oY9HT0a+O2xo6v3tZN
vi4ruc+1NgSViPHN25xl6WnlD9t5CKz4ZXhaLqT349n2nWSNhH5Py0GJMlIMR29K
zPD1xv+kdP8zaIQs5nbCWUzrfY35E21/VQe2eyECgYEAq6AcbI3U6+iXniMk9zkS
Y3rwr7z+N25J3Zf254HLnFLMDaf3QD0LkSZGvu0wVLQTsFbVf9dZJuo+stqr70Es
VOQsijZgQOP/t3hSC8nZaXB9TXS+O3S8S++Rp9+Ewp7JcIwa++wT1+k+MpAMKz4E
kSU/vXi3cI81/qp9eudvoJg=
-----END PRIVATE KEY-----`,
    name: '价值引擎',
    color: '#00BFA5'
  },
  // IP作战室
  5: {
    botId: '7605897070553284648',
    appId: '1166122598879',
    keyId: 't4g_5u3AzWjs33OQkqdvhxXz4wd5D5_xqDO6nX0E1N4',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHL2x4R1RwzJ+M
BGNYRcpQxI5QskXwigNPz5qOdLKzMaVkr+MlYYvMkxjF+um26s4fDGRntUGGsP6H
JRCQSYgQ+SpKu9WG62NYU5Jpi8GQjhfnLW0ndlwMPW35Uj1pUmLxiw8tEBsNTSZy
ZROn5AQuc5KgYzJuNOe9y5FPULxa00DW9JbzcgQRicEZLKqWqd63kN81WBBU5lRa
BNXzKh8cGQDSivWNlxVKWZtfJu4LJraxY2EQR6i85I1uH2lt6py1vYKJRbHKbjnx
P1BVG3uisFdYszyTCq7VAUlZOqPTybvV0Hdw3h1vuDUZDgBPLYILxIjHXFwe+mSu
nGHmJ8TPAgMBAAECggEABeJZz76LVjB0lTzST8OVffaCtTpkFedC71RsHpMjKCGT
GUmAWKYgj4md0SVC1lZeyC+Sk/DSy1IPgKuNxk1sVo6SKa2pH35dq6FcCJdbqEgo
JIXzVwwONFhcxb5yEs6rNbM7GMSQK6iPTbOOEscJ9Gb6oyMjyO59oNJp1KeBg96W
RRsWGFfBnv2XylwkvoxkY2qkjA6tCRuWujLnKgNHLWAImlgmpZYvldIRxpi6YUzO
kP1gTMr6piB9sfqOjfrju8Q7wn9Nh0cRpf+lCnfgfrQ0xHH++1EZtHp2XjDlRc4d
uo1Z0NnzDybA1zE9gdFQnOnomITs4LydRs8v1zJPuQKBgQD52Wzzj0dgOTKhdZb5
eiX0lXTz488ZJ0v1yTVT6OgWuoxyeFWixjDLtjybQg4b3D/Dsap7+svQit1oq9PX
oVDPiEQk9FsALNxpFCCkfy650MPX2sGaz9Hn5qsdkvxNUIGhF0h9kaw7T0lUkGNi
92KBlDFCnbgK2wcB22W14H6F+QKBgQDMFrVSEwEI8vS+oC+B9WlpQo4Sts95F0tI
WW6H1tW05QpNVIl4RTBW7soXs1Hf5rRufzpctcw3isO/qx2rfRvhP+sVnO0khGvb
rGo/GuF37gUQ9AA9oWJwKSl9/POAZAAVajN4NprRe46kmwYDGNPoB1pJ1qpzGbeC
RoJrQG2zBwKBgFOMJEWxxMFlfwvEwY59DRIjpC8mH4ueu2TeOqnreSiYivyARsqe
kZSdRNj6FrO0S9JJp+O7csoylWU6CCXT+KzdOUROPdvqJG4y39OCAAL8z3Bv40u8
cMmmNdQ24Y2M/Tv8CC6NNtXCZpgTjFh8twDzqCFJklB2+3ngfrt57XUpAoGAdoEB
DAUo5q9cWYvdyhJcANi6cjdgRSm3du0m9w1RzdXoo3pg0EsshG3nPtfKxL3LKxYJ
J2gQineyrgqIEdl1ZNeeg1A5iqixkD6O+tF69g5pNqzXrvGUnRfpldRY98YZHlYq
SLU8NEMQUpgJZ6b09JfAX3ucQXU/Tw/uDqS8jeUCgYBPcP4lQe0EZGgSWJBF/661
MEqujq/DnMNwxwvb6MZ3mMtCTvxJ31yjwoEMkfqK0X2Sx9ZiClLfiwpmbGt6AS5F
pzn3BHgOLGVgKU5vybi09GYsvPjZM7tUpEuboSpVJXqqXUEgpBCBRTcVJkkYPH8B
pcWQ+5p+KI9XDkXlkfN0JA==
-----END PRIVATE KEY-----`,
    name: 'IP作战室',
    color: '#FFC107'
  }
};

// 生成 UUID v4
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 获取或生成匿名用户ID
 * 使用 localStorage 存储，确保同一设备返回相同ID
 */
export function getAnonymousUserId(): string {
  let anonId = localStorage.getItem('bioguardian_anon_id');
  if (!anonId) {
    anonId = 'anon_' + uuidv4();
    localStorage.setItem('bioguardian_anon_id', anonId);
  }
  return anonId;
}

/**
 * 生成 JWT Token
 * @param config OAuth配置
 * @param sessionName 会话标识（应为用户业务UID）
 */
function generateJWT(config: CozeOAuthConfig, sessionName: string): { jwt: string } {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT', kid: config.keyId };

  const payload = {
    iss: config.appId,
    aud: 'api.coze.cn',
    iat: now,
    exp: now + 3600, // 1小时有效
    jti: uuidv4(),
    session_name: sessionName  // 使用传入的sessionName，实现会话隔离
  };

  const sHeader = JSON.stringify(header);
  const sPayload = JSON.stringify(payload);

  // 使用私钥签名
  const jwtToken = KJUR.jws.JWS.sign('RS256', sHeader, sPayload, config.privateKey);

  return { jwt: jwtToken };
}

/**
 * 换取 Access Token
 * @param config OAuth配置
 * @param sessionName 会话标识
 */
async function exchangeToken(config: CozeOAuthConfig, sessionName: string): Promise<{ accessToken: string; expiresAt: number }> {
  const { jwt } = generateJWT(config, sessionName);

  const response = await fetch('https://api.coze.cn/api/permission/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({
      'duration_seconds': 86399,
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
    })
  });

  const data = await response.json();

  if (data.access_token) {
    // expires_in 是相对秒数，需要转换为时间戳
    const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 86399);
    return { 
      accessToken: data.access_token, 
      expiresAt
    };
  } else {
    throw new Error(`获取Token失败: ${JSON.stringify(data)}`);
  }
}

/**
 * 获取 Coze Access Token
 * @param moduleId 模块ID
 * @param sessionName 会话标识（用户业务UID或匿名ID）
 */
export async function getCozeAccessToken(moduleId: number, sessionName: string): Promise<string> {
  const config = COZE_BOTS_CONFIG[moduleId];
  if (!config) {
    throw new Error(`模块 ${moduleId} 不存在或不支持AI对话`);
  }

  try {
    const { accessToken, expiresAt } = await exchangeToken(config, sessionName);
    const expiresTime = new Date(expiresAt * 1000).toLocaleString();
    console.log(`[CozeOAuth] Token获取成功, Session: ${sessionName}, 过期: ${expiresTime}`);
    return accessToken;
  } catch (error) {
    console.error('[CozeOAuth] Token获取失败:', error);
    throw error;
  }
}

/**
 * 获取 Coze Access Token（便捷函数，自动处理用户ID）
 * @param moduleId 模块ID
 * @param userId 用户ID（可选，未提供时使用匿名ID）
 * @returns 包含 accessToken 和 sessionName 的对象
 */
export async function getCozeAccessTokenWithUserId(moduleId: number, userId?: string): Promise<{ accessToken: string; sessionName: string }> {
  const sessionName = userId || getAnonymousUserId();
  const accessToken = await getCozeAccessToken(moduleId, sessionName);
  return { accessToken, sessionName };
}

/**
 * 清除Token缓存（兼容旧接口）
 */
export function clearCozeTokenCache(moduleId?: number, sessionName?: string): void {
  console.log(`[CozeOAuth] 清除缓存 (Module: ${moduleId}, Session: ${sessionName})`);
}

/**
 * 获取Bot配置
 */
export function getBotConfig(moduleId: number): CozeOAuthConfig | null {
  return COZE_BOTS_CONFIG[moduleId] || null;
}

/**
 * 检查模块是否支持AI对话
 */
export function isCozeModule(moduleId: number): boolean {
  return moduleId !== 2; // 数据锚点不使用Coze对话
}

/**
 * 初始化 Coze SDK 认证
 * @param moduleId 模块ID
 * @param sessionName 会话标识
 * @returns Promise<AccessToken>
 */
export async function initCozeAuth(moduleId: number, sessionName: string): Promise<string> {
  return getCozeAccessToken(moduleId, sessionName);
}
