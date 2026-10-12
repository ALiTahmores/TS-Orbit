import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { getSocket } from '../lib/socket';
import { notifyStandaloneMode } from '../lib/api';
import { 
  Project, 
  Task, 
  TeamMember, 
  Client, 
  ClientFeedback,
  WordPressChecklistItem, 
  SeoChecklistItem, 
  ContentItem, 
  QaBug, 
  FileAsset, 
  AppNotification,
  ApiLog,
  TaskStatus,
  TaskPriority,
  DepartmentKey,
  WordPressSyncData,
  TriggerType,
  AutomationCondition,
  AutomationAction,
  AutomationRule,
  AutomationLog,
  ActivityLog,
  ActivityIntelMetrics,
  ReadinessScoreCategory,
  DynamicModule,
  User,
  Workspace,
  DepartmentReport,
  Report,
  NotificationItem,
  ToastAction
} from '../types';
import { canUserAccessProject, canUserAccessNotification } from '../utils/helpers';
import { 
  INITIAL_PROJECTS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_TASKS, 
  INITIAL_CLIENTS, 
  INITIAL_WP_CHECKLIST, 
  INITIAL_SEO_CHECKLIST, 
  INITIAL_CONTENT_CENTER, 
  INITIAL_QA_BUGS, 
  INITIAL_FILES, 
  INITIAL_NOTIFICATIONS,
  INITIAL_WP_SITES,
  INITIAL_AUTOMATION_RULES,
  INITIAL_AUTOMATION_LOGS
} from '../data/mockData';
import { INITIAL_USERS, INITIAL_WORKSPACES } from '../services/db';
import { Locale, getTranslation } from '../lib/i18n';
export { INITIAL_USERS, INITIAL_WORKSPACES } from '../services/db';

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === '') {
      return fallback;
    }
    const parsed = JSON.parse(item);
    return parsed;
  } catch (error) {
    console.warn(`[Storage] Failed to read ${key}:`, error);
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[Storage] Failed to write ${key}:`, error);
  }
}

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  clients: Client[];
  wpChecklist: WordPressChecklistItem[];
  seoChecklist: SeoChecklistItem[];
  contentCenter: ContentItem[];
  qaBugs: QaBug[];
  files: FileAsset[];
  notifications: AppNotification[];
  apiLogs: ApiLog[];
  activityLogs: ActivityLog[];
  wpSites: WordPressSyncData[];
  
  // Active states
  selectedProject: Project;
  setSelectedProject: (project: Project) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
  
  // Global Create Project Modal State
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  openNewProjectModal: () => void;
  
  // Loading & Operations state
  isLoaded: boolean;
  isLoading: boolean;
  operationStatus: 'idle' | 'success' | 'error' | 'loading';
  setOperationStatus: (status: 'idle' | 'success' | 'error' | 'loading') => void;
  
  // Global search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Real "API-Ready" Mutations
  deleteProject: (projectId: string) => Promise<void>;
  resetDatabaseToZero: () => void;
  createProject: (title: string, description: string, budget?: string, deadline?: string, clientName?: string, websiteUrl?: string, teamLead?: string, isBudgetConfidential?: boolean, extraData?: { teamLeadId?: string; assignedMemberIds?: string[]; assignedTeamIds?: string[]; createdById?: string }) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addTeamMember: (memberData: Omit<TeamMember, 'id'> & { id?: string }) => Promise<TeamMember>;
  
  // WordPress checklist actions
  updateWpChecklistItem: (itemId: string, updates: Partial<WordPressChecklistItem>) => Promise<void>;
  
  // SEO checklist actions
  updateSeoChecklistItem: (itemId: string, updates: Partial<SeoChecklistItem>) => Promise<void>;
  
  // Content actions
  updateContentStatus: (contentId: string, status: ContentItem['status'], approval?: ContentItem['approvalStatus']) => Promise<void>;
  createContentItem: (item: Omit<ContentItem, 'id'>) => Promise<void>;
  
  // QA actions
  createQaBug: (bug: Omit<QaBug, 'id' | 'dateLogged'>) => Promise<void>;
  updateQaBugStatus: (bugId: string, status: QaBug['status']) => Promise<void>;
  
  // File upload simulation
  uploadFile: (file: Omit<FileAsset, 'id' | 'uploadDate' | 'version' | 'versionHistory'>) => Promise<void>;
  deleteFileAsset: (fileId: string) => Promise<void>;
  
  // Client portal functions
  submitClientFeedback: (clientId: string, feedbackContent: string) => Promise<void>;
  approveClientFeedback: (clientId: string, feedbackId: string) => Promise<void>;
  toggleClientPortal: (projectId: string, enabled: boolean) => Promise<void>;
  regenerateClientToken: (projectId: string) => Promise<string>;
  addClientFeedback: (projectId: string, feedback: Omit<ClientFeedback, 'id' | 'createdAt'>) => Promise<void>;
  updateFeedbackStatus: (projectId: string, feedbackId: string, status: ClientFeedback['status']) => Promise<void>;
  deleteFeedback: (projectId: string, feedbackId: string) => Promise<void>;
  
  // WordPress Site Actions
  activateProject: (projectId: string) => Promise<boolean>;
  syncWordPressSite: (projectId: string) => Promise<void>;
  registerWordPressSite: (siteData: any) => Promise<void>;
  disconnectWordPressSite: (projectId: string) => Promise<void>;
  triggerWebhookMock: (siteUrl: string, event: string, payload: any) => Promise<void>;
  wpLogs: any[];
  wpWebhooks: any[];

  // Automation Engine State & Controls
  automationRules: AutomationRule[];
  automationLogs: AutomationLog[];
  createAutomationRule: (rule: Omit<AutomationRule, 'id' | 'runCount' | 'isSystem'>) => void;
  toggleAutomationRule: (ruleId: string) => void;
  deleteAutomationRule: (ruleId: string) => void;
  runAutomationEngine: (trigger: TriggerType, contextData?: any) => Promise<void>;
  autoGenerateProjectTasks: (projectId: string) => Promise<void>;
  generateClientNotificationSim: (type: 'milestone' | 'approval' | 'connect' | 'launch' | 'delay', message: string) => void;
  generateReportSim: (reportingPeriod: 'weekly' | 'monthly' | 'project' | 'performance') => any;

  // Enterprise Collaboration / Chat System State & Operations
  chatConversations: any[];
  chatMessages: any[];
  chatUsers: any[];
  chatRequests: any[];
  activeConversation: any;
  setActiveConversation: (conv: any) => void;
  chatTypingUsers: Record<string, string[]>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (convId: string) => Promise<void>;
  fetchChatUsers: () => Promise<void>;
  fetchChatRequests: () => Promise<void>;
  sendChatMessage: (convId: string, content: string, attachments?: any[], replyToId?: string) => Promise<void>;
  createConversation: (recipientId?: string, title?: string, isGroup?: boolean, teamId?: string) => Promise<any>;
  sendChatRequest: (targetTeamId: string, text: string) => Promise<void>;
  respondToChatRequest: (requestId: string, status: 'approved' | 'rejected' | 'blocked') => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  reactToChatMessage: (messageId: string, emoji: string) => Promise<void>;
  pinChatMessage: (convId: string, messageId: string, pin: boolean) => Promise<void>;
  closeConversation: (convId: string) => Promise<any>;
  markConversationRead: (convId: string) => Promise<void>;
  typingInConversation: (convId: string, isTyping: boolean) => void;

  // Activity Intelligence & Metrics
  activityIntel: ActivityIntelMetrics;
  readinessScoreCategory: ReadinessScoreCategory;

  // Clear API logs or trigger manual test requests
  clearLogs: () => void;
  triggerManualMockRequest: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, payload?: any) => Promise<any>;

  // Notification Operations
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // Authentication & Role Management State
  currentUser: any;
  userRole: string;
  setUserRole: (role: string) => void;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string, role?: string, username?: string) => Promise<any>;
  loginWithGoogleData: (token: string, user: any) => void;
  logout: () => void;
  updateProfile: (name: string, phone: string, avatar?: string, bio?: string, email?: string, jobTitle?: string) => Promise<boolean>;
  updateUserRole: (targetUserId: string, newRole: string) => Promise<{ success: boolean; message?: string }>;
  getRoleLabel: (role: string) => string;

  // Dynamic tabs/modules settings
  activeModules: DynamicModule[];
  setActiveModules: React.Dispatch<React.SetStateAction<DynamicModule[]>>;
  addCustomModule: (name: string, icon: string, accessRoles: string[], customContent?: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<DynamicModule>) => void;

  // Theme & Language (i18n) Support
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  t: (key: string) => string;
  refreshAllData: () => Promise<void>;

  // Phase 6 - Dynamic Org & Modules State & Operations
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
  teams: any[];
  fetchOrgData: () => Promise<void>;
  createDepartment: (deptData: any) => Promise<any>;
  updateDepartment: (deptId: string, deptData: any) => Promise<any>;
  deleteDepartment: (deptId: string) => Promise<boolean>;
  createModule: (moduleData: any) => Promise<any>;
  deleteModule: (moduleId: string) => Promise<boolean>;
  instantiateModule: (instanceData: any) => Promise<any>;
  createOrgTeam: (teamData: any) => Promise<any>;
  generateDepartmentReport: (deptId: string) => Promise<any>;
  generateExecutiveReport: () => Promise<any>;
  saveReport: (reportData: any) => Promise<any>;
  deleteReport: (id: string) => Promise<boolean>;
  deleteReportsBulk: (range: string, ids?: string[]) => Promise<boolean>;
  saveModuleTemplate: (templateData: any) => Promise<any>;
  fetchTemplates: () => Promise<any[]>;
  updatePermission: (deptId: string, role: string, action: string, isAllowed: boolean) => Promise<any>;

  // Multi-tenant, Enterprise Persistence & Toast Sync Exposes
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  reports: DepartmentReport[];
  setReports: React.Dispatch<React.SetStateAction<DepartmentReport[]>>;
  hasPendingSync: boolean;
  setHasPendingSync: (pending: boolean) => void;
  performSilentSync: () => Promise<void>;
  activeToast: ToastAction | null;
  setActiveToast: (toast: ToastAction | null) => void;
  showToast: (toast: ToastAction) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  toastMessage: { title: string; type: 'success' | 'info' | 'error'; description?: string } | null;
  setToastMessage: (msg: { title: string; type: 'success' | 'info' | 'error'; description?: string } | null) => void;
  triggerSuccessEvent: (title: string, desc?: string) => void;
  addProject: (newProject: Project) => void;
  addTask: (newTask: Task) => void;
}

export const NULL_PROJECT: Project = {
  id: "no_project",
  title: "هیچ پروژه‌ای ثبت نشده است",
  description: "جهت مانیتورینگ وضعیت، ابتدا یک پروژه جدید برای کارگاه ثبت فرمایید.",
  progress: 0,
  totalTasks: 0,
  completedTasks: 0,
  status: "pending",
  startDate: "—",
  deadline: "—",
  budget: "۰ تومان",
  clientName: "—"
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_SEED_PROJECTS: Project[] = [];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const openNewProjectModal = () => setIsNewProjectModalOpen(true);

  // 1. Core Models with Guaranteed Lazy Storage Initializers
  const [projects, setProjects] = useState<Project[]>(() => {
    const raw = getStorageItem<Project[]>('orbit_projects_db', getStorageItem<Project[]>('TS_ORBIT_PROJECTS', getStorageItem<Project[]>('agency_projects', INITIAL_PROJECTS)));
    const list = Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_PROJECTS;
    return list.map(p => ({
      ...p,
      isPortalActive: p.isPortalActive !== undefined ? p.isPortalActive : (p.clientPortalEnabled !== undefined ? p.clientPortalEnabled : true),
      clientPortalEnabled: p.clientPortalEnabled !== undefined ? p.clientPortalEnabled : true,
      clientPortalToken: p.clientPortalToken || p.portalToken || `prj_token_${p.id}`,
      portalToken: p.portalToken || p.clientPortalToken || `prj_token_${p.id}`
    }));
  });

  useEffect(() => {
    setStorageItem('orbit_projects_db', projects);
    setStorageItem('TS_ORBIT_PROJECTS', projects);
    setStorageItem('agency_projects', projects);
  }, [projects]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const raw = getStorageItem<Task[]>('orbit_tasks_db', getStorageItem<Task[]>('TS_ORBIT_TASKS', getStorageItem<Task[]>('agency_tasks', INITIAL_TASKS)));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_TASKS;
  });

  useEffect(() => {
    setStorageItem('orbit_tasks_db', tasks);
    setStorageItem('TS_ORBIT_TASKS', tasks);
    setStorageItem('agency_tasks', tasks);
  }, [tasks]);

  const [departmentReports, setDepartmentReports] = useState<DepartmentReport[]>(() => {
    const raw = getStorageItem<DepartmentReport[]>('orbit_reports_db', getStorageItem<DepartmentReport[]>('TS_ORBIT_REPORTS', []));
    return Array.isArray(raw) ? raw : [];
  });

  useEffect(() => {
    setStorageItem('orbit_reports_db', departmentReports);
    setStorageItem('TS_ORBIT_REPORTS', departmentReports);
  }, [departmentReports]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const raw = getStorageItem<TeamMember[]>('orbit_team_members', getStorageItem<TeamMember[]>('TS_ORBIT_TEAM_MEMBERS', INITIAL_TEAM_MEMBERS));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_TEAM_MEMBERS;
  });

  useEffect(() => {
    setStorageItem('orbit_team_members', teamMembers);
    setStorageItem('TS_ORBIT_TEAM_MEMBERS', teamMembers);
  }, [teamMembers]);

  const [users, setUsers] = useState<User[]>(() => {
    const raw = getStorageItem<User[]>('orbit_users_db', getStorageItem<User[]>('TS_ORBIT_USERS', INITIAL_USERS));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_USERS;
  });

  useEffect(() => {
    setStorageItem('orbit_users_db', users);
    setStorageItem('TS_ORBIT_USERS', users);
  }, [users]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const raw = getStorageItem<Workspace[]>('orbit_workspaces_db', getStorageItem<Workspace[]>('TS_ORBIT_WORKSPACES', INITIAL_WORKSPACES));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_WORKSPACES;
  });

  useEffect(() => {
    setStorageItem('orbit_workspaces_db', workspaces);
    setStorageItem('TS_ORBIT_WORKSPACES', workspaces);
  }, [workspaces]);

  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() => {
    return getStorageItem<string>('orbit_active_ws', getStorageItem<string>('TS_ORBIT_ACTIVE_WS', 'ws_alitahmores_primary'));
  });

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    setStorageItem('orbit_active_ws', id);
    setStorageItem('TS_ORBIT_ACTIVE_WS', id);
  };

  const addTeamMember = async (memberData: Omit<TeamMember, 'id'> & { id?: string }): Promise<TeamMember> => {
    const newMember: TeamMember = {
      id: memberData.id || `tm_${Date.now()}`,
      name: memberData.name,
      role: memberData.role || 'عضو تیم',
      department: memberData.department || 'wp_dev',
      avatar: memberData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      taskCount: memberData.taskCount || 0,
      completedCount: memberData.completedCount || 0,
      status: memberData.status || 'online',
      rating: memberData.rating || 9.5,
      email: memberData.email,
      phone: memberData.phone,
      hourlyRate: memberData.hourlyRate,
      skills: memberData.skills
    };

    setTeamMembers(prev => {
      const updated = [newMember, ...prev];
      return updated;
    });

    return newMember;
  };

  // Phase 6 - Dynamic Org & Module Builder States with Lazy Initializers
  const [departments, setDepartments] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_departments_db', getStorageItem<any[]>('TS_ORBIT_DEPARTMENTS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_departments_db', departments);
    setStorageItem('TS_ORBIT_DEPARTMENTS', departments);
  }, [departments]);

  const [departmentMembers, setDepartmentMembers] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_dept_members_db', getStorageItem<any[]>('TS_ORBIT_DEPT_MEMBERS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_dept_members_db', departmentMembers);
    setStorageItem('TS_ORBIT_DEPT_MEMBERS', departmentMembers);
  }, [departmentMembers]);

  const [departmentPermissions, setDepartmentPermissions] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_dept_permissions_db', getStorageItem<any[]>('TS_ORBIT_DEPT_PERMISSIONS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_dept_permissions_db', departmentPermissions);
    setStorageItem('TS_ORBIT_DEPT_PERMISSIONS', departmentPermissions);
  }, [departmentPermissions]);

  const [departmentModules, setDepartmentModules] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_dept_modules_db', getStorageItem<any[]>('TS_ORBIT_DEPT_MODULES', []));
  });
  useEffect(() => {
    setStorageItem('orbit_dept_modules_db', departmentModules);
    setStorageItem('TS_ORBIT_DEPT_MODULES', departmentModules);
  }, [departmentModules]);

  const [departmentSettings, setDepartmentSettings] = useState<any[]>([]);
  const [departmentChats, setDepartmentChats] = useState<any[]>([]);
  const [departmentChannels, setDepartmentChannels] = useState<any[]>([]);
  const [departmentRoles, setDepartmentRoles] = useState<any[]>([]);
  const [departmentTemplates, setDepartmentTemplates] = useState<any[]>([]);
  const [navigationGroups, setNavigationGroups] = useState<any[]>([]);
  const [navigationItems, setNavigationItems] = useState<any[]>([]);

  const [moduleDefinitions, setModuleDefinitions] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_module_defs_db', getStorageItem<any[]>('TS_ORBIT_MODULE_DEFS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_module_defs_db', moduleDefinitions);
    setStorageItem('TS_ORBIT_MODULE_DEFS', moduleDefinitions);
  }, [moduleDefinitions]);

  const [moduleInstances, setModuleInstances] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_module_instances_db', getStorageItem<any[]>('TS_ORBIT_MODULE_INSTANCES', []));
  });
  useEffect(() => {
    setStorageItem('orbit_module_instances_db', moduleInstances);
    setStorageItem('TS_ORBIT_MODULE_INSTANCES', moduleInstances);
  }, [moduleInstances]);

  const [modulePermissions, setModulePermissions] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_module_perms_db', getStorageItem<any[]>('TS_ORBIT_MODULE_PERMS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_module_perms_db', modulePermissions);
    setStorageItem('TS_ORBIT_MODULE_PERMS', modulePermissions);
  }, [modulePermissions]);

  const [teams, setTeams] = useState<any[]>(() => {
    return getStorageItem<any[]>('orbit_teams_db', getStorageItem<any[]>('TS_ORBIT_TEAMS', []));
  });
  useEffect(() => {
    setStorageItem('orbit_teams_db', teams);
    setStorageItem('TS_ORBIT_TEAMS', teams);
  }, [teams]);

  const [clients, setClients] = useState<Client[]>(() => {
    const raw = getStorageItem<Client[]>('orbit_clients_db', getStorageItem<Client[]>('TS_ORBIT_CLIENTS', INITIAL_CLIENTS));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_CLIENTS;
  });
  useEffect(() => {
    setStorageItem('orbit_clients_db', clients);
    setStorageItem('TS_ORBIT_CLIENTS', clients);
  }, [clients]);

  const [wpChecklist, setWpChecklist] = useState<WordPressChecklistItem[]>(INITIAL_WP_CHECKLIST);
  const [seoChecklist, setSeoChecklist] = useState<SeoChecklistItem[]>(INITIAL_SEO_CHECKLIST);
  const [contentCenter, setContentCenter] = useState<ContentItem[]>(INITIAL_CONTENT_CENTER);
  const [qaBugs, setQaBugs] = useState<QaBug[]>(INITIAL_QA_BUGS);
  const [files, setFiles] = useState<FileAsset[]>(INITIAL_FILES);
  
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const raw = getStorageItem<AppNotification[]>('orbit_notifications_db', getStorageItem<AppNotification[]>('TS_ORBIT_NOTIFICATIONS', getStorageItem<AppNotification[]>('agency_notifications', INITIAL_NOTIFICATIONS)));
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    setStorageItem('orbit_notifications_db', notifications);
    setStorageItem('TS_ORBIT_NOTIFICATIONS', notifications);
    setStorageItem('agency_notifications', notifications);
  }, [notifications]);

  // Toast & Silent Sync Engine with Real Intelligent Data-Diff
  const [activeToast, setActiveToast] = useState<ToastAction | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'info' | 'error'; description?: string } | null>(null);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(false);
  const toastTimeoutRef = useRef<any>(null);

  const [activeView, setActiveViewState] = useState<string>('dashboard');

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    if (view === 'projects' || view === 'all_projects') {
      setActiveTab('projects');
      setActiveSubTab('overview');
    } else if (view === 'tasks' || view === 'technical_tasks' || view === 'my_tasks') {
      if (view === 'my_tasks') {
        setActiveTab('personal_tasks');
        setActiveSubTab('my_tasks');
      } else {
        setActiveTab('tasks');
        setActiveSubTab('kanban_board');
      }
    } else if (view === 'dashboard') {
      setActiveTab('dashboard');
      setActiveSubTab('overview');
    } else if (view === 'my_projects') {
      setActiveTab('personal_tasks');
      setActiveSubTab('my_projects');
    } else {
      setActiveTab(view);
    }
  };

  const showToast = (toast: ToastAction) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(toast);
    setToastMessage({
      title: toast.title,
      description: toast.description,
      type: toast.type
    });

    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
      setToastMessage(null);
    }, 5000);
  };

  const triggerSuccessEvent = (title: string, desc?: string) => {
    showToast({
      title,
      description: desc || 'تغییرات با موفقیت ذخیره و در سامانه پایدار شد.',
      type: 'success'
    });

    const notifItem: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      description: desc || 'عملیات با موفقیت در پایگاه داده محلی و سرور ثبت گردید.',
      timestamp: 'الان',
      read: false,
      type: 'task_assigned'
    };
    setNotifications(prev => [notifItem, ...prev]);
  };

  // Post-Reload State Diff Flash Notification Engine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flashRaw = sessionStorage.getItem('orbit_sync_flash');
    if (!flashRaw) return;
    sessionStorage.removeItem('orbit_sync_flash');

    try {
      const { projectCount, taskCount } = JSON.parse(flashRaw);
      const freshProjects = getStorageItem<Project[]>('orbit_projects_db', getStorageItem<Project[]>('TS_ORBIT_PROJECTS', getStorageItem<Project[]>('agency_projects', INITIAL_PROJECTS))) || [];
      const freshTasks = getStorageItem<Task[]>('orbit_tasks_db', getStorageItem<Task[]>('TS_ORBIT_TASKS', getStorageItem<Task[]>('agency_tasks', INITIAL_TASKS))) || [];

      const projectDiff = (freshProjects.length || 0) - (projectCount || 0);
      const taskDiff = (freshTasks.length || 0) - (taskCount || 0);

      if (projectDiff > 0 && taskDiff === 0) {
        showToast({
          title: 'پروژه جدید به سامانه افزوده شد',
          description: `تعداد ${projectDiff} پروژه جدید دریافت و بارگذاری شد.`,
          targetView: 'projects',
          actionText: 'مشاهده پروژه‌ها ←',
          type: 'success'
        });
      } else if (taskDiff > 0 && projectDiff === 0) {
        showToast({
          title: 'وظایف جدید ثبت گردید',
          description: `تعداد ${taskDiff} تسک و وظیفه جدید بارگذاری شد.`,
          targetView: 'technical_tasks',
          actionText: 'مشاهده وظایف ←',
          type: 'success'
        });
      } else if (projectDiff > 0 && taskDiff > 0) {
        showToast({
          title: 'به‌روزرسانی داده‌های فضای کاری',
          description: `${projectDiff} پروژه و ${taskDiff} وظیفه جدید دریافت شد.`,
          targetView: 'dashboard',
          actionText: 'مشاهده داشبورد ←',
          type: 'success'
        });
      } else {
        showToast({
          title: 'پایگاه داده کاملاً همگام است',
          description: 'داده‌های فضای کاری بررسی و ریلود شدند؛ تغییر جدیدی نسبت به نسخه جاری یافت نشد.',
          type: 'info'
        });
      }
    } catch (err) {
      console.error('Failed to parse orbit_sync_flash:', err);
    }
  }, []);

  // AUTHENTIC HARD PAGE RELOAD & DIFF SYNC ENGINE
  const performSilentSync = async () => {
    if (typeof window !== 'undefined') {
      try {
        const currentSnapshot = {
          projectCount: (projects || []).length,
          taskCount: (tasks || []).length,
          triggeredAt: Date.now()
        };
        sessionStorage.setItem('orbit_sync_flash', JSON.stringify(currentSnapshot));
      } catch (err) {
        console.error('Error saving sync snapshot:', err);
      }
      window.location.reload();
    }
  };

  // Cross-Tab Storage Event Listener for real-time multi-tab awareness
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (['orbit_projects_db', 'orbit_tasks_db', 'orbit_messages_db', 'orbit_workspaces_db', 'TS_ORBIT_PROJECTS', 'TS_ORBIT_TASKS'].includes(e.key || '')) {
        setHasPendingSync(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic Background Data Health & Smart Refresh Check (every 4 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setHasPendingSync(true);
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 'act_1', userId: 'usr_owner', actorId: 'usr_owner', userEmail: 'alitahmores343412@gmail.com', user: 'علی طهمورث', action: 'تکمیل تسک توسعه بخش هوش مصنوعی', target: 'پروژه آکادمی وب', category: 'task', timestamp: '۱۰ دقیقه پیش' },
    { id: 'act_2', userId: 'usr_owner', actorId: 'usr_owner', userEmail: 'alitahmores343412@gmail.com', user: 'علی طهمورث', action: 'افزودن دیدگاه کارشناسی', target: 'ارزیابی UI/UX فاز اول', category: 'comment', timestamp: '۴۵ دقیقه پیش' },
    { id: 'act_3', userId: 'usr_owner', actorId: 'usr_owner', userEmail: 'alitahmores343412@gmail.com', user: 'علی طهمورث', action: 'تنظیم وضعیت لایو پروژه', target: 'آریا دیزل صنعت', category: 'system', timestamp: '۲ ساعت پیش' },
    { id: 'act_4', userId: 'usr_owner', actorId: 'usr_owner', userEmail: 'alitahmores343412@gmail.com', user: 'علی طهمورث', action: 'به‌روزرسانی چک‌لیست سئو و بهینه‌سازی', target: 'فروشگاه دیجی‌کالا پلاس', category: 'task', timestamp: 'دیروز' },
    { id: 'act_5', userId: 'usr_2', actorId: 'usr_2', userEmail: 'alireza@agency.ir', user: 'علیرضا شریفی', action: 'ارسال بریف محتوای متنی', target: 'دپارتمان تولید محتوا', category: 'comment', timestamp: '۲ روز پیش' },
    { id: 'act_6', userId: 'usr_3', actorId: 'usr_3', userEmail: 'sara@agency.ir', user: 'سارا احمدی', action: 'بررسی باگ‌های تایید شده QA', target: 'ماژول درگاه پرداخت', category: 'system', timestamp: '۳ روز پیش' },
  ]);
  
  const [selectedProject, setSelectedProjectState] = useState<Project>(() => {
    try {
      const storedProjs = localStorage.getItem('agency_projects');
      if (storedProjs) {
        const parsed: Project[] = JSON.parse(storedProjs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedId = localStorage.getItem('agency_selected_project_id');
          if (savedId) {
            const found = parsed.find(p => p.id === savedId);
            if (found) return found;
          }
          return parsed[0];
        }
      }
    } catch (e) {
      console.error('Failed to load selected project from localStorage:', e);
    }
    return NULL_PROJECT;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [wpSites, setWpSites] = useState<WordPressSyncData[]>(INITIAL_WP_SITES);
  const [wpLogs, setWpLogs] = useState<any[]>([]);
  const [wpWebhooks, setWpWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(INITIAL_AUTOMATION_RULES);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(INITIAL_AUTOMATION_LOGS);

  // Enterprise Collaboration / Chat states
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [chatRequests, setChatRequests] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [chatTypingUsers, setChatTypingUsers] = useState<Record<string, string[]>>({});

  // Auth & Roles implementation
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('TS_ORBIT_USER_PROFILE') || localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        const dummyPatterns = ["alitahmores00", "milad@", "test@", "dummy", "demo@"];
        const emailLower = (parsed.email || '').toLowerCase();
        if (dummyPatterns.some(p => emailLower.includes(p)) || (parsed.id && parsed.id.startsWith("usr_1787219935059"))) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('TS_ORBIT_USER_PROFILE');
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('isAuthenticated');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('TS_ORBIT_USER_PROFILE', JSON.stringify(currentUser));
      } catch (e) {}
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('TS_ORBIT_USER_PROFILE');
    }
  }, [currentUser]);
  const [userRole, setUserRoleState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('userRole');
      return stored || '';
    } catch {
      return '';
    }
  });

  // i18n and Theme support implementation
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('wp_manager_locale');
    return (saved === 'en' || saved === 'fa') ? saved : 'fa';
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('wp_manager_theme');
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'light';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('wp_manager_locale', newLocale);
    if (currentUser && currentUser.id) {
      try {
        const userSetKey = `userSettings_${currentUser.id}`;
        const currentSettings = JSON.parse(localStorage.getItem(userSetKey) || '{}');
        currentSettings.locale = newLocale;
        localStorage.setItem(userSetKey, JSON.stringify(currentSettings));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('wp_manager_theme', newTheme);
    if (currentUser && currentUser.id) {
      try {
        const userSetKey = `userSettings_${currentUser.id}`;
        const currentSettings = JSON.parse(localStorage.getItem(userSetKey) || '{}');
        currentSettings.theme = newTheme;
        localStorage.setItem(userSetKey, JSON.stringify(currentSettings));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  // Sync theme and locale only for authenticated dashboard views
  useEffect(() => {
    if (!isAuthenticated) {
      // For unauthenticated/Auth screens, ensure clean Light mode and Persian RTL defaults
      const root = document.documentElement;
      root.classList.remove('dark');
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'fa');
      document.body.style.direction = 'rtl';
      document.body.style.textAlign = 'right';
      return;
    }

    const applyThemeAndLocale = () => {
      const root = document.documentElement;
      let actualTheme = theme;
      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      if (actualTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const dir = locale === 'fa' ? 'rtl' : 'ltr';
      root.setAttribute('dir', dir);
      root.setAttribute('lang', locale);
      document.body.style.direction = dir;
      document.body.style.textAlign = locale === 'fa' ? 'right' : 'left';
    };

    applyThemeAndLocale();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyThemeAndLocale();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, locale, isAuthenticated]);

  // Load user settings on user changes
  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        const userSetKey = `userSettings_${currentUser.id}`;
        const savedSettingsStr = localStorage.getItem(userSetKey);
        if (savedSettingsStr) {
          const savedSettings = JSON.parse(savedSettingsStr);
          if (savedSettings.locale) setLocaleState(savedSettings.locale);
          if (savedSettings.theme) setThemeState(savedSettings.theme);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  const [activeModules, setActiveModules] = useState<DynamicModule[]>(() => {
    const list = [
      { id: 'dashboard', name: 'داشبورد', icon: 'LayoutGrid', order: 1, enabled: true, accessRoles: [] },
      { id: 'projects', name: 'پروژه‌ها', icon: 'FolderGit', order: 2, enabled: true, accessRoles: [] },
      { id: 'tasks', name: 'وظایف', icon: 'CheckSquare', order: 3, enabled: true, accessRoles: [] },
      { id: 'uiux_module', name: 'طراحی UI/UX', icon: 'Palette', order: 4, enabled: true, accessRoles: [] },
      { id: 'wordpress_module', name: 'توسعه وردپرس', icon: 'Code', order: 5, enabled: true, accessRoles: [] },
      { id: 'content_module', name: 'محتوا', icon: 'FileText', order: 6, enabled: true, accessRoles: [] },
      { id: 'seo_module', name: 'سئو', icon: 'Compass', order: 7, enabled: true, accessRoles: [] },
      { id: 'qa_module', name: 'تست و کنترل کیفیت', icon: 'ShieldCheck', order: 8, enabled: true, accessRoles: [] },
      { id: 'files', name: 'فایل‌ها', icon: 'FileText', order: 9, enabled: true, accessRoles: [] },
      { id: 'reports', name: 'گزارش‌ها', icon: 'LineChart', order: 10, enabled: true, accessRoles: [] },
      { id: 'team_module', name: 'اعضای تیم', icon: 'Users', order: 11, enabled: true, accessRoles: [] },
      { id: 'clients_module', name: 'کارفرماها', icon: 'UserCheck2', order: 12, enabled: true, accessRoles: [] },
      { id: 'settings', name: 'تنظیمات سیستم', icon: 'Settings', order: 15, enabled: true, accessRoles: [] }
    ];
    try {
      const stored = localStorage.getItem('activeModules');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.filter((m: any) => m.id !== 'automation' && m.id !== 'project_plan' && m.id !== 'profile');
      }
    } catch (e) {
      console.error(e);
    }
    return list;
  });

  useEffect(() => {
    localStorage.setItem('activeModules', JSON.stringify(activeModules));
  }, [activeModules]);

  const addCustomModule = (name: string, icon: string, accessRoles: string[], customContent?: string) => {
    setActiveModules(prev => {
      const nextOrder = prev.length > 0 ? Math.max(...prev.map(m => m.order)) + 1 : 1;
      const newModule: DynamicModule = {
        id: `custom_${Date.now()}`,
        name,
        icon: icon || 'Sparkles',
        order: nextOrder,
        enabled: true,
        accessRoles: accessRoles || [],
        isCustom: true,
        customContent: customContent || 'محتوای دلخواه شما در این بخش قابل نمایش است.'
      };
      return [...prev, newModule].sort((a, b) => a.order - b.order);
    });
  };

  const removeModule = (id: string) => {
    setActiveModules(prev => prev.filter(m => m.id !== id));
  };

  const updateModule = (id: string, updates: Partial<DynamicModule>) => {
    setActiveModules(prev => {
      return prev.map(m => m.id === id ? { ...m, ...updates } : m).sort((a, b) => a.order - b.order);
    });
  };

  const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours (7,200,000 ms)

  const updateLastActive = () => {
    try {
      if (localStorage.getItem('isAuthenticated') === 'true') {
        localStorage.setItem('session_last_active', Date.now().toString());
      }
    } catch {}
  };

  const checkSessionExpiry = (): boolean => {
    try {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuth) return false;

      const lastActive = localStorage.getItem('session_last_active');
      const now = Date.now();
      if (!lastActive || (now - Number(lastActive) > SESSION_TIMEOUT_MS)) {
        console.warn("Session expired due to 2 hours of inactivity.");
        setCurrentUser(null);
        setUserRoleState('');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('TS_ORBIT_USER_PROFILE');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('session_last_active');
        return true;
      }
    } catch (e) {
      console.error('Error checking session expiry:', e);
    }
    return false;
  };

  // Inactivity & Tab Visibility event listeners
  useEffect(() => {
    if (checkSessionExpiry()) {
      return;
    }

    let lastUpdate = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 10000) { // throttle to 10s
        lastUpdate = now;
        if (!checkSessionExpiry()) {
          updateLastActive();
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        if (!checkSessionExpiry()) {
          updateLastActive();
        }
      }
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const intervalId = setInterval(() => {
      checkSessionExpiry();
    }, 60000);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
  }, []);

  // Session Persistence and validation on app boot
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('TS_ORBIT_USER_PROFILE');

    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.status === 403) {
          notifyStandaloneMode();
          throw new Error('403_FORBIDDEN');
        }
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Invalid token');
        }
      })
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
          setUserRoleState(data.user.role);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          localStorage.setItem('TS_ORBIT_USER_PROFILE', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('isAuthenticated', 'true');
          updateLastActive();
        }
      })
      .catch((err) => {
        // In standalone/offline mode or 403, retain existing localStorage user session
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            if (u && u.id) {
              setCurrentUser(u);
              setUserRoleState(u.role || 'OWNER');
              setIsAuthenticated(true);
              notifyStandaloneMode();
              return;
            }
          } catch {}
        }

        if (err?.message === '403_FORBIDDEN') {
          notifyStandaloneMode();
          return;
        }

        // Clear expired/invalid token session only if really invalid and no local session
        setCurrentUser(null);
        setUserRoleState('');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('TS_ORBIT_USER_PROFILE');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('session_last_active');
      });
    }
  }, []);

  // Tehran Timezone Jalali Date Formatting Helper
  const getTehranJalaliFormattedDateTime = () => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      let year = '', month = '', day = '', hour = '', minute = '';
      for (const p of parts) {
        if (p.type === 'year') year = p.value;
        if (p.type === 'month') month = p.value;
        if (p.type === 'day') day = p.value;
        if (p.type === 'hour') hour = p.value;
        if (p.type === 'minute') minute = p.value;
      }
      const dateStr = `${year}/${month}/${day}`;
      const timeStr = `${hour}:${minute}`;
      return { dateStr, timeStr };
    } catch (e) {
      const now = new Date();
      return {
        dateStr: `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`,
        timeStr: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      };
    }
  };

  // Detector for new task/project assignments by Admin
  const checkAndNotifyNewAssignments = (
    user: any,
    allTasks: Task[],
    allProjects: Project[]
  ) => {
    if (!user || (!user.id && !user.name)) return;
    const userKey = user.id || user.name;
    const storageKey = `TS_ORBIT_SEEN_ASSIGNMENTS_${userKey}`;

    let seenIds: string[] = [];
    const storedSeen = localStorage.getItem(storageKey);
    const isFirstTime = storedSeen === null;

    if (storedSeen) {
      try {
        seenIds = JSON.parse(storedSeen);
      } catch {}
    }

    const assignedItems: Array<{ id: string; title: string; type: 'task' | 'project' }> = [];

    allTasks.forEach(t => {
      if (!t.title) return;
      const isAssigned = (user.name && t.assignedTo === user.name) ||
                         (user.id && t.assignedTo === user.id) ||
                         (user.name && typeof t.assignedTo === 'string' && t.assignedTo.includes(user.name));
      if (isAssigned) {
        assignedItems.push({ id: `task_${t.id}`, title: t.title, type: 'task' });
      }
    });

    allProjects.forEach(p => {
      if (!p.title) return;
      const isAssigned = (user.name && p.teamLead === user.name) ||
                         (user.name && Array.isArray((p as any).teamMembers) && (p as any).teamMembers.includes(user.name));
      if (isAssigned) {
        assignedItems.push({ id: `proj_${p.id}`, title: p.title, type: 'project' });
      }
    });

    if (isFirstTime) {
      const baseline = assignedItems.map(a => a.id);
      localStorage.setItem(storageKey, JSON.stringify(baseline));
      return;
    }

    const newItems = assignedItems.filter(item => !seenIds.includes(item.id));
    if (newItems.length > 0) {
      const { dateStr, timeStr } = getTehranJalaliFormattedDateTime();
      const newNotifs: AppNotification[] = newItems.map(item => ({
        id: `notif_assign_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: item.type === 'task' ? `تخصیص تسک جدید` : `تخصیص پروژه جدید`,
        description: `تسک/پروژه جدید ${item.title} در تاریخ ${dateStr} ساعت ${timeStr} توسط مدیریت برای شما ثبت گردید.`,
        timestamp: `${timeStr} (تهران)`,
        read: false,
        type: 'task_assigned'
      }));

      const updatedSeen = [...seenIds, ...newItems.map(i => i.id)];
      localStorage.setItem(storageKey, JSON.stringify(updatedSeen));

      setNotifications(prev => [...newNotifs, ...prev]);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      checkAndNotifyNewAssignments(currentUser, tasks, projects);
    }
  }, [isAuthenticated, currentUser, tasks, projects]);

  // Setup Socket.IO Real-time Connection
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onConnect = () => {
      console.log('Real-time updates socket connection established successfully.');
      // If we have a user logged in, join their user-specific socket room
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          socket.emit('join', { userId: u.id });
        } catch (e) {}
      }
    };

    const onWpSites = (updatedSites: WordPressSyncData[]) => {
      setWpSites(updatedSites);
    };

    const onWpLogs = (updatedLogs: any[]) => {
      setWpLogs(updatedLogs);
    };

    const onWpWebhooks = (updatedWebhooks: any[]) => {
      setWpWebhooks(updatedWebhooks);
    };

    const onAppNotifs = (updatedNotifs: AppNotification[]) => {
      setNotifications(updatedNotifs);
    };

    // Real-time Chat Socket Events
    const onNewMessage = (msg: any) => {
      setChatMessages(prev => {
        // Prevent duplicate appending
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Refresh conversation list to update lastMessage and unread counts
      fetchConversations();
    };

    const onMessageUpdated = (msg: any) => {
      setChatMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
    };

    const onMessageDeleted = (data: any) => {
      setChatMessages(prev => prev.filter(m => m.id !== data.messageId));
    };

    const onReactionsUpdated = (data: any) => {
      setChatMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, reactions: data.reactions } : m));
    };

    const onTypingStatus = (data: any) => {
      setChatTypingUsers(prev => {
        const typingList = prev[data.conversationId] || [];
        if (data.isTyping) {
          if (!typingList.includes(data.username)) {
            return { ...prev, [data.conversationId]: [...typingList, data.username] };
          }
        } else {
          return { ...prev, [data.conversationId]: typingList.filter(name => name !== data.username) };
        }
        return prev;
      });
    };

    const onOnlineStatus = (data: any) => {
      setChatUsers(prev => prev.map(u => u.id === data.userId ? { ...u, status: data.status } : u));
    };

    socket.on('connect', onConnect);
    socket.on('wp_sites_updated', onWpSites);
    socket.on('wp_logs_updated', onWpLogs);
    socket.on('wp_webhooks_updated', onWpWebhooks);
    socket.on('app_notifications_updated', onAppNotifs);
    socket.on('new_message', onNewMessage);
    socket.on('message_updated', onMessageUpdated);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('reactions_updated', onReactionsUpdated);
    socket.on('typing_status', onTypingStatus);
    socket.on('online_status', onOnlineStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('wp_sites_updated', onWpSites);
      socket.off('wp_logs_updated', onWpLogs);
      socket.off('wp_webhooks_updated', onWpWebhooks);
      socket.off('app_notifications_updated', onAppNotifs);
      socket.off('new_message', onNewMessage);
      socket.off('message_updated', onMessageUpdated);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('reactions_updated', onReactionsUpdated);
      socket.off('typing_status', onTypingStatus);
      socket.off('online_status', onOnlineStatus);
    };
  }, []);

  // Sync WordPress gateway initially on mount
  useEffect(() => {
    const fetchWpHub = async () => {
      try {
        const res = await fetch('/api/sites/status');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sites) && data.sites.length > 0) setWpSites(data.sites);
          if (data && Array.isArray(data.logs)) setWpLogs(data.logs);
          if (data && Array.isArray(data.webhooks)) setWpWebhooks(data.webhooks);
        }
      } catch {
        // Retain initial data silently on network failure
      }
    };
    fetchWpHub();
  }, []);

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'OWNER': return 'صاحب سیستم (Owner)';
      case 'ADMIN': return 'مدیر سیستم (Admin)';
      case 'PROJECT_MANAGER': return 'مدیر پروژه (Project Manager)';
      case 'DEVELOPER': return 'توسعه‌دهنده (Developer)';
      case 'CLIENT': return 'کارفرما (Client)';
      case 'USER': return 'کاربر معمولی (User)';
      // Fallbacks
      case 'SUPER_ADMIN': return 'صاحب سیستم (Owner)';
      case 'WORDPRESS_DEVELOPER': return 'توسعه‌دهنده (Developer)';
      default: return r || 'کاربر معمولی (User)';
    }
  };

  const setUserRole = (role: string) => {
    setUserRoleState(role);
    setCurrentUser({ id: `usr_${role.toLowerCase()}`, name: getRoleLabel(role), role });
    logApiAction('POST', `/api/auth/role-switch`, 200, { success: true, activeRole: role });
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, password })
      });
      if (!res.ok) {
        throw new Error("UNAUTHORIZED");
      }
      const data = await res.json();
      const userObj = data.user;
      setCurrentUser(userObj);
      setUserRoleState(userObj.role || 'OWNER');
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      localStorage.setItem('TS_ORBIT_USER_PROFILE', JSON.stringify(userObj));
      localStorage.setItem('userRole', userObj.role || 'OWNER');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('session_last_active', Date.now().toString());
      if (data.token) localStorage.setItem('token', data.token);

      logApiAction('POST', '/api/auth/login', 200, data, { identifier });
      setIsLoading(false);
      fetchProjects();
      fetchTasks();
      fetchTeamMembers();
      return true;
    } catch {
      setIsLoading(false);
      logApiAction('POST', '/api/auth/login', 401, { error: "INVALID_CREDENTIALS", message: "شناسه کاربری، ایمیل یا رمز عبور اشتباه است" });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, phone: string, requestedRole: string = 'OWNER', username?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, username, role: requestedRole, requestedRole })
      });
      if (!res.ok) {
        throw new Error("REGISTRATION_FAILED");
      }
      const data = await res.json();
      
      if (data.pendingApproval) {
        setIsLoading(false);
        logApiAction('POST', '/api/auth/register', 201, data, { email, name, phone, username, role: requestedRole });
        return { success: true, pendingApproval: true, message: data.message };
      }

      const userObj = data.user;
      setCurrentUser(userObj);
      setUserRoleState(userObj.role || 'OWNER');
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      localStorage.setItem('TS_ORBIT_USER_PROFILE', JSON.stringify(userObj));
      localStorage.setItem('userRole', userObj.role || 'OWNER');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('session_last_active', Date.now().toString());
      if (data.token) localStorage.setItem('token', data.token);

      logApiAction('POST', '/api/auth/register', 201, data, { email, name, phone, username, role: requestedRole });
      setIsLoading(false);
      fetchProjects();
      fetchTasks();
      fetchTeamMembers();
      return { success: true, pendingApproval: false, user: userObj };
    } catch {
      setIsLoading(false);
      return { success: false };
    }
  };

  const loginWithGoogleData = (token: string, userObj: any) => {
    setCurrentUser(userObj);
    setUserRoleState(userObj.role);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    localStorage.setItem('TS_ORBIT_USER_PROFILE', JSON.stringify(userObj));
    localStorage.setItem('userRole', userObj.role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('session_last_active', Date.now().toString());
    localStorage.setItem('token', token);

    logApiAction('POST', '/api/auth/google-login', 200, { success: true, user: userObj });
    fetchProjects();
    fetchTasks();
    fetchTeamMembers();
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserRoleState('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('TS_ORBIT_USER_PROFILE');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('session_last_active');
    logApiAction('POST', '/api/auth/logout', 200, { message: "خروج موفقیت‌آمیز" });
  };

  const updateProfile = async (name: string, phone: string, avatar?: string, bio?: string, email?: string, jobTitle?: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ name, phone, avatar, bio, email, jobTitle })
      });
      if (!res.ok) throw new Error('Profile update failed');
      const data = await res.json();
      const updatedUser = data.user;
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      addNotification("بروزرسانی حساب", "مشخصات کاربری شما با موفقیت بروزرسانی شد.", "project_updated");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (targetUserId: string, newRole: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update role");
      }
      const data = await res.json();
      
      // Update team list locally
      setTeamMembers(prev => prev.map(m => m.id === targetUserId ? { 
        ...m, 
        role: newRole,
        department: (newRole === 'OWNER' || newRole === 'ADMIN' || newRole === 'PROJECT_MANAGER') ? 'management' : 
                    newRole === 'DEVELOPER' ? 'wp_dev' : 
                    newRole === 'CLIENT' ? 'client_approval' : 'user'
      } : m));

      setOperationStatus('success');
      addNotification(
        "بروزرسانی نقش کاربر",
        `نقش سازمانی کاربر با موفقیت به ${getRoleLabel(newRole)} تغییر یافت.`,
        "project_updated"
      );
      return { success: true };
    } catch (err: any) {
      console.error(err);
      setOperationStatus('error');
      addNotification(
        "خطا در تغییر نقش",
        err.message || "امکان تغییر نقش برای این کاربر وجود ندارد.",
        "deadline_warning"
      );
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logApiAction = (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, status: number, response: any, payload?: any) => {
    const newLog: ApiLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      method,
      endpoint,
      status,
      payload,
      response
    };
    setApiLogs(prev => [newLog, ...prev].slice(0, 50)); // keep last 50 logs
  };

  // Helper to sync overall project stats based on sub-components tasks
  const syncProjectProgress = (currentTasks: Task[]) => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        const projTasks = currentTasks.filter(t => t.projectId === p.id);
        const totalCount = projTasks.length;
        const completedCount = projTasks.filter(t => t.status === 'completed').length;
        const computedPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        return {
          ...p,
          totalTasks: totalCount,
          completedTasks: completedCount,
          progress: computedPercentage
        };
      });
      
      // Update selected project as well to reflect progress live
      setSelectedProjectState(prevSel => {
        if (!prevSel || prevSel.id === 'no_project') return prevSel;
        const fresh = updated.find(p => p.id === prevSel.id);
        return fresh || prevSel;
      });
      return updated;
    });
  };

  const setSelectedProject = (project: Project) => {
    if (!project || project.id === 'no_project') {
      setSelectedProjectState(NULL_PROJECT);
      try { localStorage.removeItem('agency_selected_project_id'); } catch {}
      return;
    }
    setSelectedProjectState(project);
    try { localStorage.setItem('agency_selected_project_id', project.id); } catch {}
    logApiAction('GET', `/api/projects/${project.id}`, 200, project);
  };

  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      try {
        await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } catch (e) {
        console.error("API delete project error:", e);
      }

      setProjects(prev => {
        const next = prev.filter(p => p.id !== projectId);
        try { localStorage.setItem('agency_projects', JSON.stringify(next)); } catch {}

        if (selectedProject?.id === projectId) {
          if (next.length > 0) {
            setSelectedProjectState(next[0]);
            try { localStorage.setItem('agency_selected_project_id', next[0].id); } catch {}
          } else {
            setSelectedProjectState(NULL_PROJECT);
            try { localStorage.removeItem('agency_selected_project_id'); } catch {}
          }
        }
        return next;
      });

      setTasks(prev => {
        const next = prev.filter(t => t.projectId !== projectId);
        try { localStorage.setItem('agency_tasks', JSON.stringify(next)); } catch {}
        return next;
      });

      setFiles(prev => {
        const next = prev.filter(f => f.projectId !== projectId);
        try { localStorage.setItem('agency_files', JSON.stringify(next)); } catch {}
        return next;
      });

      setOperationStatus('success');
      addNotification(
        "حذف پروژه",
        "پروژه با موفقیت از سیستم حذف گردید.",
        "project_updated"
      );
      logApiAction('DELETE', `/api/projects/${projectId}`, 200, { success: true, id: projectId });
    } catch (err) {
      setOperationStatus('error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDatabaseToZero = () => {
    try {
      localStorage.removeItem('agency_projects');
      localStorage.removeItem('agency_tasks');
      localStorage.removeItem('agency_selected_project_id');
      localStorage.removeItem('agency_files');
      localStorage.removeItem('agency_team');
      localStorage.removeItem('agency_notifications');
      localStorage.removeItem('agency_clients');
      localStorage.removeItem('agency_wp_sites');
      localStorage.removeItem('agency_content');
      localStorage.removeItem('agency_qa_bugs');
    } catch (e) {
      console.error('Failed to clear localStorage in resetDatabaseToZero:', e);
    }

    setProjects([]);
    setSelectedProjectState(NULL_PROJECT);
    setTasks([]);
    setFiles([]);
    setContentCenter([]);
    setQaBugs([]);
    setWpChecklist([]);
    setSeoChecklist([]);
    setNotifications([]);
    setClients([]);

    addNotification(
      "ریست دیتابیس",
      "کلیه اطلاعات دیتابیس و حافظه با موفقیت صفر گردید.",
      "project_updated"
    );
    logApiAction('POST', '/api/reset-database-zero', 200, { success: true });
  };

  const simulateDelay = async (ms = 400) => {
    setIsLoading(true);
    setOperationStatus('loading');
    await new Promise(resolve => setTimeout(resolve, ms));
    setIsLoading(false);
  };

  // 1. Task Mutations
  const createTask = async (taskInput: Omit<Task, 'id'>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    let newTask: Task;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(taskInput)
      });
      if (res.ok) {
        newTask = await res.json();
      } else {
        throw new Error('Failed to create task via API');
      }
    } catch {
      newTask = {
        ...taskInput,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: taskInput.status || 'pending',
        priority: taskInput.priority || 'medium',
        tags: taskInput.tags || [],
        attachments: taskInput.attachments || [],
        dependencies: taskInput.dependencies || []
      } as Task;
    }

    setTasks(prev => {
      const updated = [...prev, newTask];
      syncProjectProgress(updated);
      return updated;
    });
    
    triggerSuccessEvent('وظیفه جدید با موفقیت ذخیره شد', `وظیفه «${newTask.title}» به سیستم اضافه شد.`);
    setOperationStatus('success');
    setIsLoading(false);
  };

  const addTask = (newTask: Task) => {
    setTasks(prev => {
      const updated = [newTask, ...prev.filter(t => t.id !== newTask.id)];
      syncProjectProgress(updated);
      return updated;
    });
    triggerSuccessEvent('وظیفه با موفقیت اضافه شد', `وظیفه «${newTask.title}» ثبت و ذخیره گردید.`);
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update task status');
      const updatedTask = await res.json();
      
      setTasks(prev => {
        const taskIndex = prev.findIndex(t => t.id === taskId);
        if (taskIndex < 0) return prev;
        
        const updated = [...prev];
        updated[taskIndex] = updatedTask;
        
        if (status === 'completed') {
          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: "وظیفه تکمیل گردید",
              description: `وظیفه «${updatedTask.title}» تغییر وضعیت داد به تکمیل شده.`,
              timestamp: "الان",
              read: false,
              type: "task_completed"
            },
            ...n
          ]);
        }
        
        syncProjectProgress(updated);
        logApiAction('PUT', `/api/tasks/${taskId}/status`, 200, updatedTask, { status });
        return updated;
      });
      
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/tasks/${taskId}/status`, 500, { error: err.message }, { status });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      
      setTasks(prev => {
        const filtered = prev.filter(t => t.id !== taskId);
        syncProjectProgress(filtered);
        return filtered;
      });
      logApiAction('DELETE', `/api/tasks/${taskId}`, 200, { success: true, deletedId: taskId });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('DELETE', `/api/tasks/${taskId}`, 500, { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updatedTask = await res.json();
      
      setTasks(prev => {
        const taskIndex = prev.findIndex(t => t.id === taskId);
        if (taskIndex < 0) return prev;
        const updated = [...prev];
        updated[taskIndex] = updatedTask;
        syncProjectProgress(updated);
        return updated;
      });
      logApiAction('PUT', `/api/tasks/${taskId}`, 200, updatedTask, updates);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/tasks/${taskId}`, 500, { error: err.message }, updates);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. WordPress Checklist Mutations
  const updateWpChecklistItem = async (itemId: string, updates: Partial<WordPressChecklistItem>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/wordpress-checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update WordPress checklist');
      const updatedItem = await res.json();

      setWpChecklist(prev => {
        const idx = prev.findIndex(item => item.id === itemId);
        if (idx < 0) return prev;
        const list = [...prev];
        list[idx] = updatedItem;
        return list;
      });
      logApiAction('PUT', `/api/wordpress-checklist/${itemId}`, 200, updatedItem, updates);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/wordpress-checklist/${itemId}`, 500, { error: err.message }, updates);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. SEO Checklist Mutations
  const updateSeoChecklistItem = async (itemId: string, updates: Partial<SeoChecklistItem>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/seo-checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update SEO checklist');
      const updatedItem = await res.json();

      setSeoChecklist(prev => {
        const idx = prev.findIndex(item => item.id === itemId);
        if (idx < 0) return prev;
        const list = [...prev];
        list[idx] = updatedItem;
        return list;
      });
      logApiAction('PUT', `/api/seo-checklist/${itemId}`, 200, updatedItem, updates);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/seo-checklist/${itemId}`, 500, { error: err.message }, updates);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Content Center Mutations
  const updateContentStatus = async (contentId: string, status: ContentItem['status'], approval?: ContentItem['approvalStatus']) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch(`/api/content-center/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvalStatus: approval })
      });
      if (!res.ok) throw new Error('Failed to update content status');
      const updatedItem = await res.json();

      setContentCenter(prev => {
        const idx = prev.findIndex(c => c.id === contentId);
        if (idx < 0) return prev;
        
        if (status === 'published') {
           uploadFile({
             name: `content_backup_${updatedItem.pageName}.pdf`.replace(/\s+/g, '_'),
             category: 'content',
             size: '120 KB',
             tag: 'خروجی منتشر شده'
           });
        }

        const list = [...prev];
        list[idx] = updatedItem;
        return list;
      });
      logApiAction('PUT', `/api/content-center/${contentId}`, 200, updatedItem, { status, approval });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/content-center/${contentId}`, 500, { error: err.message }, { status, approval });
    } finally {
      setIsLoading(false);
    }
  };

  const createContentItem = async (itemInput: Omit<ContentItem, 'id'>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/content-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemInput)
      });
      if (!res.ok) throw new Error('Failed to create content item');
      const newItem = await res.json();

      setContentCenter(prev => [...prev, newItem]);
      logApiAction('POST', '/api/content-center', 201, newItem, itemInput);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('POST', '/api/content-center', 500, { error: err.message }, itemInput);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. QA Mutations
  const createQaBug = async (bugInput: Omit<QaBug, 'id' | 'dateLogged'>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/qa-bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugInput)
      });
      if (!res.ok) throw new Error('Failed to create bug');
      const newBug = await res.json();

      setQaBugs(prev => [...prev, newBug]);
      logApiAction('POST', '/api/qa-bugs', 201, newBug, bugInput);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('POST', '/api/qa-bugs', 500, { error: err.message }, bugInput);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQaBugStatus = async (bugId: string, status: QaBug['status']) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch(`/api/qa-bugs/${bugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update bug status');
      const updatedBug = await res.json();

      setQaBugs(prev => {
        const idx = prev.findIndex(b => b.id === bugId);
        if (idx < 0) return prev;
        const list = [...prev];
        list[idx] = updatedBug;
        return list;
      });
      logApiAction('PUT', `/api/qa-bugs/${bugId}`, 200, updatedBug, { status });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('PUT', `/api/qa-bugs/${bugId}`, 500, { error: err.message }, { status });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. File Center Actions
  const uploadFile = async (fileInput: Omit<FileAsset, 'id' | 'uploadDate' | 'version' | 'versionHistory'>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileInput)
      });
      if (!res.ok) throw new Error('Failed to upload file');
      const newFile = await res.json();

      setFiles(prev => [newFile, ...prev]);
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: "فایل جدید اضافه شد",
          description: `فایل «${newFile.name}» در دسته‌بندی ${newFile.category} ذخیره گردید.`,
          timestamp: "الان",
          read: false,
          type: "file_uploaded"
        },
        ...prev
      ]);
      logApiAction('POST', '/api/files', 201, newFile, fileInput);
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('POST', '/api/files', 500, { error: err.message }, fileInput);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFileAsset = async (fileId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete file asset');

      setFiles(prev => prev.filter(f => f.id !== fileId));
      logApiAction('DELETE', `/api/files/${fileId}`, 200, { success: true, deletedId: fileId });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('DELETE', `/api/files/${fileId}`, 500, { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Client Portal Actions
  const submitClientFeedback = async (clientId: string, feedbackContent: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, feedbackContent })
      });
      if (!res.ok) throw new Error('Failed to submit client feedback');

      const newFeedback = {
        id: `f_${Date.now()}`,
        content: feedbackContent,
        date: "1405/03/18",
        approved: false
      };

      setClients(prev => {
        return prev.map(c => {
          if (c.id === clientId) {
            return {
              ...c,
              feedback: [newFeedback, ...c.feedback]
            };
          }
          return c;
        });
      });

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: "بازخورد جدید از کارفرما",
          description: `کارفرما احمد نمونه پور بازخورد جدید ثبت کرد: «${feedbackContent.substring(0, 30)}...»`,
          timestamp: "الان",
          read: false,
          type: "approval_needed"
        },
        ...prev
      ]);
      logApiAction('POST', `/api/clients/${clientId}/feedback`, 201, newFeedback, { feedbackContent });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
      logApiAction('POST', `/api/clients/${clientId}/feedback`, 500, { error: err.message }, { feedbackContent });
    } finally {
      setIsLoading(false);
    }
  };

  const approveClientFeedback = async (clientId: string, feedbackId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      // Simulate/Trigger API approval
      setClients(prev => {
        const updated = prev.map(c => {
          if (c.id === clientId) {
            return {
              ...c,
              feedback: c.feedback.map(f => f.id === feedbackId ? { ...f, approved: true } : f)
            };
          }
          return c;
        });

        const targetClient = updated.find(c => c.id === clientId);
        const targetFeedback = targetClient?.feedback.find(f => f.id === feedbackId);

        logApiAction('PUT', `/api/clients/${clientId}/feedback/${feedbackId}`, 200, targetFeedback, { approved: true });
        return updated;
      });
      setOperationStatus('success');
    } catch (err: any) {
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClientPortal = async (projectId: string, enabled: boolean) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, clientPortalEnabled: enabled, isPortalActive: enabled } : p));
    if (selectedProject?.id === projectId) {
      setSelectedProjectState({ ...selectedProject, clientPortalEnabled: enabled, isPortalActive: enabled });
    }
    logApiAction('PUT', `/api/projects/${projectId}/portal-toggle`, 200, { enabled });
  };

  const regenerateClientToken = async (projectId: string) => {
    const newToken = `prj_token_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, clientPortalToken: newToken, portalToken: newToken } : p));
    if (selectedProject?.id === projectId) {
      setSelectedProjectState({ ...selectedProject, clientPortalToken: newToken, portalToken: newToken });
    }
    logApiAction('PUT', `/api/projects/${projectId}/regenerate-token`, 200, { token: newToken });
    return newToken;
  };

  const addClientFeedback = async (
    projectId: string, 
    feedbackData: Omit<ClientFeedback, 'id' | 'createdAt'>
  ) => {
    const newFb: ClientFeedback = {
      id: `fb_${Date.now()}`,
      projectId,
      senderName: feedbackData.senderName || 'کارفرما',
      senderRole: feedbackData.senderRole || 'client',
      category: feedbackData.category || 'general',
      message: feedbackData.message,
      status: feedbackData.status || 'pending',
      createdAt: new Date().toLocaleDateString('fa-IR'),
      attachments: feedbackData.attachments || []
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const existing = p.clientFeedbacks || [];
        return { ...p, clientFeedbacks: [newFb, ...existing] };
      }
      return p;
    }));

    if (selectedProject?.id === projectId) {
      setSelectedProjectState({
        ...selectedProject,
        clientFeedbacks: [newFb, ...(selectedProject.clientFeedbacks || [])]
      });
    }

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: "بازخورد جدید در پورتال کارفرما",
        description: `بازخورد جدید در دسته‌بندی «${feedbackData.category}» ثبت گردید.`,
        timestamp: "الان",
        read: false,
        type: "approval_needed"
      },
      ...prev
    ]);

    logApiAction('POST', `/api/projects/${projectId}/feedbacks`, 201, newFb);
  };

  const updateFeedbackStatus = async (projectId: string, feedbackId: string, status: ClientFeedback['status']) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const list = p.clientFeedbacks || [];
        const updatedList = list.map(f => f.id === feedbackId ? { ...f, status } : f);
        return { ...p, clientFeedbacks: updatedList };
      }
      return p;
    }));

    if (selectedProject?.id === projectId) {
      setSelectedProjectState({
        ...selectedProject,
        clientFeedbacks: (selectedProject.clientFeedbacks || []).map(f => f.id === feedbackId ? { ...f, status } : f)
      });
    }

    logApiAction('PUT', `/api/projects/${projectId}/feedbacks/${feedbackId}/status`, 200, { status });
  };

  const deleteFeedback = async (projectId: string, feedbackId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const list = p.clientFeedbacks || [];
        return { ...p, clientFeedbacks: list.filter(f => f.id !== feedbackId) };
      }
      return p;
    }));

    if (selectedProject?.id === projectId) {
      setSelectedProjectState({
        ...selectedProject,
        clientFeedbacks: (selectedProject.clientFeedbacks || []).filter(f => f.id !== feedbackId)
      });
    }

    logApiAction('DELETE', `/api/projects/${projectId}/feedbacks/${feedbackId}`, 200, { success: true });
  };

  // 8. WordPress Site Actions
  const createProject = async (
    title: string, 
    description: string, 
    budget: string = "۸۵,۰۰۰,۰۰۰ تومان", 
    deadline: string = "1405/04/15", 
    clientName: string = "احمد نمونه پور", 
    websiteUrl: string = "",
    teamLead: string = "",
    isBudgetConfidential: boolean = false,
    extraData?: {
      teamLeadId?: string;
      assignedMemberIds?: string[];
      assignedTeamIds?: string[];
      createdById?: string;
    }
  ) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const effectiveTeamLeadId = extraData?.teamLeadId || teamLead;
      const effectiveAssignedMemberIds = extraData?.assignedMemberIds || (effectiveTeamLeadId ? [effectiveTeamLeadId] : []);
      const effectiveAssignedTeamIds = extraData?.assignedTeamIds || [];
      const effectiveCreatedById = extraData?.createdById || currentUser?.id || 'admin';

      const postPayload = {
        title,
        description,
        deadline,
        budget,
        clientName,
        websiteUrl,
        teamLead,
        teamLeadId: effectiveTeamLeadId,
        assignedMemberIds: effectiveAssignedMemberIds,
        assignedTeamIds: effectiveAssignedTeamIds,
        createdById: effectiveCreatedById,
        isBudgetConfidential
      };

      let newProj: Project;
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postPayload)
        });
        if (res.ok) {
          newProj = await res.json();
          newProj = {
            ...newProj,
            teamLead,
            teamLeadId: newProj.teamLeadId || effectiveTeamLeadId,
            assignedMemberIds: newProj.assignedMemberIds || effectiveAssignedMemberIds,
            assignedTeamIds: newProj.assignedTeamIds || effectiveAssignedTeamIds,
            createdById: newProj.createdById || effectiveCreatedById,
            isBudgetConfidential
          };
        } else {
          throw new Error("API returned non-OK");
        }
      } catch {
        newProj = {
          id: `proj_${Date.now()}`,
          title,
          description,
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          status: 'active',
          startDate: new Date().toLocaleDateString('fa-IR'),
          deadline: deadline || "۱۴۰۵/۰۴/۱۵",
          budget: budget || "۸۵,۰۰۰,۰۰۰ تومان",
          clientName: clientName || "کارفرمای نمونه",
          websiteUrl,
          teamLead,
          teamLeadId: effectiveTeamLeadId,
          assignedMemberIds: effectiveAssignedMemberIds,
          assignedTeamIds: effectiveAssignedTeamIds,
          createdById: effectiveCreatedById,
          isBudgetConfidential,
          clientPortalEnabled: true
        };
      }

      const token = newProj.portalToken || newProj.clientPortalToken || `token_${newProj.id}_${Math.random().toString(36).substring(2, 7)}`;
      newProj = {
        ...newProj,
        clientPortalEnabled: newProj.clientPortalEnabled !== undefined ? newProj.clientPortalEnabled : true,
        isPortalActive: newProj.isPortalActive !== undefined ? newProj.isPortalActive : true,
        clientPortalToken: token,
        portalToken: token
      };

      setProjects(prev => {
        const updated = [newProj, ...prev];
        try { localStorage.setItem('agency_projects', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setSelectedProject(newProj);
      try { localStorage.setItem('agency_selected_project_id', newProj.id); } catch {}
      setOperationStatus('success');
      
      const newClient: Client = {
        id: `client_${Date.now()}`,
        name: clientName || "کارفرمای نمونه",
        company: "طرف قرارداد",
        email: "client@agency.ir",
        phone: "۰۹۱۲۳۴۵۶۷۸۹",
        activeProjects: [newProj.id],
        feedback: [],
        invoices: [],
        meetingNotes: []
      };
      setClients(prev => [...prev.filter(c => c.name !== clientName), newClient]);

      triggerSuccessEvent(
        "پروژه جدید با موفقیت ثبت شد",
        `پروژه «${title}» به کارگاه اضافه و پایدار گردید.`
      );
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = (newProject: Project) => {
    setProjects(prev => {
      const updated = [newProject, ...prev.filter(p => p.id !== newProject.id)];
      return updated;
    });
    setSelectedProject(newProject);
    triggerSuccessEvent('پروژه با موفقیت ایجاد شد', `پروژه «${newProject.title}» ثبت و ذخیره گردید.`);
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      try {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch {
        // Fallback for offline/local storage
      }

      setProjects(prev => {
        const updated = prev.map(p => p.id === projectId ? { ...p, ...updates } : p);
        return updated;
      });

      if (selectedProject?.id === projectId) {
        setSelectedProjectState(prev => prev ? { ...prev, ...updates } : null);
      }

      triggerSuccessEvent(
        "اطلاعات پروژه به‌روزرسانی شد",
        `پروژه با موفقیت ویرایش و پایدار گردید.`
      );
      setOperationStatus('success');
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const activateProject = async (projectId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch(`/api/projects/${projectId}/activate`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error("Failed to activate project");
      const data = await res.json();
      const updatedProj = data.project;

      setProjects(prev => prev.map(p => p.id === projectId ? updatedProj : p));
      setSelectedProject(updatedProj);
      setOperationStatus('success');
      addNotification(
        "پروژه با موفقیت فعال شد",
        `پروژه فعال گردید و پیشخوان آماده ردیابی است.`,
        "project_updated"
      );
      return true;
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const syncWordPressSite = async (projectId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/sites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!res.ok) throw new Error("Sync operation rejected");
      const data = await res.json();
      logApiAction('POST', '/api/sites/sync', 200, data, { projectId });
      setOperationStatus('success');

      // Trigger automatic sync rules simulation
      const siteName = data?.siteName || "آریا تجارت";
      const siteUrl = data?.siteUrl || "https://arya-commerce.ir";
      await runAutomationEngine('seo_activated', { status: "active", siteName, siteUrl });
      await runAutomationEngine('ssl_activated', { status: true, siteName, siteUrl });
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const registerWordPressSite = async (siteInput: any) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const payload = {
        projectId: siteInput.projectId || selectedProject.id,
        siteUrl: siteInput.url || siteInput.siteUrl || "",
        siteName: siteInput.name || siteInput.siteName || "",
        wpVersion: siteInput.coreVersion || "6.5.3",
        themeName: siteInput.activeTheme || "Flatsome",
        themeVersion: "3.18.3",
        serverType: "Nginx",
        sslStatus: "فعال (Let's Encrypt)"
      };
      const res = await fetch('/api/sites/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      logApiAction('POST', '/api/sites/connect', 201, data, payload);
      setOperationStatus('success');

      // Do not auto-generate mock tasks/checklists on connection. State remains empty for manual setup.
      const connectedProjId = payload.projectId;
      logApiAction('POST', '/api/sites/connect', 201, data, payload);
      setOperationStatus('success');
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWordPressSite = async (projectId: string) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/sites/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!res.ok) throw new Error("Disconnect request failed");
      const data = await res.json();
      logApiAction('POST', '/api/sites/disconnect', 200, data, { projectId });
      setOperationStatus('success');
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerWebhookMock = async (siteUrl: string, event: string, payload: any) => {
    setIsLoading(true);
    setOperationStatus('loading');
    try {
      const res = await fetch('/api/sites/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, event, payload })
      });
      if (!res.ok) throw new Error("Webhook trigger failed");
      const data = await res.json();
      logApiAction('POST', '/api/sites/webhook', 200, data, { siteUrl, event, payload });
      setOperationStatus('success');

      // Detect and run respective automation triggers
      let triggerType: TriggerType | null = null;
      if (event === 'page_published' || event === 'page_created') {
        triggerType = 'page_published';
      } else if (event === 'plugin_installed' || event === 'plugin_activated') {
        triggerType = 'plugin_installed';
      } else if (event === 'product_added' || event === 'product_created') {
        triggerType = 'product_count_gt';
      }

      if (triggerType) {
        await runAutomationEngine(triggerType, payload);
      }
    } catch (err) {
      console.error(err);
      setOperationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Custom Mock Console endpoint triggers
  const triggerManualMockRequest = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, payload?: any) => {
    setIsLoading(true);
    await simulateDelay(500);
    
    let status = 200;
    let response: any = { message: "درخواست تایید موفق" };

    if (method === 'GET' && endpoint === '/api/projects') {
      response = projects;
    } else if (method === 'POST' && endpoint === '/api/notifications/clear') {
      setNotifications([]);
      response = { success: true, message: "اعلان‌ها پاکسازی شدند" };
    } else if (method === 'POST' && endpoint.startsWith('/api/wordpress-checklist/reset')) {
      setWpChecklist(INITIAL_WP_CHECKLIST);
      response = { success: true, message: "فهرست توسعه به حالت اول بازنشانی شد" };
    } else if (method === 'GET' && endpoint === '/api/stats') {
      response = {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        onlineTeam: teamMembers.filter(t => t.status === 'online').length,
        budgetSum: "۴۴۵,۰۰۰,۰۰۰ تومان"
      };
    } else {
      // Catch-all response for other test cases in simulator
      status = method === 'POST' ? 201 : 200;
      response = {
        message: "امولاسیون درخواست موفقیت‌آمیز بود",
        timestamp: new Date().toISOString(),
        requestPath: endpoint,
        payload
      };
    }

    logApiAction(method, endpoint, status, response, payload);
    setOperationStatus('success');
    return response;
  };

  // --- AUTOMATION ENGINE AND SCORING GETTERS ---

  // Create automation rule
  const createAutomationRule = (ruleInput: Omit<AutomationRule, 'id' | 'runCount' | 'isSystem'>) => {
    const newRule: AutomationRule = {
      ...ruleInput,
      id: `rule_user_${Date.now()}`,
      runCount: 0,
      isSystem: false
    };
    setAutomationRules(prev => [newRule, ...prev]);
    logApiAction('POST', '/api/automations/rules', 201, newRule, ruleInput);
  };

  // Toggle automation rule active status
  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
    logApiAction('PUT', `/api/automations/rules/${ruleId}/toggle`, 200, { ruleId });
  };

  // Delete automation rule
  const deleteAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== ruleId));
    logApiAction('DELETE', `/api/automations/rules/${ruleId}`, 200, { ruleId });
  };

  // Helper inside client state to push notifications
  const addNotification = (title: string, description: string, type: AppNotification['type']) => {
    setNotifications(prev => [
      {
        id: `notif_auto_${Date.now()}`,
        title,
        description,
        timestamp: "کمتر از ۱ دقیقه پیش",
        read: false,
        type
      },
      ...prev
    ]);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic update locally
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        logApiAction('PUT', `/api/notifications/${id}/read`, 200, { success: true, id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic update locally
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        logApiAction('PUT', '/api/notifications/read-all', 200, { success: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: autoGenerateProjectTasks disabled by system rules
  const autoGenerateProjectTasks = async (projectId: string) => {
    setIsLoading(true);
    await timerDelay(300);
    setIsLoading(false);
    addNotification(
      "خطای خودکارسازی وظایف",
      "سیستم خودکار تولید تسک غیرفعال شده است. کلیه وظایف باید به طور دستی توسط صاحب سیستم یا مدیر پروژه تعریف گردند.",
      "deadline_warning"
    );
  };

  const timerDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Client automated notification alerts generator
  const generateClientNotificationSim = (type: 'milestone' | 'approval' | 'connect' | 'launch' | 'delay', message: string) => {
    const typeFarsi = {
      milestone: "تکمیل مایلستون نهایی",
      approval: "نیاز به بازخورد و تایید کارفرما",
      connect: "اتصال موفق هاب وردپرس",
      launch: "آماده راه‌اندازی و لانچ",
      delay: "هشدار تاخیر در ددلاین پروژه"
    };
    
    addNotification(
      `اعلان کارفرما: ${typeFarsi[type]}`,
      `پیام خودکار به ایمیل و پنل کارفرما ارسال شد: "${message}"`,
      "approval_needed"
    );

    logApiAction('POST', '/api/automations/client-notify', 201, { type, message });
  };

  // Reporting automation simulator
  const generateReportSim = (reportingPeriod: 'weekly' | 'monthly' | 'project' | 'performance') => {
    const reportId = `rep_${reportingPeriod}_${Date.now()}`;
    const reportData = {
      id: reportId,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      period: reportingPeriod,
      title: reportingPeriod === 'weekly' ? "گزارش هفتگی بهره‌وری کارگاه" :
             reportingPeriod === 'monthly' ? "گزارش ماهانه عملکرد سئو و آژانس" :
             reportingPeriod === 'project' ? "گزارش جامع وضعیت پیشرفت پروژه فعال" : "گزارش تفصیلی سرعت و عملکرد وردپرس"
    };
    
    addNotification(
      "گزارش خودکار تولید شد",
      `سند تعاملی "${reportData.title}" با موفقیت گردآوری شد.`,
      "file_uploaded"
    );

    logApiAction('POST', `/api/automations/reports/generate`, 201, reportData, { reportingPeriod });
    return reportData;
  };

  // Dynamic Website Readiness Score calculation from: Content, SEO, Performance, Security, Development, QA, Launch
  const readinessScoreCategory = React.useMemo(() => {
    const safeContentCenter = contentCenter || [];
    const safeSeoChecklist = seoChecklist || [];
    const safeTasks = tasks || [];
    const safeWpChecklist = wpChecklist || [];
    const safeQaBugs = qaBugs || [];

    const totalCont = safeContentCenter.length || 1;
    const pubCont = safeContentCenter.filter(c => c && c.status === 'published').length;
    const contentScore = Math.min(100, Math.round((pubCont / totalCont) * 100));

    const totalSeo = safeSeoChecklist.length || 1;
    const compSeo = safeSeoChecklist.filter(s => s && s.status === 'completed').length;
    const seoScore = Math.min(100, Math.round((compSeo / totalSeo) * 100));

    const aryaSite = (wpSites || []).find(s => s && s.projectId === 'proj_1');
    const responseMs = aryaSite?.performanceMetrics?.responseTimeMs || 140;
    const perfScore = Math.max(20, Math.min(100, 100 - Math.round((responseMs - 80) / 2)));

    const backActive = aryaSite?.backupStatus && aryaSite.backupStatus !== 'غیرفعال';
    const secActive = aryaSite?.securityPluginStatus && aryaSite.securityPluginStatus !== 'غیرفعال';
    const sslActive = aryaSite?.sslStatus && aryaSite.sslStatus.includes('فعال');
    let secScore = 20;
    if (sslActive) secScore += 30;
    if (secActive) secScore += 25;
    if (backActive) secScore += 25;

    const totalDevTasks = safeTasks.filter(t => t && t.department === 'wp_dev' && t.projectId === 'proj_1').length || 1;
    const compDevTasks = safeTasks.filter(t => t && t.department === 'wp_dev' && t.status === 'completed' && t.projectId === 'proj_1').length;
    const wpChecklistCount = safeWpChecklist.length || 1;
    const wpChecklistComp = safeWpChecklist.filter(w => w && w.status === 'completed').length;
    const devScore = Math.min(100, Math.round(((compDevTasks / totalDevTasks) * 60) + ((wpChecklistComp / wpChecklistCount) * 40)));

    const totalBugs = safeQaBugs.length || 1;
    const solvedBugs = safeQaBugs.filter(b => b && (b.status === 'verified' || b.status === 'resolved')).length;
    const qaScore = Math.min(100, Math.round((solvedBugs / totalBugs) * 100));

    const readyTasks = safeTasks.filter(t => t && t.projectId === 'proj_1').length || 1;
    const compTasks = safeTasks.filter(t => t && t.projectId === 'proj_1' && t.status === 'completed').length;
    const launchScore = Math.min(100, Math.round((compTasks / readyTasks) * 100));

    return {
      content: contentScore,
      seo: seoScore,
      performance: perfScore,
      security: secScore,
      development: devScore,
      qa: qaScore,
      launch: launchScore
    };
  }, [contentCenter, seoChecklist, wpSites, tasks, wpChecklist, qaBugs]);

  const websiteReadinessScore = React.useMemo(() => {
    const vals = Object.values(readinessScoreCategory);
    const sum = (vals as number[]).reduce((a: number, b: number) => a + b, 0);
    return Math.round(sum / vals.length);
  }, [readinessScoreCategory]);

  const activityIntel = React.useMemo(() => {
    const safeTasks = tasks || [];
    const completedTasks = safeTasks.filter(t => t && t.status === 'completed').length;
    const totalTasksCount = safeTasks.length || 1;
    const completionRate = Math.round((completedTasks / totalTasksCount) * 100);
    const teamProductivity = Math.min(100, Math.max(30, completionRate + 15));
    const taskVelocity = Math.max(1, Math.round(completedTasks / 2)) + 0.5;
    const delayRate = Math.round((safeTasks.filter(t => t && t.projectId === 'proj_4').length / totalTasksCount) * 15);

    return {
      teamProductivity,
      taskVelocity,
      completionRate,
      delayRate,
      approvalSpeed: "۴.۲ ساعت",
      readinessScore: websiteReadinessScore
    };
  }, [tasks, websiteReadinessScore]);

  // COMPREHENSIVE RUN AUTOMATION ENGINE
  const runAutomationEngine = async (trigger: TriggerType, contextData?: any) => {
    console.log(`[Automation Engine] Triggering: ${trigger}`, contextData);
    
    // Find active rules matching trigger
    const activeRules = (automationRules || []).filter(r => r && r.isActive && r.trigger === trigger);
    if (activeRules.length === 0) return;

    await timerDelay(300);

    activeRules.forEach(rule => {
      // Evaluate optional condition
      let conditionPassed = true;
      if (rule.condition) {
        const { field, operator, value } = rule.condition;
        const actualValue = contextData ? contextData[field] : undefined;

        if (operator === 'equals') {
          conditionPassed = String(actualValue) === String(value);
        } else if (operator === 'greater_than') {
          conditionPassed = Number(actualValue) > Number(value);
        } else if (operator === 'contains') {
          conditionPassed = actualValue && String(actualValue).toLowerCase().includes(String(value).toLowerCase());
        } else if (operator === 'is_true') {
          conditionPassed = !!actualValue;
        }
      }

      if (conditionPassed) {
        executeAutomationAction(rule, rule.thenAction, true, contextData);
      } else if (rule.elseAction) {
        executeAutomationAction(rule, rule.elseAction, false, contextData);
      }
    });
  };

  const executeAutomationAction = (rule: AutomationRule, action: AutomationAction, isThen: boolean, contextData: any) => {
    let outcomeText = "";
    
    // Increment run count
    setAutomationRules(prev => prev.map(r => r.id === rule.id ? { 
      ...r, 
      runCount: r.runCount + 1,
      lastRun: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR')
    } : r));

    switch (action.type) {
      case 'complete_task': {
        setTasks(prev => {
          const updated = prev.map(t => {
            const isMatch = t.id === action.targetId || 
                            (t.projectId === 'proj_1' && t.title.includes("طراحی") && rule.id === 'rule_1') ||
                            (t.projectId === 'proj_1' && t.id === 'task_1' && rule.id === 'rule_1');
            if (isMatch) {
              return { ...t, status: 'completed' as const };
            }
            return t;
          });
          syncProjectProgress(updated);
          return updated;
        });
        outcomeText = `وضعیت تسک «طراحی موکاپ نسخه دسکتاپ» به تکمیل شده تغییر یافت.`;
        break;
      }
      case 'mark_store_setup_complete': {
        setWpChecklist(prev => prev.map(w => {
          if (w.category === 'performance' || w.name.includes("Litespeed") || w.name.includes("Rocket")) {
            return { ...w, status: 'completed' as const, progress: 100 };
          }
          return w;
        }));
        outcomeText = "امور چک‌لیست مربوط به سرعت و بارگذاری هاست اختصاصی فروشگاه تکمیل اعلام شد.";
        break;
      }
      case 'increase_progress': {
        setContentCenter(prev => prev.map(c => {
          if (c.status === 'writing') {
            return { ...c, status: 'published' as const };
          }
          return c;
        }));
        outcomeText = `پیشرفت بخش توزیع محتوای متنی پیشرفته به ۱۰۰٪ ارتقا یافت.`;
        break;
      }
      case 'complete_seo_task': {
        setSeoChecklist(prev => prev.map(s => {
          if (s.category === 'technical') {
            return { ...s, status: 'completed' as const, progress: 100 };
          }
          return s;
        }));
        outcomeText = "وظیفه تنظیمات سئو Robots.txt و نقشه سایت XML تکمیل شد.";
        break;
      }
      case 'complete_security_checklist': {
        setWpChecklist(prev => prev.map(w => {
          if (w.category === 'hosting' || w.category === 'cloudflare') {
            return { ...w, status: 'completed' as const, progress: 100 };
          }
          return w;
        }));
        outcomeText = "وضعیت امنیتی SSL به تکمیل شده ارتقا یافت.";
        break;
      }
      case 'mark_content_phase_complete': {
        setContentCenter(prev => prev.map(c => ({ ...c, status: 'published' as const, approvalStatus: 'approved' as const })));
        outcomeText = "کلیه اوراق اصلی تحویل کارفرما تعهد و به حالت منتشر تغییر یافت.";
        break;
      }
      case 'start_development_phase': {
        setTasks(prev => {
          const updated = prev.map(t => {
            if (t.department === 'wp_dev' && t.status === 'pending') {
              return { ...t, status: 'inprogress' as const };
            }
            return t;
          });
          syncProjectProgress(updated);
          return updated;
        });
        outcomeText = "فاز توسعه وردپرس آغاز گردید و وظایف این دپارتمان فعال شدند.";
        break;
      }
      case 'create_qa_tasks': {
        setQaBugs(prev => [
          {
            id: `bug_created_auto_${Date.now()}`,
            title: "تست سرعت بارگذاری بهینه‌ساز قالب Flashtome",
            category: "responsive",
            priority: "critical",
            assignedTo: "امید رضایی",
            status: "pending",
            fixVersion: "v1.0.3",
            dateLogged: new Date().toLocaleDateString('fa-IR')
          },
          ...prev
        ]);
        outcomeText = "باگ کنترل تست با عنوان تست واکنش‌گرایی جدید صادر شد.";
        break;
      }
      case 'create_launch_checklist': {
        addNotification("صدور چک‌لیست واگذاری", "سند تحویل کارفرما صادر شد.", "deadline_warning");
        outcomeText = "چک‌لیست واگذاری و استقرار دامین نهایی لانچ شد.";
        break;
      }
      case 'notify_client': {
        generateClientNotificationSim('milestone', `وضعیت پیشرفت مایلستون به مطلع کارفرما ارسال شد.`);
        outcomeText = "نوتیفیکیشن ایمیلی به کارفرمای محترم با موفقیت رجیستر شد.";
        break;
      }
      default:
        break;
    }

    // Capture Log
    const newLog: AutomationLog = {
      id: `alog_run_${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR'),
      triggerEvent: `${rule.trigger} (بر پایه ${isThen ? 'تطبیق شرط اصلی' : 'شرط Else'})`,
      status: "success",
      details: rule.description,
      actionTaken: outcomeText || "شرایط دیتابیس لوکال تایید شد."
    };

    setAutomationLogs(prev => [newLog, ...prev]);

    // Live Socket sync logs dispatch simulation
    setWpLogs(prev => [
      {
        id: `log_wp_auto_${Date.now()}`,
        timestamp: newLog.timestamp,
        siteName: contextData?.siteName || "پورتال نوپای وردپرسی",
        siteUrl: contextData?.siteUrl || "https://arya-commerce.ir",
        type: "sync",
        status: "success",
        detail: `[موتور اتوماسیون]: ${newLog.ruleName} -> ${newLog.actionTaken}`
      },
      ...prev
    ]);

    addNotification(
      `اتوماسیون اجرا شد: ${rule.name}`,
      outcomeText || `شرط اتوماسیون با موفقیت پاس شد.`,
      "project_updated"
    );
  };

  const clearLogs = () => {
    setApiLogs([]);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const activeWs = activeWorkspaceId || localStorage.getItem('activeWorkspaceId') || localStorage.getItem('orbit_active_ws') || localStorage.getItem('TS_ORBIT_ACTIVE_WS');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (activeWs) {
      headers['x-workspace-id'] = activeWs;
    }
    return headers;
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatConversations(data);
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatMessages(data);
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const fetchChatUsers = async () => {
    try {
      const res = await fetch('/api/chat/users', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatUsers(data);
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const fetchChatRequests = async () => {
    try {
      const res = await fetch('/api/chat/requests', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setChatRequests(data);
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const sendChatMessage = async (convId: string, content: string, attachments?: any[], replyToId?: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, attachments, replyToMessageId: replyToId })
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  const createConversation = async (recipientId?: string, title?: string, isGroup?: boolean, teamId?: string) => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId, title, isGroup, teamId })
      });
      if (res.ok) {
        const data = await res.json();
        setChatConversations(prev => [data, ...prev.filter(c => c.id !== data.id)]);
        fetchConversations();
        return data;
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const sendChatRequest = async (targetTeamId: string, text: string) => {
    try {
      const res = await fetch('/api/chat/requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetTeamId, requestText: text })
      });
      if (res.ok) {
        fetchChatRequests();
      }
    } catch (err) {
      console.error("Failed to send chat request:", err);
    }
  };

  const respondToChatRequest = async (requestId: string, status: 'approved' | 'rejected' | 'blocked') => {
    try {
      const res = await fetch(`/api/chat/requests/${requestId}/respond`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchChatRequests();
        fetchChatUsers();
      }
    } catch (err) {
      console.error("Failed to respond to chat request:", err);
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setChatMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error("Failed to delete chat message:", err);
    }
  };

  const reactToChatMessage = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}/react`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emoji })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: data.reactions } : m));
      }
    } catch (err) {
      console.error("Failed to react to message:", err);
    }
  };

  const pinChatMessage = async (convId: string, messageId: string, pin: boolean) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/pin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ messageId, pin })
      });
      if (res.ok) {
        fetchMessages(convId);
      }
    } catch (err) {
      console.error("Failed to pin message:", err);
    }
  };

  const closeConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/close`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedConv = await res.json();
        setChatConversations(prev => prev.map(c => c.id === convId ? { ...c, status: 'closed' } : c));
        setActiveConversation((prev: any) => prev && prev.id === convId ? { ...prev, status: 'closed' } : prev);
        return updatedConv;
      }
    } catch (err) {
      console.error("Failed to close conversation:", err);
    }
  };

  const markConversationRead = async (convId: string) => {
    try {
      await fetch(`/api/chat/conversations/${convId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setChatConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {}
  };

  useEffect(() => {
    if (activeConversation && socketRef.current) {
      socketRef.current.emit('join', { conversationId: activeConversation.id });
    }
  }, [activeConversation]);

  const typingInConversation = (convId: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        conversationId: convId,
        userId: currentUser?.id,
        username: currentUser?.name,
        isTyping
      });
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.workspaces) && data.workspaces.length > 0) {
          setWorkspaces(data.workspaces);
          // If active workspace is not in the list, set to first one
          if (!data.workspaces.some((w: any) => w.id === activeWorkspaceId)) {
            const firstWs = data.workspaces[0];
            setActiveWorkspaceIdState(firstWs.id);
            localStorage.setItem('activeWorkspaceId', firstWs.id);
          }
        }
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        const stored = localStorage.getItem('orbit_projects_db') || localStorage.getItem('agency_projects');
        if (stored) {
          try {
            const list = JSON.parse(stored);
            if (Array.isArray(list) && list.length > 0) {
              setProjects(list);
            }
          } catch {}
        }
        return;
      }
      if (res.ok) {
        const list: Project[] = await res.json();
        if (Array.isArray(list)) {
          const formatted = list.map(p => ({
            ...p,
            isPortalActive: p.isPortalActive !== undefined ? p.isPortalActive : (p.clientPortalEnabled !== undefined ? p.clientPortalEnabled : true),
            clientPortalEnabled: p.clientPortalEnabled !== undefined ? p.clientPortalEnabled : true,
            clientPortalToken: p.clientPortalToken || p.portalToken || `prj_token_${p.id}`,
            portalToken: p.portalToken || p.clientPortalToken || `prj_token_${p.id}`
          }));
          setProjects(formatted);
          if (formatted.length === 0) {
            setSelectedProjectState(NULL_PROJECT);
          } else {
            setSelectedProjectState(prevSel => {
              if (!prevSel || prevSel.id === 'no_project') return formatted[0];
              const exists = formatted.find(p => p.id === prevSel.id);
              return exists || formatted[0];
            });
          }
        }
      }
    } catch {
      notifyStandaloneMode();
      // Silently retain localStorage state
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchWorkspaces();
  }, [activeWorkspaceId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        const stored = localStorage.getItem('orbit_tasks_db') || localStorage.getItem('agency_tasks');
        if (stored) {
          try {
            const list = JSON.parse(stored);
            if (Array.isArray(list) && list.length > 0) {
              setTasks(list);
            }
          } catch {}
        }
        return;
      }
      if (res.ok) {
        const list: Task[] = await res.json();
        if (Array.isArray(list)) {
          setTasks(list);
        }
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: TeamMember[] = data.map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            department: u.role === 'SUPER_ADMIN' || u.role === 'OWNER' || u.role === 'ADMIN' ? 'management' : 'wp_dev',
            avatar: u.name ? u.name.substring(0, 1) : 'ک',
            taskCount: 0,
            completedCount: 0,
            status: u.status || 'offline'
          }));
          setTeamMembers(mapped);
        }
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        fetchProjects(),
        fetchTasks(),
        fetchTeamMembers(),
        fetchOrgData(),
        fetchConversations()
      ]);
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 6 Dynamic Org & Modules State Actions
  const fetchOrgData = async () => {
    try {
      const res = await fetch('/api/org/data', { headers: getAuthHeaders() });
      if (res.status === 403) {
        notifyStandaloneMode();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (Array.isArray(data.departments)) setDepartments(data.departments);
          if (Array.isArray(data.departmentMembers)) setDepartmentMembers(data.departmentMembers);
          if (Array.isArray(data.departmentPermissions)) setDepartmentPermissions(data.departmentPermissions);
          if (Array.isArray(data.departmentModules)) setDepartmentModules(data.departmentModules);
          if (Array.isArray(data.departmentReports)) setDepartmentReports(data.departmentReports);
          if (Array.isArray(data.departmentSettings)) setDepartmentSettings(data.departmentSettings);
          if (Array.isArray(data.departmentChats)) setDepartmentChats(data.departmentChats);
          if (Array.isArray(data.departmentChannels)) setDepartmentChannels(data.departmentChannels);
          if (Array.isArray(data.departmentRoles)) setDepartmentRoles(data.departmentRoles);
          if (Array.isArray(data.departmentTemplates)) setDepartmentTemplates(data.departmentTemplates);
          if (Array.isArray(data.navigationGroups)) setNavigationGroups(data.navigationGroups);
          if (Array.isArray(data.navigationItems)) setNavigationItems(data.navigationItems);
          if (Array.isArray(data.moduleDefinitions)) setModuleDefinitions(data.moduleDefinitions);
          if (Array.isArray(data.moduleInstances)) setModuleInstances(data.moduleInstances);
          if (Array.isArray(data.modulePermissions)) setModulePermissions(data.modulePermissions);
          if (Array.isArray(data.teams)) setTeams(data.teams);
        }
      }
    } catch {
      notifyStandaloneMode();
    }
  };

  const createDepartment = async (deptData: any) => {
    try {
      const res = await fetch('/api/org/departments', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to create department:", err);
    }
  };

  const updateDepartment = async (deptId: string, deptData: any) => {
    try {
      const res = await fetch(`/api/org/departments/${deptId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to update department:", err);
    }
  };

  const deleteDepartment = async (deptId: string) => {
    try {
      const res = await fetch(`/api/org/departments/${deptId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchOrgData();
        return true;
      }
    } catch (err) {
      console.error("Failed to delete department:", err);
    }
    return false;
  };

  const createModule = async (moduleData: any) => {
    try {
      const res = await fetch('/api/org/modules', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to create module:", err);
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/org/modules/${moduleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchOrgData();
        return true;
      }
    } catch (err) {
      console.error("Failed to delete module:", err);
    }
    return false;
  };

  const instantiateModule = async (instanceData: any) => {
    try {
      const res = await fetch('/api/org/module-instances', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to instantiate module:", err);
    }
  };

  const createOrgTeam = async (teamData: any) => {
    try {
      const res = await fetch('/api/org/teams', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        await fetchConversations();
        return data;
      }
    } catch (err) {
      console.error("Failed to create team with channels:", err);
    }
  };

  const generateDepartmentReport = async (deptId: string) => {
    try {
      const res = await fetch(`/api/org/departments/${deptId}/reports`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDepartmentReports(prev => [data, ...prev.filter((r: any) => r.id !== data.id)]);
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to generate department report:", err);
    }
  };

  const generateExecutiveReport = async () => {
    try {
      const res = await fetch('/api/org/reports/executive-summary', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDepartmentReports(prev => [data, ...prev.filter((r: any) => r.id !== data.id)]);
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to generate executive report:", err);
    }
  };

  const saveReport = async (reportData: any) => {
    try {
      const res = await fetch('/api/org/reports', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        const data = await res.json();
        setDepartmentReports(prev => [data, ...prev.filter((r: any) => r.id !== data.id)]);
        return data;
      }
    } catch (err) {
      console.error("Failed to save report:", err);
    }
    setDepartmentReports(prev => [reportData, ...prev.filter((r: any) => r.id !== reportData.id)]);
    return reportData;
  };

  const deleteReport = async (id: string) => {
    try {
      setDepartmentReports(prev => prev.filter((r: any) => r.id !== id));
      const res = await fetch(`/api/org/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to delete report:", err);
      return false;
    }
  };

  const deleteReportsBulk = async (range: string, ids?: string[]) => {
    try {
      if (ids && ids.length > 0) {
        const idSet = new Set(ids);
        setDepartmentReports(prev => prev.filter((r: any) => !idSet.has(r.id)));
      } else if (range === 'all') {
        setDepartmentReports([]);
      }
      const res = await fetch(`/api/org/reports/bulk?range=${range}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: ids ? JSON.stringify({ ids }) : undefined
      });
      if (res.ok) {
        fetchOrgData(); // refresh
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete reports in bulk:", err);
      return false;
    }
  };

  const saveModuleTemplate = async (templateData: any) => {
    try {
      const res = await fetch('/api/org/templates', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/org/templates', { headers: getAuthHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
    return [];
  };

  const updatePermission = async (departmentId: string, role: string, action: string, isAllowed: boolean) => {
    try {
      const res = await fetch('/api/org/permissions', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId, role, action, isAllowed })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchOrgData();
        return data;
      }
    } catch (err) {
      console.error("Failed to update permission:", err);
    }
  };

  // Load initial projects, tasks, and users from database on changes to auth
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const list: AppNotification[] = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          setNotifications(list);
        }
      }
    } catch (e) {
      console.error('Error fetching notifications from server:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchTasks();
      fetchTeamMembers();
      fetchNotifications();
      fetchConversations();
      setChatMessages([]);
      fetchChatUsers();
      fetchChatRequests();
      fetchOrgData();
    }
  }, [isAuthenticated]);

  // Load initial stats log
  useEffect(() => {
    logApiAction('GET', '/api/stats', 200, {
      totalProjects: 0,
      totalTasks: 0,
      activeTasks: 0,
      completedToday: 0
    });
  }, []);

  // Zero-Trust User Scoped Data Filtering
  const accessibleProjects = useMemo(() => {
    const safeProjects = projects || [];
    if (!currentUser) return safeProjects;
    return safeProjects.filter(p => p && canUserAccessProject(currentUser, p));
  }, [projects, currentUser]);

  const accessibleProjectIds = useMemo(() => {
    return new Set((accessibleProjects || []).map(p => p.id));
  }, [accessibleProjects]);

  const userScopedTasks = useMemo(() => {
    const safeTasks = tasks || [];
    if (!currentUser) return safeTasks;
    const role = String(currentUser.role || '').toUpperCase();
    if (role === 'OWNER' || role === 'ADMIN') return safeTasks;

    const uId = String(currentUser.id || '');
    const uName = String(currentUser.name || '').trim();

    return safeTasks.filter(t => {
      if (!t) return false;
      if (t.assigneeId && String(t.assigneeId) === uId) return true;
      if (t.assignedTo && (String(t.assignedTo) === uId || String(t.assignedTo) === uName)) return true;
      if (t.assignee && (String(t.assignee) === uId || String(t.assignee) === uName)) return true;
      if (t.projectId && accessibleProjectIds.has(t.projectId)) return true;
      return false;
    });
  }, [tasks, currentUser, accessibleProjectIds]);

  const userScopedNotifications = useMemo(() => {
    const safeNotifications = notifications || [];
    if (!currentUser) return safeNotifications;
    return safeNotifications.filter(n => n && canUserAccessNotification(currentUser, n));
  }, [notifications, currentUser]);

  // Ensure selectedProject is accessible
  useEffect(() => {
    if (currentUser && accessibleProjects.length > 0) {
      if (selectedProject && selectedProject.id !== 'no_project') {
        const canAccess = canUserAccessProject(currentUser, selectedProject);
        if (!canAccess) {
          setSelectedProjectState(accessibleProjects[0]);
        }
      } else if (!selectedProject || selectedProject.id === 'no_project') {
        setSelectedProjectState(accessibleProjects[0]);
      }
    } else if (currentUser && accessibleProjects.length === 0) {
      if (selectedProject && selectedProject.id !== 'no_project') {
        setSelectedProjectState(NULL_PROJECT);
      }
    }
  }, [currentUser, accessibleProjects, selectedProject]);

  return (
    <ProjectContext.Provider value={{
      projects: accessibleProjects,
      tasks: userScopedTasks,
      teamMembers,
      clients,
      wpChecklist,
      seoChecklist,
      contentCenter,
      qaBugs,
      files,
      notifications: userScopedNotifications,
      apiLogs,
      activityLogs,
      wpSites,
      wpLogs,
      wpWebhooks,
      
      selectedProject,
      setSelectedProject,
      activeTab,
      setActiveTab,
      activeSubTab,
      setActiveSubTab,
      
      isNewProjectModalOpen,
      setIsNewProjectModalOpen,
      openNewProjectModal,
      
      isLoading,
      isLoaded,
      operationStatus,
      setOperationStatus,
      
      globalSearchQuery,
      setGlobalSearchQuery,

      createProject,
      updateProject,
      deleteProject,
      resetDatabaseToZero,
      activateProject,
      createTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      addTeamMember,
      
      updateWpChecklistItem,
      updateSeoChecklistItem,
      
      updateContentStatus,
      createContentItem,
      
      createQaBug,
      updateQaBugStatus,
      
      uploadFile,
      deleteFileAsset,
      
      submitClientFeedback,
      approveClientFeedback,
      toggleClientPortal,
      regenerateClientToken,
      addClientFeedback,
      updateFeedbackStatus,
      deleteFeedback,
      
      syncWordPressSite,
      registerWordPressSite,
      disconnectWordPressSite,
      triggerWebhookMock,

      automationRules,
      automationLogs,
      createAutomationRule,
      toggleAutomationRule,
      deleteAutomationRule,
      runAutomationEngine,
      autoGenerateProjectTasks,
      generateClientNotificationSim,
      generateReportSim,

      // Chat fields
      chatConversations,
      chatMessages,
      chatUsers,
      chatRequests,
      activeConversation,
      setActiveConversation,
      chatTypingUsers,
      fetchConversations,
      fetchMessages,
      fetchChatUsers,
      fetchChatRequests,
      sendChatMessage,
      createConversation,
      sendChatRequest,
      respondToChatRequest,
      deleteChatMessage,
      reactToChatMessage,
      pinChatMessage,
      closeConversation,
      markConversationRead,
      typingInConversation,
      activityIntel,
      readinessScoreCategory,

      clearLogs,
      triggerManualMockRequest,

      markNotificationAsRead,
      markAllNotificationsAsRead,

      currentUser,
      userRole,
      setUserRole,
      isAuthenticated,
      login,
      register,
      loginWithGoogleData,
      logout,
      updateProfile,
      updateUserRole,
      getRoleLabel,

      activeModules,
      setActiveModules,
      addCustomModule,
      removeModule,
      updateModule,

      // Phase 6 Exposes
      departments,
      departmentMembers,
      departmentPermissions,
      departmentModules,
      departmentReports,
      departmentSettings,
      departmentChats,
      departmentChannels,
      departmentRoles,
      departmentTemplates,
      navigationGroups,
      navigationItems,
      moduleDefinitions,
      moduleInstances,
      modulePermissions,
      teams,
      fetchOrgData,
      createDepartment,
      updateDepartment,
      deleteDepartment,
      createModule,
      deleteModule,
      instantiateModule,
      createOrgTeam,
      generateDepartmentReport,
      generateExecutiveReport,
      saveReport,
      deleteReport,
      deleteReportsBulk,
      saveModuleTemplate,
      fetchTemplates,
      updatePermission,

      users,
      setUsers,
      workspaces,
      setWorkspaces,
      activeWorkspaceId,
      setActiveWorkspaceId,
      reports: departmentReports,
      setReports: setDepartmentReports,
      hasPendingSync,
      setHasPendingSync,
      performSilentSync,
      activeToast,
      setActiveToast,
      showToast,
      activeView,
      setActiveView,
      toastMessage,
      setToastMessage,
      triggerSuccessEvent,
      addProject,
      addTask,

      locale,
      setLocale,
      theme,
      setTheme,
      t,
      refreshAllData
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const useProjectContext = useProject;
