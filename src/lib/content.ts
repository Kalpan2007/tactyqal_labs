// All homepage copy lives here so it can later come from a CMS / the blog API (Task 2).

export const nav = [
  { label: "About", href: "#about" },
  { label: "Programme", href: "#programme" },
  { label: "Projects", href: "#projects" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export const heroPoints = [
  "1:1 mentoring with a startup expert",
  "From idea to a launched full-stack app",
  "No prior coding needed",
  "Support for university applications, grants and press",
];

export const stats = [
  { value: "100+", label: "students mentored" },
  { value: "50+", label: "successful student founders" },
  { value: "8 weeks", label: "from idea to launch" },
];

export type Project = {
  name: string;
  category: string;
  summary: string;
  result?: string;
  tone: "teal" | "sun" | "ink" | "mist";
  founder?: string;
};

export const projects: Project[] = [
  {
    name: "One Last Chapter",
    category: "Subscription service",
    summary: "A book subscription service for kids.",
    founder: "Started by a 13-year-old",
    result: "₹1,00,000 monthly revenue",
    tone: "sun",
  },
  {
    name: "Elenor Vegan Handbags",
    category: "E-commerce",
    summary: "A corporate gifting platform selling vegan handbags.",
    founder: "Started by a 16-year-old",
    result: "₹9,000 in the first week",
    tone: "teal",
  },
  {
    name: "KrishiDrishti",
    category: "AgriTech · AI",
    summary: "AI soil analysis and crop recommendations for local farmers in India.",
    tone: "ink",
  },
  {
    name: "Paws of Promise",
    category: "Social impact",
    summary: "A virtual pet adoption app that connects pet lovers with shelters.",
    tone: "mist",
  },
  {
    name: "AudioNova",
    category: "Creative · AI",
    summary: "An AI music and video production company.",
    tone: "ink",
  },
  {
    name: "Converza",
    category: "EdTech · AI",
    summary: "A Spanish learning app with Luna, a friendly AI language tutor.",
    tone: "teal",
  },
];

export const phases = [
  {
    weeks: "Weeks 1–2",
    title: "Ideation and market research",
    tags: ["Problem discovery", "User interviews", "Validation"],
    detail: "Find a problem worth solving, talk to real users and validate the idea before building.",
  },
  {
    weeks: "Weeks 3–4",
    title: "Design and prototyping",
    tags: ["Wireframes", "Clickable prototype", "User testing"],
    detail: "Sketch the screens, build a clickable prototype and test it with the first users.",
  },
  {
    weeks: "Weeks 5–6",
    title: "Full-stack development",
    tags: ["Database", "Logins", "Payments"],
    detail: "Build the working app with modern no-code and AI tools: database, logins and payments.",
  },
  {
    weeks: "Weeks 7–8",
    title: "Launch and marketing",
    tags: ["Product Hunt", "Pitch deck", "Growth plan"],
    detail: "Ship it publicly, launch on Product Hunt, write the pitch deck and plan for growth.",
  },
];

export const benefits = [
  {
    title: "1:1 personalised mentoring",
    detail: "Every student gets a dedicated mentor and expert guidance. No group classes.",
  },
  {
    title: "A real full-stack app, no coding needed",
    detail: "Students build a working product with modern no-code and AI platforms.",
  },
  {
    title: "Proven track record",
    detail: "50+ successful students, real revenue and admits to top universities.",
  },
  {
    title: "An edge in university admissions",
    detail: "A launched product with real users stands out in any application.",
  },
  {
    title: "Real revenue",
    detail: "Students learn to sell, launch and earn from the apps they build.",
  },
  {
    title: "Pitching and presentation",
    detail: "Learn to pitch, present and launch on Product Hunt with confidence.",
  },
  {
    title: "Lifelong support",
    detail: "The mentoring doesn't stop at week 8. Students can keep coming back.",
  },
];

export type Tool = { label: string; href: string };

/** The real tool URLs from tactyqal.com, so every link on the page goes somewhere. */
export const toolsIndexUrl = 'https://tactyqal.com/Tests';

export const tools: Tool[] = [
  { label: 'Startup idea generator', href: 'https://www.tactyqal.com/index.php/Questions/ideaDisplayer' },
  { label: 'Fundability assessment', href: 'https://tactyqal.com/Tests/Fundable-Startup' },
  { label: 'Team evaluation tool', href: 'https://tactyqal.com/Tests/Startup-Team' },
  { label: 'Pitch deck analyser', href: 'https://www.tactyqal.com/Tests/Pitch-Deck' },
  { label: 'Top 10 traits for business success', href: 'https://www.tactyqal.com/Tests/General-Success' },
  { label: 'Co-founder compatibility test', href: 'https://www.tactyqal.com/Tests/The-Right-Cofounder' },
  { label: 'Problem-solution fit', href: 'https://www.tactyqal.com/Tests/Problem-Solution-Fit' },
  { label: 'Landing page assessment', href: 'https://www.tactyqal.com/Tests/Landing-Page' },
];

/** Real contact details, taken from tactyqal.com. */
export const contact = {
  email: 'tactyqal.labs@gmail.com',
  phone: '+91 98047 72106',
  phoneHref: 'tel:+919804772106',
  hours: 'Mon to Sat, 9am to 7pm',
  responseTime: 'Replies within 24 hours',
};

export const testimonials = [
  { name: "Devansh Mehta", quote: "I went from having no idea to launching my app." },
  { name: "Simran Kaur", quote: "I can focus on the creative side and don't have to worry about whether it can be built." },
  { name: "Isha Patel", quote: "Now I feel independent and can build anything I want." },
  { name: "Priya Nair", quote: "My impact app was only in my head until I built it." },
  { name: "Aarav Sharma", quote: "I had to struggle to find a tech co-founder." },
  { name: "Rohan Verma", quote: "It's the future." },
];

// The latest posts come from the database at request time (see src/lib/posts.ts),
// so there is no hard-coded list here.

export const pricing = {
  price: "₹16,000",
  was: "₹25,000",
  includes: [
    "8 weeks of 1:1 mentoring (live, 1 hour each)",
    "A full-stack app built and launched",
    "Product Hunt launch",
    "Pitch deck creation",
    "Marketing strategy",
    "Lifelong support after the programme",
  ],
};

export const faqs = [
  {
    q: "Does my child need to know how to code?",
    a: "No. Students build their app with modern no-code and AI tools, guided by their mentor at every step.",
  },
  {
    q: "How are the sessions run?",
    a: "Every session is a live 1:1 video call with a mentor, 1 hour long. There are no group classes.",
  },
  {
    q: "What will my child have at the end of 8 weeks?",
    a: "A launched, working app, a pitch deck, a Product Hunt launch and a marketing plan to keep growing it.",
  },
  {
    q: "How does this help with university admissions?",
    a: "A real product with real users shows initiative, technical skill and impact, which admissions teams look for.",
  },
  {
    q: "What happens after the programme ends?",
    a: "Support continues for life. Students can come back for help as their app and their ideas grow.",
  },
];
