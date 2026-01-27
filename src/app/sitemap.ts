import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplypdf.vercel.app'

    // 1. Core Pages (Highest Priority due to navigation importance)
    const corePages = [
        '', // Homepage
    ]

    // 2. Information Pages (High Priority for trust)
    const infoPages = [
        'about',
        'contact',
        'faq',
        'privacy',
        'terms',
        'changelog',
        'cookie-policy',
        'disclaimer',
        'features',
        'how-it-works',
        'support',
        'all-tools',
    ]

    // 3. All PDF Tools (High Priority - Main Logic)
    // Ordered alphabetically or by importance
    const tools = [
        'compress-pdf',
        'edit-metadata',
        'edit-pdf',
        'jpg-to-pdf',
        'merge-pdf',
        'ocr-pdf',
        'organize-pdf',
        'pdf-to-excel',
        'pdf-to-jpg',
        'pdf-to-word',
        'protect-pdf',
        'repair-pdf',
        'rotate-pdf',
        'sign-pdf',
        'split-pdf',
        'unlock-pdf',
        'watermark-pdf',
        'word-to-pdf',
    ]

    const routes: MetadataRoute.Sitemap = [
        // Core Pages
        ...corePages.map((page) => ({
            url: `${baseUrl}${page ? `/${page}` : ''}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        })),
        // Info Pages
        ...infoPages.map((page) => ({
            url: `${baseUrl}/${page}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        // Tools
        ...tools.map((tool) => ({
            url: `${baseUrl}/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })),
    ]

    return routes
}
