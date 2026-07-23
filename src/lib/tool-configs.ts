import type { ToolConfig } from '@/types/tool'

const MB = 1024 * 1024

export const toolConfigs: Record<string, ToolConfig> = {
  'pdf-merge': {
    id: 'pdf-merge',
    name: 'PDF Merge',
    description:
      'Combine multiple PDF files into a single document. Drag and drop to reorder pages before merging.',
    shortDescription: 'Combine multiple PDF files into one document',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 20,
    allowMultiple: true,
  },
  'pdf-split': {
    id: 'pdf-split',
    name: 'PDF Split',
    description:
      'Split a PDF file into separate pages or sections. Select specific pages or page ranges to extract.',
    shortDescription: 'Split a PDF file into separate pages or sections',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'pdf-compress': {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description:
      'Reduce PDF file size by compressing embedded images. Choose from low, medium, or high compression levels. Works best with image-heavy PDFs.',
    shortDescription: 'Reduce PDF file size by compressing images',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 100 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'word-to-pdf': {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description:
      'Convert Microsoft Word documents (DOCX) to PDF format. Fast and accurate conversion.',
    shortDescription: 'Convert DOCX files to PDF format',
    acceptedTypes: [
      '.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'pdf-to-word': {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description:
      'Convert PDF files to editable Microsoft Word (DOCX) format. Preserves formatting and layout.',
    shortDescription: 'Convert PDF files to editable DOCX format',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'pdf-to-excel': {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Convert PDF files to Excel spreadsheets (XLSX). Extracts tables and data from PDFs.',
    shortDescription: 'Convert PDF to Excel spreadsheet',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'jpg-to-png': {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    description: 'Convert JPEG images to PNG format with lossless quality.',
    shortDescription: 'Convert JPG images to PNG format',
    acceptedTypes: ['.jpg', '.jpeg', 'image/jpeg'],
    maxFileSize: 20 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'png-to-jpg': {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    description: 'Convert PNG images to JPEG format. Choose quality level for optimal file size.',
    shortDescription: 'Convert PNG images to JPG format',
    acceptedTypes: ['.png', 'image/png'],
    maxFileSize: 20 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'image-resize': {
    id: 'image-resize',
    name: 'Image Resize',
    description: 'Resize images to custom dimensions. Supports JPG, PNG, WebP.',
    shortDescription: 'Resize images to any dimension',
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 20 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'pdf-rotate': {
    id: 'pdf-rotate',
    name: 'PDF Rotate',
    description: 'Rotate all pages in a PDF by 90°, 180°, or 270°.',
    shortDescription: 'Rotate PDF pages',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'pdf-sign': {
    id: 'pdf-sign',
    name: 'PDF Sign',
    description:
      'Draw, upload, or type your signature and place it anywhere on a PDF document.',
    shortDescription: 'Add your signature to a PDF',
    acceptedTypes: ['.pdf', 'application/pdf'],
    maxFileSize: 50 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
  'remove-bg': {
    id: 'remove-bg',
    name: 'Remove Background',
    description: 'Automatically remove the background from your image using AI. Get a transparent PNG in seconds — no manual editing required.',
    shortDescription: 'Automatically remove background with AI',
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', 'image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 20 * MB,
    maxFiles: 1,
    allowMultiple: false,
  },
}

export function getToolConfig(id: string): ToolConfig | undefined {
  return toolConfigs[id]
}
