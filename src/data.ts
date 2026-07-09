import { Course, FAQItem, Testimonial, TimelineEvent, QuizQuestion } from "./types";
import krishnaGargAvatar from "../assets/Krishna-Garg_(1).jpg";
import krishnaGargIllustration from "../assets/dr_krishna_garg.svg";

// Faculty profiles focused on BDS & Dental Anatomy
export const mainTeacher = {
  name: "Dr. Krishna Garg",
  role: "Former Professor & Head of Anatomy, LHMC, New Delhi | Author of 'Textbook of Anatomy for Dental Students' | Chief Editor of B.D. Chaurasia's Human Anatomy",
  avatar: krishnaGargAvatar || krishnaGargIllustration,
  bio: "Dr. Krishna Garg, MS, PhD, FAMS, FIMSA, FIAMS, FASI, is one of India's most legendary anatomists and dental-medical educators. A former Professor and Head of the Department of Anatomy at Lady Hardinge Medical College (LHMC), New Delhi, she has dedicated over five decades to teaching and mentoring thousands of dental (BDS), medical, and allied health students. Renowned for making complex cranial corridors easy and clinically relevant, Dr. Garg is the celebrated Author of the 'Textbook of Anatomy for Dental Students' and the Chief Editor of the iconic B.D. Chaurasia's Human Anatomy (9th Edition). Her curriculum is the trusted global standard for BDS dental boards and clinical practice.",
  credentials: ["MBBS", "MS", "PhD", "FIMSA", "FIAMS", "FAMS", "FASI"],
  recognitions: [
    "Author, Textbook of Anatomy for Dental Students",
    "Chief Editor, B.D. Chaurasia's Human Anatomy",
    "Legend of Dental & Medical Anatomy",
    "Lifetime Achievement Awardee, Anatomical Society of India",
    "DMA Distinguished Service Awardee"
  ],
  positions: [
    "Ex-Professor and Head, Department of Anatomy, Lady Hardinge Medical College, New Delhi",
    "Visiting Faculty of Anatomy, Kalka Dental College, Meerut, UP",
    "Academic Consultant & Advisor, National Dental Education Boards"
  ]
};

