const translations = {
  "en": {
    "nav": {
      "home": "Home",
      "about": "About Us",
      "contact": "Contact",
      "languageLabel": "Language",
      "languageOptionPt": "Portuguese",
      "languageOptionEn": "English"
    },
    "loading": {
      "message": "Getting things ready"
    },
    "footer": {
      "copyright": "besayfe, 2026. Built in Portugal."
    },
    "seo": {
      "siteName": "besayfe",
      "defaults": {
        "description": "besayfe maps restaurants against the allergens you avoid. Where a menu is not there yet, photograph it and the app reads it and estimates the allergens for you.",
        "keywords": [
          "besayfe",
          "allergen map",
          "eating out with allergies",
          "gluten free menu",
          "allergy friendly restaurants",
          "menu photo allergens",
          "food allergy",
          "coeliac eating out",
          "allergen information",
          "restaurant menu ocr"
        ],
        "image": "/logo1000.png"
      },
      "home": {
        "title": "besayfe | See what is on the plate before you order",
        "description": "Set the allergens you avoid, open the map and see restaurant menus dish by dish. No menu yet? A photo is enough to get an estimate in seconds.",
        "keywords": [
          "allergy menu app",
          "allergen map",
          "gluten free dining",
          "menu photo allergen check",
          "eating out with food allergies"
        ]
      },
      "about": {
        "title": "About besayfe | The team behind the allergen map",
        "description": "Meet the founders of besayfe and why we set out to make eating out simple for people with food allergies and intolerances.",
        "keywords": [
          "besayfe founders",
          "food allergy startup",
          "safer eating out",
          "allergen transparency"
        ]
      },
      "contact": {
        "title": "Contact besayfe | Suggest a restaurant or ask a question",
        "description": "Talk to the besayfe team. Suggest a restaurant, ask a question, or bring besayfe to a place you run.",
        "keywords": [
          "contact besayfe",
          "suggest a restaurant",
          "allergy friendly menu"
        ]
      },
      "demoPreview": {
        "title": "besayfe | demo",
        "description": "Preview the besayfe mobile experience: OCR menu scan, allergen detection, translations, and risk scoring.",
        "keywords": [
          "food allergy prototype",
          "figma demo",
          "allergen scanner preview"
        ]
      },
      "productDemo": {
        "title": "besayfe | demo",
        "description": "Scan or search a barcode to reveal allergens, traces, and ingredient risks powered by AI and European regulations.",
        "keywords": [
          "barcode allergen lookup",
          "ingredient scanner",
          "allergy check online",
          "food trace search"
        ]
      },
      "productDemoV2": {
        "title": "besayfe | demo",
        "description": "Create your allergen profile, scan products, and see AI food risk scores with translations and label upload.",
        "keywords": [
          "allergen risk ai",
          "ingredient analysis",
          "food safety app",
          "allergy profile"
        ]
      },
      "adminLogin": {
        "title": "besayfe",
        "description": "Secure sign in for besayfe administrators.",
        "keywords": [
          "besayfe admin"
        ],
        "noindex": true
      },
      "adminDashboard": {
        "title": "besayfe",
        "description": "Encrypted contact messages and waitlist records for authorized besayfe admins.",
        "keywords": [
          "besayfe admin dashboard"
        ],
        "noindex": true
      }
    },
    "home": {
      "heroCta": "Open the map",
      "heroTrust": [
        "100+ restaurants on the map",
        "14 allergens",
        "Nothing to install",
        "Portuguese and English"
      ],
      "legendEyebrow": "Reading the map",
      "legendTitle": "What the colours mean",
      "legendIntro": "Every pin and every dish is coloured for your allergies, and says where the information came from.",
      "legend": [
        {
          "tone": "safe",
          "title": "Green",
          "text": "Safe options, confirmed by the restaurant."
        },
        {
          "tone": "info",
          "title": "Blue",
          "text": "Looks safe, but not confirmed yet."
        },
        {
          "tone": "warn",
          "title": "Orange",
          "text": "Allergens not confirmed. Ask the restaurant."
        },
        {
          "tone": "danger",
          "title": "Red",
          "text": "No safe options for you."
        }
      ],
      "allergensLabel": "Covers all 14 allergens that restaurants must declare in the EU",
      "allergens": [
        "🌾 Gluten",
        "🦐 Crustaceans",
        "🥚 Eggs",
        "🐟 Fish",
        "🥜 Peanuts",
        "🫘 Soy",
        "🥛 Milk",
        "🌰 Tree nuts",
        "🥬 Celery",
        "🟡 Mustard",
        "🌱 Sesame",
        "🍷 Sulphites",
        "🌼 Lupin",
        "🐚 Molluscs"
      ],
      "faqEyebrow": "Quick answers",
      "faqTitle": "Before you open the map",
      "faq": [
        {
          "q": "Do I need to install anything or create an account?",
          "a": "No. besayfe opens in your browser. You can skip choosing your allergies and still see everything."
        },
        {
          "q": "Can I trust the result?",
          "a": "Green means the restaurant confirmed it. Anything estimated is labelled as an estimate. besayfe is there to inform you, so it never replaces checking with the restaurant."
        },
        {
          "q": "My restaurant isn't on the map.",
          "a": "Photograph the menu and the app estimates the allergens, or tell us which restaurant it is and we'll take it from there."
        },
        {
          "q": "I run a restaurant. What do I get?",
          "a": "Your dishes show as confirmed instead of estimated, which is what guests with allergies look for first. Get in touch and we'll set up the menu with you."
        }
      ],
      "stickyCta": "Open the map",
      "ctaSecondaryLabel": "Suggest a restaurant",
      "heroEyebrow": "For anyone eating out",
      "heroTitle": "Know what is on the plate before you order.",
      "heroText": "Pick your allergies and besayfe reads the menu for you, dish by dish. If the restaurant isn't on besayfe yet, a photo of the menu is enough.",
      "heroSecondaryCta": "See how it works",
      "mock": {
        "menuTag": "Restaurant menu",
        "filterLabel": "Your profile",
        "filterChips": [
          "Gluten",
          "Milk"
        ],
        "dishes": [
          {
            "name": "Bacalhau com natas",
            "category": "Main courses",
            "allergens": [
              "Gluten",
              "Milk",
              "Fish"
            ],
            "status": "danger",
            "statusLabel": "Contains gluten and milk"
          },
          {
            "name": "Polvo à lagareiro",
            "category": "Main courses",
            "allergens": [
              "Molluscs"
            ],
            "status": "safe",
            "statusLabel": "Nothing you avoid"
          },
          {
            "name": "Arroz de pato",
            "category": "Main courses",
            "allergens": [
              "Egg"
            ],
            "status": "info",
            "statusLabel": "Nothing you avoid, unconfirmed"
          }
        ]
      },
      "problemEyebrow": "The problem",
      "problemTitle": "Eating out still means trusting an answer",
      "problemIntro": "If you avoid an ingredient, you know the routine: ask, wait, and hope the answer is right.",
      "problem": {
        "points": [
          {
            "icon": "01",
            "title": "The answer depends on who is working",
            "text": "Ask two people the same question and you may get two answers. Often nobody can check the recipe on the spot."
          },
          {
            "icon": "02",
            "title": "Asking every time",
            "text": "Explaining an allergy to a full room in the middle of service is tiring. Many people order the usual or stay home."
          },
          {
            "icon": "03",
            "title": "Most places publish nothing",
            "text": "Few restaurants publish allergen information where you can read it beforehand, so the question always ends up back at the table."
          }
        ]
      },
      "solutionEyebrow": "How it works",
      "solutionTitle": "Your allergies, on the map and on the menu",
      "solutionIntro": "besayfe opens in the browser. There is nothing to install or sign up for, and it works the same whether or not the restaurant has joined.",
      "solution": {
        "steps": [
          {
            "icon": "01",
            "title": "Choose your allergies",
            "text": "Tick yours from the 14 allergens on the EU list. It takes under a minute, and you can skip it and still see everything."
          },
          {
            "icon": "02",
            "title": "Open the map, open the menu",
            "text": "Nearby restaurants are marked by what they mean for you, and each menu tells you straight away how many dishes you can eat."
          },
          {
            "icon": "03",
            "title": "No menu yet? Photograph it",
            "text": "Take a photo of the paper menu. besayfe reads it in Portuguese or English, estimates the allergens in each dish and shows you the result straight away."
          }
        ]
      },
      "featuresEyebrow": "What you get",
      "featuresTitle": "Useful even before a restaurant joins",
      "featuresIntro": "Three sources of information, each labelled so you know which one you are reading.",
      "features": {
        "items": [
          {
            "icon": "01",
            "title": "Straight from the kitchen",
            "text": "Restaurants on besayfe fill in a technical sheet for each recipe. Only what they confirm counts as verified, and only that appears in green."
          },
          {
            "icon": "02",
            "title": "Official chain data",
            "text": "For the big chains we load the allergen tables they publish. Declared information always takes priority over the model's estimate."
          },
          {
            "icon": "03",
            "title": "Everywhere else, AI reads the menu",
            "text": "For restaurants that have not joined, a photo is enough. OCR extracts the dishes and the model estimates the likely allergens from the dish and the way it is usually cooked."
          },
          {
            "icon": "04",
            "title": "Five states",
            "text": "Contains, possible contact, no data, nothing you avoid, and nothing you avoid but unconfirmed. You always know which one you are looking at and where the answer came from."
          },
          {
            "icon": "05",
            "title": "A map that knows your allergies",
            "text": "Pins are coloured for your profile, and inside a menu you can filter down to the dishes you can eat."
          },
          {
            "icon": "06",
            "title": "Built with everyone's help",
            "text": "Menus you photograph are reviewed and then help the next person. If you spot a mistake, report it from the menu itself. Everything is in Portuguese and English."
          }
        ]
      },
      "socialProofEyebrow": "Why it matters",
      "socialProofTitle": "Many people choose where to eat this way",
      "socialProofIntro": "Allergies and intolerances shape a decision that should be easy, and the information to make it easy already exists.",
      "socialProof": {
        "items": [
          {
            "icon": "01",
            "title": "1 in 10 European adults",
            "text": "Adults with an allergy or intolerance choose a restaurant by how confident the answer to their question is.",
            "meta": "Allergy and intolerance prevalence"
          },
          {
            "icon": "02",
            "title": "Up to 22% of European children",
            "text": "More than one in five show allergic symptoms, and many families stop eating out because of it.",
            "meta": "<a href=\"https://www.spaic.pt/noticias/ate-22-das-criancas-na-europa-tem-uma-alergia\" target=\"_blank\" rel=\"noreferrer\">SPAIC, 2023</a>"
          },
          {
            "icon": "03",
            "title": "The information already exists",
            "text": "EU Regulation 1169/2011 has required allergen information for non-prepacked food since 2014. Where it is published we use it, and where it is not we read the menu.",
            "meta": "EU Regulation 1169/2011"
          }
        ]
      },
      "ctaEyebrow": "Somewhere you eat often?",
      "ctaTitle": "Tell us where you would like to see besayfe.",
      "ctaText": "Send us the restaurant and we will take it from there. If you run one, we will set up your menu so your dishes show as confirmed rather than estimated.",
      "ctaButton": "Open the map",
      "ctaSecondary": "Request the market brief",
      "disclaimer": "besayfe is informative and does not replace confirming allergens with the restaurant.",
      "galleryEyebrow": "The app",
      "galleryTitle": "What it looks like on your phone",
      "galleryIntro": "Real besayfe screens. It opens in the browser, so there is nothing to install.",
      "gallery": {
        "items": [
          {
            "key": "allergens",
            "title": "Tell it what you avoid",
            "text": "The 14 allergens on the EU list. Under a minute, and you can skip it."
          },
          {
            "key": "map",
            "title": "See what is around you",
            "text": "Every pin is coloured for your profile, and the list of restaurants is a tap away."
          },
          {
            "key": "menu-danger",
            "title": "The menu, read for you",
            "text": "How many dishes are clear, what each one contains, and a legend for the five states."
          },
          {
            "key": "contribution",
            "title": "No menu? Photograph it",
            "text": "Where there is no data yet, your photo is what the next person will read."
          }
        ]
      }
    },
    "tests": {
      "hero": {
        "loading": "Loading...",
        "captions": [
          "Your new allergen companion",
          "helps you identify risks clearly",
          "scan the product for personalized easy to read information",
          "yes it is this simple and stress free"
        ]
      },
      "validation": {
        "kicker": "Validation",
        "title": "Demand, experts, and regulation push the project forward",
        "body": "Discovery interviews, clinical validation, and European regulation confirm that besayfe answers a real and urgent need.",
        "items": [
          {
            "step": "01",
            "title": "160 early supporters",
            "body": "Prospective users signed up to test the beta and praised the ease of use.",
            "meta": "Exploratory sprint, 2025"
          },
          {
            "step": "02",
            "title": "Clinical and social endorsement",
            "body": "Allergy associations and healthcare professionals validated besayfe's scientific and human relevance.",
            "meta": "NGO partners + clinical advisors"
          },
          {
            "step": "03",
            "title": "Favourable regulation",
            "body": "EU Regulation 1169/2011 and a European health and nutrition tech market above $45B by 2030 create strong adoption tailwinds.",
            "meta": "EU regulation + market reports"
          }
        ]
      }
    },
    "demoPreview": {
      "tag": "Prototype access",
      "title": "Explore the besayfe mobile journey",
      "subtitle": "Navigate the interactive Figma prototype to see how the app's UX/UI is going to be.",
      "backHome": "Back to home",
      "openInFigma": "Open in Figma",
      "tip": "Tip: use the mouse wheel or pinch to zoom if you want to inspect the UI more closely."
    },
    "contact": {
      "title": "Get in touch",
      "intro": "Tell us where you eat, or what you serve, and we will get back to you.",
      "fields": {
        "name": "Name",
        "email": "Email",
        "message": "Message",
        "placeholders": {
          "name": "Your name",
          "email": "example@email.com",
          "message": "How can we help?"
        }
      },
      "submit": "Send message",
      "submitting": "Sending...",
      "status": {
        "incomplete": "Please fill in every field before sending.",
        "invalidEmail": "Enter a valid email address.",
        "sending": "Sending your encrypted message...",
        "success": "Thank you! We will reply shortly.",
        "error": "We could not send your message. Please try again in a moment."
      },
      "directLabel": "Prefer email? Write to"
    },
    "productDemo": {
      "initialMessage": "Point your camera at a barcode to get started.",
      "searching": "Searching for product...",
      "notFound": "Product not found.",
      "noneListed": "None listed",
      "productFound": "Product found:",
      "name": "Name",
      "code": "Code",
      "allergens": "Allergens",
      "mayContain": "May contain",
      "errorFetch": "Error fetching data. Please check your connection.",
      "cameraAccess": "Please allow camera access.",
      "noCamera": "No camera found.",
      "cameraUnavailable": "Unable to access available cameras.",
      "enterValidCode": "Enter a valid code to search.",
      "waiting": "Waiting for scan or manual entry.",
      "processing": "Processing scan...",
      "productFoundConfirm": "Product found - confirm the details below.",
      "profileTitle": "User allergen profile",
      "profileSubtitle": "Keep it simple: pick only what matters to the user.",
      "profileSelected": "Selected {count}/{total}",
      "profileNoneSelected": "No allergens selected",
      "profileTokenNone": "None selected",
      "profileMore": "more",
      "profileSelectAll": "Select all",
      "profileClear": "Clear",
      "profileHide": "Hide",
      "profileEdit": "Edit",
      "headerTag": "Scanner",
      "headerTitle": "Barcode allergen lookup",
      "headerSubtitle": "Scan a barcode or upload a label photo to review allergen risk in seconds.",
      "scannerTitle": "Camera scan",
      "scannerSubtitle": "Scan the barcode or upload a label photo below.",
      "zoom": "Zoom",
      "noCameraQuestion": "No barcode?",
      "manualHint": "Type the barcode digits to look up the product.",
      "manualPlaceholder": "5601234567890",
      "search": "Look up",
      "tapToEnable": "Tap to turn the camera on or off.",
      "summaryTitle": "Product details",
      "summarySubtitle": "Data is provided by Open Food Facts and besayfe hospitality partners.",
      "empty": "Scan a barcode or search above to view allergens and traces.",
      "ingredients": "Ingredients",
      "riskLabel": "Risk",
      "riskAnalysisTitle": "Risk analysis",
      "riskFinalScore": "Final risk score:",
      "riskFacilityAdded": "Facility risk added:",
      "riskScoreLabel": "Score:",
      "riskViewMore": "View more",
      "riskHideDetails": "Hide details",
      "riskCalculating": "Calculating risk...",
      "riskNotFoundEngine": "Product not found in besayfe engine",
      "riskEngineFailed": "Risk engine failed to compute",
      "riskUnavailable": "Service unavailable",
      "tips": []
    },
    "annex": {
      "GLUTEN": "Cereals containing gluten (wheat, rye, barley, oats and derivatives)",
      "CRUSTACEANS": "Crustaceans and products thereof",
      "EGG": "Eggs and products thereof",
      "FISH": "Fish and products thereof",
      "PEANUT": "Peanuts and products thereof",
      "SOY": "Soybeans and products thereof",
      "MILK": "Milk and dairy products including lactose",
      "TREE_NUTS": "Nuts (almond, hazelnut, walnut, cashew, pecan, Brazil nut, pistachio, macadamia)",
      "CELERY": "Celery and products thereof",
      "MUSTARD": "Mustard and products thereof",
      "SESAME": "Sesame seeds and products thereof",
      "SULPHITES": "Sulphur dioxide and sulphites >10mg/kg or 10mg/L",
      "LUPIN": "Lupin and products thereof",
      "MOLLUSCS": "Molluscs and products thereof"
    },
    "productDemoV2": {
      "initialMessage": "Point your camera at a barcode to get started.",
      "searching": "Searching for product...",
      "notFound": "Product not found.",
      "noneListed": "None listed",
      "productFound": "Product found:",
      "name": "Name",
      "code": "Code",
      "allergens": "Allergens",
      "mayContain": "May contain",
      "errorFetch": "Error fetching data. Please check your connection.",
      "cameraAccess": "Please allow camera access.",
      "noCamera": "No camera found.",
      "cameraUnavailable": "Unable to access available cameras.",
      "enterValidCode": "Enter a valid code to search.",
      "waiting": "Waiting for scan or manual entry.",
      "processing": "Processing scan...",
      "productFoundConfirm": "Product found - confirm the details below.",
      "profileTitle": "User allergen profile",
      "profileSubtitle": "Keep it simple: pick only what matters to the user.",
      "profileSelected": "Selected {count}/{total}",
      "profileNoneSelected": "No allergens selected",
      "profileTokenNone": "None selected",
      "profileMore": "more",
      "profileSelectAll": "Select all",
      "profileClear": "Clear",
      "profileHide": "Hide",
      "profileEdit": "Edit",
      "headerTag": "Scanner",
      "headerTitle": "Barcode allergen lookup",
      "headerSubtitle": "Scan or search to review core allergen information in seconds.",
      "scannerTitle": "Camera scan",
      "scannerSubtitle": "Allow camera access or enter the barcode manually.",
      "zoom": "Zoom",
      "noCameraQuestion": "No camera?",
      "manualHint": "Type the barcode digits to look up the product.",
      "manualPlaceholder": "5601234567890",
      "search": "Look up",
      "tapToEnable": "Tap to turn the camera on or off.",
      "summaryTitle": "Product details",
      "summarySubtitle": "Data is provided by Open Food Facts and besayfe hospitality partners.",
      "empty": "Scan a barcode or search above to view allergens and traces.",
      "ingredients": "Ingredients",
      "riskLabel": "Risk",
      "riskAnalysisTitle": "Risk analysis",
      "riskFinalScore": "Final risk score:",
      "riskFacilityAdded": "Facility risk added:",
      "riskScoreLabel": "Score:",
      "insufficientInfo": "Not enough ingredient data. Add a label photo to analyze.",
      "riskViewMore": "View more",
      "riskHideDetails": "Hide details",
      "riskCalculating": "Calculating risk...",
      "riskNotFoundEngine": "Product not found in besayfe engine",
      "riskEngineFailed": "Risk engine failed to compute",
      "riskUnavailable": "Service unavailable",
      "labelTitle": "Analyze an ingredient label",
      "labelSubtitle": "Upload a clear photo to read ingredients and score risk instantly.",
      "labelProcessing": "Reading label...",
      "labelReady": "Label analysis ready.",
      "labelHelp": "Need more detail? A label photo can fill missing ingredients.",
      "labelEncourage": "Tips: good light + flat label makes OCR more accurate.",
      "uploadLabel": "Analyze label",
      "uploadingLabel": "Reading label...",
      "uploadLabelSuccess": "Label analyzed.",
      "uploadLabelError": "We could not analyze the photo. Please try again.",
      "uploadLabelPermission": "We could not access the photo. Please check permissions.",
      "uploadLabelOffline": "No connection detected. Check your network and try again.",
      "uploadLabelMissingAllergens": "Select at least one allergen before analyzing a label.",
      "allergenLabels": {
        "GLUTEN": "Gluten",
        "CRUSTACEANS": "Crustaceans",
        "EGG": "Egg",
        "FISH": "Fish",
        "PEANUT": "Peanut",
        "SOY": "Soy",
        "MILK": "Milk",
        "TREE_NUTS": "Tree Nuts",
        "CELERY": "Celery",
        "MUSTARD": "Mustard",
        "SESAME": "Sesame",
        "SULPHITES": "Sulphites",
        "LUPIN": "Lupin",
        "MOLLUSCS": "Molluscs"
      },
      "tips": []
    },
    "about": {
      "heroTag": "Our story",
      "heroTitle": "Making every table feel safe.",
      "heroLead": "besayfe started at university, from a simple observation: the information that makes a meal safe already exists in the kitchen, and almost never reaches the person eating it.",
      "missionTitle": "Why we built besayfe",
      "missionBody": "We listened to people who hesitate before ordering and to friends who read every menu twice. besayfe puts the answer in their hands: what each dish contains, checked against what they avoid. It comes from the kitchen where the restaurant is on besayfe, and from the menu itself where it is not.",
      "missionPillars": [
        "The answer belongs to the person eating.",
        "The kitchen already has the answer. Our job is to get it to the table.",
        "No account, no app to install, no fuss."
      ],
      "teamTitle": "Meet the founders",
      "teamIntro": "We are a small team that blends technology, rigour and time spent in real kitchens to change how food information reaches the table.",
      "founders": [
        {
          "name": "Francisco Magalhaes",
          "role": "CEO & CTO",
          "bio": "Leads product and engineering, and builds the platform the kitchens work on."
        },
        {
          "name": "Rodrigo Azevedo",
          "role": "COO & CPO",
          "bio": "Runs operations and partnerships, and onboards every restaurant that joins."
        }
      ],
      "ctaTitle": "Want to be part of it?",
      "ctaBody": "Tell us where you usually eat and we will bring besayfe to one more table.<br>If you run a restaurant, we will set your menu up so your dishes show as confirmed by you.",
      "rulesTitle": "How we handle the information",
      "rulesBody": "People with allergies are asked to trust what we show them, so the rules we follow should be public. Here they are, and the app follows them without exception.",
      "rules": [
        "<strong>Only the restaurant confirms.</strong> Anything the model works out stays marked as unconfirmed and never shows in green.",
        "<strong>Declared beats inferred.</strong> Where official information exists, that is what we show, even when the estimate says otherwise.",
        "<strong>We never call a dish safe.</strong> We tell you what we know, where it came from and what is still unconfirmed. The decision stays yours."
      ]
    }
  },
  "pt": {
    "nav": {
      "home": "Início",
      "about": "Sobre nós",
      "contact": "Contacto",
      "languageLabel": "Idioma",
      "languageOptionPt": "Português",
      "languageOptionEn": "Inglês"
    },
    "loading": {
      "message": "A preparar tudo"
    },
    "footer": {
      "copyright": "besayfe, 2026. Feito em Portugal."
    },
    "seo": {
      "siteName": "besayfe",
      "defaults": {
        "description": "A besayfe mostra-te o que cada prato leva antes de pedires. Escolhe as tuas alergias e o menu do restaurante assinala-as, em português e inglês.",
        "keywords": [
          "besayfe",
          "mapa de alergénios",
          "comer fora com alergias",
          "menu sem glúten",
          "restaurantes para alérgicos",
          "fotografia do menu alergénios",
          "alergia alimentar",
          "celíaco comer fora",
          "intolerância alimentar",
          "OCR de menus"
        ],
        "image": "/logo1000.png"
      },
      "home": {
        "title": "besayfe | Vê o que está no prato antes de pedires",
        "description": "App de alergénios para quem come fora: escolhe o que evitas (glúten, lactose, frutos secos, marisco) e vê prato a prato o que podes pedir. Sem menu na app? Uma foto chega.",
        "keywords": [
          "menu alergias",
          "menu de alergénios",
          "tabela de alergénios restaurante",
          "app alergias alimentares",
          "restaurantes sem frutos secos",
          "restaurantes sem frutos de casca rija",
          "restaurantes sem glúten Lisboa",
          "restaurantes sem lactose",
          "mapa de alergénios",
          "fotografar menu alergénios",
          "comer fora com alergias"
        ]
      },
      "about": {
        "title": "Sobre a besayfe | A equipa por trás do mapa de alergénios",
        "description": "Conhece os fundadores da besayfe e porque quisemos tornar simples comer fora para quem tem alergias ou intolerâncias alimentares.",
        "keywords": [
          "fundadores besayfe",
          "startup alergias alimentares",
          "comer fora em segurança",
          "transparência alimentar"
        ]
      },
      "contact": {
        "title": "Contacto besayfe | Sugere um restaurante ou tira uma dúvida",
        "description": "Fala com a equipa da besayfe. Sugere um restaurante, tira uma dúvida ou leva a besayfe ao teu restaurante.",
        "keywords": [
          "contacto besayfe",
          "sugerir restaurante",
          "menu para alérgicos"
        ]
      },
      "demoPreview": {
        "title": "besayfe | demo",
        "description": "Veja a experiência mobile da besayfe: OCR em menus, deteção de alergias, traduções e índice de risco.",
        "keywords": [
          "protótipo alergias",
          "demo figma",
          "scanner de alergias"
        ]
      },
      "productDemo": {
        "title": "besayfe | demo",
        "description": "Leia ou pesquise um código de barras para ver alergias, vestígios e riscos de ingredientes com base em IA e regulação europeia.",
        "keywords": [
          "verificador código de barras",
          "scanner de ingredientes",
          "verificador de alergias",
          "riscos de alimentos"
        ]
      },
      "productDemoV2": {
        "title": "besayfe | demo",
        "description": "Crie o seu perfil de alergias, escaneie produtos e veja pontuações de risco alimentar com IA, traduções e upload de rótulo.",
        "keywords": [
          "ia risco de alergias",
          "análise de ingredientes",
          "app de segurança alimentar",
          "perfil de alergias"
        ]
      },
      "adminLogin": {
        "title": "besayfe",
        "description": "Acesso seguro para administradores besayfe.",
        "keywords": [
          "besayfe admin"
        ],
        "noindex": true
      },
      "adminDashboard": {
        "title": "besayfe",
        "description": "Mensagens encriptadas e lista de espera para administradores autorizados.",
        "keywords": [
          "dashboard besayfe admin"
        ],
        "noindex": true
      }
    },
    "home": {
      "heroCta": "Abrir o mapa",
      "heroTrust": [
        "Mais de 100 restaurantes no mapa",
        "14 alergénios",
        "Sem instalar nada",
        "Português e inglês"
      ],
      "legendEyebrow": "Como ler o mapa",
      "legendTitle": "O que significa cada cor",
      "legendIntro": "Cada ponto e cada prato ganha a cor das tuas alergias e diz de onde vem a informação.",
      "legend": [
        {
          "tone": "safe",
          "title": "Verde",
          "text": "Opções seguras, confirmadas pelo restaurante."
        },
        {
          "tone": "info",
          "title": "Azul",
          "text": "Parece seguro, mas ainda não foi confirmado."
        },
        {
          "tone": "warn",
          "title": "Laranja",
          "text": "Alergénios por confirmar. Pergunta ao restaurante."
        },
        {
          "tone": "danger",
          "title": "Vermelho",
          "text": "Sem opções seguras para ti."
        }
      ],
      "allergensLabel": "Cobre os 14 alergénios que os restaurantes têm de declarar na UE",
      "allergens": [
        "🌾 Glúten",
        "🦐 Crustáceos",
        "🥚 Ovos",
        "🐟 Peixe",
        "🥜 Amendoim",
        "🫘 Soja",
        "🥛 Leite",
        "🌰 Frutos de casca rija",
        "🥬 Aipo",
        "🟡 Mostarda",
        "🌱 Sésamo",
        "🍷 Sulfitos",
        "🌼 Tremoço",
        "🐚 Moluscos"
      ],
      "faqEyebrow": "Respostas rápidas",
      "faqTitle": "Antes de abrires o mapa",
      "faq": [
        {
          "q": "Tenho de instalar alguma coisa ou criar conta?",
          "a": "Não. A besayfe abre no navegador. Podes saltar a escolha das alergias e ver tudo na mesma."
        },
        {
          "q": "Posso confiar no resultado?",
          "a": "Verde quer dizer que o restaurante confirmou. O que é estimado vem sempre identificado como estimativa. A besayfe serve para te informar e não substitui a confirmação com o restaurante."
        },
        {
          "q": "O restaurante que frequento não está no mapa.",
          "a": "Tira uma foto ao menu e a app estima os alergénios, ou diz-nos qual é o restaurante e tratamos do resto."
        },
        {
          "q": "Tenho um restaurante. O que ganho?",
          "a": "Os teus pratos aparecem como confirmados e não como estimados, que é o que quem tem alergias procura primeiro. Fala connosco e configuramos o menu contigo."
        }
      ],
      "stickyCta": "Abrir o mapa",
      "ctaSecondaryLabel": "Sugerir um restaurante",
      "heroEyebrow": "Para quem come fora",
      "heroTitle": "Vê o que está no prato antes de pedires.",
      "heroText": "Escolhe as tuas alergias e a besayfe lê o menu por ti, prato a prato. Se o restaurante ainda não está cá, basta uma foto do menu.",
      "heroSecondaryCta": "Ver como funciona",
      "mock": {
        "menuTag": "Menu do restaurante",
        "filterLabel": "O teu perfil",
        "filterChips": [
          "Glúten",
          "Leite"
        ],
        "dishes": [
          {
            "name": "Bacalhau com natas",
            "category": "Pratos principais",
            "allergens": [
              "Glúten",
              "Leite",
              "Peixe"
            ],
            "status": "danger",
            "statusLabel": "Contém glúten e leite"
          },
          {
            "name": "Polvo à lagareiro",
            "category": "Pratos principais",
            "allergens": [
              "Moluscos"
            ],
            "status": "safe",
            "statusLabel": "Nada do que evitas"
          },
          {
            "name": "Arroz de pato",
            "category": "Pratos principais",
            "allergens": [
              "Ovo"
            ],
            "status": "info",
            "statusLabel": "Nada do que evitas, por confirmar"
          }
        ]
      },
      "problemEyebrow": "O problema",
      "problemTitle": "Comer fora ainda obriga a confiar numa resposta",
      "problemIntro": "Quem evita um ingrediente conhece a rotina: perguntar, aguardar e esperar que a resposta seja a certa.",
      "problem": {
        "points": [
          {
            "icon": "01",
            "title": "A resposta depende de quem está de serviço",
            "text": "A mesma pergunta pode ter respostas diferentes consoante quem atende, e muitas vezes ninguém consegue confirmar a receita naquele momento."
          },
          {
            "icon": "02",
            "title": "Perguntar sempre",
            "text": "Explicar uma alergia com a sala cheia, a meio do serviço, é cansativo. Muita gente acaba por pedir o prato do costume ou por ficar em casa."
          },
          {
            "icon": "03",
            "title": "Poucos sítios publicam alguma coisa",
            "text": "Poucos restaurantes publicam os alergénios onde os possas ver antes de ir, por isso acabas sempre a perguntar à mesa."
          }
        ]
      },
      "solutionEyebrow": "Como funciona",
      "solutionTitle": "As tuas alergias, no mapa e no menu",
      "solutionIntro": "Abre no navegador. Não instalas nada, não crias conta e não esperas.",
      "solution": {
        "steps": [
          {
            "icon": "01",
            "title": "Escolhe as tuas alergias",
            "text": "Assinala as tuas entre os 14 alergénios da lista europeia. Demora menos de um minuto e podes saltar este passo e ver tudo na mesma."
          },
          {
            "icon": "02",
            "title": "Abre o mapa, abre o menu",
            "text": "Os restaurantes à tua volta ficam marcados conforme o que significam para ti, e o menu diz-te logo quantos pratos podes comer."
          },
          {
            "icon": "03",
            "title": "Ainda não há menu? Fotografa",
            "text": "Tira uma foto ao menu de papel. A besayfe lê-o em português ou inglês, estima os alergénios de cada prato e mostra-te logo o resultado."
          }
        ]
      },
      "featuresEyebrow": "O que tens",
      "featuresTitle": "Útil mesmo antes de o restaurante aderir",
      "featuresIntro": "Três fontes de informação, cada uma identificada para saberes qual estás a ler.",
      "features": {
        "items": [
          {
            "icon": "01",
            "title": "Vem direto da cozinha",
            "text": "Os restaurantes na besayfe preenchem uma ficha técnica por receita. Só o que confirmam conta como verificado e só isso aparece a verde."
          },
          {
            "icon": "02",
            "title": "Dados oficiais das cadeias",
            "text": "Das grandes cadeias carregamos as tabelas de alergénios que publicam. O que está declarado tem sempre prioridade sobre a estimativa do modelo."
          },
          {
            "icon": "03",
            "title": "No resto, a IA lê o menu",
            "text": "Nos restaurantes que ainda não aderiram basta uma foto. O OCR extrai os pratos e o modelo estima os alergénios mais prováveis a partir do prato e da forma como costuma ser confecionado."
          },
          {
            "icon": "04",
            "title": "Cinco estados",
            "text": "Contém, possível contacto, sem dados, nada do que evitas, e nada do que evitas mas por confirmar. Sabes sempre em qual estás e de onde vem a resposta."
          },
          {
            "icon": "05",
            "title": "Um mapa que conhece as tuas alergias",
            "text": "Os pontos mudam de cor conforme o teu perfil e, dentro do menu, vês só os pratos que podes comer."
          },
          {
            "icon": "06",
            "title": "Feito com a ajuda de todos",
            "text": "Os menus que fotografas são revistos e passam a ajudar a pessoa seguinte. Se vires um erro, podes avisar no próprio menu. Tudo em português e inglês."
          }
        ]
      },
      "socialProofEyebrow": "Porque é que isto importa",
      "socialProofTitle": "Muita gente escolhe onde comer assim",
      "socialProofIntro": "As alergias e as intolerâncias condicionam uma decisão que devia ser simples, e a informação para a simplificar já existe.",
      "socialProof": {
        "items": [
          {
            "icon": "01",
            "title": "1 em cada 10 adultos europeus",
            "text": "Os adultos com alergia ou intolerância escolhem o restaurante consoante a confiança que a resposta lhes dá.",
            "meta": "Prevalência de alergias e intolerâncias"
          },
          {
            "icon": "02",
            "title": "Até 22% das crianças europeias",
            "text": "Mais de uma em cada cinco tem sintomas alérgicos, e muitas famílias deixam de comer fora por causa disso.",
            "meta": "<a href=\"https://www.spaic.pt/noticias/ate-22-das-criancas-na-europa-tem-uma-alergia\" target=\"_blank\" rel=\"noreferrer\">SPAIC, 2023</a>"
          },
          {
            "icon": "03",
            "title": "A informação já existe",
            "text": "O Regulamento (UE) 1169/2011 exige informação sobre alergénios nos alimentos não pré-embalados desde 2014. Onde está publicada, usamo-la; onde não está, lemos o menu.",
            "meta": "Regulamento (UE) 1169/2011"
          }
        ]
      },
      "ctaEyebrow": "Há um sítio onde comes muitas vezes?",
      "ctaTitle": "Diz-nos onde gostavas de ver a besayfe.",
      "ctaText": "Diz-nos qual é o restaurante e tratamos do resto. Se o restaurante for teu, configuramos o menu para que os pratos apareçam como confirmados e não como estimados.",
      "ctaButton": "Abrir o mapa",
      "ctaSecondary": "Pedir o relatório de mercado",
      "disclaimer": "A besayfe é informativa e não substitui a confirmação dos alergénios no restaurante.",
      "galleryEyebrow": "A app",
      "galleryTitle": "Como fica no telemóvel",
      "galleryIntro": "Ecrãs reais da besayfe. Abre no navegador, por isso não tens de instalar nada.",
      "gallery": {
        "items": [
          {
            "key": "allergens",
            "title": "Diz o que evitas",
            "text": "Os 14 alergénios da lista europeia. Menos de um minuto, e podes saltar."
          },
          {
            "key": "map",
            "title": "Vês o que tens à volta",
            "text": "Cada ponto tem a cor das tuas alergias, e a lista de restaurantes está à distância de um toque."
          },
          {
            "key": "menu-danger",
            "title": "O menu lido por ti",
            "text": "Quantos pratos podes comer, o que cada um contém e a legenda dos cinco estados."
          },
          {
            "key": "contribution",
            "title": "Sem menu? Fotografa",
            "text": "Onde ainda não há dados, a tua foto serve a quem vier a seguir."
          }
        ]
      }
    },
    "tests": {
      "hero": {
        "loading": "A carregar...",
        "captions": [
          "O novo aliado contra alergias",
          "ajuda a identificar riscos com clareza",
          "analisa o produto para informação personalizada e fácil de ler",
          "sim, é mesmo assim tão simples e sem stress"
        ]
      },
      "validation": {
        "kicker": "Validação",
        "title": "Procura, especialistas e regulação impulsionam o projeto",
        "body": "Entrevistas exploratórias, validação clínica e legislação europeia confirmam que a besayfe responde a uma necessidade real e urgente.",
        "items": [
          {
            "step": "01",
            "title": "160 interessados",
            "body": "Utilizadores potenciais inscreveram-se para testar a versão beta e destacaram a facilidade de utilização.",
            "meta": "Fase exploratória, 2025"
          },
          {
            "step": "02",
            "title": "Endosso clínico e social",
            "body": "Associações de alergias e profissionais de saúde validaram a relevância científica e humana da besayfe.",
            "meta": "ONG parceiras + conselheiros clínicos"
          },
          {
            "step": "03",
            "title": "Regulação favorável",
            "body": "O Regulamento (UE) 1169/2011 e um mercado europeu de saúde e nutrição digital acima dos 45 mil milhões de dólares até 2030 criam forte tração para adoção.",
            "meta": "Relatórios de mercado + União Europeia"
          }
        ]
      }
    },
    "demoPreview": {
      "tag": "Acesso ao protótipo",
      "title": "Explore a jornada móvel da besayfe",
      "subtitle": "Siga o protótipo interativo no Figma e veja como irá ser o UX/UI da app.",
      "backHome": "Voltar ao início",
      "openInFigma": "Abrir no Figma",
      "tip": "Sugestão: use o rato ou o gesto de pinça para aproximar e analisar os ecrãs com mais detalhe."
    },
    "contact": {
      "title": "Fala connosco",
      "intro": "Diz-nos onde costumas comer, ou o que serves, e respondemos-te.",
      "fields": {
        "name": "Nome",
        "email": "Email",
        "message": "Mensagem",
        "placeholders": {
          "name": "O teu nome",
          "email": "exemplo@email.com",
          "message": "Como podemos ajudar?"
        }
      },
      "submit": "Enviar mensagem",
      "submitting": "A enviar...",
      "status": {
        "incomplete": "Preenche todos os campos antes de enviar.",
        "invalidEmail": "Indica um email válido.",
        "sending": "A enviar a mensagem encriptada...",
        "success": "Obrigado! Respondemos em breve.",
        "error": "Não foi possível enviar agora. Tenta outra vez daqui a pouco."
      },
      "directLabel": "Preferes email? Escreve para"
    },
    "productDemo": {
      "initialMessage": "Aponte a câmara para um código de barras para começar.",
      "searching": "A procurar produto...",
      "notFound": "Produto não encontrado.",
      "noneListed": "Nenhum indicado",
      "productFound": "Produto encontrado:",
      "name": "Nome",
      "code": "Código",
      "allergens": "Alergénios",
      "mayContain": "Pode conter",
      "errorFetch": "Erro ao obter dados. Verifique a ligação.",
      "cameraAccess": "Autorize o acesso à câmara.",
      "noCamera": "Nenhuma câmara detetada.",
      "cameraUnavailable": "Não foi possível aceder às câmaras disponíveis.",
      "enterValidCode": "Introduza um código válido para pesquisar.",
      "waiting": "A aguardar leitura ou introdução manual.",
      "processing": "A processar leitura...",
      "productFoundConfirm": "Produto encontrado ? confirme os detalhes abaixo.",
      "profileTitle": "Perfil de alergénios do utilizador",
      "profileSubtitle": "Mantenha simples: escolha apenas o que importa ao utilizador.",
      "profileSelected": "Selecionados {count}/{total}",
      "profileNoneSelected": "Nenhum alergénio selecionado",
      "profileTokenNone": "Nenhum selecionado",
      "profileMore": "mais",
      "profileSelectAll": "Selecionar todos",
      "profileClear": "Limpar",
      "profileHide": "Ocultar",
      "profileEdit": "Editar",
      "headerTag": "Leitor",
      "headerTitle": "Consulta de alergénios por código de barras",
      "headerSubtitle": "Leia o código de barras ou envie uma foto do rótulo para analisar o risco em segundos.",
      "scannerTitle": "Leitura com câmara",
      "scannerSubtitle": "Leia o código de barras ou envie uma foto do rótulo abaixo.",
      "zoom": "Zoom",
      "noCameraQuestion": "Sem código de barras?",
      "manualHint": "Escreva os dígitos do código para procurar o produto.",
      "manualPlaceholder": "5601234567890",
      "search": "Pesquisar",
      "tapToEnable": "Toque para ativar/desativar a câmara.",
      "summaryTitle": "Detalhes do produto",
      "summarySubtitle": "Dados fornecidos pela Open Food Facts e parceiros da besayfe.",
      "empty": "Leia um código ou pesquise acima para ver alergénios e vestígios.",
      "ingredients": "Ingredientes",
      "riskLabel": "Risco",
      "riskAnalysisTitle": "Análise de risco",
      "riskFinalScore": "Pontuação final de risco:",
      "riskFacilityAdded": "Risco da instalação incluído:",
      "riskScoreLabel": "Pontuação:",
      "riskViewMore": "Ver mais",
      "riskHideDetails": "Ocultar detalhes",
      "riskCalculating": "A calcular risco...",
      "riskNotFoundEngine": "Produto não encontrado no motor besayfe",
      "riskEngineFailed": "Falha no cálculo de risco",
      "riskUnavailable": "Serviço indisponível",
      "tips": []
    },
    "annex": {
      "GLUTEN": "Cereais que contem gluten (trigo, centeio, cevada, aveia e derivados)",
      "CRUSTACEANS": "Crustaceos e produtos a base de crustaceos",
      "EGG": "Ovos e produtos a base de ovo",
      "FISH": "Peixe e produtos a base de peixe",
      "PEANUT": "Amendoim e produtos a base de amendoim",
      "SOY": "Soja e produtos a base de soja",
      "MILK": "Leite e produtos lacteos, incluindo lactose",
      "TREE_NUTS": "Frutos de casca rija (amendoa, avela, noz, caju, peca, castanha do Brasil, pistacio, macadamia)",
      "CELERY": "Aipo e produtos a base de aipo",
      "MUSTARD": "Mostarda e produtos a base de mostarda",
      "SESAME": "Sementes de sesamo e produtos a base de sesamo",
      "SULPHITES": "Dioxido de enxofre e sulfitos >10mg/kg ou 10mg/L",
      "LUPIN": "Tremoco e produtos a base de tremoco",
      "MOLLUSCS": "Moluscos e produtos a base de moluscos"
    },
    "productDemoV2": {
      "initialMessage": "Aponte a câmara para um código de barras para começar.",
      "searching": "A procurar produto...",
      "notFound": "Produto não encontrado.",
      "noneListed": "Nenhum indicado",
      "productFound": "Produto encontrado:",
      "name": "Nome",
      "code": "Código",
      "allergens": "Alergénios",
      "mayContain": "Pode conter",
      "errorFetch": "Erro ao obter dados. Verifique a ligação.",
      "cameraAccess": "Autorize o acesso à câmara.",
      "noCamera": "Nenhuma câmara detetada.",
      "cameraUnavailable": "Não foi possível aceder às câmaras disponíveis.",
      "enterValidCode": "Introduza um código válido para pesquisar.",
      "waiting": "A aguardar leitura ou introdução manual.",
      "processing": "A processar leitura...",
      "productFoundConfirm": "Produto encontrado – confirme os detalhes abaixo.",
      "profileTitle": "Perfil de alergénios do utilizador",
      "profileSubtitle": "Mantenha simples: escolha apenas o que importa ao utilizador.",
      "profileSelected": "Selecionados {count}/{total}",
      "profileNoneSelected": "Nenhum alergénio selecionado",
      "profileTokenNone": "Nenhum selecionado",
      "profileMore": "mais",
      "profileSelectAll": "Selecionar todos",
      "profileClear": "Limpar",
      "profileHide": "Ocultar",
      "profileEdit": "Editar",
      "headerTag": "Leitor",
      "headerTitle": "Consulta de alergénios por código de barras",
      "headerSubtitle": "Leia ou pesquise para rever informação essencial em segundos.",
      "scannerTitle": "Leitura com câmara",
      "scannerSubtitle": "Autorize o acesso ou introduza o código manualmente.",
      "zoom": "Zoom",
      "noCameraQuestion": "Sem câmara?",
      "manualHint": "Escreva os dígitos do código para procurar o produto.",
      "manualPlaceholder": "5601234567890",
      "search": "Pesquisar",
      "tapToEnable": "Toque para ativar/desativar a câmara.",
      "summaryTitle": "Detalhes do produto",
      "summarySubtitle": "Dados fornecidos pela Open Food Facts e parceiros da besayfe.",
      "empty": "Leia um código ou pesquise acima para ver alergénios e vestígios.",
      "ingredients": "Ingredientes",
      "riskLabel": "Risco",
      "riskAnalysisTitle": "Análise de risco",
      "riskFinalScore": "Pontuação final de risco:",
      "riskFacilityAdded": "Risco da instalação incluído:",
      "riskScoreLabel": "Pontuação:",
      "insufficientInfo": "Informação insuficiente de ingredientes. Adicione uma foto do rótulo para analisar.",
      "riskViewMore": "Ver mais",
      "riskHideDetails": "Ocultar detalhes",
      "riskCalculating": "A calcular risco...",
      "riskNotFoundEngine": "Produto não encontrado no motor besayfe",
      "riskEngineFailed": "Falha no cálculo de risco",
      "riskUnavailable": "Serviço indisponível",
      "labelTitle": "Analisar rótulo de ingredientes",
      "labelSubtitle": "Envie uma foto nítida para ler os ingredientes e calcular o risco.",
      "labelProcessing": "A ler rótulo...",
      "labelReady": "Análise do rótulo pronta.",
      "labelHelp": "Precisa de mais detalhe? Uma foto do rótulo completa os ingredientes.",
      "labelEncourage": "Dica: boa luz e rótulo plano melhoram o OCR.",
      "uploadLabel": "Analisar rótulo",
      "uploadingLabel": "A ler rótulo...",
      "uploadLabelSuccess": "Rótulo analisado.",
      "uploadLabelError": "Não foi possível analisar a fotografia. Tente novamente.",
      "uploadLabelPermission": "Não foi possível aceder à fotografia. Verifique as permissões.",
      "uploadLabelOffline": "Sem ligação. Verifique a rede e tente novamente.",
      "uploadLabelMissingAllergens": "Selecione pelo menos um alergénio antes de analisar o rótulo.",
      "allergenLabels": {
        "GLUTEN": "Glúten",
        "CRUSTACEANS": "Crustáceos",
        "EGG": "Ovo",
        "FISH": "Peixe",
        "PEANUT": "Amendoim",
        "SOY": "Soja",
        "MILK": "Leite",
        "TREE_NUTS": "Frutos secos",
        "CELERY": "Aipo",
        "MUSTARD": "Mostarda",
        "SESAME": "Sésamo",
        "SULPHITES": "Sulfitos",
        "LUPIN": "Tremoço",
        "MOLLUSCS": "Moluscos"
      },
      "tips": []
    },
    "about": {
      "heroTag": "A nossa história",
      "heroTitle": "Garantir segurança em cada escolha.",
      "heroLead": "A besayfe nasceu de um projeto universitário, a partir de uma observação simples: a informação que torna uma refeição segura já existe na cozinha e quase nunca chega a quem a vai comer.",
      "missionTitle": "Porque criámos a besayfe",
      "missionBody": "Ouvimos quem hesita antes de pedir e amigos que leem cada menu duas vezes. A besayfe põe a resposta nas mãos deles: o que cada prato leva, comparado com o que evitam. Vem da cozinha, quando o restaurante está na besayfe, e do próprio menu, quando não está.",
      "missionPillars": [
        "A resposta pertence a quem está a comer.",
        "A cozinha já tem a resposta. O nosso trabalho é fazê-la chegar à mesa.",
        "Sem conta, sem app para instalar e sem complicações."
      ],
      "teamTitle": "Conhece os fundadores",
      "teamIntro": "Somos uma equipa pequena que junta tecnologia, rigor e horas passadas em cozinhas reais para mudar a forma como a informação chega à mesa.",
      "founders": [
        {
          "name": "Francisco Magalhães",
          "role": "CEO e CTO",
          "bio": "Lidera produto e engenharia, e constrói a plataforma em que as cozinhas trabalham."
        },
        {
          "name": "Rodrigo Azevedo",
          "role": "COO e CPO",
          "bio": "Gere operações e parcerias, e acompanha cada restaurante que adere."
        }
      ],
      "ctaTitle": "Queres fazer parte disto?",
      "ctaBody": "Diz-nos onde costumas comer e levamos a besayfe a mais uma mesa.<br>Se tens um restaurante, configuramos o teu menu para que os pratos apareçam confirmados por ti.",
      "rulesTitle": "Como tratamos a informação",
      "rulesBody": "Pedimos a quem tem alergias que confie no que lhe mostramos, por isso as regras que seguimos têm de estar à vista. São estas, e a app cumpre-as sempre.",
      "rules": [
        "<strong>Só o restaurante confirma.</strong> O que o modelo estima fica marcado como não confirmado e nunca aparece a verde.",
        "<strong>O declarado ganha ao inferido.</strong> Onde há informação oficial, mostramos essa, mesmo que a estimativa diga outra coisa.",
        "<strong>Nunca dizemos que um prato é seguro.</strong> Dizemos o que sabemos, de onde veio e o que falta confirmar. A decisão continua a ser tua."
      ]
    }
  }
};

export default translations;
