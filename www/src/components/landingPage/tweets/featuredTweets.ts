export interface Tweet {
  id: string
  handle: string
  verified: boolean
  author: string
  avatar: string
  date: Date
  text: string
  likes: number
  retweets: number
  replies: number
  quotes: number
}

// featured tweets for the testimonials on the landing page
export const featuredTweets: Tweet[] = [
  // https://twitter.com/ajcwebdev/status/1544909672137867264
  {
    id: '1544909672137867264',
    handle: 'ajcwebdev',
    author: '❤️ Anthony (ajcwebdev.x)',
    verified: false,
    avatar:
      'https://pbs.twimg.com/profile_images/1549247631867711488/hK_Qr-Dx_normal.png',
    date: new Date('2022-07-07T05:02:23.000Z'),
    text: 'Now that Blitz.js has pivoted and Bison has stagnated, create-t3-app will be the only framework to give Redwood a run for its money in the quest to build a legitimate fullstack React framework.',
    likes: 32,
    retweets: 3,
    replies: 9,
    quotes: 2
  },

  // https://twitter.com/tomdoes_tech/status/1595652166173458434
  {
    id: '1595652166173458434',
    handle: 'tomdoes_tech',
    author: 'Tom',
    verified: false,
    avatar:
      'https://pbs.twimg.com/profile_images/1551907445856997385/3m8M35Cn_400x400.png',
    date: new Date('2022-11-24T08:34:00.000Z'),
    text: "Used create-t3-app for a hackathon today. I don't think I've ever created an app that works so well and does so much in a single day before",
    likes: 194,
    retweets: 6,
    replies: 10,
    quotes: 2
  },

  // https://twitter.com/synecdokey/status/1553580714591158272
  {
    id: '1553580714591158272',
    handle: 'synecdokey',
    author: 'Emilia Zapata',
    verified: false,
    avatar:
      'https://pbs.twimg.com/profile_images/1426010455055638531/xUFu5JP7_400x400.jpg',
    date: new Date('2022-07-31T07:18:00.000Z'),
    text: "Finally had the chance to play with @trpcio and it's scary how easy it makes to make your data flow, with full type safety and backend validation. With create-t3-app and @supabase , I was able to create a simple to-do app with auth in less than 3 hours, scary.",
    likes: 76,
    retweets: 10,
    replies: 2,
    quotes: 0
  },

  // https://twitter.com/royanger/status/1553191258771841024
  {
    id: '1553191258771841024',
    handle: 'royanger',
    author: 'Roy Anger',
    verified: false,
    avatar:
      'https://pbs.twimg.com/profile_images/1346968887/dsc652499-2_400x400.jpg',
    date: new Date('2022-07-30T05:30:00.000Z'),
    text: 'create-t3-app is amazing. I worked on a MVP over the last 10 days on the side, and easily built it out using the stack. Working with data via tRPC was amazing. Try out the t3 stack, or at least tRPC.',
    likes: 19,
    retweets: 2,
    replies: 0,
    quotes: 0
  },

  // https://twitter.com/jonhigger/status/1570054715240763393
  {
    id: '1570054715240763393',
    handle: 'jonhigger',
    author: 'jon',
    verified: false,
    avatar:
      'https://pbs.twimg.com/profile_images/1466866060007723008/QXEf5Vbs_400x400.jpg',
    date: new Date('2022-09-14T18:19:00.000Z'),
    text: "If you're a Rails developer, you should give full stack TS frameworks a try. @remix_run 's stacks or @pingdotgg 's create-t3-app are two great options. If you learn these tools, your long term productivity will be faster than Rails. The performance benefits are just a side bonus.",
    likes: 5,
    retweets: 1,
    replies: 1,
    quotes: 0
  }
]