// High-fidelity Course Catalog with fully defined Lectures & Timestamp Notes for BDS/Dental students
export const coursesData: Course[] = [
  {
    id: "course-1",
    title: "Head & Neck Anatomy: Maxilla, Mandible & TMJ",
    category: "Dental Osteology & Joints",
    description: "An intensive study of the skull bones, jaws, and the Temporomandibular Joint. Gain absolute mastery over mandibular excursions, articular discs, and fracture lines.",
    duration: "18h 45m",
    lecturesCount: 4,
    rating: 4.98,
    image: "https://img.youtube.com/vi/F3_8f_V417Q/hqdefault.jpg",
    progress: 65,
    studentsCount: 2450,
    teacher: mainTeacher,
    tags: ["Oral Surgery", "Osteology", "TMJ Biomechanics"],
    lectures: [
      {
        id: "l1",
        title: "Osteological Features of the Mandible & Maxilla",
        duration: "14:20",
        seconds: 860,
        videoUrl: "https://www.youtube.com/embed/F3_8f_V417Q",
        description: "Explore the mental foramen, mandibular canal, alveolar processes, maxillary sinus relations, and skeletal landmarks vital for dental implants and local anaesthesia.",
        completed: true,
        resources: [
          { name: "Mandible_Internal_Canal_Guide.pdf", size: "3.8 MB", type: "PDF" },
          { name: "Maxillary_Sinus_Relations.png", size: "8.5 MB", type: "IMAGE" }
        ],
        notes: [
          { time: "01:15", seconds: 75, text: "The mental foramen is typically located below and between the apex of the premolars." },
          { time: "04:50", seconds: 290, text: "Mandibular foramen on the medial side of ramus houses the inferior alveolar nerve." },
          { time: "11:10", seconds: 670, text: "The thin floor of the maxillary sinus lies in close contact with the roots of maxillary molars." }
        ],
        transcript: [
          { time: "00:05", text: "Welcome dental students. Today we chart the detailed architecture of the mandible." },
          { time: "01:10", text: "Let us locate the mental foramen. Note its position relative to premolars, vital for nerve blocks." },
          { time: "04:40", text: "Moving to the medial aspect of the ramus, we find the lingula guarding the mandibular foramen." },
          { time: "11:00", text: "Notice the thin bone separating the maxillary first molar roots from the sinus cavity." }
        ]
      },
      {
        id: "l2",
        title: "Temporomandibular Joint: Anatomy & Mechanics",
        duration: "18:40",
        seconds: 1120,
        videoUrl: "https://www.youtube.com/embed/F3_8f_V417Q?start=300",
        description: "A clinical guide to the articular disc, fibrous capsule, lateral pterygoid attachments, joint movements, and anterior dislocation.",
        completed: true,
        resources: [
          { name: "TMJ_Ginglymoarthrodial_Flow.pdf", size: "5.2 MB", type: "PDF" }
        ],
        notes: [
          { time: "02:40", seconds: 160, text: "The TMJ is a ginglymoarthrodial joint with upper compartment sliding and lower hinge movements." },
          { time: "08:15", seconds: 495, text: "Anterior dislocation of TMJ happens when head of mandible slips anterior to articular eminence." }
        ],
        transcript: [
          { time: "00:10", text: "Clinical appreciation of TMJ dislocation is essential for dental extractions." },
          { time: "02:30", text: "Behold the articular disc, separating the joint into superior and inferior synovial cavities." },
          { time: "08:00", text: "When yawning widely, the lateral pterygoid pulls the condyle forward past the articular eminence." }
        ]
      },
      {
        id: "l3",
        title: "Muscles of Mastication & Mandibular Excursions",
        duration: "22:15",
        seconds: 1335,
        videoUrl: "https://www.youtube.com/embed/F3_8f_V417Q?start=600",
        description: "Anatomical paths of Masseter, Temporalis, Medial Pterygoid, and Lateral Pterygoid with clinical nerve supply.",
        completed: false,
        resources: [
          { name: "Masticatory_Muscle_Innervations.xlsx", size: "1.1 MB", type: "XLS" }
        ],
        notes: [
          { time: "05:22", seconds: 322, text: "The lateral pterygoid is the only muscle of mastication that actively opens/depresses the mouth." },
          { time: "12:40", seconds: 760, text: "The temporalis muscle posterior fibers retract the mandible back into position." }
        ],
        transcript: [
          { time: "00:15", text: "Today we examine the infratemporal fossa to visualize the pterygoid muscles." },
          { time: "05:10", text: "Note the horizontal fibers of the lateral pterygoid inserting into the TMJ neck capsule." },
          { time: "12:30", text: "Observe the fan-shaped temporalis muscle passing medial to the zygomatic arch." }
        ]
      },
      {
        id: "l4",
        title: "Infratemporal Fossa: Corridors & Contents",
        duration: "30:10",
        seconds: 1810,
        videoUrl: "https://www.youtube.com/embed/F3_8f_V417Q?start=900",
        description: "Mapping boundaries of the fossa, pterygoid venous plexus, maxillary artery branches, and mandibular nerve division.",
        completed: false,
        resources: [
          { name: "Infratemporal_Fossa_Cheat_Sheet.pdf", size: "2.8 MB", type: "PDF" }
        ],
        notes: [
          { time: "10:30", seconds: 630, text: "Pterygoid venous plexus connects with cavernous sinus via emissary veins." }
        ],
        transcript: [
          { time: "00:05", text: "This area is crucial for posterior superior alveolar (PSA) blocks." },
          { time: "10:20", text: "Observe the maxillary artery wrapping around the lateral pterygoid muscle." }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Trigeminal & Facial Nerves: Dental Block Anatomy",
    category: "Neuroanatomy for Dentistry",
    description: "Deep dive into Cranial Nerves V and VII. Perfect your technique for inferior alveolar, mental, incisive, and infraorbital nerve blocks.",
    duration: "14h 20m",
    lecturesCount: 3,
    rating: 4.96,
    image: "https://img.youtube.com/vi/R96uO6tYwT0/hqdefault.jpg",
    progress: 30,
    studentsCount: 1890,
    teacher: mainTeacher,
    tags: ["Local Anaesthesia", "Neurology", "Nerve Blocks"],
    lectures: [
      {
        id: "l2-1",
        title: "Mandibular Nerve (V3): Branches & Dental Distribution",
        duration: "16:45",
        seconds: 1005,
        videoUrl: "https://www.youtube.com/embed/R96uO6tYwT0",
        description: "Detailed course of the inferior alveolar nerve, lingual nerve (and its chorda tympani relation), buccal and auriculotemporal branches.",
        completed: true,
        resources: [
          { name: "Mandibular_Nerve_BDS_Syllabus.pdf", size: "4.5 MB", type: "PDF" }
        ],
        notes: [
          { time: "03:10", seconds: 190, text: "The lingual nerve runs close to the medial side of lower third molar, risking injury during extraction." }
        ],
        transcript: [
          { time: "00:10", text: "As dental surgeons, you must visualize the precise course of V3 branches." },
          { time: "03:00", text: "Note how the lingual nerve passes directly under the superior constrictor muscle near the alveolar ridge." }
        ]
      },
      {
        id: "l2-2",
        title: "Maxillary Nerve (V2) & Pterygopalatine Fossa",
        duration: "19:30",
        seconds: 1170,
        videoUrl: "https://www.youtube.com/embed/R96uO6tYwT0?start=450",
        description: "Trace the infraorbital, PSA, MSA, ASA, greater palatine, and nasopalatine nerve courses for dental anesthesia.",
        completed: false,
        resources: [
          { name: "Maxillary_Anaesthesia_Zones.png", size: "6.4 MB", type: "IMAGE" }
        ],
        notes: [
          { time: "05:40", seconds: 340, text: "Nasopalatine nerve enters the hard palate through the incisive canal behind central incisors." }
        ],
        transcript: [
          { time: "00:05", text: "Today we map the palate's sensory supply. Crucial for greater palatine blocks." },
          { time: "05:30", text: "Observe the needle path in the incisive papilla for nasopalatine block anesthesia." }
        ]
      },
      {
        id: "l2-3",
        title: "Facial Nerve (VII) & The Parotid Gland Course",
        duration: "25:00",
        seconds: 1500,
        videoUrl: "https://www.youtube.com/embed/R96uO6tYwT0?start=900",
        description: "Trace the intraparotid course of CN VII, its five terminal branches, and how an incorrect IAN block can cause transient facial paralysis.",
        completed: false,
        resources: [],
        notes: [],
        transcript: []
      }
    ]
  },
  {
    id: "course-3",
    title: "Oral Cavity, Tongue & Salivary Glands",
    category: "Oral Anatomy & Histology",
    description: "Detailed guide of the oral vestibule, hard and soft palates, salivary gland duct openings, and lymph nodes of the head and neck.",
    duration: "20h 10m",
    lecturesCount: 2,
    rating: 4.91,
    image: "https://img.youtube.com/vi/5Ue0_k18S6Q/hqdefault.jpg",
    progress: 0,
    studentsCount: 1150,
    teacher: mainTeacher,
    tags: ["Oral Mucosa", "Salivary Ducts", "Lymphatic Drainage"],
    lectures: [
      {
        id: "l3-1",
        title: "The Tongue: Muscles, Papillae & Taste Pathways",
        duration: "15:40",
        seconds: 940,
        videoUrl: "https://www.youtube.com/embed/5Ue0_k18S6Q",
        description: "Intrinsic vs. extrinsic lingual muscles, motor supply via hypoglossal nerve, and taste fibers via chorda tympani & glossopharyngeal nerves.",
        completed: false,
        resources: [],
        notes: [],
        transcript: []
      },
      {
        id: "l3-2",
        title: "Parotid, Submandibular & Sublingual Glands",
        duration: "28:15",
        seconds: 1695,
        videoUrl: "https://www.youtube.com/embed/5Ue0_k18S6Q?start=450",
        description: "Ductal opening locations, parasympathetic secretomotor pathways via otic & submandibular ganglia, and clinical sialolithiasis.",
        completed: false,
        resources: [],
        notes: [],
        transcript: []
      }
    ]
  }
];

// Interactive Quizzes Database for BDS/Dental Students
export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which nerve is targeted during an Inferior Alveolar Nerve block and passes through the mandibular foramen?",
    options: [
      "Lingual Nerve",
      "Inferior Alveolar Nerve (branch of V3)",
      "Mylohyoid Nerve",
      "Mental Nerve"
    ],
    correctAnswer: 1,
    explanation: "The Inferior Alveolar Nerve, a branch of the posterior division of the mandibular nerve (CN V3), enters the mandibular foramen to supply the lower teeth, alveolar bone, and periodontal ligaments."
  },
  {
    id: "q2",
    question: "Where does the Stensen's duct of the Parotid gland open into the oral cavity?",
    options: [
      "Sublingual fold on the floor of the mouth",
      "Sublingual caruncle beside the lingual frenulum",
      "Vestibule of the mouth, opposite the crown of the upper second molar",
      "Behind the central incisive papilla on the hard palate"
    ],
    correctAnswer: 2,
    explanation: "The parotid duct (Stensen's duct) runs forward across the masseter muscle, pierces the buccinator, and opens into the oral vestibule opposite the upper second maxillary molar tooth."
  },
  {
    id: "q3",
    question: "Which muscle of mastication is primarily responsible for depressing (opening) the mandible?",
    options: [
      "Masseter muscle",
      "Medial Pterygoid muscle",
      "Lateral Pterygoid muscle",
      "Temporalis muscle"
    ],
    correctAnswer: 2,
    explanation: "The Lateral Pterygoid muscle acts to protrude and depress (open) the mandible. Masseter, Temporalis, and Medial Pterygoid are primary elevator muscles that close the mouth."
  },
  {
    id: "q4",
    question: "Injury to the lingual nerve during a mandibular third molar (wisdom tooth) surgical extraction causes loss of:",
    options: [
      "General sensation and taste to the anterior two-thirds of the tongue",
      "Motor control to all intrinsic muscles of the tongue",
      "Taste sensation only to the posterior one-third of the tongue",
      "Secretomotor supply to the parotid gland"
    ],
    correctAnswer: 0,
    explanation: "The lingual nerve lies very close to the medial aspect of the mandibular third molar. It carries both general sensation (from CN V3) and taste sensation (from CN VII via chorda tympani) to the anterior 2/3 of the tongue; its injury impairs both."
  }
];

// Historical milestones of Dr. Garg's Academic & Publishing Journey
export const timelineEvents: TimelineEvent[] = [
  {
    year: "1970s",
    title: "Five Decades of Academic Mentorship",
    description: "Dr. Krishna Garg starts her prolific teaching career at Lady Hardinge Medical College, developing pioneering diagrams to help dental and medical students visualize the head, neck, and brain.",
    category: "Milestone"
  },
  {
    year: "2000s",
    title: "Chief Editor of B.D. Chaurasia's Human Anatomy",
    description: "Appointed Chief Editor of the iconic medical reference 'B.D. Chaurasia's Human Anatomy', preserving and updating the golden standard for dental and clinical students globally.",
    category: "Publication"
  },
  {
    year: "2010s",
    title: "Textbook of Anatomy for Dental Students",
    description: "Launches the highly acclaimed 'Textbook of Anatomy for Dental Students', designed precisely around the Dental Council of India (DCI) syllabus to highlight high-yield clinical correlations.",
    category: "Award"
  },
  {
    year: "2026",
    title: "Interactive BDS Anatomy Digital Portal",
    description: "Initiating this high-fidelity platform to provide dental students with direct, organized lectures, local anesthesia landmarks, and board-level interactive skull and neck wireframe maps.",
    category: "Vision"
  }
];

// FAQs tailored to Dental Students (BDS)
export const faqData: FAQItem[] = [
  {
    category: "Syllabus Alignments",
    question: "Is this platform aligned with the Dental Council of India (DCI) syllabus for BDS First Year?",
    answer: "Yes, absolutely! The entire content, including course lists, video timestamps, and dental block nerve coordinates, are systematically structured according to the official DCI guidelines. It covers Head and Neck anatomy, Osteology, Embryology, and Neuroanatomy with clinical relevance for dental surgeons."
  },
  {
    category: "Clinical Anatomy",
    question: "How does Dr. Garg's teaching help with clinical local anesthesia (blocks)?",
    answer: "Every single cranial nerve module explains the exact tactile and bony landmarks (e.g., mandibular notch, pterygomandibular raphe, internal oblique ridge) required to administer precise Inferior Alveolar, Posterior Superior Alveolar, or Mental nerve blocks, preventing common complications like parotid capsule penetration."
  },
  {
    category: "AI Assistant",
    question: "What queries can the Garg Dental-Anatomy AI Assistant resolve?",
    answer: "The Garg AI Assistant is backed by a server-side Gemini 3.5 Flash engine configured with Dr. Krishna Garg's academic textbooks. It is highly capable of explaining complex skull base foramina, masticatory muscles, TMJ movements, dental anomalies, and histology of oral tissues."
  },
  {
    category: "Practical Exams",
    question: "Can I use this platform to prepare for my BDS spotters and viva voce?",
    answer: "Yes! The platform includes interactive high-fidelity wireframe models, study highlight galleries, and board-level quiz questions. The virtual 'study review' mimics real-world exam questions on landmarks, nerve paths, and salivary ducts, giving you the ultimate confidence for vivas."
  }
];

// Alumni Testimonials from Dental Professionals
export const testimonials: Testimonial[] = [
  {
    name: "Divya Prakash Jyoti",
    role: "Student",
    university: "Government Dental College & Hospital",
    text: "During my BDS first year, Dr. Krishna Garg's dental textbook was my guide. This interactive digital portal makes head and neck anatomy feel incredibly intuitive. The detailed nerve block landmarks are clear and invaluable.",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=256&h=256",
    rating: 5
  },
  {
    name: "Aishwarya Soni",
    role: "Student",
    university: "Maulana Azad Institute of Dental Sciences",
    text: "The TMJ mechanics and masticatory muscle videos saved my oral surgery pre-clinicals! Every dental student in India should use this library to ace their university practical spotters and viva boards.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256&h=256",
    rating: 5
  },
  {
    name: "Sneha Reddy",
    role: "BDS First Year Class Representative",
    university: "King George's Medical University (KGMU)",
    text: "The combination of high-density lectures and the Garg AI assistant is like having Dr. Krishna Garg right next to you while preparing for practical viva exams. It's the ultimate anatomy library for dental students.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256&h=256",
    rating: 5
  }
];

// Study statistics for Dashboard
export const dashboardStats = {
  streak: 18, // Days
  todayProgress: 75, // Percentage
  totalHours: "48.5h",
  lecturesCompleted: 14,
  achievementsCount: 6,
  weeklyActivity: [
    { day: "Mon", hours: 1.5, active: true },
    { day: "Tue", hours: 2.2, active: true },
    { day: "Wed", hours: 0.8, active: true },
    { day: "Thu", hours: 3.5, active: true },
    { day: "Fri", hours: 1.2, active: true },
    { day: "Sat", hours: 4.0, active: true },
    { day: "Sun", hours: 2.0, active: true }
  ],
  announcements: [
    {
      id: "a-1",
      date: "July 7, 2026",
      title: "Interactive TMJ Anterior Dislocation Walkthrough",
      text: "Dr. Garg has uploaded a fresh high-resolution video explaining articular eminence landmarks and Hippocrates reduction method for mandibular joint dislocations. High-yield for BDS exams!"
    },
    {
      id: "a-2",
      date: "July 2, 2026",
      title: "Pterygomandibular Space Boundaries Quiz Release",
      text: "The local anaesthetic block corridor module is now live. Score above 90% to unlock the Dental Anesthesia Specialist badge."
    }
  ]
};
