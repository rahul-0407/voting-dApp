// Mock data for polls and votes
export const mockPolls = [
  {
    id: "poll-001",
    title: "Best Programming Language for 2025",
    description:
      "Vote for the programming language you think will dominate in 2025. Consider factors like community support, job market, and future prospects.",
    image: "/programming-languages-code.jpg",
    creator: "TechGuru42",
    createdAt: "2025-01-15T10:30:00Z",
    endTime: "2025-02-15T23:59:59Z",
    isPublic: true,
    status: "active",
    options: [
      { id: "opt1", text: "JavaScript", votes: 245 },
      { id: "opt2", text: "Python", votes: 189 },
      { id: "opt3", text: "TypeScript", votes: 156 },
      { id: "opt4", text: "Rust", votes: 98 },
    ],
    totalVotes: 688,
    hasVoted: false,
    userVote: null,
  },
  {
    id: "poll-002",
    title: "Favorite Web Framework",
    description:
      "Which web framework do you prefer for building modern applications? Share your experience and help others make informed decisions.",
    image: "/web-development-frameworks.jpg",
    creator: "WebDev_Master",
    createdAt: "2025-01-10T14:20:00Z",
    endTime: "2025-01-25T23:59:59Z",
    isPublic: true,
    status: "ended",
    options: [
      { id: "opt1", text: "React", votes: 342 },
      { id: "opt2", text: "Vue.js", votes: 198 },
      { id: "opt3", text: "Angular", votes: 156 },
      { id: "opt4", text: "Svelte", votes: 89 },
    ],
    totalVotes: 785,
    hasVoted: true,
    userVote: "opt1",
    winner: { id: "opt1", text: "React", votes: 342 },
  },
  {
    id: "poll-003",
    title: "Remote Work Preference",
    description:
      "How do you prefer to work in the post-pandemic era? Your input helps companies understand employee preferences.",
    image: "/remote-work-office-setup.jpg",
    creator: "HRInsights",
    createdAt: "2025-01-12T09:15:00Z",
    endTime: "2025-02-12T23:59:59Z",
    isPublic: true,
    status: "active",
    options: [
      { id: "opt1", text: "Fully Remote", votes: 423 },
      { id: "opt2", text: "Hybrid (2-3 days office)", votes: 298 },
      { id: "opt3", text: "Mostly Office", votes: 145 },
      { id: "opt4", text: "Fully Office", votes: 67 },
    ],
    totalVotes: 933,
    hasVoted: false,
    userVote: null,
  },
]

export const mockUserPolls = [
  {
    id: "poll-004",
    title: "Team Building Activity",
    description: "What team building activity should we organize for next month?",
    image: "/team-building-activities.png",
    creator: "You",
    createdAt: "2025-01-14T16:45:00Z",
    endTime: "2025-01-30T23:59:59Z",
    isPublic: false,
    status: "active",
    options: [
      { id: "opt1", text: "Escape Room", votes: 12 },
      { id: "opt2", text: "Bowling", votes: 8 },
      { id: "opt3", text: "Cooking Class", votes: 15 },
      { id: "opt4", text: "Outdoor Adventure", votes: 6 },
    ],
    totalVotes: 41,
    hasVoted: false,
    userVote: null,
  },
]

export const mockUserVotes = [
  {
    pollId: "poll-002",
    poll: mockPolls[1],
    votedAt: "2025-01-11T10:30:00Z",
    selectedOption: "opt1",
  },
  {
    pollId: "poll-005",
    poll: {
      id: "poll-005",
      title: "Best Coffee Shop in Town",
      description: "Vote for your favorite local coffee shop",
      creator: "CoffeeLovers",
      status: "ended",
      winner: { text: "Brew & Bean", votes: 156 },
    },
    votedAt: "2025-01-08T15:20:00Z",
    selectedOption: "opt2",
  },
]

// Utility functions
export const getPollById = (id) => {
  return [...mockPolls, ...mockUserPolls].find((poll) => poll.id === id)
}

export const isValidPollId = (id) => {
  return [...mockPolls, ...mockUserPolls].some((poll) => poll.id === id)
}

export const getActivePollsCount = () => {
  return mockPolls.filter((poll) => poll.status === "active").length
}

export const getUserVotesCount = () => {
  return mockUserVotes.length
}
