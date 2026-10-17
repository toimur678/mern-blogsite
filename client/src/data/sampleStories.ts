import type { BlogData, EditorBlock } from '../assets/assets'

const stories = [
  { id: 'quiet-spaces', title: 'The quiet art of making room.', subTitle: 'In a world that asks us to do more, a new generation of spaces invites us to do a little less.', category: 'Design', image: 'quiet-spaces', author: 'Olivia Bennett', readTime: 7, featured: true },
  { id: 'less-but-better', title: 'Less, but better: a new way to create', subTitle: 'Why the most thoughtful work often begins with what we choose to leave out.', category: 'Design', image: 'design', author: 'Daniel Foster', readTime: 5 },
  { id: 'human-side-of-tech', title: 'The human side of a digital world', subTitle: 'Finding a more considered relationship with the tools that shape our days.', category: 'Technology', image: 'technology', author: 'Amelia Chen', readTime: 8 },
  { id: 'taking-the-slow-road', title: 'A case for taking the slow road', subTitle: 'Small towns, open landscapes, and the unexpected joy of having nowhere to be.', category: 'Lifestyle', image: 'coast', author: 'James Walker', readTime: 6 },
  { id: 'objects-with-stories', title: 'The objects we choose to keep', subTitle: 'On everyday rituals, meaningful objects, and the beauty of things made to last.', category: 'Culture', image: 'objects', author: 'Sofia Laurent', readTime: 4 },
  { id: 'small-starts', title: 'Great things begin with small starts', subTitle: 'A more thoughtful approach to building something you believe in.', category: 'Startup', image: 'workspace', author: 'Daniel Foster', readTime: 6 },
  { id: 'enough', title: 'What does enough look like?', subTitle: 'Rethinking ambition, personal wealth, and the things we value most.', category: 'Finance', image: 'mountains', author: 'Olivia Bennett', readTime: 9 },
  { id: 'closer-look', title: 'Learning to take a closer look', subTitle: 'An invitation to notice the extraordinary hiding in the ordinary.', category: 'Culture', image: 'coast', author: 'Sofia Laurent', readTime: 5 },
  { id: 'work-and-life', title: 'A working life with room to breathe', subTitle: 'How a few small boundaries can make space for your most meaningful work.', category: 'Lifestyle', image: 'workspace', author: 'Amelia Chen', readTime: 7 },
]

function blocks(story: typeof stories[number]): EditorBlock[] {
  return [
    { id: 'opening', type: 'paragraph', data: { text: story.subTitle + ' It starts with a simple question: what would happen if we gave our attention to fewer things, and gave those things a little more care?' } },
    { id: 'attention', type: 'header', data: { text: 'A little room for attention', level: 2 } },
    { type: 'paragraph', data: { text: 'There is a particular feeling that comes with stepping away from the noise. Details become clearer. An afternoon feels longer. We notice the way light moves across a room, or how a conversation changes when nobody is looking at a screen.' } },
    { type: 'paragraph', data: { text: 'This is not a call to abandon ambition. It is an invitation to consider its shape. The best work, the most memorable journeys, and the spaces we love tend to share something: they leave room for us to be present.' } },
    { type: 'quote', data: { text: 'The things that matter most rarely ask for our attention. We have to choose to give it.', caption: 'From the Folio notebook' } },
    { id: 'different-pace', type: 'header', data: { text: 'Finding a different pace', level: 2 } },
    { type: 'paragraph', data: { text: 'Start small. Choose one part of your day and give it a little more intention. Make a cup of coffee without doing something else. Take the longer way home. Keep a notebook close. Leave an hour unplanned.' } },
    { type: 'list', data: { style: 'unordered', items: [{ content: 'Make space before you fill it.', items: [] }, { content: 'Choose useful, beautiful things that last.', items: [] }, { content: 'Protect time for the people and ideas you care about.', items: [] }] } },
    { id: 'carry-forward', type: 'header', data: { text: 'Something to carry forward', level: 2 } },
    { type: 'paragraph', data: { text: 'A thoughtful life is built in small decisions, repeated. There is no perfect version to arrive at. There is only the practice of noticing, choosing, and beginning again. Perhaps that is enough of a place to start.' } },
  ]
}

export const sampleStories: BlogData[] = stories.map((story, index) => ({
  _id: `demo-${story.id}`, title: story.title, subTitle: story.subTitle, excerpt: story.subTitle,
  category: story.category, image: `/images/${story.image}.jpg`, authorName: story.author,
  readTime: story.readTime, featured: story.featured || false, isPublished: true, likes: [], tags: [story.category],
  createdAt: new Date(Date.UTC(2026, 9, 16 - index)).toISOString(), updatedAt: new Date(Date.UTC(2026, 9, 16 - index)).toISOString(),
  description: { blocks: blocks(story) },
}))
