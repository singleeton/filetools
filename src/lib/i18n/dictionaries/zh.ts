import type { Dictionary } from './en'

export const zh: Dictionary = {
  nav: {
    tools: '工具',
  },

  hero: {
    title: '快速免费的在线文件工具',
    subtitle:
      '在浏览器中即时转换、合并、拆分和压缩 PDF 及文档。无需安装任何软件。',
    cta: '免费试用',
    image: '',
  },

  popularTools: {
    title: '热门工具',
    subtitle: '处理 PDF 和文档文件所需的一切',
    useTool: '使用工具 →',
  },

  tool: {
    'pdf-merge': {
      name: 'PDF 合并',
      shortDesc: '将多个 PDF 文件合并为一个文档',
      description:
        '将多个 PDF 文件合并为一个文档。拖放以重新排列页面顺序。',
    },
    'pdf-split': {
      name: 'PDF 拆分',
      shortDesc: '将 PDF 文件拆分为单独的页面或部分',
      description:
        '将 PDF 文件拆分为单独的页面或部分。选择特定页面或页面范围进行提取。',
    },
    'pdf-compress': {
      name: 'PDF 压缩',
      shortDesc: '通过压缩图像减小 PDF 文件大小',
      description:
        '通过压缩嵌入图像减小 PDF 文件大小。选择低、中或高压缩级别。对包含大量图像的 PDF 效果最佳。',
    },
    'word-to-pdf': {
      name: 'Word 转 PDF',
      shortDesc: '将 DOCX 文件转换为 PDF 格式',
      description:
        '将 Microsoft Word 文档（DOCX）转换为 PDF 格式。快速准确的转换。',
    },
    'pdf-to-word': {
      name: 'PDF 转 Word',
      shortDesc: '将 PDF 文件转换为可编辑的 DOCX 格式',
      description: '将 PDF 文件转换为可编辑的 Microsoft Word（DOCX）格式。保留格式和布局。',
    },
    'pdf-to-excel': { name: 'PDF 转 Excel', shortDesc: '将 PDF 转换为 Excel 表格', description: '将 PDF 文件转换为 Excel 表格（XLSX）。提取表格和数据。' },
    'jpg-to-png': { name: 'JPG 转 PNG', shortDesc: '将 JPEG 图片转换为 PNG 格式', description: '将 JPEG 图片转换为无损 PNG 格式。' },
    'png-to-jpg': { name: 'PNG 转 JPG', shortDesc: '将 PNG 图片转换为 JPG 格式', description: '将 PNG 图片转换为 JPEG 格式。可选择质量级别。' },
    'image-resize': { name: '图片调整大小', shortDesc: '将图片调整为任意尺寸', description: '将图片调整为自定义尺寸。支持 JPG、PNG、WebP。' },
    'pdf-rotate': { name: 'PDF 旋转', shortDesc: '旋转 PDF 页面', description: '将 PDF 中的所有页面旋转 90°、180° 或 270°。' },
    'remove-bg': { name: '移除背景', shortDesc: '使用 AI 自动移除背景', description: '使用人工智能自动移除图片背景。几秒钟内获得透明 PNG——无需手动编辑。' },
  },

  features: {
    title: '为什么选择 FileTools？',
    subtitle: '简单、快速、安全的文件处理',
    fast: {
      title: '极速处理',
      description: '文件在我们的服务器上即时处理，无需等待。',
      image: '',
    },
    secure: {
      title: '安全私密',
      description: '文件处理后自动删除。我们绝不存储您的数据。',
      image: '',
    },
    noInstall: {
      title: '无需安装',
      description: '完全在浏览器中运行。无需下载或安装任何软件。',
      image: '',
    },
    mobile: {
      title: '移动端适配',
      description: '在任何设备上使用——电脑、平板或手机。完全响应式设计。',
      image: '',
    },
  },

  howItWorks: {
    title: '使用方法',
    subtitle: '三个简单步骤即可完成文件处理',
    step1: { title: '上传文件', description: '拖放或浏览选择您的文件' },
    step2: { title: '处理', description: '选择设置，其余交给我们' },
    step3: { title: '下载', description: '即时获取转换后的文件' },
  },

  faq: {
    title: '常见问题',
    items: [
      {
        question: '是免费的吗？',
        answer: '是的！所有工具完全免费使用，没有隐藏费用，无需注册。',
      },
      {
        question: '我的文件安全吗？',
        answer:
          '绝对安全。文件在我们的服务器上安全处理，处理后自动删除。我们绝不存储或分享您的文件。',
      },
      {
        question: '需要创建账户吗？',
        answer: '不需要。您可以在不创建账户或注册的情况下使用所有工具。',
      },
      {
        question: '支持哪些文件格式？',
        answer: '我们目前支持 PDF、DOCX 和 DOC 文件。更多格式即将推出。',
      },
      {
        question: '有文件大小限制吗？',
        answer:
          '有。大多数工具支持最大 50 MB 的文件。PDF 压缩支持最大 100 MB。',
      },
    ],
  },

  trust: {
    title: '深受数千用户信赖',
    subtitle: '您的文件安全无忧',
    noStorage: {
      title: '不存储文件',
      description: '我们绝不存储您的文件。所有内容在内存中处理后即被丢弃。',
    },
    autoDelete: {
      title: '自动删除',
      description: '所有上传的文件在处理后几分钟内自动删除。',
    },
    encrypted: {
      title: '安全处理',
      description: '文件在我们的服务器上安全处理。无第三方访问。',
    },
  },

  cta: {
    title: '准备好开始了吗？',
    subtitle: '无需注册。选择一个工具，开始免费转换您的文件。',
    button: '浏览所有工具',
  },

  ui: {
    dropzone: {
      drag: '将文件拖放到此处',
      browse: '将文件拖放到此处，或',
      browseLink: '浏览选择',
      maxSize: '最大',
      upTo: '最多',
      files: '个文件',
    },
    download: {
      ready: '您的文件已准备好！',
      button: '下载',
      startOver: '重新开始',
    },
    processing: {
      default: '正在处理您的文件...',
      compressing: '正在压缩 PDF...',
    },
    process: {
      button: '处理',
      file: '个文件',
      files: '个文件',
    },
    relatedTools: '您可能需要的其他工具',
  },

  split: {
    options: '拆分选项',
    pagesDetected: '页已检测',
    pageRange: '页面范围',
    pageRangeDesc: '提取一个页面范围',
    extractPages: '提取特定页面',
    extractPagesDesc: '输入以逗号分隔的页码（例如 1, 3, 5）',
    allPages: '所有页面',
    allPagesDesc: '保留所有页面（用于移除加密）',
    button: '拆分 PDF',
    from: '从',
    to: '到',
  },

  compress: {
    title: '压缩级别',
    low: '低',
    lowDesc: '最佳质量，轻微减小',
    medium: '中',
    mediumDesc: '质量与大小的良好平衡',
    high: '高',
    highDesc: '最小文件大小，较低质量',
    button: '压缩 PDF',
    original: '原始大小',
  },

  removeBg: {
    processing: '正在删除背景...',
    modelLoading: '正在下载AI模型（仅首次）...',
    before: '原图',
    after: '效果',
    download: '下载',
    removeAnother: '处理其他图片',
    error: '背景删除失败',
    retry: '重试',
    refine: '微调',
    refineHint: '涂抹以恢复或擦除区域',
    restore: '恢复',
    erase: '擦除',
    brushSize: '画笔大小',
    undo: '撤销',
    resetMask: '重置',
    apply: '应用更改',
    cancel: '取消',
    editView: '编辑',
    previewView: '预览',
    brushTool: '画笔',
    wandTool: '魔术棒',
    tolerance: '容差',
    selectSimilar: '选择所有相似颜色',
  },

  blog: {
    nav: '博客',
    latestTitle: '最新博客文章',
    latestSubtitle: '关于文件转换的技巧、指南和更新',
    viewAll: '查看所有文章',
    readMore: '阅读更多',
    listTitle: '博客',
    listSubtitle: '关于 PDF 和文件工具的指南、技巧和新闻',
    emptyState: '暂无文章，敬请期待！',
    publishedOn: '发布于',
    backToBlog: '返回博客',
    previous: '上一页',
    next: '下一页',
  },

  footer: {
    tagline: '免费在线文件工具。无需安装。',
    tools: '工具',
    legal: '法律信息',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '服务条款',
    rights: '保留所有权利。',
  },

  meta: {
    home: {
      title: 'FileTools — 免费在线文件工具',
      description: '免费在线文件工具。在线转换、合并、拆分和压缩文件。',
    },
    'pdf-merge': {
      title: 'PDF 合并 — 免费在线合并 PDF 文件',
      description: '免费在线将多个 PDF 文件合并为一个文档。',
    },
    'pdf-split': {
      title: 'PDF 拆分 — 免费在线拆分 PDF 页面',
      description: '免费在线将 PDF 文件拆分为单独的页面或提取特定页面范围。',
    },
    'pdf-compress': {
      title: 'PDF 压缩 — 免费在线减小 PDF 大小',
      description: '免费在线压缩 PDF 文件。多种压缩级别可选。',
    },
    'word-to-pdf': {
      title: 'Word 转 PDF — 免费在线转换 DOCX',
      description: '免费在线将 Word 文档（DOCX）转换为 PDF 格式。快速安全。',
    },
    'pdf-to-word': { title: 'PDF 转 Word — 免费在线转换', description: '免费在线将 PDF 转换为 Word。' },
    'pdf-to-excel': { title: 'PDF 转 Excel — 免费在线', description: '免费在线将 PDF 转换为 Excel 表格。' },
    'jpg-to-png': { title: 'JPG 转 PNG — 免费在线', description: '免费在线将 JPEG 转换为 PNG。' },
    'png-to-jpg': { title: 'PNG 转 JPG — 免费在线', description: '免费在线将 PNG 转换为 JPEG。' },
    'image-resize': { title: '调整图片大小 — 免费在线', description: '免费在线调整图片大小。' },
    'pdf-rotate': { title: 'PDF 旋转 — 免费在线', description: '免费在线旋转 PDF 页面。' },
    'remove-bg': { title: '移除背景 — 免费在线', description: '免费在线移除图片背景。' },
    blog: {
      title: '博客 - FileTools 技巧与指南',
      description: '关于 PDF 和文件转换工具的指南、技巧和新闻。',
    },
  },
}
