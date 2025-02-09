export interface SurveyQuestion {
  id: string
  text: string
  type: 'single' | 'multiple'
  options: string[]
}

export interface BingoTask {
  id: string
  text: string
  category: string
  points: number
}

export interface Template {
  id: string
  name: string
  description: string
  surveyQuestions: SurveyQuestion[]
  bingoTasks: BingoTask[]
}

export const templates: Template[] = [
  {
    id: 'startup-networking',
    name: 'Startup Networking',
    description: 'Startup ekosistemindeki profesyoneller için networking etkinliği şablonu.',
    surveyQuestions: [
      {
        id: 'role',
        text: 'Şu anki rolünüz nedir?',
        type: 'single',
        options: [
          'Kurucu/CEO',
          'CTO/Teknik Lider',
          'Ürün Yöneticisi',
          'Yazılım Geliştirici',
          'Tasarımcı',
          'Pazarlama/Satış',
          'Diğer'
        ]
      },
      {
        id: 'experience',
        text: 'Startup deneyiminiz?',
        type: 'single',
        options: [
          '0-1 yıl',
          '1-3 yıl',
          '3-5 yıl',
          '5+ yıl'
        ]
      },
      {
        id: 'interests',
        text: 'İlgilendiğiniz alanlar?',
        type: 'multiple',
        options: [
          'Yapay Zeka/ML',
          'Blockchain/Web3',
          'SaaS',
          'E-ticaret',
          'Fintech',
          'Mobil Uygulamalar',
          'IoT/Donanım'
        ]
      }
    ],
    bingoTasks: [
      {
        id: 'task1',
        text: 'Bir startup kurucusu ile tanış',
        category: 'networking',
        points: 10
      },
      {
        id: 'task2',
        text: 'Bir CTO ile teknik bir konuda sohbet et',
        category: 'networking',
        points: 10
      },
      {
        id: 'task3',
        text: 'Bir yatırımcı ile tanış',
        category: 'networking',
        points: 15
      },
      {
        id: 'task4',
        text: 'Bir startup pitch\'i dinle',
        category: 'learning',
        points: 5
      },
      {
        id: 'task5',
        text: 'Kendi fikrinden bahset',
        category: 'sharing',
        points: 10
      }
    ]
  },
  {
    id: 'tech-meetup',
    name: 'Teknoloji Buluşması',
    description: 'Yazılım geliştiriciler, tasarımcılar ve teknoloji meraklıları için networking etkinliği',
    surveyQuestions: [
      {
        id: 'tech-stack',
        text: 'Hangi teknolojilerle geliştirme yapıyorsunuz?',
        type: 'multiple',
        options: [
          'Node.js',
          'React',
          'Python',
          'Java',
          'Go',
          'TypeScript',
          'Vue.js',
          'Angular',
          'PHP',
          'Ruby'
        ]
      },
      {
        id: 'dev-role',
        text: 'Hangi alanda çalışıyorsunuz?',
        type: 'multiple',
        options: [
          'Frontend Geliştirici',
          'Backend Geliştirici',
          'Full Stack Geliştirici',
          'DevOps Mühendisi',
          'UI/UX Tasarımcı',
          'Mobil Geliştirici',
          'Veri Bilimci',
          'Yapay Zeka Mühendisi',
          'Oyun Geliştirici',
          'Siber Güvenlik Uzmanı'
        ]
      },
      {
        id: 'experience',
        text: 'Kaç yıllık deneyiminiz var?',
        type: 'single',
        options: [
          '0-2 yıl',
          '3-5 yıl',
          '6-8 yıl',
          '9-12 yıl',
          '12+ yıl'
        ]
      },
      {
        id: 'company-size',
        text: 'Ne tür bir şirkette çalışıyorsunuz?',
        type: 'single',
        options: [
          'Startup',
          'Orta ölçekli şirket',
          'Kurumsal şirket',
          'Freelancer',
          'Kendi şirketim'
        ]
      },
      {
        id: 'interests',
        text: 'İlgilendiğiniz teknoloji alanları nelerdir?',
        type: 'multiple',
        options: [
          'Web3/Blockchain',
          'Yapay Zeka',
          'Bulut Teknolojileri',
          'IoT',
          'Siber Güvenlik',
          'Veri Bilimi',
          'Mobil Teknolojiler',
          'AR/VR',
          'Mikroservisler',
          'DevOps'
        ]
      },
      {
        id: 'cloud',
        text: 'Hangi bulut platformlarını kullanıyorsunuz?',
        type: 'multiple',
        options: [
          'AWS',
          'Google Cloud',
          'Azure',
          'DigitalOcean',
          'Heroku',
          'Vercel',
          'Firebase'
        ]
      },
      {
        id: 'databases',
        text: 'Hangi veritabanlarıyla çalışıyorsunuz?',
        type: 'multiple',
        options: [
          'PostgreSQL',
          'MongoDB',
          'MySQL',
          'Redis',
          'Elasticsearch',
          'Firebase Realtime DB',
          'DynamoDB'
        ]
      },
      {
        id: 'learning',
        text: 'Şu anda öğrenmek istediğiniz teknolojiler nelerdir?',
        type: 'multiple',
        options: [
          'Rust',
          'WebAssembly',
          'Kubernetes',
          'GraphQL',
          'Solidity',
          'Machine Learning',
          'Swift',
          'Flutter'
        ]
      },
      {
        id: 'work-type',
        text: 'Tercih ettiğiniz çalışma şekli nedir?',
        type: 'single',
        options: [
          'Tam zamanlı ofis',
          'Tam zamanlı uzaktan',
          'Hibrit',
          'Freelance',
          'Proje bazlı'
        ]
      },
      {
        id: 'contribution',
        text: 'Açık kaynak projelere katkıda bulunuyor musunuz?',
        type: 'single',
        options: [
          'Evet, düzenli olarak',
          'Ara sıra',
          'Hayır, ama ilgileniyorum',
          'Hayır'
        ]
      }
    ],
    bingoTasks: [
      {
        id: 'nodejs-dev',
        text: 'Node.js geliştiren biriyle tanış',
        category: 'tech-stack',
        points: 10
      },
      {
        id: 'react-dev',
        text: 'React kullanan bir frontend geliştiricisiyle tanış',
        category: 'tech-stack',
        points: 10
      },
      {
        id: 'ai-engineer',
        text: 'Yapay zeka alanında çalışan biriyle tanış',
        category: 'dev-role',
        points: 15
      },
      {
        id: 'startup-founder',
        text: 'Bir startup kurucusuyla tanış',
        category: 'company-size',
        points: 20
      },
      {
        id: 'senior-dev',
        text: '8+ yıl deneyimli bir geliştiriciyle tanış',
        category: 'experience',
        points: 15
      },
      {
        id: 'blockchain-dev',
        text: 'Web3/Blockchain alanında çalışan biriyle tanış',
        category: 'interests',
        points: 15
      },
      {
        id: 'aws-expert',
        text: 'AWS kullanan bir DevOps mühendisiyle tanış',
        category: 'cloud',
        points: 10
      },
      {
        id: 'mongodb-user',
        text: 'MongoDB deneyimi olan bir backend geliştiricisiyle tanış',
        category: 'databases',
        points: 10
      },
      {
        id: 'rust-learner',
        text: 'Rust öğrenen biriyle tanış',
        category: 'learning',
        points: 10
      },
      {
        id: 'remote-worker',
        text: 'Tam zamanlı uzaktan çalışan biriyle tanış',
        category: 'work-type',
        points: 10
      },
      {
        id: 'opensource-contributor',
        text: 'Açık kaynak projelere katkıda bulunan biriyle tanış',
        category: 'contribution',
        points: 15
      },
      {
        id: 'mobile-dev',
        text: 'Mobil uygulama geliştiren biriyle tanış',
        category: 'dev-role',
        points: 10
      },
      {
        id: 'security-expert',
        text: 'Siber güvenlik uzmanıyla tanış',
        category: 'interests',
        points: 15
      },
      {
        id: 'data-scientist',
        text: 'Veri bilimciyle tanış',
        category: 'dev-role',
        points: 15
      },
      {
        id: 'typescript-dev',
        text: 'TypeScript kullanan bir geliştiriciye tanış',
        category: 'tech-stack',
        points: 10
      }
    ]
  },
  {
    id: 'creative-meetup',
    name: 'Kreatif Buluşma',
    description: 'Tasarımcılar, içerik üreticileri ve kreatif profesyoneller için networking etkinliği.',
    surveyQuestions: [
      {
        id: 'creative-role',
        text: 'Kreatif alandaki rolünüz?',
        type: 'single',
        options: [
          'UI/UX Tasarımcı',
          'Grafik Tasarımcı',
          'İçerik Üreticisi',
          'Sosyal Medya Yöneticisi',
          'Video Editör',
          'Fotoğrafçı',
          'Diğer'
        ]
      },
      {
        id: 'tools',
        text: 'Kullandığınız araçlar?',
        type: 'multiple',
        options: [
          'Figma',
          'Adobe Creative Suite',
          'Sketch',
          'Canva',
          'Final Cut Pro',
          'Adobe Premiere',
          'Lightroom'
        ]
      },
      {
        id: 'interests',
        text: 'İlgilendiğiniz kreatif alanlar?',
        type: 'multiple',
        options: [
          'UI Design',
          'Brand Design',
          'Motion Design',
          'İllüstrasyon',
          'Tipografi',
          'Video Prodüksiyon',
          'Sosyal Medya'
        ]
      }
    ],
    bingoTasks: [
      {
        id: 'creative-task1',
        text: 'Bir tasarım portfolyosu incele',
        category: 'learning',
        points: 5
      },
      {
        id: 'creative-task2',
        text: 'Bir kreatif direktör ile tanış',
        category: 'networking',
        points: 15
      },
      {
        id: 'creative-task3',
        text: 'Bir tasarım sürecini dinle',
        category: 'learning',
        points: 10
      },
      {
        id: 'creative-task4',
        text: 'Kendi projelerinden birini paylaş',
        category: 'sharing',
        points: 10
      },
      {
        id: 'creative-task5',
        text: 'Bir tasarım kritiğine katıl',
        category: 'learning',
        points: 5
      }
    ]
  }
] 