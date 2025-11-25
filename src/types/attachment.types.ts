/**
 * Attachment types matching backend schema
 */

/**
 * Attachment type enum (matches backend)
 */
export enum AttachmentType {
  EXPENSE_RECEIPT = "EXPENSE_RECEIPT",
  CHECKS_AND_BANK_TRANSFER = "CHECKS_AND_BANK_TRANSFER",
  INVENTORIES = "INVENTORIES",
  SUPPORTING_DOCUMENTS = "SUPPORTING_DOCUMENTS",
}

/**
 * Attachment model from backend
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  businessId: string;
  cashierId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create attachment input (for business uploads)
 */
export interface CreateAttachmentInput {
  name: string;
  url: string;
  type: AttachmentType;
}

/**
 * Attachment type display names
 */
export const ATTACHMENT_TYPE_LABELS: Record<AttachmentType, string> = {
  [AttachmentType.EXPENSE_RECEIPT]: "Expense Receipt",
  [AttachmentType.CHECKS_AND_BANK_TRANSFER]: "Checks & Bank Transfer",
  [AttachmentType.INVENTORIES]: "Inventories",
  [AttachmentType.SUPPORTING_DOCUMENTS]: "Supporting Documents",
};

/**
 * Attachment type colors for badges
 */
export const ATTACHMENT_TYPE_COLORS: Record<AttachmentType, string> = {
  [AttachmentType.EXPENSE_RECEIPT]: "text-green-600 bg-green-50 border-green-200",
  [AttachmentType.CHECKS_AND_BANK_TRANSFER]: "text-blue-600 bg-blue-50 border-blue-200",
  [AttachmentType.INVENTORIES]: "text-orange-600 bg-orange-50 border-orange-200",
  [AttachmentType.SUPPORTING_DOCUMENTS]: "text-purple-600 bg-purple-50 border-purple-200",
};

/**
 * Get display name for attachment type
 */
export function getAttachmentTypeLabel(type: AttachmentType): string {
  return ATTACHMENT_TYPE_LABELS[type] || type;
}

/**
 * Get color classes for attachment type
 */
export function getAttachmentTypeColor(type: AttachmentType): string {
  return ATTACHMENT_TYPE_COLORS[type] || "text-gray-600 bg-gray-50 border-gray-200";
}
