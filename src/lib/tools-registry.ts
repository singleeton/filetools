import type { Tool } from '@/types/tool'

export const tools: Tool[] = [
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    description: 'Combine multiple PDF files into one document',
    href: '/pdf-merge',
    category: 'pdf',
    icon: 'Merge',
  },
  {
    id: 'pdf-split',
    name: 'PDF Split',
    description: 'Split a PDF file into separate pages or sections',
    href: '/pdf-split',
    category: 'pdf',
    icon: 'Scissors',
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Reduce PDF file size without losing quality',
    href: '/pdf-compress',
    category: 'pdf',
    icon: 'FileDown',
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOCX files to PDF format',
    href: '/word-to-pdf',
    category: 'convert',
    icon: 'FileText',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF files to editable DOCX format',
    href: '/pdf-to-word',
    category: 'convert',
    icon: 'FileOutput',
  },
]

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id)
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category)
}
