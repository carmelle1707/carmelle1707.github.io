import flotImage from './assets/projects/flot.jpg'
import postitImage from './assets/projects/postit.jpg'
import yowlImage from './assets/projects/yowl.jpg'

// Introduction et première scène. Les études et la formation viennent de
// l'ancien portfolio (UVCI : licence 2025-2026, WeCode : depuis janvier 2026).
export const intro = {
  greeting: 'Hey',
  wave: '👋🏾',
  name: 'I’m Carmelle.',
  invitation: 'Viens, je t’emmène dans mon monde',
}

export const aboutScene = {
  label: 'About me',
  hook: 'I build things because I’m curious how they work.',
  text: 'I’m learning to design and develop web and mobile apps — between my studies and a full-stack training. Every project is a way to turn a question into something people can actually use.',
  notes: [
    { kind: 'Studying', detail: 'Applications & e-services, UVCI' },
    { kind: 'Training', detail: 'Full-stack & mobile, WeCode' },
  ],
}

export const links = {
  email: 'gbedjiangecarmelle@gmail.com',
  whatsapp: 'https://wa.me/2250105458767',
  linkedin: 'https://www.linkedin.com/in/ange-carmelle-gbedji-1a11b237a',
  github: 'https://github.com/carmelle1707',
  cv: '/cv-ange-carmelle-gbedji.pdf',
}

export const navItems = [
  { label: 'À propos', href: '#about' },
  { label: 'Projets', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export const timeline = [
  {
    period: 'Depuis 2026',
    place: 'WeCode',
    detail: 'Formation développement full-stack et mobile : front-end, back-end, API et bases de données, à travers des projets concrets.',
  },
  {
    period: 'Depuis 2025',
    place: 'Université Virtuelle de Côte d’Ivoire',
    detail: 'Licence Développement d’applications et e-services.',
  },
  {
    period: 'Déc. 2025',
    place: 'Tech For Girls',
    detail: 'Programmation et robotique : Python, Arduino.',
  },
  {
    period: '2025',
    place: 'DigiFemme Côte d’Ivoire',
    detail: 'Programme JA Social Equity.',
  },
  {
    period: '2024 – 2025',
    place: 'Lycée Classique d’Abidjan',
    detail: 'Baccalauréat.',
  },
]

export const stack = [
  {
    area: 'Interfaces',
    tools: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'JavaScript'],
  },
  {
    area: 'Serveur & données',
    tools: ['Laravel', 'PHP', 'Inertia.js', 'Node.js', 'Express', 'MySQL', 'MongoDB'],
  },
  {
    area: 'Mobile',
    tools: ['React Native', 'Expo'],
  },
  {
    area: 'Au quotidien',
    tools: ['Git', 'GitHub', 'Figma'],
  },
]

export const projects = [
  {
    name: 'YOWL',
    summary: 'Une plateforme pour commenter n’importe quel contenu du web au même endroit, et en discuter ouvertement.',
    context: 'Projet académique, en équipe de quatre',
    tools: ['Laravel', 'SQL', 'Tailwind CSS'],
    image: yowlImage,
    url: 'http://yowl.free.nf',
  },
  {
    name: 'Flot',
    summary: 'L’onglet MOM du Global Reporting de Flot : les données mensuelles d’activité réunies dans un seul tableau, d’après la maquette de l’équipe.',
    context: 'Projet académique',
    tools: ['Vue.js', 'Laravel', 'Inertia.js', 'Tailwind CSS'],
    image: flotImage,
  },
  {
    name: 'Post-it',
    summary: 'Des notes à créer, modifier et supprimer en temps réel, comme des post-it sur un mur.',
    context: 'Projet académique',
    tools: ['Vue.js', 'CSS', 'API REST'],
    image: postitImage,
  },
  {
    name: 'Rotten Tomatoes',
    summary: 'Explorer les films du moment, les plus populaires et ses favoris, à partir de l’API TMDB.',
    context: 'Projet académique',
    tools: ['Next.js', 'API TMDB', 'Tailwind CSS'],
  },
]
