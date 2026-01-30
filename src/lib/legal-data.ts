import {
  Eye,
  Server,
  Cookie,
  Shield,
  Users,
  Lock,
  Mail,
  AlertTriangle,
  FileText,
  Scale,
  Globe,
  Gavel,
  Settings,
  Info,
} from "lucide-react";

export const privacySections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `SimplyPDF is designed with privacy as a core principle. We collect minimal information:

**Automatically Collected:**
- Basic analytics data (page views, browser type, device type) through cookies
- IP addresses for analytics and fraud prevention
- Error logs to improve our service

**What We DON'T Collect:**
- Your PDF files or their contents
- Personal documents or data within your files
- Any file metadata

All PDF processing happens directly in your browser. Your files never leave your device or get uploaded to our servers.`,
  },
  {
    icon: Server,
    title: "How We Process Your Files",
    content: `**100% Browser-Based Processing**

Unlike other PDF tools, SimplyPDF processes all files locally in your web browser using JavaScript. This means:

- Your files are NEVER uploaded to any server
- Processing happens entirely on your device
- Files are automatically cleared from browser memory when you close the tab
- No copies of your documents are ever made or stored

This architecture ensures complete privacy and security for sensitive documents like contracts, financial statements, or personal records.`,
  },
  {
    icon: Cookie,
    title: "Cookies and Tracking Technologies",
    content: `We and our advertising partners use cookies, web beacons, and similar technologies for:

**Essential Cookies:**
- Session management and user preferences
- Authentication state (if you sign in with Google)

**Analytics Cookies:**
- Google Analytics to understand how visitors use our site
- This helps us improve the user experience

**Advertising Cookies:**
- Google AdSense to display advertisements on our site
- Third parties, including Google, use cookies to serve ads based on your prior visits to this website or other websites
- These cookies enable Google and its partners to serve ads based on your visit to our site and/or other sites on the Internet

**How Google Uses Your Data:**
When you visit our site, third parties including Google may place and read cookies on your browser, or use web beacons to collect information. To learn more about how Google uses data when you use our site, visit: https://policies.google.com/technologies/partner-sites

**Managing Cookie Preferences:**
You can control cookie preferences through your browser settings. You may also opt out of personalized advertising by visiting Google's Ads Settings (https://adssettings.google.com) or by visiting https://www.aboutads.info to opt out of third-party advertising cookies. Disabling cookies may affect some functionality.`,
  },
  {
    icon: Shield,
    title: "Third-Party Services & Advertising",
    content: `We integrate with the following third-party services:

**Google AdSense (Advertising):**
- We use Google AdSense to display advertisements
- Google and its partners use cookies to serve ads based on your prior visits to this or other websites
- You may opt out of personalized advertising by visiting Google's Ads Settings
- For more information about how Google collects and uses data, see: https://policies.google.com/technologies/partner-sites

**Google Analytics:**
- Used for website analytics and understanding user behavior
- Google's privacy policy applies to data collected through Analytics
- We use analytics to improve our service, not for advertising purposes

**Google Sign-In:**
- Optional authentication service
- We only receive your name, email, and profile picture when you choose to sign in
- We do not sell, trade, or transfer your personal information

**Interest-Based Advertising:**
We participate in interest-based advertising using Google AdSense. This means ads may be tailored based on your browsing history. You can learn more about this type of advertising and your choices at:
- Digital Advertising Alliance: https://www.aboutads.info
- Network Advertising Initiative: https://www.networkadvertising.org`,
  },
  {
    icon: Users,
    title: "Children's Privacy (COPPA Compliance)",
    content: `**Age Restriction:**
SimplyPDF is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.

**COPPA Compliance:**
In compliance with the Children's Online Privacy Protection Act (COPPA):
- We do not target or collect data from users under 13 years of age
- We do not use interest-based advertising to target children under 13
- If we become aware that we have inadvertently collected personal information from a child under 13, we will take steps to delete that information

**Parental Rights:**
If you are a parent or guardian and believe your child has provided us with personal information, please contact us at arshverma.dev@gmail.com so we can delete the information.

**Note for Parents:**
We recommend parents supervise their children's online activities and consider using parental control tools available from online services and software manufacturers.`,
  },
  {
    icon: Lock,
    title: "Data Security",
    content: `We implement security measures to protect your information:

- HTTPS encryption for all data transmission
- No server-side storage of user files
- Regular security audits of our codebase
- Secure authentication through Google OAuth

Since files are processed locally in your browser, the primary security consideration is your own device's security.`,
  },
  {
    icon: Mail,
    title: "Your Rights & Choices",
    content: `You have the right to:

**Access:** Request information about data we hold about you
**Deletion:** Request deletion of your account and associated data
**Opt-out:** Disable cookies and tracking through browser settings
**Portability:** Export your history data (if signed in)
**Advertising Opt-out:** Opt out of personalized advertising through Google's Ads Settings

**For EU/EEA Users (GDPR):**
You have additional rights including the right to object to processing, right to rectification, and right to lodge a complaint with a supervisory authority.

**For California Users (CCPA):**
You have the right to know what personal information is collected, request deletion, and opt-out of the sale of personal information (we do not sell personal information).

To exercise any of these rights, contact us at: arshverma.dev@gmail.com`,
  },
  {
    icon: AlertTriangle,
    title: "Policy Updates",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

**Contact Us:**
If you have any questions about this Privacy Policy, please contact us at:
- Email: arshverma.dev@gmail.com
- Website: https://simplypdf.vercel.app/contact`,
  },
];

