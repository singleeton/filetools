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
      'Reduce PDF file size without losing quality. Choose from low, medium, or high compression levels.',
    shortDescription: 'Reduce PDF file size without losing quality',
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
      '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
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
}

export function getToolConfig(id: string): ToolConfig | undefined {
  return toolConfigs[id]
}
