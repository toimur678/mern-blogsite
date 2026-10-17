import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Blog from '../models/Blog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickblog'

const slugFor = (title: string, index: number): string =>
  `${title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)}-${index + 101}`

const blogsData = [
  {
    title: 'The Architecture of Quiet Spaces: How Restraint Shapes Modern Living',
    subTitle: 'When every room demands attention, the most radical design choice is deliberate silence.',
    category: 'Design',
    authorName: 'Elena Rostova',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    tags: ['Architecture', 'Interiors', 'Minimalism'],
    featured: true,
    readTime: 5,
    excerpt: 'True luxury in modern architecture is not ornamentation, but proportion, natural shadow, and breathing room for thought.',
    daysAgo: 1,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'We live in an age of sensory saturation. Our devices buzz with notifications, our streets hum with transit, and our built environments increasingly emulate commercial spectacles. In reaction to this perpetual noise, a quiet revolution is unfolding in contemporary architecture: the pursuit of the silent room.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Discipline of Subtraction', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'To design a quiet space is not simply to remove furniture or paint every wall alabaster white. Rather, it is a deliberate choreography between light, texture, and silence. When architects prioritize raw materials—unfinished oak, lime-washed plaster, honed limestone—the eye ceases to dart between visual interruptions. It rests.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'Simplicity is not about having less. It is about making room for what truly matters to flourish.',
          caption: 'John Pawson, On Architecture and Solitude',
          alignment: 'left'
        }
      },
      {
        type: 'header',
        data: { text: 'Key Principles of Quiet Interiors', level: 3 }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Indirect natural illumination that shifts subtly across matte wall textures throughout the day.',
            'Continuous floor planes without abrupt threshold transitions between adjacent zones.',
            'Acoustic dampening achieved through natural textiles, drapery, and sound-absorbing masonry.',
            'Concealed storage that prevents daily domestic clutter from competing with focal art or greenery.'
          ]
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'When we cross the threshold into a room conceived with genuine restraint, our nervous systems decompress. We breathe deeper. In the end, the architecture of quiet is not an aesthetic indulgence—it is an essential sanctuary for contemplative life.'
        }
      }
    ]
  },
  {
    title: 'The Silicon Renaissance: Microarchitecture in the Post-Moore Era',
    subTitle: 'As physical lithography meets fundamental atomic limits, chip design becomes an art of specialization.',
    category: 'Technology',
    authorName: 'Dr. Aris Thorne',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    tags: ['Hardware', 'Semiconductors', 'Engineering'],
    featured: true,
    readTime: 6,
    excerpt: 'The era of effortless frequency scaling is behind us. Today, computing breakthroughs come from custom silicon, unified memory, and purpose-built neural engines.',
    daysAgo: 2,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'For nearly half a century, the semiconductor industry sailed smoothly along the predictable current of Moore’s Law. Every two years, transistor density doubled, clocks ticked faster, and software developers received free performance without rewriting a single line of logic. That golden decade has decisively passed.'
        }
      },
      {
        type: 'header',
        data: { text: 'Thermal Walls and Atomic Thresholds', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'At gate lengths measured in single nanometers, quantum tunneling and thermal dissipation turn simple silicon channels into unpredictable conduits. Pushing clock frequencies past 5 GHz requires cryogenic cooling solutions that are unfeasible for consumer devices. The brute-force scaling era has ended.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'When raw speed is constrained by physics, architecture and heterogeneous domain design become our only salvation.',
          caption: 'David Patterson, Turing Award Lecture',
          alignment: 'left'
        }
      },
      {
        type: 'header',
        data: { text: 'The Shift to Domain-Specific Accelerators', level: 3 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Modern silicon progress is now driven by tailored execution units: tensor accelerators, dedicated image signal processors, and ultra-high-bandwidth unified memory fabrics. By matching silicon layout directly to mathematical workload patterns, modern systems achieve orders-of-magnitude energy efficiency improvements.'
        }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Unified memory architectures that eliminate redundant data copies between compute units.',
            '3D die stacking and advanced packaging (chiplets) connecting specialized silicon modules.',
            'Hardware matrix multipliers optimized specifically for neural tensor mathematics.',
            'Near-threshold voltage computing for extreme low-power ambient sensing.'
          ]
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Far from signaling technological stagnation, the post-Moore landscape has inaugurated a renaissance in computer engineering. Hardware design is once again an artisanal craft, rewarding deep synergy between algorithms and physical silicon.'
        }
      }
    ]
  },
  {
    title: 'The Marginalia of History: What Hand-Annotated Books Reveal',
    subTitle: 'Centuries of scribbled notes in library margins tell the intimate, unfiltered story of human curiosity.',
    category: 'Culture',
    authorName: 'Camilla Laurent',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80',
    tags: ['Literature', 'History', 'Libraries'],
    featured: true,
    readTime: 4,
    excerpt: 'In the scrawled notes, asterisks, and coffee stains of old volumes lies an intimate second book: the private dialogue between reader and author.',
    daysAgo: 3,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'In the rare book vaults of Oxford and Bologna, the greatest treasures are often not the pristine, untouched first folios. The true emotional resonance lives in the battered copies—the volumes where readers from the seventeenth or nineteenth century argued violently with the printed page in iron gall ink.'
        }
      },
      {
        type: 'header',
        data: { text: 'A Private Dialogue Across Generations', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Marginalia is intellectual graffiti preserved by happenstance. In one sixteenth-century translation of Aristotle, a student has penned in the margins: ‘Master argues poorly here; he forgets the nature of the eye.’ Four words that puncture historical distance, revealing a young mind refusing to bow blindly to authority.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'We read to know we are not alone. In marginalia, we discover we were never the first to wonder.',
          caption: 'H.J. Jackson, Marginalia: Readers Writing in Books',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'As digital reading platforms move toward ephemeral scrolling and closed formats, we risk losing this tactile layer of human witness. A book with hand-written notes is an artifact of attention, proof that someone spent hours wrestling with ideas that outlived them.'
        }
      }
    ]
  },
  {
    title: 'Grid Systems and Graphic Harmony: Lessons from Swiss Typography',
    subTitle: 'Order is not the absence of emotion, but the framework through which clarity speaks.',
    category: 'Design',
    authorName: 'Marcus Vance',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80',
    tags: ['Typography', 'Graphic Design', 'Swiss Style'],
    featured: false,
    readTime: 4,
    excerpt: 'The grid is an instrument of intellectual honesty. It establishes an invisible cadence that respects the reader above all else.',
    daysAgo: 4,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'During the mid-twentieth century, designers in Zurich and Basel pioneered a visual philosophy that would reshape international communication. Led by Josef Müller-Brockmann and Armin Hofmann, the Swiss Style elevated the mathematical grid from a mere layout tool to an ethical commitment to truth and legibility.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Logic of the Column', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'A grid is not a straitjacket; it is a canvas with measured tension. By establishing modular baselines, proportional gutter widths, and strict typographic hierarchy, the designer frees the content to communicate without rhetorical exaggeration.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style.',
          caption: 'Josef Müller-Brockmann, Grid Systems in Graphic Design',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Modern web and mobile interfaces owe their fundamental rhythm to these principles. When we open a clean digital publication today, the harmony we feel is Swiss rigor adapted for touch screens and variable viewports.'
        }
      }
    ]
  },
  {
    title: 'The Lost Craft of Humane Software Engineering',
    subTitle: 'Why the fastest code is the code you never write, and how simplicity became a lost discipline.',
    category: 'Technology',
    authorName: 'Devon Chen',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
    tags: ['Software', 'Craftsmanship', 'Engineering'],
    featured: false,
    readTime: 5,
    excerpt: 'We have built toolchains that generate millions of lines of abstraction to render a paragraph of text. It is time to rediscover simplicity.',
    daysAgo: 5,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Modern software engineering is caught in an irony of abundance. We possess silicon that executes billions of instructions per second, yet opening a simple messaging client can lag on a flagship computer. Layers of runtime abstractions, bloated packages, and unvetted dependencies have eroded the foundational craftsmanship of programming.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Virtue of Deliberate Constraints', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Great engineers do not measure their prowess by how many complex frameworks they assemble, but by how much extraneous code they delete. When you build with native platform capabilities and respect memory footprints, software gains an unmistakable snappiness that users immediately perceive.'
        }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Questioning every external dependency before adding it to package manifests.',
            'Prioritizing readable, straightforward loops over speculative meta-programming.',
            'Designing data structures around hardware cache lines and network latency.',
            'Maintaining sub-100 millisecond response times as an inviolable product requirement.'
          ]
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Humane engineering is ultimately an act of empathy. It recognizes that computational resources and user attention are precious finite gifts that should never be squandered.'
        }
      }
    ]
  },
  {
    title: 'A Century in Oil: Why the Great Galleries Still Hold Our Gaze',
    subTitle: 'In a world inundated with ephemeral pixels, the physical presence of canvas demands a different pace.',
    category: 'Culture',
    authorName: 'Julian Dubois',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
    tags: ['Art', 'Exhibitions', 'Visual Culture'],
    featured: false,
    readTime: 4,
    excerpt: 'A painting does not scroll. It does not update. It stands motionless, inviting our restless modern consciousness to adjust to its stillness.',
    daysAgo: 6,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Stand before an oil painting by Rembrandt, Cézanne, or Rothko, and something strange happens to your perception of time. In our digital routines, images pass before our eyes in fractions of a second. But physical oil on linen cannot be digested at the speed of a thumb swipe.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Physicality of the Impasto', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'A high-resolution display can reproduce the hue of a masterwork, but it cannot reproduce its physical topography: the thick ridge of white lead catching ambient daylight, the glazed translucent amber creating illusionary depth, the evidence of a human hand moving across days and years.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'Art is the only way to run away without leaving home.',
          caption: 'Twyla Tharp',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Visiting a gallery is an exercise in recalibration. In doing so, we rediscover that the deepest human experiences cannot be downloaded; they must be encountered in quiet space.'
        }
      }
    ]
  },
  {
    title: 'The Sacred First Hour: Rituals of Quiet Morning Focus',
    subTitle: 'Before the digital world intrudes, solitary morning rituals ground the creative mind.',
    category: 'Lifestyle',
    authorName: 'Sophia Lindqvist',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    tags: ['Rituals', 'Mindfulness', 'Morning Routine'],
    featured: false,
    readTime: 4,
    excerpt: 'How you spend the sixty minutes after waking determines whether you will author your day or react to someone else’s agenda.',
    daysAgo: 7,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'For centuries, writers, composers, and thinkers guarded their dawn hours with religious devotion. In the early stillness before email threads ignite and street traffic surges, the mind enjoys an unscattered clarity that cannot be manufactured later in the afternoon.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Single-Rule Morning', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'The most transformative morning habit is astonishingly simple: do not touch a screen for sixty minutes after opening your eyes. Drink water, brew a pour-over coffee, journal three unfiltered pages, or stretch in silence. Give your own consciousness the privilege of setting the day’s emotional baseline.'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'When we protect this quiet threshold, the entire day transforms. We move with deliberate intent rather than reactive frenzy.'
        }
      }
    ]
  },
  {
    title: 'Walking Without Destination: The Solitary Philosophy of Forest Bathing',
    subTitle: 'Shinrin-yoku is not outdoor exercise; it is the art of letting nature reclaim our attention.',
    category: 'Lifestyle',
    authorName: 'Kai Takahashi',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    tags: ['Nature', 'Wellness', 'Slow Living'],
    featured: false,
    readTime: 5,
    excerpt: 'Step beneath the forest canopy and leave your metrics behind. The woods ask nothing of you except your presence.',
    daysAgo: 8,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Originating in Japan during the 1980s, the practice of Shinrin-yoku—literally forest bathing—was conceived as a vital public health antidote to urban tech burnout. Crucially, forest bathing is neither hiking nor physical conditioning. There is no summit to reach, no calorie goal to hit, and no GPS track to record.'
        }
      },
      {
        type: 'header',
        data: { text: 'Awakening the Sensory Cortex', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'In the woods, attention shifts from effortful directed focus (the kind demanded by spreadsheets and code) to involuntary attention (soft fascination). The scent of damp pine needles, the dappled patterns of sunlight filtering through cedar branches, the crunch of decayed leaves underfoot—all gently restore our depleted cognitive reserves.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'In every walk with nature one receives far more than he seeks.',
          caption: 'John Muir',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Two hours spent wandering without hurry among trees measurably lowers salivary cortisol, stabilizes blood pressure, and rekindles creative curiosity. The forest reminds us that we are biological creatures who belong to the earth.'
        }
      }
    ]
  },
  {
    title: 'Building in the Open: How Transparency Breeds Enduring Trust',
    subTitle: 'When founders trade guarded secrecy for radical openness, customers become devoted collaborators.',
    category: 'Startup',
    authorName: 'Rowan Sterling',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    tags: ['Startups', 'Leadership', 'Transparency'],
    featured: false,
    readTime: 5,
    excerpt: 'The era of stealth mode is dying. In the digital economy, authentic vulnerability and open roadmaps are the ultimate competitive moats.',
    daysAgo: 9,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'For generations, business conventional wisdom dictated that startups must guard their strategies like state secrets. Founders operated in ‘stealth mode’ for months or years, emerging only with grand theatrical product launches. But in an internet landscape where software is commoditized, secrecy is often just a mask for fear of feedback.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Open Roadmap Advantage', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'When a founding team publicly shares its monthly revenue numbers, product bugs, architectural dilemmas, and roadmap trade-offs, something remarkable happens: prospective buyers stop acting like suspicious evaluators and begin rooting for the team’s success.'
        }
      },
      {
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Immediate feedback loops that kill unviable features before expensive development begins.',
            'Organic recruiting of high-caliber engineers who value cultural integrity and candor.',
            'A loyal base of early adopters whose input directly shapes the product’s core ergonomics.'
          ]
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Transparency is not a marketing tactic; it is an organizational posture. Companies that have nothing to hide build relationships that price-slashing competitors cannot dismantle.'
        }
      }
    ]
  },
  {
    title: 'The Counter-Intuitive Power of Staying Small',
    subTitle: 'Resisting hyper-growth to build calm, profitable, and durable software companies.',
    category: 'Startup',
    authorName: 'Nadia Al-Mansoor',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=80',
    tags: ['Bootstrapping', 'Business', 'Philosophy'],
    featured: false,
    readTime: 4,
    excerpt: 'Bigger is not automatically better. A boutique team of four masters will consistently out-innovate a bureaucratic department of forty.',
    daysAgo: 10,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Venture capital culture equates enterprise value with headcount growth. Raise a larger round, hire dozens of specialists, install layers of middle management, and pursue top-line market share at any burn rate. Yet many of the most admired and profitable tools on the internet today are run by fewer than ten people.'
        }
      },
      {
        type: 'header',
        data: { text: 'Freedom from the Growth Treadmill', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'A company of one or a team of five enjoys an agility that corporate giants envy. There are no two-hour alignment committees, no PowerPoint status presentations, and no quarterly panic to satisfy impatient institutional funds. Decisions are made over afternoon tea, and software ships the same day.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'What if you didn’t have to grow? What if staying small was the best way to do your finest work and enjoy your life?',
          caption: 'Paul Jarvis, Company of One',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'By defining what ‘enough’ looks like, boutique founders preserve their creative agency and deliver products characterized by singular focus and obsessive polish.'
        }
      }
    ]
  },
  {
    title: 'The Architecture of Capital: Understanding Long-Horizon Investments',
    subTitle: 'Why true wealth creation mirrors cathedral building rather than quarterly market sprints.',
    category: 'Finance',
    authorName: 'Arthur Sterling',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    tags: ['Economics', 'Investing', 'Patience'],
    featured: false,
    readTime: 5,
    excerpt: 'Financial markets reward those who can tolerate boredom. Real compounding occurs when capital is left undisturbed across decades.',
    daysAgo: 11,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Modern financial media is engineered around urgency: breaking tickers, flashing green and red candlesticks, and quarterly earnings theatrics. Yet the greatest investors in economic history operate more like foresters or stone masons. They understand that compounding is an exponential curve whose rewards belong strictly to the patient.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Friction Cost of Over-Activity', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Every transaction introduces tax liabilities, advisory fees, and timing risk. Academic studies consistently reveal that retail and institutional accounts with the highest turnover underperform passive indices. The urge to ‘do something’ during volatility is almost always the investor’s greatest enemy.'
        }
      },
      {
        type: 'quote',
        data: {
          text: 'The stock market is a device for transferring money from the impatient to the patient.',
          caption: 'Warren Buffett',
          alignment: 'left'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Building enduring capital requires decoupling one’s emotional state from the morning news cycle. True financial wisdom lies in having a philosophy robust enough to ignore ninety-nine percent of the daily noise.'
        }
      }
    ]
  },
  {
    title: 'The Enduring Ledger: Personal Economics in an Uncertain Century',
    subTitle: 'Simplicity, margin of safety, and emotional discipline remain the three pillars of financial autonomy.',
    category: 'Finance',
    authorName: 'Claire Beaufort',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80',
    tags: ['Personal Finance', 'Wealth', 'Philosophy'],
    featured: false,
    readTime: 4,
    excerpt: 'Financial independence is not a magic portfolio number; it is the absence of anxiety and the freedom to spend your hours as you choose.',
    daysAgo: 12,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'In conversations about money, society routinely fixates on maximization: how to earn more, borrow more, leverage more. But financial resilience is built upon optimization and buffer zones. Having six months of living expenses in an unexciting reserve account provides more peace of mind than speculative windfall chasing.'
        }
      },
      {
        type: 'header',
        data: { text: 'The Luxury of Saying No', level: 2 }
      },
      {
        type: 'paragraph',
        data: {
          text: 'The greatest dividend money pays is control over your own time. When your overhead is lean and your balance sheet is free of high-interest consumer debt, you possess the ultimate career asset: the power to walk away from bad clients, toxic offices, and misaligned opportunities.'
        }
      },
      {
        type: 'paragraph',
        data: {
          text: 'Keep your ledger transparent, live below your means with quiet contentment, and let simple math do the heavy lifting. In an unpredictable world, self-sufficiency is the ultimate luxury.'
        }
      }
    ]
  }
]

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`)
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB.')

    // Clear existing sample/demo blogs if any
    const existingCount = await Blog.countDocuments()
    console.log(`Current blogs in database: ${existingCount}`)

    const now = Date.now()
    const insertedBlogs = []

    for (let i = 0; i < blogsData.length; i++) {
      const b = blogsData[i]
      const timestamp = new Date(now - b.daysAgo * 86400000)
      const slug = slugFor(b.title, i)

      const doc = {
        title: b.title,
        subTitle: b.subTitle,
        category: b.category,
        authorName: b.authorName,
        image: b.image,
        tags: b.tags,
        featured: b.featured,
        readTime: b.readTime,
        excerpt: b.excerpt,
        isPublished: true,
        slug,
        description: {
          time: timestamp.getTime(),
          blocks: b.blocks,
          version: '2.30.7'
        },
        publishedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        likes: []
      }

      const created = await Blog.findOneAndUpdate(
        { slug },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      insertedBlogs.push(created)
      console.log(`[${i + 1}/${blogsData.length}] Seeded: "${created.title}" (${created.category})`)
    }

    const totalCount = await Blog.countDocuments({ isPublished: true })
    console.log(`\nSuccessfully seeded ${insertedBlogs.length} articles! Total published blogs in DB: ${totalCount}`)

    await mongoose.disconnect()
    console.log('Database connection closed cleanly.')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

void seed()

