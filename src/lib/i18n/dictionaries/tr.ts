import type { Dictionary } from './en'

export const tr: Dictionary = {
  nav: {
    tools: 'Araçlar',
  },

  hero: {
    title: 'Hızlı ve Ücretsiz Online Dosya Araçları',
    subtitle:
      'PDF ve belgelerinizi tarayıcınızda anında dönüştürün, birleştirin, bölün ve sıkıştırın. Kurulum gerektirmez.',
    cta: 'Ücretsiz Deneyin',
    image: '',
  },

  popularTools: {
    title: 'Popüler Araçlar',
    subtitle: 'PDF ve belge dosyalarıyla çalışmak için ihtiyacınız olan her şey',
    useTool: 'Kullan →',
  },

  tool: {
    'pdf-merge': {
      name: 'PDF Birleştir',
      shortDesc: 'Birden fazla PDF dosyasını tek belgede birleştirin',
      description:
        'Birden fazla PDF dosyasını tek bir belgede birleştirin. Sürükle bırak ile sayfaları yeniden sıralayın.',
    },
    'pdf-split': {
      name: 'PDF Böl',
      shortDesc: 'PDF dosyasını sayfalara veya bölümlere ayırın',
      description:
        'PDF dosyasını sayfalara veya bölümlere ayırın. Belirli sayfaları veya sayfa aralıklarını seçin.',
    },
    'pdf-compress': {
      name: 'PDF Sıkıştır',
      shortDesc: 'Görselleri sıkıştırarak PDF boyutunu küçültün',
      description:
        'PDF içindeki görselleri sıkıştırarak dosya boyutunu küçültün. Düşük, orta veya yüksek sıkıştırma seviyeleri. Görsel ağırlıklı PDF dosyalarında en iyi sonucu verir.',
    },
    'word-to-pdf': {
      name: "Word'den PDF'e",
      shortDesc: "DOCX dosyalarını PDF formatına dönüştürün",
      description:
        "Microsoft Word belgelerini (DOCX) PDF formatına dönüştürün. Hızlı ve doğru dönüşüm.",
    },
    'pdf-to-word': {
      name: "PDF'den Word'e",
      shortDesc: "PDF dosyalarını düzenlenebilir DOCX formatına dönüştürün",
      description: "PDF dosyalarını düzenlenebilir Microsoft Word (DOCX) formatına dönüştürün. Biçimlendirmeyi korur.",
    },
    'pdf-to-excel': {
      name: "PDF'den Excel'e",
      shortDesc: "PDF'yi Excel tablosuna dönüştürün",
      description: "PDF dosyalarını Excel tablolarına (XLSX) dönüştürün. Tablo ve verileri çıkarır.",
    },
    'jpg-to-png': {
      name: "JPG'den PNG'ye",
      shortDesc: "JPEG görsellerini PNG formatına dönüştürün",
      description: "JPEG görsellerini kayıpsız PNG formatına dönüştürün.",
    },
    'png-to-jpg': {
      name: "PNG'den JPG'ye",
      shortDesc: "PNG görsellerini JPG formatına dönüştürün",
      description: "PNG görsellerini JPEG formatına dönüştürün. Kalite seviyesi seçebilirsiniz.",
    },
    'image-resize': {
      name: 'Görsel Boyutlandır',
      shortDesc: 'Görselleri istediğiniz boyuta getirin',
      description: 'Görselleri özel boyutlara yeniden boyutlandırın. JPG, PNG, WebP destekler.',
    },
    'pdf-rotate': {
      name: 'PDF Döndür',
      shortDesc: 'PDF sayfalarını döndürün',
      description: "PDF'deki tüm sayfaları 90°, 180° veya 270° döndürün.",
    },
    'remove-bg': {
      name: 'Arka Plan Kaldır',
      shortDesc: 'Yapay zeka ile arka planı otomatik kaldırın',
      description: 'Yapay zeka kullanarak görselinizin arka planını otomatik olarak kaldırın. Saniyeler içinde şeffaf PNG elde edin — manuel düzenleme gerekmez.',
    },
  },

  features: {
    title: 'Neden FileTools?',
    subtitle: 'Basit, hızlı ve güvenli dosya işleme',
    fast: {
      title: 'Hızlı İşleme',
      description: 'Dosyalar sunucularımızda anında işlenir. Bekleme yok.',
      image: '',
    },
    secure: {
      title: 'Güvenli ve Gizli',
      description:
        'Dosyalar işlem sonrası otomatik olarak silinir. Verilerinizi asla saklamayız.',
      image: '',
    },
    noInstall: {
      title: 'Kurulum Gerektirmez',
      description:
        'Tamamen tarayıcınızda çalışır. İndirme veya kurulum gerekmez.',
      image: '',
    },
    mobile: {
      title: 'Mobil Uyumlu',
      description:
        'Her cihazda kullanın — masaüstü, tablet veya telefon. Tam uyumlu.',
      image: '',
    },
  },

  howItWorks: {
    title: 'Nasıl Çalışır?',
    subtitle: 'Dosyanızı hazırlamak için üç basit adım',
    step1: { title: 'Dosya Yükle', description: 'Sürükle bırak veya dosyanızı seçin' },
    step2: { title: 'İşle', description: 'Ayarlarınızı seçin, gerisini bize bırakın' },
    step3: { title: 'İndir', description: 'Dönüştürülmüş dosyanızı anında alın' },
  },

  faq: {
    title: 'Sıkça Sorulan Sorular',
    items: [
      {
        question: 'Kullanımı ücretsiz mi?',
        answer:
          'Evet! Tüm araçlar tamamen ücretsizdir. Gizli maliyet veya kayıt gerekmez.',
      },
      {
        question: 'Dosyalarım güvende mi?',
        answer:
          'Kesinlikle. Dosyalar sunucularımızda güvenle işlenir ve işlem sonrası otomatik silinir. Dosyalarınızı asla saklamaz veya paylaşmayız.',
      },
      {
        question: 'Hesap oluşturmam gerekiyor mu?',
        answer:
          'Hayır. Tüm araçları hesap oluşturmadan veya kayıt olmadan kullanabilirsiniz.',
      },
      {
        question: 'Hangi dosya formatları destekleniyor?',
        answer:
          'Şu anda PDF, DOCX ve DOC dosyalarını destekliyoruz. Yakında daha fazla format eklenecek.',
      },
      {
        question: 'Dosya boyutu sınırı var mı?',
        answer:
          "Evet. Çoğu araç 50 MB'a kadar dosyaları destekler. PDF Sıkıştır 100 MB'a kadar destekler.",
      },
    ],
  },

  trust: {
    title: 'Binlerce Kullanıcının Güveni',
    subtitle: 'Dosyalarınız güvende',
    noStorage: {
      title: 'Dosya Saklanmaz',
      description: 'Dosyalarınızı asla saklamayız. Her şey bellekte işlenir ve silinir.',
    },
    autoDelete: {
      title: 'Otomatik Silme',
      description: 'Yüklenen tüm dosyalar işlem sonrası dakikalar içinde otomatik silinir.',
    },
    encrypted: {
      title: 'Güvenli İşleme',
      description: 'Dosyalar sunucularımızda güvenle işlenir. Üçüncü taraf erişimi yoktur.',
    },
  },

  cta: {
    title: 'Başlamaya Hazır mısınız?',
    subtitle:
      'Kayıt gerekmez. Bir araç seçin ve dosyalarınızı ücretsiz dönüştürmeye başlayın.',
    button: 'Tüm Araçlara Göz At',
  },

  ui: {
    dropzone: {
      drag: 'Dosyalarınızı buraya bırakın',
      browse: 'Dosyalarınızı sürükleyip bırakın veya',
      browseLink: 'seçin',
      maxSize: 'Maks',
      upTo: 'En fazla',
      files: 'dosya',
    },
    download: {
      ready: 'Dosyanız hazır!',
      button: 'İndir',
      startOver: 'Baştan Başla',
    },
    processing: {
      default: 'Dosyanız işleniyor...',
      compressing: "PDF'niz sıkıştırılıyor...",
    },
    process: {
      button: 'İşle',
      file: 'Dosya',
      files: 'Dosya',
    },
    relatedTools: 'İhtiyacınız Olabilecek Diğer Araçlar',
  },

  split: {
    options: 'Bölme Seçenekleri',
    pagesDetected: 'sayfa algılandı',
    pageRange: 'Sayfa Aralığı',
    pageRangeDesc: 'Bir sayfa aralığı çıkarın',
    extractPages: 'Belirli Sayfaları Çıkar',
    extractPagesDesc: 'Virgülle ayrılmış sayfa numaraları girin (ör. 1, 3, 5)',
    allPages: 'Tüm Sayfalar',
    allPagesDesc: 'Tüm sayfaları koru (şifre kaldırma için kullanışlı)',
    button: "PDF'yi Böl",
    from: 'Başlangıç',
    to: 'bitiş',
  },

  compress: {
    title: 'Sıkıştırma Seviyesi',
    low: 'Düşük',
    lowDesc: 'En iyi kalite, hafif boyut azaltma',
    medium: 'Orta',
    mediumDesc: 'Kalite ve boyut dengesi',
    high: 'Yüksek',
    highDesc: 'En küçük dosya boyutu, düşük kalite',
    button: "PDF'yi Sıkıştır",
    original: 'Orijinal',
  },

  removeBg: {
    processing: 'Arka plan kaldırılıyor...',
    modelLoading: 'AI modeli indiriliyor (yalnızca ilk kez)...',
    before: 'Önce',
    after: 'Sonra',
    download: 'İndir',
    removeAnother: 'Başka Görsel',
    error: 'Arka plan kaldırılamadı',
    retry: 'Tekrar Dene',
    refine: 'Düzelt',
    refineHint: 'Alanları geri getirmek veya silmek için boyayın',
    restore: 'Geri Getir',
    erase: 'Sil',
    brushSize: 'Fırça Boyutu',
    undo: 'Geri Al',
    resetMask: 'Sıfırla',
    apply: 'Değişiklikleri Uygula',
    cancel: 'Vazgeç',
    editView: 'Düzenle',
    previewView: 'Önizleme',
    brushTool: 'Fırça',
    wandTool: 'Sihirli Değnek',
    tolerance: 'Tolerans',
    selectSimilar: 'Tüm benzer renkleri seç',
  },

  blog: {
    nav: 'Blog',
    latestTitle: 'Blogumuzdan son yazılar',
    latestSubtitle: 'Dosya dönüştürme hakkında ipuçları, rehberler ve güncellemeler',
    viewAll: 'Tüm yazıları gör',
    readMore: 'Devamını oku',
    listTitle: 'Blog',
    listSubtitle: 'PDF ve dosya araçları hakkında rehberler, ipuçları ve haberler',
    emptyState: 'Henüz yazı yok. Yakında burada olacak!',
    publishedOn: 'Yayın tarihi',
    backToBlog: 'Bloga dön',
    previous: 'Önceki',
    next: 'Sonraki',
  },

  footer: {
    tagline: 'Ücretsiz online dosya araçları. Kurulum gerektirmez.',
    tools: 'Araçlar',
    legal: 'Yasal',
    contact: 'İletişim',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları',
    rights: 'Tüm hakları saklıdır.',
  },

  meta: {
    home: {
      title: 'FileTools - Ücretsiz Online Dosya Araçları',
      description:
        'Ücretsiz online dosya araçları. Dosyaları çevrimiçi dönüştürün, birleştirin, bölün ve sıkıştırın.',
    },
    'pdf-merge': {
      title: 'PDF Birleştir - PDF Dosyalarını Ücretsiz Birleştirin',
      description:
        'Birden fazla PDF dosyasını ücretsiz olarak tek belgede birleştirin.',
    },
    'pdf-split': {
      title: 'PDF Böl - PDF Sayfalarını Ücretsiz Ayırın',
      description:
        'PDF dosyalarını ücretsiz olarak ayrı sayfalara bölün veya belirli sayfa aralıklarını çıkarın.',
    },
    'pdf-compress': {
      title: 'PDF Sıkıştır - PDF Boyutunu Ücretsiz Küçültün',
      description:
        'PDF dosyalarını ücretsiz olarak sıkıştırın. Düşük, orta veya yüksek sıkıştırma seviyeleri.',
    },
    'word-to-pdf': {
      title: "Word'den PDF'e - DOCX'i Ücretsiz PDF'e Dönüştürün",
      description:
        "Word belgelerini (DOCX) ücretsiz olarak PDF formatına dönüştürün. Hızlı ve güvenli.",
    },
    'pdf-to-word': { title: "PDF'den Word'e - PDF'i Ücretsiz DOCX'e Dönüştürün", description: "PDF dosyalarını ücretsiz olarak düzenlenebilir Word belgelerine dönüştürün." },
    'pdf-to-excel': { title: "PDF'den Excel'e - Ücretsiz Dönüştürün", description: "PDF dosyalarını ücretsiz olarak Excel tablolarına dönüştürün." },
    'jpg-to-png': { title: "JPG'den PNG'ye - Ücretsiz Dönüştürün", description: "JPEG görsellerini ücretsiz olarak PNG formatına dönüştürün." },
    'png-to-jpg': { title: "PNG'den JPG'ye - Ücretsiz Dönüştürün", description: "PNG görsellerini ücretsiz olarak JPEG formatına dönüştürün." },
    'image-resize': { title: 'Görsel Boyutlandır - Ücretsiz Online', description: 'Görselleri ücretsiz olarak istediğiniz boyuta getirin.' },
    'pdf-rotate': { title: 'PDF Döndür - Ücretsiz Online', description: 'PDF sayfalarını ücretsiz olarak 90°, 180° veya 270° döndürün.' },
    'remove-bg': { title: 'Arka Plan Kaldır - Ücretsiz Online', description: 'Görsellerden arka planı ücretsiz olarak kaldırın.' },
    blog: {
      title: 'Blog - FileTools İpuçları ve Rehberler',
      description: 'PDF ve dosya dönüştürme araçları hakkında rehberler, ipuçları ve haberler.',
    },
  },
}
