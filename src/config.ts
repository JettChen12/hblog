/**
 * H-BLOG 站点配置 —— 站长的“唯一需要常改的文件”。
 * 个人资料、社交链接、评论配置都集中在这里，改完 push 即生效。
 */

export const site = {
  /** 站名 */
  name: 'H-BLOG',
  /** 站训（首页 hero 的一句话） */
  tagline: '千里之行，始于足下',
  /** 站点 URL：域名就绪后改成正式域名（影响 RSS / sitemap / canonical） */
  url: 'https://hblog.local',
  /** 站长名 */
  author: 'Jett',
  /** 页脚起始年份 */
  since: 2026,
  /** 一句话副标题（hero 辅助说明，保持真实，不要营销腔） */
  intro: '这里记录我的技术文章与思考。',
};

export const nav = [
  { label: '文章', href: '/archive/' },
  { label: '标签', href: '/tags/' },
  { label: '关于', href: '/about/' },
];

/**
 * 个人简介 —— 想改内容就编辑这里。
 * bio 里写真实的介绍；现在放的是占位文案，上线前请替换。
 */
export const profile = {
  /** 头像：像素画 SVG 占位。换成自己的图时，把文件放进 public/pixel/ 再改路径 */
  avatar: '/pixel/avatar.svg',
  name: 'Jett',
  /** 一句话身份 */
  role: '开发者',
  /** 简介（支持多段，每段一个字符串）。当前为占位文案。 */
  bio: [
    '你好，我是 Jett。这一段是简介占位：编辑 src/config.ts 里的 profile.bio，写上你自己的介绍，两三段即可。',
    '可以写你在做什么方向的技术、这个博客记录什么、以及任何你希望读者知道的事。写完 push，网站会自动更新。',
  ],
  /** 技能 / 兴趣标签（诚实填写，别堆砌） */
  skills: ['Web', '前端', '工具链', '折腾'],
  /** 社交链接：label 显示、href 跳转。不需要的删掉即可 */
  links: [
    { label: 'GitHub', href: 'https://github.com/JettChen12' },
    { label: 'Email', href: 'mailto:jett@ztgame.com' },
  ],
};

/**
 * giscus 评论配置。
 * 开启步骤（一次性）：
 *  1. 仓库已 public（JettChen12/hblog 已满足）
 *  2. 仓库 Settings → General → Features → 勾选 Discussions
 *  3. 打开 https://github.com/apps/giscus 安装到本仓库
 *  4. 打开 https://giscus.app/zh-CN 选择仓库 JettChen12/hblog，
 *     映射方式选“pathname”，分类选 Announcements（推荐）
 *  5. 把页面生成的 data-repo-id / data-category-id 填到下面
 * 留空时文章页会显示“评论区未配置”的小字提示，不影响其他功能。
 */
export const giscus = {
  repo: 'JettChen12/hblog' as `${string}/${string}`,
  repoId: '', // 待填：giscus.app 生成
  category: 'Announcements',
  categoryId: '', // 待填：giscus.app 生成
};

/** 友情链接（P2，先留空数组） */
export const friends: { name: string; href: string; desc: string }[] = [];
