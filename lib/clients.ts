/**
 * clients.ts - Client Management for B2B Outreach
 *
 * Manages client records for targeted marketing with curated
 * skill and workflow selections per client.
 */

import type { Client, ClientStatus, ClientIndustry, DEFAULT_TARGET_COMPANIES } from './storage/types';
import { DEFAULT_TARGET_COMPANIES as defaultCompanies } from './storage/types';
import { logger } from './logger';

const CLIENTS_STORAGE_KEY = 'skillengine_clients';

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all clients from storage
 */
export function getClients(): Client[] {
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error('Failed to load clients', { error });
  }
  return [];
}

/**
 * Save clients to storage
 */
export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    logger.error('Failed to save clients', { error });
  }
}

/**
 * Get a single client by ID
 */
export function getClientById(id: string): Client | null {
  const clients = getClients();
  return clients.find(c => c.id === id) || null;
}

/**
 * Get a client by their portal slug
 */
export function getClientBySlug(slug: string): Client | null {
  const clients = getClients();
  return clients.find(c => c.portalSlug === slug && c.portalEnabled) || null;
}

/**
 * Generate a URL-friendly slug from company name
 */
export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a new client
 */
export function createClient(data: Partial<Client>): Client {
  const clients = getClients();

  const newClient: Client = {
    id: generateId(),
    companyName: data.companyName || 'New Company',
    industry: data.industry || 'other',
    website: data.website,
    description: data.description,
    contacts: data.contacts || [],
    selectedSkillIds: data.selectedSkillIds || [],
    selectedWorkflowIds: data.selectedWorkflowIds || [],
    customHeadline: data.customHeadline,
    customMessage: data.customMessage,
    portalSlug: data.portalSlug || generateSlug(data.companyName || 'new-company'),
    portalEnabled: data.portalEnabled ?? false,
    status: data.status || 'prospect',
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Ensure slug is unique
  let slug = newClient.portalSlug;
  let counter = 1;
  while (clients.some(c => c.portalSlug === slug)) {
    slug = `${newClient.portalSlug}-${counter}`;
    counter++;
  }
  newClient.portalSlug = slug;

  clients.push(newClient);
  saveClients(clients);

  return newClient;
}

/**
 * Update an existing client
 */
export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === id);

  if (index === -1) return null;

  const updatedClient = {
    ...clients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If slug changed, ensure uniqueness
  if (updates.portalSlug && updates.portalSlug !== clients[index].portalSlug) {
    let slug = updates.portalSlug;
    let counter = 1;
    while (clients.some((c, i) => i !== index && c.portalSlug === slug)) {
      slug = `${updates.portalSlug}-${counter}`;
      counter++;
    }
    updatedClient.portalSlug = slug;
  }

  clients[index] = updatedClient;
  saveClients(clients);

  return updatedClient;
}

/**
 * Delete a client
 */
export function deleteClient(id: string): boolean {
  const clients = getClients();
  const filtered = clients.filter(c => c.id !== id);

  if (filtered.length === clients.length) return false;

  saveClients(filtered);
  return true;
}

/**
 * Mark client as contacted
 */
export function markClientContacted(id: string, notes?: string): Client | null {
  return updateClient(id, {
    status: 'contacted',
    lastContactedAt: new Date().toISOString(),
    notes: notes ? `${notes}\n[Contacted: ${new Date().toLocaleString()}]` : undefined,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL/WORKFLOW SELECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update selected skills for a client
 */
export function updateClientSkills(id: string, skillIds: string[]): Client | null {
  return updateClient(id, { selectedSkillIds: skillIds });
}

/**
 * Update selected workflows for a client
 */
export function updateClientWorkflows(id: string, workflowIds: string[]): Client | null {
  return updateClient(id, { selectedWorkflowIds: workflowIds });
}

/**
 * Toggle portal enabled status
 */
export function toggleClientPortal(id: string, enabled: boolean): Client | null {
  return updateClient(id, { portalEnabled: enabled });
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize with default target companies if no clients exist
 */
export function initializeDefaultClients(): Client[] {
  const existing = getClients();
  if (existing.length > 0) return existing;

  const clients: Client[] = defaultCompanies.map(company => ({
    id: generateId(),
    companyName: company.companyName || 'Unknown',
    industry: company.industry || 'other',
    contacts: [],
    selectedSkillIds: [],
    selectedWorkflowIds: [],
    portalSlug: generateSlug(company.companyName || 'unknown'),
    portalEnabled: false,
    status: 'prospect' as ClientStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  saveClients(clients);
  return clients;
}

/**
 * Get clients by status
 */
export function getClientsByStatus(status: ClientStatus): Client[] {
  return getClients().filter(c => c.status === status);
}

/**
 * Get clients by industry
 */
export function getClientsByIndustry(industry: ClientIndustry): Client[] {
  return getClients().filter(c => c.industry === industry);
}

/**
 * Get clients with active portals
 */
export function getClientsWithPortals(): Client[] {
  return getClients().filter(c => c.portalEnabled);
}

/**
 * Export clients to CSV
 */
export function exportClientsToCSV(): string {
  const clients = getClients();
  const headers = [
    'Company Name',
    'Industry',
    'Status',
    'Website',
    'Portal Slug',
    'Portal Enabled',
    'Primary Contact',
    'Primary Email',
    'Skills Count',
    'Workflows Count',
    'Last Contacted',
    'Created',
  ];

  const rows = clients.map(c => {
    const primary = c.contacts.find(contact => contact.isPrimary) || c.contacts[0];
    return [
      c.companyName,
      c.industry,
      c.status,
      c.website || '',
      c.portalSlug,
      c.portalEnabled ? 'Yes' : 'No',
      primary?.name || '',
      primary?.email || '',
      c.selectedSkillIds.length,
      c.selectedWorkflowIds.length,
      c.lastContactedAt || '',
      c.createdAt,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get client portal URL
 */
export function getClientPortalUrl(client: Client): string {
  return `${window.location.origin}/#/portal/${client.portalSlug}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

export interface ClientStats {
  total: number;
  byStatus: Record<ClientStatus, number>;
  byIndustry: Record<ClientIndustry, number>;
  withPortals: number;
  contacted: number;
  avgSkillsPerClient: number;
  avgWorkflowsPerClient: number;
}

/**
 * Get client statistics
 */
export function getClientStats(): ClientStats {
  const clients = getClients();

  const byStatus: Record<ClientStatus, number> = {
    prospect: 0,
    contacted: 0,
    demo_scheduled: 0,
    active: 0,
    inactive: 0,
  };

  const byIndustry: Partial<Record<ClientIndustry, number>> = {};

  let totalSkills = 0;
  let totalWorkflows = 0;

  clients.forEach(c => {
    byStatus[c.status]++;
    byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
    totalSkills += c.selectedSkillIds.length;
    totalWorkflows += c.selectedWorkflowIds.length;
  });

  return {
    total: clients.length,
    byStatus,
    byIndustry: byIndustry as Record<ClientIndustry, number>,
    withPortals: clients.filter(c => c.portalEnabled).length,
    contacted: clients.filter(c => c.lastContactedAt).length,
    avgSkillsPerClient: clients.length > 0 ? Math.round(totalSkills / clients.length * 10) / 10 : 0,
    avgWorkflowsPerClient: clients.length > 0 ? Math.round(totalWorkflows / clients.length * 10) / 10 : 0,
  };
}
