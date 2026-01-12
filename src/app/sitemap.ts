import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplypdf.vercel.app'

    // All tool pages
    const tools = [
        'merge-pdf',
        'split-pdf',
        'compress-pdf',
        'rotate-pdf',
        'jpg-to-pdf',
        'pdf-to-jpg',
        'unlock-pdf',
        'protect-pdf',
        'organize-pdf',
        'watermark-pdf',
        'sign-pdf',
        'edit-pdf',
        'pdf-to-word',
        'word-to-pdf',
        'pdf-to-excel',
        'ocr-pdf',
    ]

    const pages = [
        '',
        'about',
        'contact',
        'faq',
        'privacy',
        'terms',
        'history',
    ]

    const routes = [
        ...pages.map(page => ({
            url: `${baseUrl}${page ? `/${page}` : ''}`,
            lastModified: new Date(),
            changeFrequency: (page === '' ? 'daily' : 'monthly') as 'daily' | 'monthly' | 'weekly' | 'yearly' | 'always' | 'hourly',
            priority: page === '' ? 1 : 0.5,
        })),
        ...tools.map((tool) => ({
            url: `${baseUrl}/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    ]

    return routes
}
