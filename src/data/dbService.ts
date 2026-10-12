import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { canUserAccessProject, canUserAccessNotification } from '../utils/helpers';

// Define the DB path in the root of the project
const DB_PATH = path.join(process.cwd(), 'db.json');

// Interface representing the entire relational database state
export interface DatabaseSchema {
  users: any[];
  workspaces: any[];
  organizations: any[];
  teams: any[];
  teamMembers: any[];
  projects: any[];
  projectMembers: any[];
  tasks: any[];
  subtasks: any[];
  wordpressChecklist: any[];
  seoChecklist: any[];
  contentCenter: any[];
  qaBugs: any[];
  files: any[];
  notifications: any[];
  externalApis: any[];
  apiLogs: any[];
  wpSites: any[];
  wpLogs: any[];
  wpWebhooks: any[];
  comments: any[];
  milestones: any[];
  settings: any;
  auditLogs: any[];
  conversations: any[];
  conversationMembers: any[];
  messages: any[];
  conversationRequests: any[];
  conversationPermissions: any[];
  pinnedMessages: any[];
  messageReactions: any[];
  readReceipts: any[];
  
  // Dynamic Org & Module Builder Tables
  departments: any[];
  departmentMembers: any[];
  departmentPermissions: any[];
  departmentModules: any[];
  departmentReports: any[];
  departmentSettings: any[];
  departmentChats: any[];
  departmentChannels: any[];
  departmentRoles: any[];
  departmentTemplates: any[];
  navigationGroups: any[];
  navigationItems: any[];
  moduleDefinitions: any[];
  moduleInstances: any[];
  modulePermissions: any[];

  // System Owner Approval Tables
  approvalRequests: any[];
  approvalHistory: any[];
  notificationQueue: any[];
  emailQueue: any[];

  // Identity Management Tables
  userProfiles: any[];
  userSettings: any[];
  userSessions: any[];
  loginHistory: any[];
  userDevices: any[];
  securityEvents: any[];
  profileImages: any[];
  userPreferences: any[];
  userActivities: any[];
}

// Helper to check if owner email
export const isOwnerEmail = (emailStr: string): boolean => {
  if (!emailStr) return false;
  const norm = emailStr.toLowerCase().trim();
  const envOwner = (process.env.OWNER_EMAIL || "alitahmores343412@gmail.com").toLowerCase().trim();
  return norm === envOwner;
};

export const INITIAL_USERS: any[] = [
  {
    id: "usr_master_alitahmores",
    name: "علی طهمورث",
    username: "alitahmores",
    email: "alitahmores343412@gmail.com",
    phone: "09123456789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores",
    status: "ACTIVE",
    role: "OWNER",
    personalWorkspaceId: "ws_alitahmores_primary",
    memberships: [
      {
        workspaceId: "ws_alitahmores_primary",
        workspaceName: "فضای کاری علی طهمورث",
        role: "OWNER",
        permissions: ["all"],
        joinedAt: new Date().toISOString()
      }
    ]
  }
];

export const INITIAL_WORKSPACES: any[] = [
  {
    id: "ws_alitahmores_primary",
    name: "فضای کاری علی طهمورث",
    ownerId: "usr_master_alitahmores",
    inviteCode: "ORBITMASTER",
    members: [
      {
        userId: "usr_master_alitahmores",
        role: "OWNER",
        permissions: ["all"],
        name: "علی طهمورث",
        username: "alitahmores",
        email: "alitahmores343412@gmail.com",
        phone: "09123456789",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"
      }
    ]
  }
];

