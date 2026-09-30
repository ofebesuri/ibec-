// ============================================================================
// SiteLinks - 外部链接中心化配置
//
// 设计原则：
// 1. 全部跳到对应官网首页，不依赖任何具体账号 / 仓库 / 包名 / 镜像
// 2. 后续若要指向具体页面，只在这里改一次，全站生效
// 3. 站内路由（forum、download API）放 internal 段
// ============================================================================

export const SITE_LINKS = {
  /**
   * 外部官网首页（用户点击一定跳到真页面）
   */
  external: {
    githubHome: 'https://github.com',
    dockerHome: 'https://www.docker.com',
    pypiHome: 'https://pypi.org',
    nodejsHome: 'https://nodejs.org',
    igemHome: 'https://igem.org',
    rcsbPdbHome: 'https://www.rcsb.org'
  },

  /**
   * 站内路由
   */
  internal: {
    forumHome: '/forum',
    communityHome: '/community'
  },

  /**
   * 下载 API（指向 /api/download，参数见 api/download/route.ts）
   */
  downloads: {
    algorithmsTar: '/api/download?file=algorithms.tar.gz',
    algorithmsWheel: '/api/download?file=algorithms.whl',
    dockerCompose: '/api/download?file=docker-compose.yml',
    readme: '/api/download?file=README.md'
  },

  /**
   * 邮件
   */
  mail: {
    contact: 'mailto:contact@flubiostack.io'
  }
} as const;

export type SiteLinkKey = keyof typeof SITE_LINKS;
