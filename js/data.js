/**
 * ElectIQ – Data Module
 * All static content data: process steps, timelines, quiz, glossary
 */

'use strict';

const ELECTION_DATA = {

  /* =============================================
     PROCESS STEPS
     ============================================= */
  processSteps: [
    {
      id: 1,
      icon: '📣',
      title: 'Election Announcement',
      description: 'The government officially announces an upcoming election, setting the date and informing citizens. This triggers the formal start of the electoral process and activates campaign regulations.',
      category: 'pre',
      categoryLabel: 'Pre-Election',
      details: ['Official government gazette notification', 'Model Code of Conduct activated', 'Date fixed based on constitutional requirements', 'Election Commission begins preparations']
    },
    {
      id: 2,
      icon: '📝',
      title: 'Voter Registration',
      description: 'Citizens register to vote or update their existing registration. Deadlines vary by jurisdiction. First-time voters must provide proof of identity, age, and residency.',
      category: 'pre',
      categoryLabel: 'Pre-Election',
      details: ['Photo ID proof required', 'Online and offline registration options', 'Voter rolls are verified and cleansed', 'Voter ID cards issued to new registrants']
    },
    {
      id: 3,
      icon: '🏃',
      title: 'Candidate Filing',
      description: 'Eligible individuals file nomination papers to run for office. Candidates must meet age, residency, and eligibility requirements. Filing fees are typically required.',
      category: 'pre',
      categoryLabel: 'Pre-Election',
      details: ['Nomination papers submitted with fee', 'Candidates vetted for eligibility', 'Scrutiny of nomination papers', 'Final candidate list published']
    },
    {
      id: 4,
      icon: '📢',
      title: 'Campaigning Period',
      description: 'Candidates and parties actively campaign to earn votes. This includes rallies, debates, advertising, and outreach. Spending limits and campaign finance rules apply.',
      category: 'pre',
      categoryLabel: 'Pre-Election',
      details: ['Rallies, debates, and town halls', 'Campaign finance reporting required', 'Media advertising regulations enforced', 'Campaigning ends 48 hrs before voting']
    },
    {
      id: 5,
      icon: '🗳️',
      title: 'Voting Day',
      description: 'Registered voters cast their ballots at designated polling stations. Polls are typically open for 10–12 hours. Voters present ID and mark their preferred candidate.',
      category: 'election',
      categoryLabel: 'Election Day',
      details: ['Polling booths open 7 AM – 6 PM', 'Voters present ID at booths', 'Electronic Voting Machines (EVMs) used', 'Exit polls conducted after voting ends']
    },
    {
      id: 6,
      icon: '🔢',
      title: 'Vote Counting',
      description: 'Sealed ballot boxes are transported to counting centers. Votes are counted by election officials under strict supervision. Party representatives (agents) observe the process.',
      category: 'post',
      categoryLabel: 'Post-Election',
      details: ['EVMs transported under security', 'Counting done in multiple rounds', 'Party agents present throughout', 'Results announced constituency by constituency']
    },
    {
      id: 7,
      icon: '✅',
      title: 'Result Certification',
      description: 'Election officials certify the results after counting is complete. Winning candidates are issued certificates of election. Losers may file challenges within a legal window.',
      category: 'post',
      categoryLabel: 'Post-Election',
      details: ['Returning Officer certifies results', 'Certificate of election issued', 'Recounts may be ordered if margins are thin', 'Results published in official gazette']
    },
    {
      id: 8,
      icon: '🏛️',
      title: 'Swearing In & Transition',
      description: 'Elected officials are sworn into office, marking the formal transfer of power. The new government forms, cabinet is appointed, and governance begins.',
      category: 'post',
      categoryLabel: 'Post-Election',
      details: ['Oath of office administered', 'Cabinet formation and portfolios assigned', 'Outgoing government transitions power', 'New government presents its agenda']
    }
  ],

  /* =============================================
     TIMELINES
     ============================================= */
  timelines: {
    general: [
      { icon: '📅', date: 'T-12 Months', title: 'Planning & Preparation', description: 'Election Commission begins logistics: booth setup, staff training, EVM procurement, and scheduling.', tags: ['Logistics', 'Commission'] },
      { icon: '📣', date: 'T-6 Months', title: 'Election Announcement', description: 'Government announces election dates. Model Code of Conduct comes into effect immediately.', tags: ['Official', 'MCC'] },
      { icon: '📝', date: 'T-5 Months', title: 'Voter Registration Opens', description: 'Citizens can register to vote or update information. Rolls are verified against national ID database.', tags: ['Registration', 'Citizens'] },
      { icon: '📋', date: 'T-4 Months', title: 'Voter Rolls Published', description: 'Draft voter rolls published for public scrutiny. Objections and corrections accepted for 30 days.', tags: ['Transparency', 'Verification'] },
      { icon: '🏃', date: 'T-3 Months', title: 'Candidate Nominations', description: 'Candidates file nomination papers. Scrutiny by returning officers. Final list of valid candidates published.', tags: ['Candidates', 'Filing'] },
      { icon: '📢', date: 'T-8 Weeks', title: 'Campaign Period Begins', description: 'Official campaign period starts. Spending limits enforced. Media advertising regulated.', tags: ['Campaign', 'Regulation'] },
      { icon: '🤫', date: 'T-48 Hours', title: 'Campaign Silence Period', description: 'All campaigning stops 48 hours before polling. Allows voters to make final decisions without pressure.', tags: ['Silence', 'Law'] },
      { icon: '🗳️', date: 'Election Day', title: 'Polling Day', description: 'Citizens cast votes at designated booths from 7 AM to 6 PM. Free and fair polling supervised by Commission.', tags: ['Voting', 'Democracy'] },
      { icon: '🔢', date: 'T+1 Day', title: 'Vote Counting', description: 'EVMs transported to counting centers. Results announced throughout the day as counting progresses.', tags: ['Counting', 'Results'] },
      { icon: '✅', date: 'T+7 Days', title: 'Certification & Transition', description: 'Official results certified. Winners issued election certificates. New government formation begins.', tags: ['Certification', 'Transition'] }
    ],
    primary: [
      { icon: '🏛️', date: 'T-9 Months', title: 'Party Announces Primary', description: 'Political party announces primary election to select candidates for the general election.', tags: ['Party', 'Internal'] },
      { icon: '📝', date: 'T-7 Months', title: 'Party Member Registration', description: 'Party members confirm membership. Only registered members can vote in closed primaries.', tags: ['Members', 'Registration'] },
      { icon: '🏃', date: 'T-5 Months', title: 'Candidate Declarations', description: 'Party members declare candidacy for primary. Internal vetting and eligibility checks conducted.', tags: ['Candidates', 'Vetting'] },
      { icon: '📢', date: 'T-3 Months', title: 'Primary Campaign', description: 'Primary candidates debate and campaign within party. Focus on party values and platform.', tags: ['Campaign', 'Debate'] },
      { icon: '🗳️', date: 'Primary Day', title: 'Primary Voting', description: 'Party members vote to select their preferred candidate for the general election.', tags: ['Primary Vote'] },
      { icon: '👑', date: 'T+1 Week', title: 'Nominee Selected', description: 'Primary winner becomes the official party nominee for the general election.', tags: ['Nominee', 'Party'] }
    ],
    local: [
      { icon: '🏘️', date: 'T-6 Months', title: 'Local Body Announcement', description: 'State Election Commission announces local body election for municipalities, gram panchayats, etc.', tags: ['Local', 'Municipality'] },
      { icon: '📝', date: 'T-4 Months', title: 'Ward Demarcation', description: 'Local wards and constituencies are defined. Voter rolls compiled for each ward.', tags: ['Wards', 'Demarcation'] },
      { icon: '🏃', date: 'T-3 Months', title: 'Local Candidate Filing', description: 'Local candidates (councillors, sarpanch, mayor) file nominations. Eligibility includes property tax records.', tags: ['Nominees', 'Local'] },
      { icon: '🗳️', date: 'Election Day', title: 'Local Body Voting', description: 'Voters elect local representatives who manage civic services, infrastructure, and local governance.', tags: ['Local Vote', 'Civic'] },
      { icon: '✅', date: 'T+2 Days', title: 'Local Results', description: 'Results declared ward by ward. Elected councillors/sarpanch form local governing body.', tags: ['Results', 'Governing Body'] }
    ]
  },

  /* =============================================
     QUIZ QUESTIONS
     ============================================= */
  quizQuestions: [
    {
      id: 1,
      question: 'What is the Model Code of Conduct (MCC)?',
      options: [
        'A code for candidate dress code during elections',
        'A set of guidelines issued by the Election Commission to regulate political parties and candidates during elections',
        'A law that prevents voters from being bribed',
        'The rulebook for TV debates during elections'
      ],
      correct: 1,
      explanation: 'The Model Code of Conduct is a set of guidelines issued by the Election Commission of India that comes into effect from the date of announcement of election schedule. It regulates the conduct of political parties, candidates, and the government to ensure free and fair elections.'
    },
    {
      id: 2,
      question: 'What is the minimum voting age in most modern democracies?',
      options: ['16 years', '21 years', '18 years', '25 years'],
      correct: 2,
      explanation: 'In most modern democracies, including India (since 1989), the USA, UK, and Australia, the minimum voting age is 18 years. Some countries like Austria, Argentina, and Scotland allow voting at 16.'
    },
    {
      id: 3,
      question: 'What does "First Past the Post" (FPTP) electoral system mean?',
      options: [
        'Candidates must post bonds before running',
        'The candidate who runs the fastest campaign wins',
        'The candidate with the most votes wins, even without a majority',
        'Proportional representation based on party votes'
      ],
      correct: 2,
      explanation: 'FPTP is a voting system where the candidate who receives the most votes wins the seat, even if they don\'t get more than 50% of the total votes. India, the UK, and the USA use this system for most elections.'
    },
    {
      id: 4,
      question: 'What is the primary purpose of a secret ballot?',
      options: [
        'To keep the identity of candidates secret',
        'To allow voters to cast their vote privately without coercion or influence',
        'To prevent duplicate voting',
        'To speed up the counting process'
      ],
      correct: 1,
      explanation: 'The secret ballot ensures that a voter\'s choice remains private, protecting them from intimidation, coercion, or vote-buying. It is a cornerstone of free and fair elections in democracies.'
    },
    {
      id: 5,
      question: 'What is gerrymandering?',
      options: [
        'A campaign strategy involving door-to-door canvassing',
        'The process of drawing electoral district boundaries to give one party an unfair advantage',
        'A method of counting preferential votes',
        'The act of funding multiple candidates to split the vote'
      ],
      correct: 1,
      explanation: 'Gerrymandering is the practice of manipulating the boundaries of electoral constituencies to favor a particular political party. The term originated in 1812 from Massachusetts Governor Elbridge Gerry, whose district was shaped like a salamander.'
    },
    {
      id: 6,
      question: 'In India, who appoints the Chief Election Commissioner?',
      options: [
        'The Prime Minister',
        'The Parliament through a vote',
        'The President of India',
        'The Supreme Court of India'
      ],
      correct: 2,
      explanation: 'The Chief Election Commissioner of India is appointed by the President of India. The Election Commission of India is an autonomous constitutional authority responsible for administering Union and State election processes.'
    },
    {
      id: 7,
      question: 'What is a hung parliament / hung assembly?',
      options: [
        'A parliament where all sessions are online',
        'When no single party or coalition wins a majority of seats',
        'A parliament that has been dissolved before its term ends',
        'When turnout is below 50% in an election'
      ],
      correct: 1,
      explanation: 'A hung parliament (or hung assembly) occurs when no single political party wins an outright majority of seats needed to form a government on their own. This usually leads to coalition negotiations or a minority government.'
    },
    {
      id: 8,
      question: 'What is the Electoral College in the context of US presidential elections?',
      options: [
        'A college that trains election officials',
        'A group of electors who formally elect the President and Vice President',
        'The committee that certifies election results',
        'A system of proportional representation used in the Senate'
      ],
      correct: 1,
      explanation: 'The Electoral College is a body of 538 electors established by the US Constitution who formally cast votes to elect the President and Vice President. Each state\'s number of electors equals its total Congressional representation (House + Senate seats).'
    }
  ],

  /* =============================================
     GLOSSARY
     ============================================= */
  glossary: [
    { term: 'Ballot', definition: 'A method or device used to cast votes in an election. Can be paper-based, electronic, or digital.' },
    { term: 'By-Election', definition: 'An election held between general elections to fill a vacancy caused by death, resignation, or disqualification of a sitting member.' },
    { term: 'Candidate', definition: 'A person who has formally registered to compete in an election for a public office.' },
    { term: 'Constituency', definition: 'A geographic area whose residents are represented by an elected official. Also called a district, ward, or riding.' },
    { term: 'Electorate', definition: 'All citizens who are eligible to vote in a given election.' },
    { term: 'Exit Poll', definition: 'A survey conducted immediately after voters leave polling stations, used to predict election outcomes before official results.' },
    { term: 'Franchise', definition: 'The legal right to vote in public elections. Universal franchise means all adult citizens can vote.' },
    { term: 'Incumbent', definition: 'The current holder of a political office who is running for re-election.' },
    { term: 'Manifesto', definition: 'A published statement of a political party\'s policies, plans, and values presented to voters before an election.' },
    { term: 'Nomination', definition: 'The formal process by which a candidate officially declares their intent to run in an election.' },
    { term: 'Polling Booth', definition: 'A designated location where voters go to cast their ballots on Election Day. Also called a polling station.' },
    { term: 'Proportional Representation', definition: 'An electoral system where the number of seats a party wins reflects its share of the total vote.' },
    { term: 'Referendum', definition: 'A direct vote in which all members of the electorate are asked to accept or reject a particular proposal or policy.' },
    { term: 'Returning Officer', definition: 'An official responsible for overseeing the conduct of elections in a specific constituency and announcing results.' },
    { term: 'Suffrage', definition: 'The right to vote in political elections. Women\'s suffrage refers to the movement for women\'s right to vote.' },
    { term: 'Swing State / Marginal Seat', definition: 'A constituency or state where no single party has a consistent majority, making it crucial to the overall election outcome.' },
    { term: 'Turnout', definition: 'The percentage of eligible voters who actually cast a ballot in a given election. Higher turnout is generally considered healthier for democracy.' },
    { term: 'Veto', definition: 'The constitutional right of a head of state or legislative chamber to reject a bill or decision.' },
    { term: 'Whip', definition: 'A party official responsible for ensuring members of parliament attend and vote in line with party direction.' },
    { term: 'Electoral Roll', definition: 'The official list of all registered voters eligible to participate in an election. Also called the voter list or register.' }
  ]
};

// Make data globally accessible
window.ELECTION_DATA = ELECTION_DATA;
