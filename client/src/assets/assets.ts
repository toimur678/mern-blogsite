import upload_area from './upload_area.svg'

export const assets = {
    upload_area,
}

// Editor.js block types
export interface EditorBlock {
    id?: string
    type: string
    data: Record<string, unknown>
}

export interface EditorOutputData {
    time?: number
    blocks: EditorBlock[]
    version?: string
}

export interface BlogData {
    _id: string
    title: string
    subTitle?: string
    description: EditorOutputData
    category: string
    image: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
    __v?: number
}

export interface CommentData {
    _id: string
    blog: BlogData
    name: string
    content: string
    isApproved: boolean
    createdAt: string
    updatedAt: string
    __v?: number
}

export interface DashboardData {
    blogs: number
    comments: number
    drafts: number
    recentBlogs: BlogData[]
}

export interface FooterSection {
    title: string
    links: string[]
}

export const blogCategories: string[] = ['All', 'Technology', 'Startup', 'Lifestyle', 'Finance']

export const blog_data: BlogData[] = [
    {
        "_id": "6805ee7dd8f584af5da78d37",
        "title": "A detailed step by step guide to manage your lifestyle",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "A Simple Step-by-Step Guide to Managing Your Lifestyle", "level": 1 } },
                { "type": "paragraph", "data": { "text": "If you're looking to improve your health, boost productivity, and create a balanced life, managing your lifestyle intentionally is key." } }
            ]
        },
        "category": "Lifestyle",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Lifestyle",
        "createdAt": "2025-04-21T07:06:37.508Z",
        "updatedAt": "2025-04-24T08:26:29.750Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "A Simple Step-by-Step Guide to Managing Your Lifestyle"
    },
    {
        "_id": "6805ef08d8f584af5da78d39",
        "title": "How to create an effective startup roadmap or ideas",
        "description": {
            "blocks": [
                { "type": "paragraph", "data": { "text": "Creating an effective startup roadmap helps you turn an idea into a structured, actionable plan." } }
            ]
        },
        "category": "Startup",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Startup",
        "createdAt": "2025-04-21T07:08:56.214Z",
        "updatedAt": "2025-04-24T08:30:47.920Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "Creating an effective startup roadmap"
    },
    {
        "_id": "6805f2aad8f584af5da78d3b",
        "title": "Learning new technology to boost your career in software",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Learning New Tech to Boost Your Software Career", "level": 1 } },
                { "type": "paragraph", "data": { "text": "In tech, staying still means falling behind." } }
            ]
        },
        "category": "Technology",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Technology",
        "createdAt": "2025-04-21T07:24:26.853Z",
        "updatedAt": "2025-04-24T08:20:36.187Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "Learning New Tech to Boost Your Software Career"
    },
    {
        "_id": "6805f2e2d8f584af5da78d3d",
        "title": "Tips for getting the most out of apps and software",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Tips for Getting the Most Out of Apps and Software", "level": 1 } },
                { "type": "paragraph", "data": { "text": "We use tons of apps daily — but most people only scratch the surface." } }
            ]
        },
        "category": "Technology",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Apps",
        "createdAt": "2025-04-21T07:25:22.362Z",
        "updatedAt": "2025-04-24T08:20:36.979Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "Tips for Getting the Most Out of Apps and Software"
    },
    {
        "_id": "6805f307d8f584af5da78d3f",
        "title": "Enhancing your skills and capturing memorable moments",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Enhancing Your Skills and Capturing Memorable Moments", "level": 1 } },
                { "type": "paragraph", "data": { "text": "In today's fast-paced world, personal growth and preserving memories go hand in hand." } }
            ]
        },
        "category": "Lifestyle",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Skills",
        "createdAt": "2025-04-21T07:25:59.789Z",
        "updatedAt": "2025-04-24T08:32:42.649Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "Enhancing Your Skills and Capturing Memorable Moments"
    },
    {
        "_id": "6805f324d8f584af5da78d41",
        "title": "Maximizing returns by minimizing resources in your startup",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Maximizing Returns by Minimizing Resources in Your Startup", "level": 1 } },
                { "type": "paragraph", "data": { "text": "Startups thrive not by having the most, but by using the least for the most impact." } }
            ]
        },
        "category": "Startup",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Startup",
        "createdAt": "2025-04-21T07:26:28.058Z",
        "updatedAt": "2025-04-24T09:32:08.179Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "Maximizing Returns by Minimizing Resources in Your Startup"
    },
    {
        "_id": "68062afc8474108ecb7d7944",
        "title": "Taxes on Luxury Houses",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Luxury Home Taxes: Are They Fair, and What Do They Mean for the Market?", "level": 2 } },
                { "type": "paragraph", "data": { "text": "Luxury homes. The pinnacle of real estate." } }
            ]
        },
        "category": "Finance",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Finance",
        "createdAt": "2025-04-21T11:24:44.773Z",
        "updatedAt": "2025-04-24T09:31:52.102Z",
        "__v": 0,
        "isPublished": true,
        "subTitle": "What Do They Mean for the Market?"
    },
    {
        "_id": "6809f9f23e075dbeedd23bca",
        "title": "The New Way of Study",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "The New Way of Study: Ditching the Old, Embracing the Now", "level": 2 } },
                { "type": "paragraph", "data": { "text": "For years, the image of studying has been synonymous with late nights." } }
            ]
        },
        "category": "Finance",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Study",
        "isPublished": true,
        "createdAt": "2025-04-24T08:44:34.937Z",
        "updatedAt": "2025-04-24T09:59:21.299Z",
        "__v": 0,
        "subTitle": "The New Way of Study: Ditching the Old"
    },
    {
        "_id": "6810995bb5fd81dd0c923d5b",
        "title": "Importance of Tourism",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "Beyond Postcards: Why Tourism Matters More Than You Think", "level": 2 } },
                { "type": "paragraph", "data": { "text": "Tourism is a powerhouse." } }
            ]
        },
        "category": "Lifestyle",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Tourism",
        "isPublished": true,
        "createdAt": "2025-04-29T09:18:19.662Z",
        "updatedAt": "2025-04-29T10:13:25.035Z",
        "__v": 0,
        "subTitle": " Why Tourism Matters More Than You Think"
    },
    {
        "_id": "6810a6a2ed57ecc68a99abb3",
        "title": "AI best practices in healthcare",
        "description": {
            "blocks": [
                { "type": "header", "data": { "text": "AI Best Practices in Healthcare: Navigating the Future Responsibly", "level": 2 } },
                { "type": "paragraph", "data": { "text": "AI is rapidly transforming healthcare." } }
            ]
        },
        "category": "Lifestyle",
        "image": "https://placehold.co/800x450/CEE4E1/087A68?text=Healthcare",
        "isPublished": true,
        "createdAt": "2025-04-29T10:14:58.575Z",
        "updatedAt": "2025-04-29T10:14:58.575Z",
        "__v": 0,
        "subTitle": "Navigating the Future Responsibly"
    }
]

