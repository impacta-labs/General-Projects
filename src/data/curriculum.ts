import type { Lesson } from '../types'

// A founder-focused speaking curriculum. Each lesson teaches in Spanish, gives
// key phrases (EN/ES) and examples, then drills the founder with short prompts.
// This static content is real teaching material — the AI coach can enrich it,
// but it works fully offline too.

export const CURRICULUM: Lesson[] = [
  {
    id: 'introduce-yourself',
    title: 'Introduce yourself with confidence',
    titleEs: 'Preséntate con seguridad',
    goalEs: 'Sonar cercano y claro en 15 segundos',
    category: 'Fundamentos',
    intensity: 1,
    conceptEs:
      'Una buena presentación en inglés es corta y cálida: nombre, qué haces y un gancho. No traduzcas el español largo. En inglés, menos es más: 2 o 3 frases bastan. Sonríe con la voz.',
    whyEs:
      'La primera frase decide cómo te ven en un evento o una reunión. Si dudas al presentarte, transmites inseguridad antes de empezar.',
    phrases: [
      { en: "Hi, I'm [name] — nice to meet you.", es: 'Hola, soy [nombre], encantado.', example: "Hi, I'm Marta — nice to meet you." },
      { en: "I'm the founder of [company].", es: 'Soy el fundador de [empresa].', example: "I'm the founder of Lumo, a small AI studio." },
      { en: "We help [who] to [do what].", es: 'Ayudamos a [quién] a [hacer qué].', example: 'We help restaurants cut food waste.' },
      { en: "What about you?", es: '¿Y tú?', example: "I run a design studio. What about you?" },
    ],
    examples: [
      "Hi, I'm Marta. I'm the founder of Lumo — we help restaurants waste less food. What about you?",
      "Nice to meet you. I'm Carlos, I build software for small clinics.",
    ],
    drills: [
      { promptEs: 'Di: “Hola, soy [tu nombre], encantado de conocerte.”', targetEn: "Hi, I'm [your name] — nice to meet you.", tipEs: 'Une “I’m” corto, no “I am” marcado.' },
      { promptEs: 'Di: “Soy el fundador de una startup de IA.”', targetEn: "I'm the founder of an AI startup.", tipEs: 'Di “founder” con la “ou” de “ow”: FOWN-der.' },
      { promptEs: 'Preséntate entero en 2 frases: nombre, qué haces y “¿y tú?”', targetEn: "Hi, I'm [name]. I build [what] for [who]. What about you?", tipEs: 'Cierra con una pregunta para que la conversación siga.' },
    ],
  },
  {
    id: 'one-line-company',
    title: 'Explain your company in one line',
    titleEs: 'Explica tu empresa en una frase',
    goalEs: 'Una frase que cualquiera entienda',
    category: 'Fundamentos',
    intensity: 1,
    conceptEs:
      'La fórmula que siempre funciona: “We help [quién] + [verbo de acción] + [resultado].” Usa un verbo fuerte (build, help, cut, grow) en vez de “we are a company that…”. Evita tecnicismos.',
    whyEs:
      'Si no puedes explicar tu empresa en una frase, un inversor o cliente se pierde. La claridad vende.',
    phrases: [
      { en: 'We help [who] [do what].', es: 'Ayudamos a [quién] a [hacer qué].', example: 'We help freelancers get paid faster.' },
      { en: 'We build [product] for [who].', es: 'Creamos [producto] para [quién].', example: 'We build scheduling software for clinics.' },
      { en: 'Think of it as [simple comparison].', es: 'Piénsalo como [comparación simple].', example: 'Think of it as Slack for construction teams.' },
      { en: 'In short, we [core value].', es: 'En resumen, nosotros [valor central].', example: 'In short, we save restaurants money.' },
    ],
    examples: [
      'We help small clinics manage appointments without paperwork.',
      "Think of it as a personal trainer, but for your English.",
    ],
    drills: [
      { promptEs: 'Explica TU empresa con “We help… to…”.', targetEn: 'We help [who] to [do what].', tipEs: 'Un verbo de acción es más fuerte que “we are a company that…”.' },
      { promptEs: 'Usa una comparación: “Piénsalo como… para…”.', targetEn: 'Think of it as [known thing] for [your niche].', tipEs: 'La comparación hace que te entiendan en 2 segundos.' },
      { promptEs: 'Resume en una frase: “En resumen, nosotros…”.', targetEn: 'In short, we [the one thing you do].', tipEs: 'Elige UNA sola idea, no tres.' },
    ],
  },
  {
    id: 'what-you-do',
    title: 'Answer “what do you do?”',
    titleEs: 'Responde “¿a qué te dedicas?”',
    goalEs: 'Responder sin bloquearte',
    category: 'Fundamentos',
    intensity: 1,
    conceptEs:
      'Responde en capas: primero simple, luego detalle si preguntan. No sueltes todo de golpe. “I run a startup” → si preguntan más, amplías. Deja espacio para la conversación.',
    whyEs:
      'Es la pregunta más frecuente en networking. Tener una respuesta lista te quita el nervio.',
    phrases: [
      { en: 'I run a startup in [field].', es: 'Llevo una startup de [sector].', example: 'I run a startup in healthcare.' },
      { en: 'Right now I’m focused on [x].', es: 'Ahora mismo estoy centrado en [x].', example: "Right now I'm focused on getting our first customers." },
      { en: 'Basically, [simple version].', es: 'Básicamente, [versión simple].', example: 'Basically, we make paperwork disappear.' },
      { en: 'Happy to tell you more if you’re curious.', es: 'Te cuento más si te interesa.', example: "Happy to tell you more if you're curious." },
    ],
    examples: [
      "I run a small software company. Basically, we help clinics book patients faster.",
      "I'm a founder. Right now I'm focused on our first ten customers.",
    ],
    drills: [
      { promptEs: 'Responde simple: “Llevo una startup de [tu sector].”', targetEn: "I run a startup in [your field].", tipEs: '“Run” aquí significa dirigir, no correr.' },
      { promptEs: 'Di en qué estás centrado ahora: “Ahora mismo estoy centrado en…”.', targetEn: "Right now I'm focused on [your priority].", tipEs: 'Liga “focused on” → “focus-don”.' },
      { promptEs: 'Ofrece contar más: “Te cuento más si te interesa.”', targetEn: "Happy to tell you more if you're curious.", tipEs: 'Suena generoso y abre conversación.' },
    ],
  },
  {
    id: 'numbers-metrics',
    title: 'Talk about numbers and metrics',
    titleEs: 'Habla de números y métricas',
    goalEs: 'Decir cifras con soltura',
    category: 'Negocio',
    intensity: 2,
    conceptEs:
      'Los números impresionan si los dices con seguridad. Aprende a leer cifras, porcentajes y crecimiento en inglés. “We grew 3x” o “revenue is up 40%”. Practica los números en voz alta.',
    whyEs:
      'En un pitch o una reunión, los números son tu prueba. Titubear con una cifra resta credibilidad.',
    phrases: [
      { en: 'Revenue is up [40%] this year.', es: 'Los ingresos han subido un [40%] este año.', example: 'Revenue is up 40% this year.' },
      { en: 'We grew [3x] in [12 months].', es: 'Crecimos [3 veces] en [12 meses].', example: 'We grew 3x in 12 months.' },
      { en: 'We have [200] paying customers.', es: 'Tenemos [200] clientes de pago.', example: 'We have 200 paying customers.' },
      { en: 'Our margin is around [30%].', es: 'Nuestro margen ronda el [30%].', example: 'Our margin is around 30 percent.' },
    ],
    examples: [
      'Revenue is up 40% this year, and we grew from 50 to 200 customers.',
      "We're at half a million in annual revenue, growing about 10% a month.",
    ],
    drills: [
      { promptEs: 'Di: “Los ingresos han subido un 40% este año.”', targetEn: 'Revenue is up 40% this year.', tipEs: '“Percent” se dice per-CENT.' },
      { promptEs: 'Di: “Crecimos 3 veces en 12 meses.”', targetEn: 'We grew 3x in 12 months.', tipEs: '“3x” se lee “three times” o “three ex”.' },
      { promptEs: 'Di: “Tenemos 200 clientes de pago.”', targetEn: 'We have 200 paying customers.', tipEs: 'Marca la “-ing” de “paying”.' },
    ],
  },
  {
    id: 'linking-words',
    title: 'Connect your ideas',
    titleEs: 'Conecta tus ideas (however, so, actually…)',
    goalEs: 'Sonar fluido, no cortado',
    category: 'Fluidez',
    intensity: 2,
    conceptEs:
      'Los conectores hacen que suenes fluido: “so” (así que), “however” (sin embargo), “actually” (en realidad), “that said” (dicho esto). Úsalos para unir frases en vez de pararte.',
    whyEs:
      'Sin conectores hablas a saltos. Con ellos, tu discurso fluye y suenas más avanzado.',
    phrases: [
      { en: 'So, [conclusion].', es: 'Así que, [conclusión].', example: 'So, we decided to focus on one market.' },
      { en: 'However, [contrast].', es: 'Sin embargo, [contraste].', example: 'It was risky. However, it paid off.' },
      { en: 'Actually, [correction/surprise].', es: 'En realidad, [matiz].', example: 'Actually, it was easier than we thought.' },
      { en: 'That said, [nuance].', es: 'Dicho esto, [matiz].', example: 'That said, we still have a lot to prove.' },
    ],
    examples: [
      "We were small, so we moved fast. However, we had to say no to a lot.",
      "Actually, our first idea failed. That said, it taught us everything.",
    ],
    drills: [
      { promptEs: 'Une dos ideas con “so”: “Éramos pocos, así que fuimos rápidos.”', targetEn: 'We were small, so we moved fast.', tipEs: '“So” aquí = “por eso / así que”.' },
      { promptEs: 'Contrasta con “however”: “Fue arriesgado. Sin embargo, funcionó.”', targetEn: 'It was risky. However, it worked.', tipEs: 'Haz una pausa breve tras “however”.' },
      { promptEs: 'Matiza con “that said”: “Dicho esto, aún tenemos que demostrar mucho.”', targetEn: 'That said, we still have a lot to prove.', tipEs: 'Sirve para reconocer lo bueno y lo pendiente.' },
    ],
  },
  {
    id: 'buy-time',
    title: 'Buy time gracefully',
    titleEs: 'Gana tiempo con elegancia',
    goalEs: 'No quedarte en blanco',
    category: 'Fluidez',
    intensity: 2,
    conceptEs:
      'Cuando no sabes qué decir, no te calles ni digas “eeeh”. Usa frases puente que te dan un segundo y suenan seguras: “That’s a great question”, “Let me think for a second”.',
    whyEs:
      'El silencio incómodo o el “eeeh” te hacen parecer inseguro. Estas frases te dan tiempo y control.',
    phrases: [
      { en: "That's a great question.", es: 'Es una gran pregunta.', example: "That's a great question — let me think." },
      { en: 'Let me think for a second.', es: 'Déjame pensar un segundo.', example: 'Let me think for a second.' },
      { en: 'The way I see it, …', es: 'Tal como yo lo veo, …', example: 'The way I see it, timing is everything.' },
      { en: 'Let me put it this way.', es: 'Déjame decirlo así.', example: 'Let me put it this way — we bet on focus.' },
    ],
    examples: [
      "That's a fair question. Let me put it this way — we chose focus over speed.",
      "Good question. The way I see it, we still have room to grow.",
    ],
    drills: [
      { promptEs: 'Gana tiempo: “Es una gran pregunta, déjame pensar.”', targetEn: "That's a great question — let me think.", tipEs: 'Dilo con calma, sin prisa. La calma es seguridad.' },
      { promptEs: 'Introduce tu opinión: “Tal como yo lo veo…”.', targetEn: 'The way I see it, …', tipEs: 'Liga “the way I see it” rápido, como un bloque.' },
      { promptEs: 'Reformula: “Déjame decirlo así…”.', targetEn: 'Let me put it this way…', tipEs: 'Perfecto para explicar algo complejo de forma simple.' },
    ],
  },
  {
    id: 'tough-questions',
    title: 'Handle tough questions',
    titleEs: 'Maneja preguntas difíciles',
    goalEs: 'Responder con calma y honestidad',
    category: 'Presión',
    intensity: 3,
    conceptEs:
      'Ante una pregunta difícil: reconoce, responde con honestidad y redirige a tu fortaleza. No te pongas a la defensiva. “That’s fair”, “Honestly…”, “What I can tell you is…”.',
    whyEs:
      'Los inversores presionan a propósito para ver cómo reaccionas. La calma vale más que la respuesta perfecta.',
    phrases: [
      { en: "That's a fair point.", es: 'Es un buen punto / es justo.', example: "That's a fair point, and here's how we think about it." },
      { en: 'Honestly, [truth].', es: 'Sinceramente, [verdad].', example: "Honestly, we're not there yet, but we're close." },
      { en: 'What I can tell you is [strength].', es: 'Lo que sí te puedo decir es [fortaleza].', example: 'What I can tell you is our users love it.' },
      { en: "We're still figuring [x] out.", es: 'Todavía estamos resolviendo [x].', example: "We're still figuring pricing out." },
    ],
    examples: [
      "That's a fair point. Honestly, growth is slow — but our retention is strong.",
      "Good challenge. What I can tell you is that every customer we've won, we've kept.",
    ],
    drills: [
      { promptEs: 'Reconoce la crítica: “Es un buen punto, y así lo vemos…”.', targetEn: "That's a fair point, and here's how we see it.", tipEs: 'Reconocer no es rendirse — te da credibilidad.' },
      { promptEs: 'Sé honesto: “Sinceramente, aún no estamos ahí, pero estamos cerca.”', targetEn: "Honestly, we're not there yet, but we're close.", tipEs: 'La honestidad genera confianza, no debilidad.' },
      { promptEs: 'Redirige a tu fuerza: “Lo que sí te puedo decir es que…”.', targetEn: 'What I can tell you is [your strongest fact].', tipEs: 'Cierra siempre con tu dato más fuerte.' },
    ],
  },
  {
    id: 'small-talk',
    title: 'Small talk and networking',
    titleEs: 'Small talk y networking',
    goalEs: 'Romper el hielo sin esfuerzo',
    category: 'Networking',
    intensity: 2,
    conceptEs:
      'El small talk no es tonto: abre puertas. Preguntas ligeras y muestra interés real. “How’s your week going?”, “What brings you here?”. Escucha y rebota con otra pregunta.',
    whyEs:
      'Las mejores oportunidades salen de una charla informal. Saber empezar y mantenerla es una habilidad de founder.',
    phrases: [
      { en: 'How’s your week going?', es: '¿Qué tal tu semana?', example: "Hey, how's your week going?" },
      { en: 'What brings you here?', es: '¿Qué te trae por aquí?', example: 'So, what brings you here today?' },
      { en: 'How do you two know each other?', es: '¿De qué os conocéis?', example: 'How do you two know each other?' },
      { en: "Let's stay in touch.", es: 'Sigamos en contacto.', example: "This was great — let's stay in touch." },
    ],
    examples: [
      "Hey, how's your week going? — What brings you to the event?",
      "This was a great chat. Let's stay in touch — are you on LinkedIn?",
    ],
    drills: [
      { promptEs: 'Rompe el hielo: “¿Qué tal tu semana?”', targetEn: "How's your week going?", tipEs: 'Liga “how’s your” → “how-zher”.' },
      { promptEs: 'Pregunta el motivo: “¿Qué te trae por aquí?”', targetEn: 'What brings you here?', tipEs: 'Pregunta abierta y muy natural en eventos.' },
      { promptEs: 'Cierra la charla: “Sigamos en contacto.”', targetEn: "Let's stay in touch.", tipEs: 'Ideal para terminar y dejar la puerta abierta.' },
    ],
  },
  {
    id: 'pronunciation-es',
    title: 'Sounds Spanish speakers struggle with',
    titleEs: 'Pronunciación: sonidos difíciles para españoles',
    goalEs: 'Que te entiendan a la primera',
    category: 'Pronunciación',
    intensity: 2,
    conceptEs:
      'Cuatro sonidos clave: la “th” (think, that), la “h” aspirada (house), la diferencia b/v (very ≠ berry), y las terminaciones “-ed” (worked, needed). Exagéralos al practicar.',
    whyEs:
      'No necesitas acento perfecto, pero estos sonidos, si fallan, cambian la palabra y confunden. Trabajarlos te hace entendible.',
    phrases: [
      { en: 'Think · three · thanks', es: 'La “th”: saca la lengua entre los dientes.', example: 'I think we need three things.' },
      { en: 'House · here · behind', es: 'La “h” se aspira, suena soplada.', example: 'He is here, behind the house.' },
      { en: 'Very · value · vision', es: 'La “v”: labio inferior con dientes, no “b”.', example: 'Our vision has real value.' },
      { en: 'Worked · needed · started', es: 'Las “-ed”: /t/, /d/ o /id/.', example: 'We worked hard and it started to pay off.' },
    ],
    examples: [
      'I think three things really matter here.',
      'Our vision has real value — very real value.',
    ],
    drills: [
      { promptEs: 'Pronuncia la “th”: “I think we need three things.”', targetEn: 'I think we need three things.', tipEs: 'Lengua entre los dientes en think/three/things.' },
      { promptEs: 'Pronuncia la “v”: “Our vision has real value.”', targetEn: 'Our vision has real value.', tipEs: 'Labio inferior toca los dientes: no digas “bision”.' },
      { promptEs: 'Pronuncia las “-ed”: “We worked hard and it started to pay off.”', targetEn: 'We worked hard and it started to pay off.', tipEs: 'work-T, start-ID: la “-ed” cambia de sonido.' },
    ],
  },
  {
    id: 'business-phrasal-verbs',
    title: 'Business phrasal verbs',
    titleEs: 'Phrasal verbs de negocio',
    goalEs: 'Hablar como un nativo de negocios',
    category: 'Vocabulario',
    intensity: 3,
    conceptEs:
      'Los nativos usan phrasal verbs constantemente: “scale up” (crecer), “roll out” (lanzar), “reach out” (contactar), “follow up” (dar seguimiento). Aprenderlos te hace sonar natural.',
    whyEs:
      'En reuniones reales se usan más los phrasal verbs que los verbos “de libro”. Reconocerlos y usarlos marca la diferencia.',
    phrases: [
      { en: 'Scale up', es: 'Crecer / escalar', example: "We're ready to scale up next year." },
      { en: 'Roll out', es: 'Lanzar / desplegar', example: "We'll roll out the feature in March." },
      { en: 'Reach out', es: 'Contactar', example: 'Feel free to reach out any time.' },
      { en: 'Follow up', es: 'Dar seguimiento', example: "I'll follow up with an email tomorrow." },
    ],
    examples: [
      "Let's roll out the beta first, then scale up if it works.",
      "Thanks for reaching out — I'll follow up next week.",
    ],
    drills: [
      { promptEs: 'Usa “scale up”: “Estamos listos para escalar el año que viene.”', targetEn: "We're ready to scale up next year.", tipEs: '“Scale up” = crecer de forma controlada.' },
      { promptEs: 'Usa “reach out”: “No dudes en contactarme cuando quieras.”', targetEn: 'Feel free to reach out any time.', tipEs: '“Reach out” es más cálido que “contact”.' },
      { promptEs: 'Usa “follow up”: “Te doy seguimiento con un email mañana.”', targetEn: "I'll follow up with an email tomorrow.", tipEs: '“Follow up” = dar seguimiento, retomar.' },
    ],
  },
]

export function getLessonById(id: string): Lesson | undefined {
  return CURRICULUM.find((l) => l.id === id)
}
