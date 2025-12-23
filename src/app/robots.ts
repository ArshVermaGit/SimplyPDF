import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simplypdf.vercel.app'
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/history'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