export const termsSections = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: `By accessing and using SimplyPDF ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.

These terms apply to all visitors, users, and others who access or use the Service. We reserve the right to modify these terms at any time. Continued use of the Service after any changes constitutes acceptance of the new terms.`,
  },
  {
    icon: Globe,
    title: "2. Description of Service",
    content: `SimplyPDF provides free online tools for PDF manipulation, including but not limited to:

• Merging multiple PDF files into one document
• Splitting PDF documents into separate files
• Compressing PDF files to reduce size
• Converting between PDF and other formats (JPG, Word, Excel)
• Rotating, organizing, and editing PDF pages
• Adding watermarks and signatures to PDFs
• Password protecting and unlocking PDFs
• Extracting text from scanned documents (OCR)

**Important:** All file processing occurs locally in your web browser. Files are not uploaded to our servers.`,
  },
  {
    icon: Users,
    title: "3. User Responsibilities",
    content: `When using SimplyPDF, you agree to:

**Lawful Use:**
• Use the Service only for lawful purposes
• Not process documents that infringe on others' intellectual property rights
• Not use the Service to create, distribute, or process illegal content

**Appropriate Conduct:**
• Not attempt to interfere with or disrupt the Service
• Not attempt to access systems or data you're not authorized to access
• Not use automated systems or software to extract data from the Service

**Your Files:**
• You are solely responsible for the files you process
• You must have the legal right to modify any documents you upload
• We are not responsible for the content of your files`,
  },
  {
    icon: Scale,
    title: "4. Intellectual Property",
    content: `**Our Content:**
The SimplyPDF name, logo, and all associated graphics, code, and content are protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without written permission.

**Your Content:**
You retain all rights to your PDF files and documents. By using our Service, you do not grant us any rights to your content. Since all processing happens in your browser, we never have access to your files.

**Open Source:**
SimplyPDF uses various open-source libraries. These libraries retain their respective licenses and attributions.`,
  },
  {
    icon: AlertTriangle,
    title: "5. Disclaimer of Warranties",
    content: `**AS-IS Service:**
SimplyPDF is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:

• Implied warranties of merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy or completeness of results

**No Guarantees:**
We do not guarantee that:
• The Service will be uninterrupted or error-free
• Results will meet your specific requirements
• Any errors will be corrected
• The Service will be compatible with all systems

**Backup Responsibility:**
Always keep backup copies of your original files. We are not responsible for any data loss.`,
  },
  {
    icon: Gavel,
    title: "6. Limitation of Liability",
    content: `**Maximum Liability:**
To the maximum extent permitted by law, SimplyPDF and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

• Loss of profits or revenue
• Loss of data or documents
• Business interruption
• Any other intangible losses

This applies regardless of whether we were advised of the possibility of such damages.

**Your Sole Remedy:**
Your sole remedy for dissatisfaction with the Service is to stop using it.`,
  },
  {
    icon: FileText,
    title: "7. Modifications to Service",
    content: `We reserve the right to:

• Modify or discontinue any part of the Service at any time
• Update features, tools, or functionality without notice
• Change these Terms of Service with notice posted on this page

We are not liable to you or any third party for any modification, suspension, or discontinuance of the Service.`,
  },
  {
    icon: Globe,
    title: "8. Governing Law",
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

Any disputes arising from these terms or your use of the Service shall be resolved in the courts of India.

If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.`,
  },
];

export const cookieSections = [
  {
    icon: Eye,
    title: "What are cookies?",
    content:
      "Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.",
  },
  {
    icon: Shield,
    title: "How we use cookies",
    content:
      "We use cookies to provide essential website functionality, analyze site traffic, and serve personalized advertisements through Google AdSense. Some cookies are necessary for the site to function, while others help us improve your experience.",
  },
  {
    icon: Settings,
    title: "Managing cookies",
    content:
      "You can manage your cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, but doing so may affect certain features of the website.",
  },
];

export const disclaimerSections = [
  {
    icon: Info,
    title: "General Information",
    content: `The information provided by SimplyPDF ("we," "us," or "our") on our website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.`,
  },
  {
    icon: Shield,
    title: "No Liability",
    content: `Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.`,
  },
  {
    icon: Scale,
    title: "Local Processing",
    content: `SimplyPDF processes all files locally in your browser. While this provides enhanced privacy, we are not responsible for any data loss, file corruption, or security breaches that may occur on your device or as a result of your browser's configuration.`,
  },
];