export const comments_data: CommentData[] = [
        {
            "_id": "6811ed9e7836a82ba747cb25",
            "blog": blog_data[0],
            "name": "Michael Scott",
            "content": "This is my new comment",
            "isApproved": false,
            "createdAt": "2025-04-30T09:30:06.918Z",
            "updatedAt": "2025-04-30T09:30:06.918Z",
            "__v": 0
        },
        {
            "_id": "6810a752fbb942aa7cbf4adb",
            "blog": blog_data[1],
            "name": "John Doe",
            "content": "This is a nice blog",
            "isApproved": false,
            "createdAt": "2025-04-29T10:17:54.832Z",
            "updatedAt": "2025-04-29T10:17:54.832Z",
            "__v": 0
        },
        {
            "_id": "680779aebef75c08f8b4898f",
            "blog": blog_data[2],
            "name": "Jack London",
            "content": "Hi this blog is must to read",
            "isApproved": true,
            "createdAt": "2025-04-22T11:12:46.547Z",
            "updatedAt": "2025-04-22T11:13:10.015Z",
            "__v": 0
        },
        {
            "_id": "680770aeb2897e5c28bf9b26",
            "blog": blog_data[3],
            "name": "Sam Smith",
            "content": "This is the best blog, everybody should read it",
            "isApproved": false,
            "createdAt": "2025-04-22T10:34:22.020Z",
            "updatedAt": "2025-04-22T10:34:22.020Z",
            "__v": 0
        },
        {
            "_id": "68076468e32055c94a696cf5",
            "blog": blog_data[4],
            "name": "Peter Lawrence",
            "content": "Honestly, I did not expect this to work, but it totally did. Saved my project!",
            "isApproved": true,
            "createdAt": "2025-04-22T09:42:00.444Z",
            "updatedAt": "2025-04-22T10:24:55.626Z",
            "__v": 0
        }
    ]

export const dashboard_data: DashboardData = {
    "blogs": 10,
    "comments": 5,
    "drafts": 0,
    "recentBlogs": blog_data.slice(0, 5),
}

export const footer_data: FooterSection[] = [
      {
          title: "Explore",
          links: ["Home", "Latest Blogs", "Categories", "About Us", "Contact"]
      },
      {
          title: "Resources",
          links: ["Write for Us", "RSS Feed", "Newsletter", "Sitemap", "FAQs"]
      },
      {
          title: "Follow Us",
          links: ["Twitter", "LinkedIn", "GitHub", "YouTube"]
      }
  ];

/**
 * Extract plain text from Editor.js output data (for previews and reading time)
 */
export function extractTextFromBlocks(description: EditorOutputData): string {
    if (!description?.blocks) return ''
    return description.blocks
        .map(block => {
            if (typeof block.data.text === 'string') return block.data.text
            if (Array.isArray(block.data.items)) return (block.data.items as string[]).join(' ')
            return ''
        })
        .filter(Boolean)
        .join(' ')
}
