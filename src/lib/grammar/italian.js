const verb = (prompt, options, answer) => ({ type: 'verb', prompt, options, answer });
const article = (prompt, options, answer) => ({ type: 'article', prompt, options, answer });
const plural = (prompt, options, answer) => ({ type: 'plural', prompt, options, answer });
const preposition = (prompt, options, answer) => ({ type: 'preposition', prompt, options, answer });
const imperative = (prompt, options, answer) => ({ type: 'imperative', prompt, options, answer });
const picture = (emoji, options, answer) => ({ type: 'picture', emoji, prompt: '', options, answer });

export const LEVELS = {
  1: [
    verb('Io ___ andare', ['voglio', 'vuoi', 'vuole'], 0),
    verb('Tu ___ andare', ['voglio', 'vuoi', 'vuole'], 1),
    verb('Lui ___ andare', ['voglio', 'vuoi', 'vuole'], 2),
    verb('Lei ___ un gelato', ['vuole', 'vuoi', 'voglio'], 0),
    verb('Noi ___ giocare', ['vogliamo', 'volete', 'vogliono'], 0),
    verb('Voi ___ giocare', ['vogliamo', 'volete', 'vuole'], 1),
    verb('Loro ___ giocare', ['vogliono', 'volete', 'vogliamo'], 0),
    verb('Io ___ un gelato', ['vuole', 'voglio', 'vogliamo'], 1)
  ],
  2: [
    verb('Io ___ a calcio', ['gioco', 'giochi', 'gioca'], 0),
    verb('Tu ___ a calcio', ['gioco', 'giochi', 'gioca'], 1),
    verb('Lui ___ a calcio', ['gioco', 'giochi', 'gioca'], 2),
    verb('Noi ___ a calcio', ['giochiamo', 'giocate', 'giocano'], 0),
    verb('Io ___ a scuola', ['vado', 'vai', 'va'], 0),
    verb('Tu ___ a scuola', ['vado', 'vai', 'va'], 1),
    verb('Noi ___ in bici', ['andiamo', 'andate', 'vanno'], 0),
    verb('Io ___ una mela', ['mangio', 'mangi', 'mangia'], 0),
    verb('Tu ___ una mela', ['mangio', 'mangi', 'mangia'], 1),
    verb('Loro ___ a calcio', ['giocano', 'giochiamo', 'giocate'], 0)
  ],
  3: [
    verb('Io ___ la palla', ['prendo', 'prendi', 'prende'], 0),
    verb('Tu ___ la palla', ['prendo', 'prendi', 'prende'], 1),
    verb('Lui ___ la palla', ['prendo', 'prendi', 'prende'], 2),
    verb('Noi ___ la palla', ['prendiamo', 'prendete', 'prendono'], 0),
    verb('Io ___ nel lettino', ['dormo', 'dormi', 'dorme'], 0),
    verb('Tu ___ nel lettino', ['dormo', 'dormi', 'dorme'], 1),
    verb('Il gatto ___ sul divano', ['dorme', 'dormo', 'dormiamo'], 0),
    verb('Io ___ un libro', ['leggo', 'leggi', 'legge'], 0),
    verb('Tu ___ un libro', ['leggo', 'leggi', 'legge'], 1),
    verb('Noi ___ un libro', ['leggiamo', 'leggete', 'leggono'], 0)
  ],
  4: [
    article('___ zaino', ['lo', 'il', 'la'], 0),
    article('___ libro', ['lo', 'il', 'la'], 1),
    article('___ mela', ['il', 'la', 'le'], 1),
    article('___ gatti', ['gli', 'i', 'le'], 1),
    article('___ amici', ['gli', 'i', 'le'], 0),
    article('___ case', ['i', 'gli', 'le'], 2),
    article('___ sole', ['il', 'lo', 'la'], 0),
    article('___ stella', ['le', 'la', 'il'], 1),
    article('___ cani', ['gli', 'i', 'le'], 1),
    article('___ pesci', ['gli', 'i', 'le'], 1)
  ],
  5: [
    article('___ mela', ['una', 'un', 'uno'], 0),
    article('___ gatto', ['uno', 'un', 'una'], 1),
    article('___ zaino', ['un', 'uno', 'una'], 1),
    article('___ amico', ['uno', 'un', 'una'], 1),
    plural('il gatto → ___', ['le gatte', 'i gatti', 'il gatti'], 1),
    plural('la mela → ___', ['i mele', 'la mele', 'le mele'], 2),
    plural('lo zaino → ___', ['i zaini', 'gli zaini', 'le zaini'], 1),
    plural('la stella → ___', ['le stella', 'le stelle', 'gli stelle'], 1),
    plural('il cane → ___', ['gli cani', 'i cani', 'le cani'], 1),
    plural("l'amico → ___", ['i amici', 'le amici', 'gli amici'], 2)
  ],
  6: [
    preposition('Andiamo ___ bici', ['in', 'a', 'con'], 0),
    preposition('Vado ___ scuola', ['in', 'a', 'con'], 1),
    preposition('Gioco ___ te', ['in', 'con', 'da'], 1),
    preposition('Questo regalo è ___ te', ['per', 'con', 'da'], 0),
    preposition('Vado ___ nonna', ['da', 'in', 'a'], 0),
    preposition('Andiamo ___ vacanza', ['in', 'a', 'da'], 0),
    preposition('Torno ___ casa', ['a', 'in', 'per'], 0),
    preposition('Vengo ___ te', ['con', 'per', 'da'], 0)
  ],
  7: [
    imperative('___ la pala!', ['Prendi', 'Prendiamo', 'Prendete'], 0),
    imperative('___ insieme!', ['Gioca', 'Giochiamo', 'Giocate'], 1),
    imperative('___ in bici!', ['Vai', 'Andiamo', 'Andate'], 1),
    imperative('___ a fare una camminata!', ["Va'", 'Andiamo', 'Andate'], 1),
    imperative('___ il cane a spasso!', ['Portiamo', 'Porta', 'Portate'], 1),
    imperative('___ il gelato!', ['Prendi', 'Prendiamo', 'Prendete'], 0),
    imperative('___ la palla!', ['Passiamo', 'Passate', 'Passa'], 2),
    imperative('___ attenzione!', ['Facciamo', 'Fate', 'Fai'], 2)
  ],
  8: [
    picture('🍦', ['Andiamo a prendere un gelato', 'Prendi la pala', 'Giochiamo insieme'], 0),
    picture('🚲', ['Andiamo a dormire', 'Andiamo in bici', 'Mangiamo una mela'], 1),
    picture('⚽', ['Andiamo in bici', 'Prendi il gelato', 'Giochiamo insieme'], 2),
    picture('🐕', ['Portiamo il cane a spasso', 'Giochiamo a calcio', 'Andiamo a scuola'], 0),
    picture('🥾', ['Prendiamo un gelato', 'Dormiamo sul divano', 'Andiamo a fare una camminata'], 2),
    picture('🍎', ['Mangio una mela', 'Bevo un gelato', 'Gioco a calcio'], 0),
    picture('🛏️', ['Vado in bici', 'Vado a dormire', 'Vado a giocare'], 1),
    picture('📖', ['Prendo la palla', 'Faccio una camminata', 'Leggo un libro'], 2)
  ],
  9: [
    picture('🚲🌳', ['Andiamo in bici al parco', 'Andiamo in bici a scuola', 'Andiamo in bici al mare'], 0),
    picture('🚲🏫', ['Andiamo in bici al parco', 'Andiamo in bici a scuola', 'Andiamo in bici al mare'], 1),
    picture('🚲🏖️', ['Andiamo in bici al parco', 'Andiamo in bici a scuola', 'Andiamo in bici al mare'], 2),
    picture('⚽🌳', ['Giochiamo a calcio in casa', 'Giochiamo a calcio al parco', 'Giochiamo a calcio a scuola'], 1),
    picture('🍎🍌', ['Mangio la pizza', 'Mangio il gelato', 'Mangio la frutta'], 2),
    picture('🐕🦮', ['Porto il gatto a spasso', 'Porto il cane a spasso', 'Porto il cane a scuola'], 1),
    picture('🌙🛏️', ['Vado a dormire', 'Vado a giocare', 'Vado a mangiare'], 0),
    picture('📖🛋️', ['Leggo un libro a scuola', 'Leggo un libro in bici', 'Leggo un libro sul divano'], 2)
  ],
  10: [
    verb('Noi ___ andare', ['vogliamo', 'volete', 'vogliono'], 0),
    article('___ amici', ['i', 'gli', 'le'], 1),
    plural('lo zaino → ___', ['gli zaini', 'i zaini', 'le zaini'], 0),
    preposition('Gioco ___ te', ['in', 'con', 'da'], 1),
    imperative('___ insieme!', ['Gioca', 'Giochiamo', 'Giocate'], 1),
    picture('🍦', ['Andiamo a prendere un gelato', 'Prendi la pala', 'Giochiamo insieme'], 0),
    verb('Tu ___ una mela', ['mangio', 'mangi', 'mangia'], 1),
    article('___ stella', ['le', 'la', 'il'], 1),
    plural('la mela → ___', ['i mele', 'la mele', 'le mele'], 2),
    preposition('Vado ___ nonna', ['da', 'in', 'a'], 0),
    imperative('___ il cane a spasso!', ['Portiamo', 'Porta', 'Portate'], 1),
    picture('📖', ['Prendo la palla', 'Faccio una camminata', 'Leggo un libro'], 2)
  ]
};

export function exercisesFor(level) {
  const n = Math.min(Math.max(1, level), 10);
  return LEVELS[n];
}

export function roundGoal(level) {
  return 4 + Math.min(Math.max(1, level), 6);
}