// Generates the initial high-fidelity realistic seed data representing a premium digital marketing agency workspace
const getSeedData = (): DatabaseSchema => {
  const ownerEmail = "alitahmores343412@gmail.com";
  const hashedPassword = bcryptjs.hashSync("123456", 10); // Standard secure seed password

  const users = [
    {
      id: "usr_master_alitahmores",
      email: ownerEmail,
      username: "alitahmores",
      passwordHash: hashedPassword,
      name: "علی طهمورث",
      phone: "09123456789",
      role: "OWNER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores",
      status: "ACTIVE",
      personalWorkspaceId: "ws_alitahmores_primary",
      memberships: [
        {
          workspaceId: "ws_alitahmores_primary",
          workspaceName: "فضای کاری علی طهمورث",
          role: "OWNER",
          permissions: ["all"],
          joinedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toLocaleDateString('fa-IR'),
      workspace: "ws_alitahmores_primary"
    }
  ];

  const workspaces = [
    {
      id: "ws_alitahmores_primary",
      name: "فضای کاری علی طهمورث",
      ownerId: "usr_master_alitahmores",
      inviteCode: "ORBITMASTER",
      members: [
        {
          userId: "usr_master_alitahmores",
          role: "OWNER",
          permissions: ["all"],
          joinedAt: new Date().toISOString(),
          name: "علی طهمورث",
          username: "alitahmores",
          email: ownerEmail,
          phone: "09123456789",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"
        }
      ],
      createdAt: "1405/01/01"
    }
  ];

  const teams: any[] = [];
  const teamMembers: any[] = [];

  const organizations = [
    {
      id: "org_1",
      name: "هلدینگ تجاری آریا (Arya Commerce Group)",
      slug: "arya-commerce",
      ownerId: "usr_owner",
      createdAt: "1405/01/01"
    }
  ];

  const departments: any[] = [];
  const departmentMembers: any[] = [];
  const moduleDefinitions: any[] = [];
  const moduleInstances: any[] = [];
  const departmentModules: any[] = [];
  const navigationGroups: any[] = [];
  const navigationItems: any[] = [];

  return {
    users,
    workspaces,
    organizations,
    teams,
    teamMembers,
    projects: [],
    projectMembers: [],
    tasks: [],
    subtasks: [],
    wordpressChecklist: [],
    seoChecklist: [],
    contentCenter: [],
    qaBugs: [],
    files: [],
    notifications: [],
    externalApis: [],
    apiLogs: [],
    wpSites: [],
    wpLogs: [],
    wpWebhooks: [],
    comments: [],
    milestones: [],
    settings: {
      ownerEmail,
      theme: "dark",
      require2FA: false
    },
    auditLogs: [],
    conversations: [],
    conversationMembers: [],
    messages: [],
    conversationRequests: [],
    conversationPermissions: [],
    pinnedMessages: [],
    messageReactions: [],
    readReceipts: [],
    
    // Dynamic Org seeds
    departments,
    departmentMembers,
    departmentPermissions: [],
    departmentModules,
    departmentReports: [],
    departmentSettings: [],
    departmentChats: [],
    departmentChannels: [],
    departmentRoles: [],
    departmentTemplates: [],
    navigationGroups,
    navigationItems,
    moduleDefinitions,
    moduleInstances,
    modulePermissions: [],

    // Normalized System Owner Approvals & Identity tables
    approvalRequests: [],
    approvalHistory: [],
    notificationQueue: [],
    emailQueue: [],
    userProfiles: [],
    userSettings: [],
    userSessions: [],
    loginHistory: [],
    userDevices: [],
    securityEvents: [],
    profileImages: [],
    userPreferences: [],
    userActivities: []
  };
};

/*
  const organizations = [
    {
      id: "org_1",
      name: "آژانس دیجیتال مارکتینگ طهمورث",
      slug: "tahmores-agency",
      ownerId: "usr_owner",
      createdAt: new Date().toLocaleDateString('fa-IR')
    }
  ];

  const teams = [
    { id: "team_wp", orgId: "org_1", name: "توسعه وردپرس & وب‌سایت", leadId: "usr_owner" },
    { id: "team_seo", orgId: "org_1", name: "سئو و بهینه‌سازی موتورهای جستجو", leadId: "usr_owner" },
    { id: "team_content", orgId: "org_1", name: "تولید و استراتژی محتوا", leadId: "usr_pm" }
  ];

  const teamMembers = [
    { id: "tm_1", teamId: "team_wp", userId: "usr_owner", role: "Leader" },
    { id: "tm_2", teamId: "team_wp", userId: "usr_dev", role: "Senior Developer" },
    { id: "tm_3", teamId: "team_seo", userId: "usr_seo", role: "SEO Specialist" },
    { id: "tm_4", teamId: "team_content", userId: "usr_pm", role: "Content Manager" }
  ];

  const projects = [
    {
      id: "proj_honey",
      title: "پروژه طراحی و سئو فروشگاه عسل طبیعی مصفا",
      description: "طراحی پرتال فروشگاهی بر پایه ووکامرس، بهینه‌سازی سرعت لود در جی‌تی‌متریکس، و رتبه گرفتن روی کلمات کلیدی رقابتی عسل ارگانیک.",
      progress: 60,
      totalTasks: 5,
      completedTasks: 3,
      status: "CONNECTED_TO_WORDPRESS",
      startDate: "1405/01/15",
      deadline: "1405/06/30",
      budget: "۸۵,۰۰۰,۰۰۰ تومان",
      clientName: "کریمی - شرکت عسل مصفا",
      clientPortalEnabled: true,
      isPortalActive: true,
      clientPortalToken: "prj_token_honey_9x8f2a1",
      portalToken: "prj_token_honey_9x8f2a1",
      clientFeedbacks: [
        {
          id: "fb_1",
          projectId: "proj_honey",
          senderName: "رضا کریمی (کارفرما)",
          senderRole: "client",
          category: "design",
          message: "طرح اولیه فیگما عالی بود، فقط رنگ دکمه خرید در هدر کمی پررنگ‌تر شود تا در حالت موبایل خوانایی بیشتری داشته باشد.",
          status: "resolved",
          createdAt: "۱۴۰۵/۰۴/۱۰",
          attachments: []
        },
        {
          id: "fb_2",
          projectId: "proj_honey",
          senderName: "رضا کریمی (کارفرما)",
          senderRole: "client",
          category: "technical",
          message: "لطفاً در بستر درگاه پرداخت، قابلیت انصراف و بازگشت به سبد خرید تست شود.",
          status: "pending",
          createdAt: "۱۴۰۵/۰۴/۱۸",
          attachments: []
        }
      ]
    },
    {
      id: "proj_insurance",
      title: "پروژه پورتال شرکتی بیمه سامان شعبه مرکزی",
      description: "طراحی مجدد سایت، راه‌اندازی بخش استعلام آنلاین بیمه‌نامه‌ها، و بهینه‌سازی سئو تکنیکال نقشه سایت.",
      progress: 0,
      totalTasks: 2,
      completedTasks: 0,
      status: "ACTIVE",
      startDate: "1405/02/01",
      deadline: "1405/08/15",
      budget: "۱۲۰,۰۰۰,۰۰۰ تومان",
      clientName: "احمدی - نمایندگی بیمه سامان",
      clientPortalEnabled: true,
      isPortalActive: true,
      clientPortalToken: "prj_token_ins_3f7b9c",
      portalToken: "prj_token_ins_3f7b9c",
      clientFeedbacks: [
        {
          id: "fb_3",
          projectId: "proj_insurance",
          senderName: "سارا احمدی (کارفرما)",
          senderRole: "client",
          category: "content",
          message: "فایل متون معرفی خدمات بیمه مسئولیت به پیوست بریف اضافه شد.",
          status: "in_progress",
          createdAt: "۱۴۰۵/۰۴/۱۲"
        }
      ]
    },
    {
      id: "proj_taban",
      title: "بازطراحی وب‌سایت هلدینگ تجاری تابان",
      description: "بازطراحی قالب اختصاصی، دوزبانه کردن وب‌سایت، تنظیم CDN کلودفلر و تست‌های کامل کارایی و ریسپانسیو.",
      progress: 100,
      totalTasks: 3,
      completedTasks: 3,
      status: "COMPLETED",
      startDate: "1404/10/01",
      deadline: "1404/12/25",
      budget: "۶۵,۰۰۰,۰۰۰ تومان",
      clientName: "دکتر حسینی - هلدینگ تابان",
      clientPortalEnabled: false,
      isPortalActive: false,
      clientPortalToken: "prj_token_taban_7d2e4f",
      portalToken: "prj_token_taban_7d2e4f",
      clientFeedbacks: []
    }
  ];

  const projectMembers = [
    { id: "pm_1", projectId: "proj_honey", userId: "usr_owner" },
    { id: "pm_2", projectId: "proj_honey", userId: "usr_dev" },
    { id: "pm_3", projectId: "proj_honey", userId: "usr_seo" },
    { id: "pm_4", projectId: "proj_insurance", userId: "usr_pm" }
  ];

  const tasks = [
    {
      id: "task_1",
      projectId: "proj_honey",
      title: "طراحی اتود اولیه هوم‌پیج در فیگما",
      description: "آماده‌سازی پیش‌طرح گرافیکی هوم‌پیج و صفحه دسته‌بندی محصولات بر اساس هویت بصری کارفرما.",
      assignedTo: "علی طهمورث",
      priority: "high",
      status: "completed",
      department: "ui_ux",
      startDate: "1405/01/18",
      deadline: "1405/02/05",
      tags: ["Figma", "UI/UX", "طرح اولیه"],
      attachments: [],
      dependencies: []
    },
    {
      id: "task_2",
      projectId: "proj_honey",
      title: "نصب وردپرس و پیکربندی ووکامرس روی هاست ابری",
      description: "نصب آخرین نسخه هسته وردپرس، قالب اصلی و استقرار افزونه ووکامرس همراه با درگاه‌های بانکی عضو شتاب.",
      assignedTo: "امید رضایی",
      priority: "critical",
      status: "completed",
      department: "wp_dev",
      startDate: "1405/02/10",
      deadline: "1405/02/20",
      tags: ["WooCommerce", "WordPress", "استقرار"],
      attachments: [],
      dependencies: ["task_1"]
    },
    {
      id: "task_3",
      projectId: "proj_honey",
      title: "سئو تکنیکال و ساخت نقشه سایت داینامیک",
      description: "بهینه‌سازی فایل robots.txt، نصب و تنظیم افزونه رنک مث پرو، و ثبت سایت در سرچ کنسول گوگل.",
      assignedTo: "علی احمدی",
      priority: "medium",
      status: "inprogress",
      department: "seo",
      startDate: "1405/02/25",
      deadline: "1405/04/10",
      tags: ["RankMath", "SEO Technical", "Console"],
      attachments: [],
      dependencies: ["task_2"]
    },
    {
      id: "task_4",
      projectId: "proj_honey",
      title: "تولید ۳ مقاله تخصصی معرفی محصولات عسل ارگانیک",
      description: "نگارش مقالاتی با کلمات کلیدی هدف: عسل گون اصل، خرید عسل ارگانیک، تشخیص عسل طبیعی و آپلود در پنل وردپرس.",
      assignedTo: "مریم فرخی",
      priority: "medium",
      status: "inprogress",
      department: "content",
      startDate: "1405/03/01",
      deadline: "1405/03/25",
      tags: ["تولید محتوا", "عسل طبیعی", "وبلاگ"],
      attachments: [],
      dependencies: []
    },
    {
      id: "task_5",
      projectId: "proj_honey",
      title: "تست ریسپانسیو و بررسی فرم‌های تماس در موبایل",
      description: "بررسی تمام صفحات روی آیفون، اندروید و تبلت جهت همسانی نمایش فونت‌ها و دکمه‌های فراخوانی به اقدام.",
      assignedTo: "امید رضایی",
      priority: "low",
      status: "pending",
      department: "qa",
      startDate: "1405/03/15",
      deadline: "1405/04/01",
      tags: ["QA Testing", "Responsive", "Forms"],
      attachments: [],
      dependencies: ["task_2"]
    }
  ];

  const wordpressChecklist = [
    {
      id: "wp_ch_1",
      category: "hosting",
      name: "خرید هاست لینوکس ابری NVMe ایران با وب‌سرور لایت‌اسپید",
      status: "completed",
      owner: "امید رضایی",
      dueDate: "1405/01/20",
      notes: "با مشخصات ۸ گیگ رم و پهنای باند نامحدود تهیه و فعال شد.",
      progress: 100
    },
    {
      id: "wp_ch_2",
      category: "dns",
      name: "اتصال دامنه به سرویس ابری کلودفلر و ثبت رکوردهای CDN",
      status: "completed",
      owner: "علی طهمورث",
      dueDate: "1405/01/22",
      notes: "دی‌ان‌اس‌ها روی کلودفلر ست شده و پراکسی نارنجی فعال گردید.",
      progress: 100
    },
    {
      id: "wp_ch_3",
      category: "security",
      name: "نصب افزونه امنیتی وردفنس (Wordfence Security) و کانفیگ فایروال بومی",
      status: "inprogress",
      owner: "امید رضایی",
      dueDate: "1405/03/30",
      notes: "افزونه نصب شده است. اسکنر فایروال در حال بهینه‌سازی لاگ‌های کاذب است.",
      progress: 50
    },
    {
      id: "wp_ch_4",
      category: "performance",
      name: "تنظیم افزونه کش لایت‌اسپید (LiteSpeed Cache) و بهینه‌سازی کدهای CSS/JS",
      status: "inprogress",
      owner: "امید رضایی",
      dueDate: "1405/04/05",
      notes: "سیستم مینیفای کدهای استایل انجام شد. کدهای جی‌اس در دست تاخیرگذاری هستند.",
      progress: 75
    },
    {
      id: "wp_ch_5",
      category: "testing",
      name: "تست سرعت و رتبه GTmetrix و رفع ارورهای بارگذاری فونت و تصاویر",
      status: "pending",
      owner: "امید رضایی",
      dueDate: "1405/04/15",
      notes: "پس از اتمام بهینه‌سازی کامل کش لایت‌اسپید اجرا می‌شود.",
      progress: 0
    }
  ];

  const seoChecklist = [
    {
      id: "seo_ch_1",
      category: "search_console",
      name: "ثبت وب‌سایت در گوگل سرچ کنسول و تایید مالکیت از طریق رکورد TXT دی‌ان‌اس",
      priority: "high",
      assignedTo: "علی احمدی",
      status: "completed",
      progress: 100,
      dueDate: "1405/01/30",
      metrics: { label: "تعداد کلیک روزانه", value: "۴۵ کلیک", trend: "up" }
    },
    {
      id: "seo_ch_2",
      category: "schema",
      name: "پیاده‌سازی کدهای اسکیما ارگانیک (Organization & Product Schema) روی تمامی محصولات و مقالات",
      priority: "high",
      assignedTo: "علی احمدی",
      status: "inprogress",
      progress: 40,
      dueDate: "1405/04/20",
      metrics: { label: "اسکیماهای فعال", value: "۳ اسکیما", trend: "neutral" }
    },
    {
      id: "seo_ch_3",
      category: "keywords",
      name: "تحقیق جامع کلمات کلیدی، استخراج رقبا و تدوین کیورد تارگتینگ فروشگاه",
      priority: "critical",
      assignedTo: "علی احمدی",
      status: "completed",
      progress: 100,
      dueDate: "1405/02/10",
      metrics: { label: "کلمات کلیدی هدف", value: "۶۸ کلمه", trend: "up" }
    }
  ];

  const contentCenter = [
    {
      id: "cont_1",
      pageName: "صفحه درباره ما و معرفی کارگاه عسل مصفا",
      status: "approved",
      writer: "مریم فرخی",
      reviewer: "علی طهمورث",
      approvalStatus: "approved",
      deadline: "1405/02/15",
      attachments: ["doc_about_us.docx"],
      contentBody: "متن کامل صفحه درباره ما با تمرکز بر اصالت عسل‌های طبیعی دامنه‌های سبلان و تاییدیه آزمایشگاهی با موفقیت نگارش شد و پس از بررسی توسط مدیریت تایید نهایی گردید."
    },
    {
      id: "cont_2",
      pageName: "بلاگ‌پست جامع «۱۰ روش علمی تشخیص عسل طبیعی و تقلبی»",
      status: "writing",
      writer: "مریم فرخی",
      reviewer: "علی طهمورث",
      approvalStatus: "pending",
      deadline: "1405/03/28",
      attachments: [],
      contentBody: "این محتوا با هدف جذب ترافیک ارگانیک بر روی کلمه کلیدی تشخیص عسل طبیعی در حال نگارش است و شامل جدول مقایسه‌ای غلظت و تست آب گرم می‌باشد."
    }
  ];

  const qaBugs = [
    {
      id: "bug_1",
      title: "لینک اینستاگرام و تلگرام در فوتر سایت آدرس اشتباه دارد",
      category: "forms",
      priority: "medium",
      assignedTo: "امید رضایی",
      status: "pending",
      fixVersion: "v1.0.1",
      dateLogged: "1405/03/02"
    },
    {
      id: "bug_2",
      title: "عدم نمایش درست فونت بومی ایران‌سنس در سافاری مک‌بوک و آیفون",
      category: "responsive",
      priority: "high",
      assignedTo: "امید رضایی",
      status: "inprogress",
      fixVersion: "v1.0.2",
      dateLogged: "1405/03/10"
    }
  ];

  const files = [
    {
      id: "file_1",
      name: "logo_masafa_honey_main.png",
      category: "logo",
      size: "450 KB",
      uploadDate: "1405/01/16",
      version: 1,
      tag: "لوگو اصلی شرکت",
      uploadedById: "usr_owner",
      projectId: "proj_honey"
    },
    {
      id: "file_2",
      name: "seo_analytics_report_q1.pdf",
      category: "seo",
      size: "2.1 MB",
      uploadDate: "1405/02/28",
      version: 1,
      tag: "گزارش سئو سه ماهه اول",
      uploadedById: "usr_seo",
      projectId: "proj_honey"
    }
  ];

  const notifications = [
    {
      id: "notif_1",
      title: "اتصال موفق به هاب وردپرس",
      description: "وب‌سایت عسل مصفا با آدرس honey-store.com با موفقیت به گیت‌وی پورتال سینک شد.",
      timestamp: "هم‌اکنون",
      read: false,
      type: "project_updated"
    },
    {
      id: "notif_2",
      title: "تکمیل وظیفه حساس در پروژه",
      description: "وظیفه «نصب وردپرس و پیکربندی ووکامرس روی هاست ابری» توسط امید رضایی تکمیل شد.",
      timestamp: "۳ ساعت پیش",
      read: false,
      type: "task_completed"
    }
  ];

  const wpSites = [
    {
      projectId: "proj_honey",
      siteUrl: "https://honey-store.com",
      siteName: "فروشگاه عسل طبیعی مصفا",
      wpVersion: "6.5.3",
      phpVersion: "8.1.25",
      themeName: "Flatsome Theme",
      themeVersion: "3.18.2",
      serverType: "LiteSpeed/Enterprise",
      sslStatus: "فعال (Let's Encrypt SSL Secure)",
      dnsStatus: "مستقر روی کلودفلر CDN",
      installedThemes: ["Flatsome", "Flatsome Child", "Twenty Twenty-Four"],
      installedPlugins: [
        { name: "Elementor Pro", version: "3.21.0", active: true },
        { name: "WooCommerce", version: "8.9.0", active: true },
        { name: "Rank Math Pro", version: "1.0.220", active: true },
        { name: "LiteSpeed Cache", version: "6.1.0", active: true }
      ],
      pagesCount: 14,
      postsCount: 8,
      productsCount: 45,
      mediaCount: 154,
      rankMathStatus: "فعال (XML Sitemap Dynamic)",
      yoastStatus: "غیرفعال",
      sitemapStatus: "فعال شده و ثبت شده در سرچ کنسول",
      robotsTxtStatus: "استاندارد ربات گوگل فعال",
      cacheStatus: "فعال (Object cache + HTML Page optimal)",
      optimizationStatus: "کدهای CSS و JS فشرده و بهینه‌سازی شده",
      securityPluginStatus: "فعال (ردیاب امنیتی لایت‌اسپید)",
      backupStatus: "فعال (تهیه بک‌آپ هفتگی خودکار روی سرور خارجی)",
      lastSynced: "هم‌اکنون",
      connectionStatus: "connected",
      apiKey: "wpsync_sec_key_masafa786x",
      performanceMetrics: {
        responseTimeMs: 145,
        cpuLoadPercent: 8,
        memoryUsagePercent: 32
      }
    }
  ];

  const wpLogs = [
    {
      id: "log_wp_1",
      timestamp: "1405/03/14 12:45:10",
      siteName: "فروشگاه عسل طبیعی مصفا",
      siteUrl: "https://honey-store.com",
      type: "sync",
      status: "success",
      detail: "همگام‌سازی دوره‌ای افزونه وردپرس با موفقیت تایید شد. ۱۴ برگه، ۸ نوشته و ۴۵ محصول همگام هستند."
    }
  ];

  const wpWebhooks: any[] = [];
  const externalApis: any[] = [];
  const apiLogs: any[] = [];
  const subtasks: any[] = [];
  const auditLogs: any[] = [];
  const comments: any[] = [];
  const milestones: any[] = [];

  return {
    users,
    organizations,
    teams,
    teamMembers,
    projects,
    projectMembers,
    tasks,
    subtasks,
    wordpressChecklist,
    seoChecklist,
    contentCenter,
    qaBugs,
    files,
    notifications,
    externalApis,
    apiLogs,
    wpSites,
    wpLogs,
    wpWebhooks,
    comments,
    milestones,
    settings: {
      ownerEmail,
      theme: "dark",
      require2FA: false
    },
    auditLogs
  };
};
*/

// Global DB helper class
export class DbService {
  private static instance: DbService | null = null;
  private state: DatabaseSchema | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  private init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.state = JSON.parse(raw);
        
        // Auto-initialize missing collections for backward compatibility
        const tables = [
          'users', 'organizations', 'teams', 'teamMembers', 'projects', 'projectMembers',
          'tasks', 'subtasks', 'wordpressChecklist', 'seoChecklist', 'contentCenter',
          'qaBugs', 'files', 'notifications', 'externalApis', 'apiLogs', 'wpSites',
          'wpLogs', 'wpWebhooks', 'comments', 'milestones', 'auditLogs', 'conversations',
          'conversationMembers', 'messages', 'conversationRequests', 'conversationPermissions',
          'pinnedMessages', 'messageReactions', 'readReceipts', 'departments', 'departmentMembers',
          'departmentPermissions', 'departmentModules', 'departmentReports', 'departmentSettings',
          'departmentChats', 'departmentChannels', 'departmentRoles', 'departmentTemplates',
          'navigationGroups', 'navigationItems', 'moduleDefinitions', 'moduleInstances', 'modulePermissions',
          'approvalRequests', 'approvalHistory', 'notificationQueue', 'emailQueue',
          'userProfiles', 'userSettings', 'userSessions', 'loginHistory', 'userDevices',
          'securityEvents', 'profileImages', 'userPreferences', 'userActivities'
        ];
        
        tables.forEach(table => {
          if (!this.state![table as keyof DatabaseSchema]) {
            (this.state as any)[table] = [];
          }
        });

        // IMMORTAL OWNER & DUMMY PURGE GUARANTEE
        const ownerEmail = "alitahmores343412@gmail.com";
        const dummyEmailPatterns = ["alitahmores00", "milad@", "test@", "dummy", "demo@"];

        // 1. Purge dummy/mock accounts
        const purgedUserIds = new Set<string>();
        this.state.users = (this.state.users || []).filter(u => {
          const emailLower = (u.email || '').toLowerCase().trim();
          const isDummy = dummyEmailPatterns.some(pattern => emailLower.includes(pattern)) ||
            (u.id && u.id.startsWith("usr_1787219935059")) ||
            (u.name === "کاربر آزمایشی");
          if (isDummy) {
            purgedUserIds.add(u.id);
            return false;
          }
          return true;
        });

        // Clean up orphaned workspaces, sessions, and logs for purged users
        if (purgedUserIds.size > 0) {
          this.state.workspaces = (this.state.workspaces || []).filter(ws => !purgedUserIds.has(ws.ownerId));
          this.state.userProfiles = (this.state.userProfiles || []).filter(p => !purgedUserIds.has(p.userId));
          this.state.userSessions = (this.state.userSessions || []).filter(s => !purgedUserIds.has(s.userId));
          this.state.loginHistory = (this.state.loginHistory || []).filter(l => !purgedUserIds.has(l.userId));
          this.state.userDevices = (this.state.userDevices || []).filter(d => !purgedUserIds.has(d.userId));
          this.state.securityEvents = (this.state.securityEvents || []).filter(e => !purgedUserIds.has(e.userId));
          this.state.userPreferences = (this.state.userPreferences || []).filter(pr => !purgedUserIds.has(pr.userId));
        }

        // 2. Ensure Immortal SuperAdmin / Owner exists
        let masterUser = this.state.users.find(u => (u.email && u.email.toLowerCase().trim() === ownerEmail) || u.id === "usr_master_alitahmores" || u.id === "usr_owner");
        const hashedPassword = masterUser?.passwordHash || bcryptjs.hashSync("123456", 10);

        if (!masterUser) {
          masterUser = {
            id: "usr_master_alitahmores",
            email: ownerEmail,
            username: "alitahmores",
            passwordHash: hashedPassword,
            name: "علی طهمورث",
            phone: "09123456789",
            role: "OWNER",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores",
            status: "ACTIVE",
            personalWorkspaceId: "ws_alitahmores_primary",
            memberships: [
              {
                workspaceId: "ws_alitahmores_primary",
                workspaceName: "فضای کاری علی طهمورث",
                role: "OWNER",
                permissions: ["all"],
                joinedAt: new Date().toISOString()
              }
            ],
            createdAt: new Date().toLocaleDateString('fa-IR'),
            workspace: "ws_alitahmores_primary"
          };
          this.state.users.unshift(masterUser);
        } else {
          // Normalize and protect immortal fields
          masterUser.id = "usr_master_alitahmores";
          masterUser.email = ownerEmail;
          masterUser.username = "alitahmores";
          masterUser.name = "علی طهمورث";
          masterUser.phone = "09123456789";
          masterUser.role = "OWNER";
          masterUser.status = "ACTIVE";
          masterUser.avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores";
          masterUser.personalWorkspaceId = "ws_alitahmores_primary";
          if (!masterUser.memberships || masterUser.memberships.length === 0) {
            masterUser.memberships = [
              {
                workspaceId: "ws_alitahmores_primary",
                workspaceName: "فضای کاری علی طهمورث",
                role: "OWNER",
                permissions: ["all"],
                joinedAt: new Date().toISOString()
              }
            ];
          }
        }

        // 3. Ensure Immortal Workspace exists
        let masterWorkspace = this.state.workspaces.find(ws => ws.id === "ws_alitahmores_primary" || ws.id === "ws_primary_owner" || ws.ownerId === "usr_master_alitahmores");
        if (!masterWorkspace) {
          masterWorkspace = {
            id: "ws_alitahmores_primary",
            name: "فضای کاری علی طهمورث",
            ownerId: "usr_master_alitahmores",
            inviteCode: "ORBITMASTER",
            members: [
              {
                userId: "usr_master_alitahmores",
                role: "OWNER",
                permissions: ["all"],
                joinedAt: new Date().toISOString(),
                name: "علی طهمورث",
                username: "alitahmores",
                email: ownerEmail,
                phone: "09123456789",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"
              }
            ],
            createdAt: "1405/01/01"
          };
          this.state.workspaces.unshift(masterWorkspace);
        } else {
          masterWorkspace.id = "ws_alitahmores_primary";
          masterWorkspace.name = "فضای کاری علی طهمورث";
          masterWorkspace.ownerId = "usr_master_alitahmores";
          masterWorkspace.inviteCode = masterWorkspace.inviteCode || "ORBITMASTER";
          if (!masterWorkspace.members || masterWorkspace.members.length === 0) {
            masterWorkspace.members = [
              {
                userId: "usr_master_alitahmores",
                role: "OWNER",
                permissions: ["all"],
                joinedAt: new Date().toISOString(),
                name: "علی طهمورث",
                username: "alitahmores",
                email: ownerEmail,
                phone: "09123456789",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alitahmores"
              }
            ];
          }
        }

        this.save();
        
        console.log(`Database loaded successfully from ${DB_PATH} with ${this.state?.users.length} users.`);
      } else {
        console.log(`No database file found. Provisioning fresh relational seed data to ${DB_PATH}...`);
        const seed = getSeedData();
        this.state = seed;
        this.save();
      }
    } catch (err) {
      console.error("Database initialization failed. Recovering with seed...", err);
      this.state = getSeedData();
      this.save();
    }
  }

  public save() {
    try {
      if (this.state) {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf8');
      }
    } catch (err) {
      console.error("Failed to persist database state to file:", err);
    }
  }

  public persist() {
    this.save();
  }

  // --- GENERIC STATE GETTERS ---
  public getState(): DatabaseSchema {
    if (!this.state) {
      this.init();
    }
    return this.state!;
  }

  // --- AUTH / USER METHODS ---
  public getUsers() {
    return this.getState().users;
  }

  public findUserById(id: string) {
    return this.getUsers().find(u => u.id === id);
  }

  public findUserByEmail(email: string) {
    if (!email) return undefined;
    return this.getUsers().find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public createUser(userData: any) {
    const db = this.getState();
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error("EMAIL_TAKEN");
    }

    const assignedRole = isOwnerEmail(userData.email) ? "OWNER" : (userData.role || "USER");

    const newUser = {
      id: userData.id || `usr_${Date.now()}`,
      email: userData.email,
      passwordHash: userData.password ? bcryptjs.hashSync(userData.password, 10) : userData.passwordHash,
      name: userData.name,
      phone: userData.phone || "",
      role: assignedRole,
      avatar: userData.name ? userData.name.substring(0, 1) : "ک",
      status: "offline",
      createdAt: new Date().toLocaleDateString('fa-IR'),
      workspace: null
    };

    db.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserRole(userId: string, role: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    user.role = role;
    this.save();
    return user;
  }

  public updateUserWorkspace(userId: string, workspace: any) {
    const user = this.findUserById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    user.workspace = workspace;
    this.save();
    return user;
  }

  // --- PROJECTS ---
  public getProjects() {
    return this.getState().projects;
  }

  public getProjectsForUser(user: any) {
    const all = this.getProjects();
    if (!user) return all;
    return all.filter(p => canUserAccessProject(user, p));
  }

  public findProjectById(id: string) {
    return this.getProjects().find(p => p.id === id);
  }

  public createProject(projectData: any) {
    const db = this.getState();
    const teamLead = projectData.teamLead || projectData.teamLeadId || "";
    const teamLeadId = projectData.teamLeadId || projectData.teamLead || "";
    const assignedMemberIds = Array.isArray(projectData.assignedMemberIds)
      ? projectData.assignedMemberIds
      : Array.isArray(projectData.assignedMembers)
      ? projectData.assignedMembers
      : (teamLeadId ? [teamLeadId] : []);
    const assignedTeamIds = Array.isArray(projectData.assignedTeamIds) ? projectData.assignedTeamIds : [];
    const createdById = projectData.createdById || "admin";

    const newProj = {
      id: `proj_${Date.now()}`,
      title: projectData.title,
      description: projectData.description || "",
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      status: projectData.status || "ACTIVE",
      startDate: projectData.startDate && projectData.startDate !== "—" ? projectData.startDate : new Date().toLocaleDateString('fa-IR'),
      deadline: projectData.deadline || "1405/06/01",
      budget: projectData.budget || "ناشخص",
      clientName: projectData.clientName || "بدون کارفرما",
      websiteUrl: projectData.websiteUrl || "",
      teamLead,
      teamLeadId,
      assignedMemberIds,
      assignedTeamIds,
      createdById,
      isBudgetConfidential: !!projectData.isBudgetConfidential,
      clientPortalEnabled: true,
      isPortalActive: true
    };
    db.projects.push(newProj);
    this.save();
    return newProj;
  }

  public updateProject(id: string, updates: any) {
    const proj = this.findProjectById(id);
    if (!proj) throw new Error("PROJECT_NOT_FOUND");
    if (updates.teamLead && !updates.teamLeadId) {
      updates.teamLeadId = updates.teamLead;
    }
    if (updates.teamLeadId && !updates.teamLead) {
      updates.teamLead = updates.teamLeadId;
    }
    Object.assign(proj, updates);
    this.save();
    return proj;
  }

  // --- TASKS ---
  public getTasks() {
    return this.getState().tasks;
  }

  public findTaskById(id: string) {
    return this.getTasks().find(t => t.id === id);
  }

  public createTask(taskData: any) {
    const db = this.getState();
    const newTask = {
      id: `task_${Date.now()}`,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description || "",
      assignedTo: taskData.assignedTo || "امید رضایی",
      priority: taskData.priority || "medium",
      status: taskData.status || "pending",
      department: taskData.department || "wp_dev",
      startDate: taskData.startDate || new Date().toLocaleDateString('fa-IR'),
      deadline: taskData.deadline || "1405/04/01",
      tags: taskData.tags || [],
      attachments: taskData.attachments || [],
      dependencies: taskData.dependencies || []
    };
    db.tasks.push(newTask);
    this.recalculateProjectStats(taskData.projectId);
    this.save();
    return newTask;
  }

  public updateTask(id: string, updates: any) {
    const task = this.findTaskById(id);
    if (!task) throw new Error("TASK_NOT_FOUND");
    Object.assign(task, updates);
    this.recalculateProjectStats(task.projectId);
    this.save();
    return task;
  }

  public deleteTask(id: string) {
    const db = this.getState();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx < 0) throw new Error("TASK_NOT_FOUND");
    const deleted = db.tasks.splice(idx, 1)[0];
    this.recalculateProjectStats(deleted.projectId);
    this.save();
    return deleted;
  }

  private recalculateProjectStats(projectId: string) {
    const db = this.getState();
    const proj = db.projects.find(p => p.id === projectId);
    if (!proj) return;

    const projTasks = db.tasks.filter(t => t.projectId === projectId);
    proj.totalTasks = projTasks.length;
    proj.completedTasks = projTasks.filter(t => t.status === 'completed').length;
    proj.progress = projTasks.length > 0 ? Math.round((proj.completedTasks / proj.totalTasks) * 100) : 0;
  }

  // --- WORDPRESS CHECKLIST ---
  public getWordPressChecklist() {
    return this.getState().wordpressChecklist;
  }

  public findWordPressChecklistItemById(id: string) {
    return this.getWordPressChecklist().find(w => w.id === id);
  }

  public updateWordPressChecklistItem(id: string, updates: any) {
    const item = this.findWordPressChecklistItemById(id);
    if (!item) throw new Error("CHECKLIST_ITEM_NOT_FOUND");
    Object.assign(item, updates);
    this.save();
    return item;
  }

  // --- SEO CHECKLIST ---
  public getSeoChecklist() {
    return this.getState().seoChecklist;
  }

  public findSeoChecklistItemById(id: string) {
    return this.getSeoChecklist().find(s => s.id === id);
  }

  public updateSeoChecklistItem(id: string, updates: any) {
    const item = this.findSeoChecklistItemById(id);
    if (!item) throw new Error("CHECKLIST_ITEM_NOT_FOUND");
    Object.assign(item, updates);
    this.save();
    return item;
  }

  // --- CONTENT CENTER ---
  public getContentCenter() {
    return this.getState().contentCenter;
  }

  public findContentItemById(id: string) {
    return this.getContentCenter().find(c => c.id === id);
  }

  public createContentItem(itemData: any) {
    const db = this.getState();
    const newItem = {
      id: `cont_${Date.now()}`,
      pageName: itemData.pageName || "صفحه بدون عنوان",
      status: itemData.status || "writing",
      writer: itemData.writer || "مریم فرخی",
      reviewer: itemData.reviewer || "علی طهمورث",
      approvalStatus: itemData.approvalStatus || "pending",
      deadline: itemData.deadline || "1405/03/30",
      attachments: itemData.attachments || [],
      contentBody: itemData.contentBody || ""
    };
    db.contentCenter.push(newItem);
    this.save();
    return newItem;
  }

  public updateContentItem(id: string, updates: any) {
    const item = this.findContentItemById(id);
    if (!item) throw new Error("CONTENT_NOT_FOUND");
    Object.assign(item, updates);
    this.save();
    return item;
  }

  // --- QA BUGS ---
  public getQaBugs() {
    return this.getState().qaBugs;
  }

  public findQaBugById(id: string) {
    return this.getQaBugs().find(q => q.id === id);
  }

  public createQaBug(bugData: any) {
    const db = this.getState();
    const newBug = {
      id: `bug_${Date.now()}`,
      title: bugData.title || "باگ بدون نام",
      category: bugData.category || "responsive",
      priority: bugData.priority || "high",
      assignedTo: bugData.assignedTo || "امید رضایی",
      status: bugData.status || "pending",
      fixVersion: bugData.fixVersion || "v1.0.0",
      dateLogged: new Date().toLocaleDateString('fa-IR')
    };
    db.qaBugs.push(newBug);
    this.save();
    return newBug;
  }

  public updateQaBug(id: string, updates: any) {
    const bug = this.findQaBugById(id);
    if (!bug) throw new Error("BUG_NOT_FOUND");
    Object.assign(bug, updates);
    this.save();
    return bug;
  }

  // --- NOTIFICATIONS ---
  public getNotifications() {
    return this.getState().notifications;
  }

  public createNotification(title: string, description: string, type = "project_updated") {
    const db = this.getState();
    const newNotif = {
      id: `notif_${Date.now()}`,
      title,
      description,
      timestamp: "هم‌اکنون",
      read: false,
      type
    };
    db.notifications.unshift(newNotif);
    if (db.notifications.length > 50) db.notifications.pop();
    this.save();
    return newNotif;
  }

  public clearNotifications() {
    const db = this.getState();
    db.notifications = [];
    this.save();
  }

  // --- FILES ---
  public getFiles() {
    return this.getState().files;
  }

  public findFileById(id: string) {
    return this.getFiles().find(f => f.id === id);
  }

  public saveFileAsset(fileData: any) {
    const db = this.getState();
    const newFile = {
      id: `file_${Date.now()}`,
      name: fileData.name,
      category: fileData.category || "documents",
      size: fileData.size || "100 KB",
      uploadDate: new Date().toLocaleDateString('fa-IR'),
      version: 1,
      tag: fileData.tag || "",
      uploadedById: fileData.uploadedById || "usr_owner",
      projectId: fileData.projectId || ""
    };
    db.files.push(newFile);
    this.save();
    return newFile;
  }

  public deleteFileAsset(id: string) {
    const db = this.getState();
    const idx = db.files.findIndex(f => f.id === id);
    if (idx < 0) throw new Error("FILE_NOT_FOUND");
    const deleted = db.files.splice(idx, 1)[0];
    this.save();
    return deleted;
  }

  // --- WORDPRESS METRICS & HUBS ---
  public getWpSites() {
    return this.getState().wpSites;
  }

  public findWpSiteByProjectId(projectId: string) {
    return this.getWpSites().find(s => s.projectId === projectId);
  }

  public findWpSiteByUrl(url: string) {
    return this.getWpSites().find(s => s.siteUrl.includes(url));
  }

  public registerWpSite(siteData: any) {
    const db = this.getState();
    const existingIdx = db.wpSites.findIndex(s => s.projectId === siteData.projectId || s.siteUrl === siteData.siteUrl);
    
    const newSite = {
      projectId: siteData.projectId,
      siteUrl: siteData.siteUrl,
      siteName: siteData.siteName || "پورتال وردپرس نوپا",
      wpVersion: siteData.wpVersion || "6.5.3",
      phpVersion: siteData.phpVersion || "8.1.0",
      themeName: siteData.themeName || "Astra Theme",
      themeVersion: siteData.themeVersion || "4.1.0",
      serverType: siteData.serverType || "Apache/LiteSpeed",
      sslStatus: siteData.sslStatus || "فعال (Let's Encrypt)",
      dnsStatus: "مستقر روی کلودفلر CDN",
      installedThemes: siteData.installedThemes || [siteData.themeName || "Astra Theme", "Twenty Twenty-Four"],
      installedPlugins: siteData.installedPlugins || [
        { name: "Elementor Pro", version: "3.21.0", active: true },
        { name: "WooCommerce", version: "8.9.0", active: true }
      ],
      pagesCount: siteData.pagesCount || 5,
      postsCount: siteData.postsCount || 1,
      productsCount: siteData.productsCount || 0,
      mediaCount: siteData.mediaCount || 12,
      rankMathStatus: siteData.rankMathStatus || "فعال",
      yoastStatus: siteData.yoastStatus || "غیرفعال",
      sitemapStatus: "فعال",
      robotsTxtStatus: "فعال",
      cacheStatus: "فعال",
      optimizationStatus: "بهینه‌سازی کامل",
      securityPluginStatus: "فعال (Wordfence)",
      backupStatus: "فعال (UpdraftPlus)",
      lastSynced: "هم‌اکنون",
      connectionStatus: "connected",
      apiKey: siteData.apiKey || `wpsync_${Math.random().toString(36).substring(2, 8)}`,
      performanceMetrics: siteData.performanceMetrics || {
        responseTimeMs: 140,
        cpuLoadPercent: 6,
        memoryUsagePercent: 28
      }
    };

    if (existingIdx >= 0) {
      db.wpSites[existingIdx] = { ...db.wpSites[existingIdx], ...newSite, connectionStatus: 'connected' };
    } else {
      db.wpSites.unshift(newSite);
    }
    this.save();
    return newSite;
  }

  public disconnectWpSite(projectId: string) {
    const db = this.getState();
    const site = db.wpSites.find(s => s.projectId === projectId);
    if (!site) throw new Error("NOT_FOUND");
    site.connectionStatus = 'disconnected';
    site.lastSynced = "قطع اتصال شده";
    this.save();
    return site;
  }

  public syncWpSite(projectId: string, payload: any) {
    const db = this.getState();
    const site = db.wpSites.find(s => s.projectId === projectId);
    if (!site) throw new Error("NOT_FOUND");
    Object.assign(site, payload, {
      lastSynced: "هم‌اکنون",
      connectionStatus: 'connected'
    });
    this.save();
    return site;
  }

  // --- LOGS AND WEBHOOKS ---
  public getWpLogs() {
    return this.getState().wpLogs;
  }

  public saveWpLog(logData: any) {
    const db = this.getState();
    const newLog = {
      id: `log_wp_${Date.now()}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      siteName: logData.siteName,
      siteUrl: logData.siteUrl,
      type: logData.type,
      status: logData.status || "success",
      detail: logData.detail
    };
    db.wpLogs.unshift(newLog);
    if (db.wpLogs.length > 100) db.wpLogs.pop();
    this.save();
    return newLog;
  }

  public getWpWebhooks() {
    return this.getState().wpWebhooks;
  }

  public saveWpWebhook(whData: any) {
    const db = this.getState();
    const newWh = {
      id: `wh_${Date.now()}`,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      siteUrl: whData.siteUrl,
      event: whData.event,
      payload: whData.payload || {}
    };
    db.wpWebhooks.unshift(newWh);
    if (db.wpWebhooks.length > 100) db.wpWebhooks.pop();
    this.save();
    return newWh;
  }

  // --- EXTERNAL APIS ---
  public getExternalConnections() {
    return this.getState().externalApis;
  }

  public saveExternalConnection(connData: any) {
    const db = this.getState();
    const newConn = {
      id: `api_conn_${Date.now()}`,
      name: connData.name,
      endpointUrl: connData.endpointUrl,
      apiType: connData.apiType || "REST",
      authType: connData.authType || "ApiKey",
      credentials: connData.credentials || "masked_secret_key_xxxxxx",
      status: "active",
      healthState: "healthy",
      lastPing: "کمتر از ۱ دقیقه"
    };
    db.externalApis.push(newConn);
    this.save();
    return newConn;
  }

  public toggleExternalConnection(id: string) {
    const db = this.getState();
    const conn = db.externalApis.find(c => c.id === id);
    if (!conn) throw new Error("NOT_FOUND");
    conn.status = conn.status === "active" ? "disabled" : "active";
    conn.healthState = conn.status === "active" ? "healthy" : "offline";
    this.save();
    return conn;
  }

  // --- API LOGS ---
  public getApiLogs() {
    return this.getState().apiLogs;
  }

  public saveApiLog(logData: any) {
    const db = this.getState();
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      method: logData.method,
      endpoint: logData.endpoint,
      status: logData.status,
      payload: logData.payload,
      response: logData.response || {}
    };
    db.apiLogs.unshift(newLog);
    if (db.apiLogs.length > 50) db.apiLogs.pop();
    this.save();
    return newLog;
  }

  public clearApiLogs() {
    const db = this.getState();
    db.apiLogs = [];
    this.save();
  }
}
