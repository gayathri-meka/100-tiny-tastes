import { Recipe } from "./types";

const recipes: Record<string, Recipe> = {
  banana: {
    foodId: "banana",
    prep: "Choose a ripe banana with brown spots for natural sweetness.",
    steps: [
      { text: "Peel the banana and cut into pieces." },
      { text: "Mash with a fork until smooth." },
      { text: "Serve as-is or thin with a little breast milk or formula." },
    ],
    note: "Also works as finger food — cut into long strips for easy gripping.",
  },
  avocado: {
    foodId: "avocado",
    prep: "Pick a ripe avocado that yields to gentle pressure.",
    steps: [
      { text: "Cut in half and remove the pit." },
      { text: "Scoop out the flesh and mash until smooth." },
      { text: "Serve immediately — avocado browns quickly." },
    ],
    note: "Cut into thin strips or long wedges for finger food.",
  },
  apple: {
    foodId: "apple",
    prep: "Use a sweet variety like Fuji or Gala.",
    steps: [
      { text: "Peel, core, and cut into small chunks." },
      { text: "Steam until very soft, about 8–10 minutes." },
      { text: "Mash or blend to desired consistency." },
    ],
    note: "Soft steamed wedges work well as finger food for older babies.",
  },
  pear: {
    foodId: "pear",
    prep: "Choose a ripe, soft pear.",
    steps: [
      { text: "Peel, core, and chop into pieces." },
      { text: "Steam until tender, about 5–7 minutes." },
      { text: "Mash with a fork or blend smooth." },
    ],
    note: "Very ripe pears can be served raw as mashed or finger food.",
  },
  mango: {
    foodId: "mango",
    prep: "Use a ripe mango that smells sweet.",
    steps: [
      { text: "Peel and cut the flesh away from the pit." },
      { text: "Mash or blend until smooth." },
      { text: "Serve as purée or spread on toast." },
    ],
    note: "A mango pit with flesh attached makes a great gnawing handle for babies.",
  },
  peach: {
    foodId: "peach",
    prep: "Pick a ripe, fragrant peach.",
    steps: [
      { text: "Peel, pit, and chop the flesh." },
      { text: "Steam briefly if firm, or use raw if very ripe." },
      { text: "Mash or blend to desired texture." },
    ],
  },
  plum: {
    foodId: "plum",
    prep: "Choose a ripe, soft plum.",
    steps: [
      { text: "Peel, pit, and chop." },
      { text: "Steam for 3–4 minutes if needed." },
      { text: "Mash with a fork." },
    ],
  },
  blueberry: {
    foodId: "blueberry",
    prep: "Fresh or frozen blueberries both work well.",
    steps: [
      { text: "Rinse berries and steam until soft." },
      { text: "Mash or lightly crush — squish each berry for safety." },
      { text: "Mix into yogurt or cereal if desired." },
    ],
    note: "Always flatten or halve blueberries to reduce choking risk.",
  },
  strawberry: {
    foodId: "strawberry",
    prep: "Wash fresh strawberries well.",
    steps: [
      { text: "Remove stems and cut into small pieces." },
      { text: "Mash with a fork for younger babies." },
      { text: "Serve as soft finger food for older babies." },
    ],
  },
  raspberry: {
    foodId: "raspberry",
    prep: "Gently rinse raspberries.",
    steps: [
      { text: "Mash with a fork — they break down easily." },
      { text: "Press through a sieve to remove seeds if desired." },
      { text: "Serve plain or stir into yogurt." },
    ],
  },
  watermelon: {
    foodId: "watermelon",
    prep: "Choose a seedless watermelon.",
    steps: [
      { text: "Cut a thick wedge or strip shape." },
      { text: "Remove any visible seeds." },
      { text: "Serve as a soft finger food — it will be slippery!" },
    ],
  },
  cantaloupe: {
    foodId: "cantaloupe",
    prep: "Select a ripe cantaloupe.",
    steps: [
      { text: "Remove rind and seeds." },
      { text: "Cut into thin strips or small cubes." },
      { text: "Mash for younger babies or serve as finger food." },
    ],
  },
  papaya: {
    foodId: "papaya",
    prep: "Use a ripe papaya — it should be soft and fragrant.",
    steps: [
      { text: "Cut in half and scoop out seeds." },
      { text: "Scoop flesh and mash with a fork." },
      { text: "Serve as purée or soft strips." },
    ],
  },
  kiwi: {
    foodId: "kiwi",
    prep: "Choose a ripe kiwi that gives slightly when pressed.",
    steps: [
      { text: "Peel and slice into thin rounds or strips." },
      { text: "Mash for younger babies." },
      { text: "Serve as soft finger food for older babies." },
    ],
  },
  apricot: {
    foodId: "apricot",
    prep: "Use fresh ripe apricots or no-sugar-added dried ones.",
    steps: [
      { text: "If fresh, halve, pit, and steam until soft." },
      { text: "If dried, soak in water until very soft." },
      { text: "Mash or blend to smooth." },
    ],
  },
  cherry: {
    foodId: "cherry",
    prep: "Use fresh sweet cherries.",
    steps: [
      { text: "Pit each cherry carefully." },
      { text: "Steam until soft, then mash well." },
      { text: "Cut into tiny pieces for older babies." },
    ],
    note: "Always pit and cut cherries — they are a choking hazard whole.",
  },
  grape: {
    foodId: "grape",
    prep: "Use seedless grapes.",
    steps: [
      { text: "Wash and cut each grape lengthwise into quarters." },
      { text: "Mash for younger babies." },
      { text: "Serve quartered for older babies." },
    ],
    note: "Always cut grapes — never serve whole.",
  },
  fig: {
    foodId: "fig",
    prep: "Use very ripe fresh figs.",
    steps: [
      { text: "Remove the stem and peel if desired." },
      { text: "Mash the soft flesh with a fork." },
      { text: "Serve as purée or mix into oatmeal." },
    ],
  },
  date: {
    foodId: "date",
    prep: "Use soft Medjool dates.",
    steps: [
      { text: "Remove the pit and soak in warm water until very soft." },
      { text: "Blend into a smooth paste." },
      { text: "Stir a small amount into purées or oatmeal." },
    ],
  },
  prune: {
    foodId: "prune",
    prep: "Use pitted prunes.",
    steps: [
      { text: "Soak in warm water until very soft." },
      { text: "Blend into a smooth purée." },
      { text: "Mix with other purées or serve on its own." },
    ],
  },
  "sweet-potato": {
    foodId: "sweet-potato",
    prep: "Scrub and pierce a sweet potato.",
    steps: [
      { text: "Bake at 400°F until very soft, about 45 minutes." },
      { text: "Scoop out the flesh and mash until smooth." },
      { text: "Thin with a little water or milk if needed." },
    ],
    note: "Cut into long sticks for finger food once baby is ready.",
  },
  carrot: {
    foodId: "carrot",
    prep: "Peel fresh carrots.",
    steps: [
      { text: "Cut into rounds and steam until very soft." },
      { text: "Mash or blend until smooth." },
      { text: "Season with a tiny pinch of cumin if you like." },
    ],
    note: "Steam until mashable with a fork for safe finger food.",
  },
  pea: {
    foodId: "pea",
    prep: "Use fresh or frozen peas.",
    steps: [
      { text: "Steam or boil until soft." },
      { text: "Blend and push through a sieve to remove skins." },
      { text: "Serve as a smooth purée." },
    ],
    note: "Lightly smash for older babies as finger food.",
  },
  "green-bean": {
    foodId: "green-bean",
    prep: "Trim fresh green beans.",
    steps: [
      { text: "Steam until very tender." },
      { text: "Blend or mash for younger babies." },
      { text: "Serve whole soft beans as finger food." },
    ],
  },
  "butternut-squash": {
    foodId: "butternut-squash",
    prep: "Halve and seed a butternut squash.",
    steps: [
      { text: "Roast cut-side down at 400°F until soft." },
      { text: "Scoop out flesh and mash smooth." },
      { text: "Thin with water if needed." },
    ],
  },
  zucchini: {
    foodId: "zucchini",
    prep: "Wash and trim zucchini.",
    steps: [
      { text: "Peel if desired, then chop." },
      { text: "Steam until very soft." },
      { text: "Mash or blend." },
    ],
    note: "Cut into long sticks for easy finger food.",
  },
  broccoli: {
    foodId: "broccoli",
    prep: "Cut broccoli into florets.",
    steps: [
      { text: "Steam until very tender, about 10 minutes." },
      { text: "Mash or chop finely for younger babies." },
      { text: "Serve a whole soft floret as a great finger food." },
    ],
  },
  cauliflower: {
    foodId: "cauliflower",
    prep: "Break cauliflower into florets.",
    steps: [
      { text: "Steam until fork-tender." },
      { text: "Blend with a little cooking water until smooth." },
      { text: "Season with a tiny pinch of mild spice if desired." },
    ],
  },
  spinach: {
    foodId: "spinach",
    prep: "Use fresh baby spinach.",
    steps: [
      { text: "Wash thoroughly." },
      { text: "Steam or wilt in a pan for 2–3 minutes." },
      { text: "Blend into a smooth purée, or mix into other foods." },
    ],
  },
  kale: {
    foodId: "kale",
    prep: "Remove tough stems from kale leaves.",
    steps: [
      { text: "Steam until very tender." },
      { text: "Blend until smooth — kale is fibrous." },
      { text: "Mix with sweet potato or apple to mellow the flavor." },
    ],
  },
  pumpkin: {
    foodId: "pumpkin",
    prep: "Use a sugar pumpkin or canned pure pumpkin (not pie filling).",
    steps: [
      { text: "If fresh, halve, seed, and roast until soft." },
      { text: "Scoop out flesh and mash." },
      { text: "Add a tiny pinch of cinnamon if you like." },
    ],
  },
  beet: {
    foodId: "beet",
    prep: "Scrub fresh beets.",
    steps: [
      { text: "Wrap in foil and roast at 400°F until soft." },
      { text: "Peel and mash or blend smooth." },
      { text: "Mix with yogurt or apple to balance the earthy flavor." },
    ],
    note: "Beets stain everything — dress baby accordingly!",
  },
  corn: {
    foodId: "corn",
    prep: "Use fresh or frozen corn kernels.",
    steps: [
      { text: "Cook until very tender." },
      { text: "Blend well — corn skins can be tough." },
      { text: "Push through a sieve for a smoother purée." },
    ],
  },
  potato: {
    foodId: "potato",
    prep: "Peel and chop potatoes.",
    steps: [
      { text: "Boil or steam until very soft." },
      { text: "Mash with a little butter or milk." },
      { text: "Keep it smooth for younger babies." },
    ],
  },
  parsnip: {
    foodId: "parsnip",
    prep: "Peel parsnips and remove the woody core if large.",
    steps: [
      { text: "Chop and steam until very tender." },
      { text: "Mash or blend smooth." },
      { text: "Mix with apple or pear for a sweeter taste." },
    ],
  },
  turnip: {
    foodId: "turnip",
    prep: "Peel and chop turnips.",
    steps: [
      { text: "Steam or boil until soft." },
      { text: "Mash until smooth." },
      { text: "Mix with potato or butter to mellow the flavor." },
    ],
  },
  asparagus: {
    foodId: "asparagus",
    prep: "Snap off the tough ends.",
    steps: [
      { text: "Steam the tips until very soft." },
      { text: "Blend for purée or serve whole tips as finger food." },
      { text: "The natural shape makes a great handle for babies." },
    ],
  },
  "bell-pepper": {
    foodId: "bell-pepper",
    prep: "Use a red or yellow bell pepper for sweetness.",
    steps: [
      { text: "Remove seeds and cut into strips." },
      { text: "Roast or steam until very soft." },
      { text: "Blend for purée or serve as soft strips." },
    ],
  },
  cucumber: {
    foodId: "cucumber",
    prep: "Peel a cucumber and remove seeds.",
    steps: [
      { text: "Cut into long thin sticks." },
      { text: "Serve raw as a teething-friendly finger food." },
      { text: "Grate finely for younger babies to mix into yogurt." },
    ],
  },
  tomato: {
    foodId: "tomato",
    prep: "Use ripe, sweet tomatoes.",
    steps: [
      { text: "Score the bottom, blanch, and peel." },
      { text: "Remove seeds and chop the flesh." },
      { text: "Cook briefly and mash, or serve raw if very ripe." },
    ],
  },
  eggplant: {
    foodId: "eggplant",
    prep: "Choose a firm, smooth eggplant.",
    steps: [
      { text: "Peel and cut into chunks." },
      { text: "Roast or steam until very soft." },
      { text: "Mash with a little olive oil." },
    ],
  },
  mushroom: {
    foodId: "mushroom",
    prep: "Use button or cremini mushrooms.",
    steps: [
      { text: "Wipe clean and slice thinly." },
      { text: "Sauté in a little butter until very soft." },
      { text: "Finely chop or blend for younger babies." },
    ],
  },
  celery: {
    foodId: "celery",
    prep: "Use the inner, tender stalks.",
    steps: [
      { text: "Remove strings and chop finely." },
      { text: "Cook until very soft in soups or stews." },
      { text: "Blend into other purées — celery adds mild flavor." },
    ],
  },
  leek: {
    foodId: "leek",
    prep: "Use the white and light green parts only.",
    steps: [
      { text: "Slice and wash well — leeks trap dirt." },
      { text: "Sauté in butter until very soft." },
      { text: "Blend into potato or other purées." },
    ],
  },
  artichoke: {
    foodId: "artichoke",
    prep: "Use canned artichoke hearts (in water, not oil).",
    steps: [
      { text: "Drain and rinse well." },
      { text: "Blend or mash until smooth." },
      { text: "Mix with a little lemon juice and olive oil." },
    ],
  },
  rice: {
    foodId: "rice",
    prep: "Use white or brown rice.",
    steps: [
      { text: "Cook rice with extra water until very soft." },
      { text: "Blend or mash for younger babies." },
      { text: "Serve as soft clumps for older babies to grab." },
    ],
  },
  oatmeal: {
    foodId: "oatmeal",
    prep: "Use rolled or steel-cut oats.",
    steps: [
      { text: "Cook with water or milk until very soft." },
      { text: "Blend for a smoother texture if needed." },
      { text: "Top with mashed fruit." },
    ],
  },
  pasta: {
    foodId: "pasta",
    prep: "Use a small shape like orzo, ditalini, or fusilli.",
    steps: [
      { text: "Cook until very soft — past al dente." },
      { text: "Cut into small pieces for younger babies." },
      { text: "Toss with butter, olive oil, or sauce." },
    ],
    note: "Fusilli is easy for babies to grab.",
  },
  bread: {
    foodId: "bread",
    prep: "Use soft whole wheat bread.",
    steps: [
      { text: "Toast lightly for easier gripping." },
      { text: "Cut into finger-length strips." },
      { text: "Spread with nut butter or mashed avocado." },
    ],
  },
  quinoa: {
    foodId: "quinoa",
    prep: "Rinse quinoa well before cooking.",
    steps: [
      { text: "Cook with water until fluffy and soft." },
      { text: "Mash slightly for younger babies." },
      { text: "Mix into purées or serve as a soft grain." },
    ],
  },
  barley: {
    foodId: "barley",
    prep: "Use pearl barley.",
    steps: [
      { text: "Cook with extra water until very soft." },
      { text: "Blend for younger babies." },
      { text: "Serve as a soft grain mixed with veggies." },
    ],
  },
  millet: {
    foodId: "millet",
    prep: "Rinse millet before cooking.",
    steps: [
      { text: "Cook with water until porridge-like and soft." },
      { text: "Stir in a little butter or milk." },
      { text: "Serve warm, topped with fruit." },
    ],
  },
  couscous: {
    foodId: "couscous",
    prep: "Use regular (not Israeli) couscous for small babies.",
    steps: [
      { text: "Prepare with boiling water per package directions." },
      { text: "Fluff and let cool slightly." },
      { text: "Mix with purées or finely chopped soft veggies." },
    ],
  },
  polenta: {
    foodId: "polenta",
    prep: "Use instant or pre-made polenta.",
    steps: [
      { text: "Cook until smooth and creamy." },
      { text: "Serve warm as a spoonable purée." },
      { text: "Let it set and cut into strips for finger food." },
    ],
  },
  pancake: {
    foodId: "pancake",
    prep: "Make simple pancakes with flour, egg, and milk.",
    steps: [
      { text: "Mix batter — skip added sugar." },
      { text: "Cook small, thin pancakes in a little butter." },
      { text: "Cut into strips for easy grabbing." },
    ],
    note: "Add mashed banana or pumpkin to the batter for flavor.",
  },
  tortilla: {
    foodId: "tortilla",
    prep: "Use a soft flour or corn tortilla.",
    steps: [
      { text: "Warm slightly so it's pliable." },
      { text: "Cut into strips." },
      { text: "Spread with mashed avocado, hummus, or nut butter." },
    ],
  },
  pita: {
    foodId: "pita",
    prep: "Use soft pita bread.",
    steps: [
      { text: "Toast lightly and cut into strips." },
      { text: "Serve with hummus or yogurt for dipping." },
      { text: "The pocket shape is fun for babies to explore." },
    ],
  },
  cracker: {
    foodId: "cracker",
    prep: "Choose low-sodium, whole grain crackers.",
    steps: [
      { text: "Select crackers that dissolve easily in the mouth." },
      { text: "Spread with nut butter or cream cheese." },
      { text: "Break into manageable pieces for small hands." },
    ],
  },
  cereal: {
    foodId: "cereal",
    prep: "Use iron-fortified baby cereal.",
    steps: [
      { text: "Mix with breast milk, formula, or water." },
      { text: "Stir until smooth and thin." },
      { text: "Gradually thicken as baby gets used to it." },
    ],
  },
  noodles: {
    foodId: "noodles",
    prep: "Use egg noodles, udon, or rice noodles.",
    steps: [
      { text: "Cook until very soft." },
      { text: "Cut into short pieces." },
      { text: "Toss in a little sauce or butter." },
    ],
    note: "Long slippery noodles are fun but messy!",
  },
  chicken: {
    foodId: "chicken",
    prep: "Use boneless, skinless chicken thighs for tenderness.",
    steps: [
      { text: "Bake, poach, or slow cook until very tender." },
      { text: "Shred finely or blend with cooking liquid." },
      { text: "Serve as purée or soft shredded strips." },
    ],
  },
  turkey: {
    foodId: "turkey",
    prep: "Use ground turkey or turkey breast.",
    steps: [
      { text: "Cook ground turkey until done, keeping it moist." },
      { text: "Blend or mash with a little broth." },
      { text: "Form into small, soft patties for finger food." },
    ],
  },
  beef: {
    foodId: "beef",
    prep: "Use a tender cut or ground beef.",
    steps: [
      { text: "Cook ground beef until well done." },
      { text: "Blend with broth for a smooth purée." },
      { text: "Or make soft mini meatballs for finger food." },
    ],
  },
  lamb: {
    foodId: "lamb",
    prep: "Use ground lamb or a slow-cook cut.",
    steps: [
      { text: "Cook slowly until very tender." },
      { text: "Shred or blend with cooking liquid." },
      { text: "Serve as purée or in soft, small pieces." },
    ],
  },
  pork: {
    foodId: "pork",
    prep: "Use pork tenderloin or ground pork.",
    steps: [
      { text: "Cook slowly until very tender and cooked through." },
      { text: "Shred or blend smooth." },
      { text: "Mix with applesauce for a classic pairing." },
    ],
  },
  salmon: {
    foodId: "salmon",
    prep: "Use fresh or frozen skinless salmon.",
    steps: [
      { text: "Bake or poach until it flakes easily." },
      { text: "Flake and check carefully for bones." },
      { text: "Mash with a fork or serve as soft flakes." },
    ],
  },
  cod: {
    foodId: "cod",
    prep: "Use fresh or frozen cod fillets.",
    steps: [
      { text: "Steam or bake until flaky." },
      { text: "Check carefully for bones." },
      { text: "Mash or flake for baby." },
    ],
  },
  tuna: {
    foodId: "tuna",
    prep: "Use canned light tuna in water (lower mercury).",
    steps: [
      { text: "Drain well." },
      { text: "Mash with a fork." },
      { text: "Mix with avocado or yogurt." },
    ],
  },
  sardine: {
    foodId: "sardine",
    prep: "Use canned sardines in water or olive oil.",
    steps: [
      { text: "Drain and remove any visible bones." },
      { text: "Mash well with a fork." },
      { text: "Mix into pasta or spread on toast." },
    ],
  },
  shrimp: {
    foodId: "shrimp",
    prep: "Use fresh or frozen peeled shrimp.",
    steps: [
      { text: "Cook until pink and fully done." },
      { text: "Chop very finely or blend." },
      { text: "Mix into purées or serve as tiny pieces." },
    ],
  },
  egg: {
    foodId: "egg",
    prep: "Use a fresh egg.",
    steps: [
      { text: "Hard-boil, scramble, or make a thin omelette." },
      { text: "Mash hard-boiled egg or chop into small pieces." },
      { text: "Cut omelette strips for finger food." },
    ],
  },
  tofu: {
    foodId: "tofu",
    prep: "Use firm or extra-firm tofu.",
    steps: [
      { text: "Press out excess water." },
      { text: "Cut into strips and pan-fry lightly." },
      { text: "Serve as soft finger food or crumble into dishes." },
    ],
  },
  lentils: {
    foodId: "lentils",
    prep: "Use red or green lentils.",
    steps: [
      { text: "Cook with water until very soft and falling apart." },
      { text: "Mash or blend to desired consistency." },
      { text: "Season with mild spices like cumin." },
    ],
  },
  chickpea: {
    foodId: "chickpea",
    prep: "Use canned chickpeas, drained and rinsed.",
    steps: [
      { text: "Cook until very soft or use straight from can." },
      { text: "Mash well or blend into a hummus-like texture." },
      { text: "Flatten individual chickpeas for finger food." },
    ],
  },
  "black-bean": {
    foodId: "black-bean",
    prep: "Use canned black beans, drained and rinsed.",
    steps: [
      { text: "Heat and mash with a fork." },
      { text: "Blend for a smoother purée." },
      { text: "Flatten individual beans for older babies." },
    ],
  },
  "kidney-bean": {
    foodId: "kidney-bean",
    prep: "Use canned kidney beans, drained and rinsed.",
    steps: [
      { text: "Mash well — kidney beans are firm." },
      { text: "Blend into a smooth purée with a little water." },
      { text: "Season with mild spices." },
    ],
  },
  "white-bean": {
    foodId: "white-bean",
    prep: "Use canned cannellini or navy beans.",
    steps: [
      { text: "Drain, rinse, and heat gently." },
      { text: "Mash with a fork — they're naturally creamy." },
      { text: "Mix with veggies or serve on toast." },
    ],
  },
  "peanut-butter": {
    foodId: "peanut-butter",
    prep: "Use smooth, unsweetened peanut butter.",
    steps: [
      { text: "Thin with warm water or milk until runny." },
      { text: "Mix a small amount into oatmeal or yogurt." },
      { text: "Spread thinly on toast strips." },
    ],
    note: "Never serve thick globs — thin it down for safety.",
  },
  "almond-butter": {
    foodId: "almond-butter",
    prep: "Use smooth, unsweetened almond butter.",
    steps: [
      { text: "Thin with warm water until easily spreadable." },
      { text: "Stir into oatmeal or purées." },
      { text: "Spread very thinly on toast." },
    ],
  },
  tahini: {
    foodId: "tahini",
    prep: "Use well-stirred tahini.",
    steps: [
      { text: "Mix a small spoonful into purées or yogurt." },
      { text: "Thin with lemon juice and water for a sauce." },
      { text: "Drizzle over roasted veggies." },
    ],
  },
  hummus: {
    foodId: "hummus",
    prep: "Use store-bought or homemade hummus.",
    steps: [
      { text: "Serve as a dip with soft bread strips." },
      { text: "Spread on toast for finger food." },
      { text: "Mix into warm pasta or grains." },
    ],
  },
  tempeh: {
    foodId: "tempeh",
    prep: "Use plain tempeh.",
    steps: [
      { text: "Steam or boil until soft." },
      { text: "Crumble or cut into thin strips." },
      { text: "Pan-fry lightly for a little texture." },
    ],
  },
  liver: {
    foodId: "liver",
    prep: "Use chicken liver — it's mildest.",
    steps: [
      { text: "Sauté in butter until cooked through." },
      { text: "Blend smooth with a little broth." },
      { text: "Mix a small amount into other purées." },
    ],
    note: "Liver is very iron-rich — a little goes a long way.",
  },
  "bone-broth": {
    foodId: "bone-broth",
    prep: "Use homemade or low-sodium store-bought broth.",
    steps: [
      { text: "Warm gently." },
      { text: "Use to thin out purées or cook grains." },
      { text: "Offer small sips in an open cup." },
    ],
  },
  edamame: {
    foodId: "edamame",
    prep: "Use frozen shelled edamame.",
    steps: [
      { text: "Cook until very soft." },
      { text: "Remove the outer skin from each bean." },
      { text: "Mash or flatten for baby." },
    ],
  },
  yogurt: {
    foodId: "yogurt",
    prep: "Use plain whole-milk yogurt, no added sugar.",
    steps: [
      { text: "Scoop into a bowl." },
      { text: "Serve plain or mix in fruit purée." },
      { text: "Let baby explore with a preloaded spoon." },
    ],
  },
  cheese: {
    foodId: "cheese",
    prep: "Use mild cheese like cheddar or mozzarella.",
    steps: [
      { text: "Shred or cut into thin strips." },
      { text: "Melt into other foods or serve as finger food." },
      { text: "Avoid large cubes — thin strips are safest." },
    ],
  },
  "cottage-cheese": {
    foodId: "cottage-cheese",
    prep: "Use full-fat cottage cheese.",
    steps: [
      { text: "Serve as-is for older babies who handle texture." },
      { text: "Blend smooth for younger babies." },
      { text: "Mix with fruit purée." },
    ],
  },
  ricotta: {
    foodId: "ricotta",
    prep: "Use whole-milk ricotta.",
    steps: [
      { text: "Spread on toast strips." },
      { text: "Mix into pasta." },
      { text: "Serve with mashed berries." },
    ],
  },
  butter: {
    foodId: "butter",
    prep: "Use unsalted butter.",
    steps: [
      { text: "Add a small pat to cooked veggies or grains." },
      { text: "Spread thinly on toast." },
      { text: "Use for cooking — it adds healthy fat." },
    ],
  },
  "cream-cheese": {
    foodId: "cream-cheese",
    prep: "Use full-fat cream cheese.",
    steps: [
      { text: "Spread thinly on toast strips or crackers." },
      { text: "Mix into mashed potatoes for creaminess." },
      { text: "Roll into small balls with other ingredients." },
    ],
  },
  coconut: {
    foodId: "coconut",
    prep: "Use coconut cream or unsweetened shredded coconut.",
    steps: [
      { text: "Stir coconut cream into purées or oatmeal." },
      { text: "Finely grind shredded coconut before adding to food." },
      { text: "Use coconut milk for cooking grains." },
    ],
  },
  "olive-oil": {
    foodId: "olive-oil",
    prep: "Use extra virgin olive oil.",
    steps: [
      { text: "Drizzle a small amount over cooked veggies." },
      { text: "Mix into purées for added healthy fat." },
      { text: "Use for cooking or roasting foods." },
    ],
  },
  cinnamon: {
    foodId: "cinnamon",
    prep: "Use a tiny pinch of ground cinnamon.",
    steps: [
      { text: "Sprinkle into oatmeal, yogurt, or fruit purées." },
      { text: "Add to pancake batter." },
      { text: "Mix with mashed sweet potato or apple." },
    ],
  },
  cumin: {
    foodId: "cumin",
    prep: "Use a tiny pinch of ground cumin.",
    steps: [
      { text: "Add to lentils, beans, or meat purées." },
      { text: "Mix into carrot or sweet potato purée." },
      { text: "A little goes a long way — start very small." },
    ],
  },
  turmeric: {
    foodId: "turmeric",
    prep: "Use a tiny pinch of ground turmeric.",
    steps: [
      { text: "Stir into rice, lentils, or scrambled eggs." },
      { text: "Add to soups or stews." },
      { text: "Pair with a tiny pinch of black pepper." },
    ],
    note: "Turmeric stains — be mindful of clothes and surfaces.",
  },
  basil: {
    foodId: "basil",
    prep: "Use fresh basil leaves.",
    steps: [
      { text: "Tear or chop finely." },
      { text: "Stir into pasta, tomato sauce, or purées." },
      { text: "Blend into a baby-friendly pesto with olive oil." },
    ],
  },
  oregano: {
    foodId: "oregano",
    prep: "Use dried or fresh oregano.",
    steps: [
      { text: "Add a tiny pinch to tomato-based dishes." },
      { text: "Sprinkle on roasted veggies." },
      { text: "Mix into meat or bean purées." },
    ],
  },
  garlic: {
    foodId: "garlic",
    prep: "Use fresh garlic cloves.",
    steps: [
      { text: "Mince finely and cook in a little oil or butter." },
      { text: "Add to veggies, meats, or grains while cooking." },
      { text: "Start with a small amount — garlic is strong." },
    ],
  },
  ginger: {
    foodId: "ginger",
    prep: "Use fresh ginger root.",
    steps: [
      { text: "Peel and grate finely." },
      { text: "Add a tiny amount to fruit purées or stir-fries." },
      { text: "Cook briefly to mellow the flavor." },
    ],
  },
};

export function getRecipe(foodId: string): Recipe | undefined {
  return recipes[foodId];
}
