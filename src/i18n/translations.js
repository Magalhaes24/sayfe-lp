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
        "title": "besayfe",
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
        "title": "besayfe | about",
        "description": "Meet the founders of besayfe and why we set out to make eating out simple for people with food allergies and intolerances.",
        "keywords": [
          "besayfe founders",
          "food allergy startup",
          "safer eating out",
          "allergen transparency"
        ]
      },
      "contact": {
        "title": "besayfe | contact",
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
      "heroCta": "Talk to our team",
      "heroEyebrow": "For anyone eating out",
      "heroTitle": "Know what is on the plate before you order.",
      "heroText": "Set the allergens you avoid and besayfe reads the menu for you, dish by dish. Where the restaurant has not joined yet, a photo of the menu is enough to get an answer.",
      "heroSecondaryCta": "See how it works",
      "mock": {
        "menuTag": "Guest menu",
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
            "status": "warn",
            "statusLabel": "Contains gluten and milk"
          },
          {
            "name": "Polvo à lagareiro",
            "category": "Main courses",
            "allergens": [
              "Molluscs"
            ],
            "status": "safe",
            "statusLabel": "None of your allergens"
          },
          {
            "name": "Arroz de pato",
            "category": "Main courses",
            "allergens": [
              "Gluten?",
              "Egg?"
            ],
            "status": "estimate",
            "statusLabel": "Estimated from a menu photo, not confirmed"
          }
        ]
      },
      "problemEyebrow": "The reality",
      "problemTitle": "Eating out still comes down to trusting an answer",
      "problemIntro": "Anyone who avoids an ingredient knows the routine: ask, wait, and hope the answer that comes back is the right one.",
      "problem": {
        "points": [
          {
            "icon": "01",
            "title": "The answer depends on who is working",
            "text": "The same question gets a different answer depending on who takes the order, and often nobody can check the recipe there and then."
          },
          {
            "icon": "02",
            "title": "Asking, every single time",
            "text": "Explaining an allergy to a full room, in the middle of service, is tiring. Plenty of people order the safe option instead, or stay home."
          },
          {
            "icon": "03",
            "title": "Most places have nothing published",
            "text": "Only a small share of restaurants put allergen information anywhere you can read it beforehand, so the question always comes back to the table."
          }
        ]
      },
      "solutionEyebrow": "How it works",
      "solutionTitle": "Your allergens, on the map and on the menu",
      "solutionIntro": "besayfe opens in the browser. Nothing to install, and it works the same whether the restaurant is with us or not.",
      "solution": {
        "steps": [
          {
            "icon": "01",
            "title": "Tell us what you avoid",
            "text": "Tick your allergens from the 14 declarable ones. The map and every menu then read against your list rather than against a generic one."
          },
          {
            "icon": "02",
            "title": "Open the map, open the menu",
            "text": "Restaurants near you are marked by what they mean for you: contains it, does not declare it, or nothing known. Open one and you get the same reading dish by dish."
          },
          {
            "icon": "03",
            "title": "No menu yet? Photograph it",
            "text": "Point your camera at the paper menu. besayfe reads it in Portuguese or English, works out the likely allergens per dish, and shows you the result there and then."
          }
        ]
      },
      "featuresEyebrow": "What you get",
      "featuresTitle": "Useful before the restaurant is even with us",
      "featuresIntro": "Three sources of information, always labelled so you know which one you are reading.",
      "features": {
        "items": [
          {
            "icon": "01",
            "title": "Straight from the kitchen",
            "text": "Restaurants with besayfe fill in a technical sheet per recipe. Only what they confirm counts as verified, and only that can ever show as clear."
          },
          {
            "icon": "02",
            "title": "Official chain data",
            "text": "For the big chains we load the allergen tables they publish. Declared information always wins over anything the model works out."
          },
          {
            "icon": "03",
            "title": "Everywhere else, AI reads the menu",
            "text": "For restaurants that have not joined, a photo is enough: OCR pulls out the dishes and the model estimates the likely allergens from the dish and how it is usually cooked."
          },
          {
            "icon": "04",
            "title": "An estimate says so",
            "text": "Inferred dishes stay marked as unverified and are never painted as safe. You see where the answer came from and decide from there."
          },
          {
            "icon": "05",
            "title": "A map that knows your list",
            "text": "Pins are coloured against your own profile: contains, not declared, nothing known, or no data yet. Shared equipment shows up as possible contact."
          },
          {
            "icon": "06",
            "title": "Yours, and everyone's",
            "text": "Menus you photograph are reviewed and then help the next person with the same allergy. Portuguese and English throughout."
          }
        ]
      },
      "socialProofEyebrow": "Why it matters",
      "socialProofTitle": "Millions of people choose where to eat this way",
      "socialProofIntro": "Allergies and intolerances shape a decision that should be easy, and the information to fix it already exists.",
      "socialProof": {
        "items": [
          {
            "icon": "01",
            "title": "1 in 10 European adults",
            "text": "Adults living with an allergy or an intolerance pick restaurants by how confidently their question is answered.",
            "meta": "Allergy and intolerance prevalence"
          },
          {
            "icon": "02",
            "title": "Up to 22% of European children",
            "text": "More than one in five show allergic symptoms, and families often avoid eating out altogether because of it.",
            "meta": "<a href=\"https://www.spaic.pt/noticias/ate-22-das-criancas-na-europa-tem-uma-alergia\" target=\"_blank\" rel=\"noreferrer\">SPAIC, 2023</a>"
          },
          {
            "icon": "03",
            "title": "The information already exists",
            "text": "EU Regulation 1169/2011 has required allergen information for non-prepacked food since 2014. Where it is published we use it, and where it is not, we read the menu instead.",
            "meta": "EU Regulation 1169/2011"
          }
        ]
      },
      "ctaEyebrow": "Somewhere you eat often?",
      "ctaTitle": "Tell us where you would like to see besayfe.",
      "ctaText": "Send us the restaurant and we will take it from there. And if you run one, we will set your menu up so your dishes show as confirmed rather than estimated.",
      "ctaButton": "Send us a message",
      "ctaSecondary": "Request the market brief"
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
      "missionBody": "We listened to people who hesitate before ordering, and to friends who read every menu twice. besayfe puts the answer in their hands: what each dish contains, read against what they avoid, from the kitchen itself where the restaurant is with us and from the menu itself where it is not.",
      "missionPillars": [
        "The answer belongs to the person eating.",
        "An estimate is always labelled as one.",
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
      "ctaTitle": "Ready to be part of the change?",
      "ctaBody": "Eating out should not depend on who happens to take your order.<br> Join besayfe and help us bring clear allergen information to more tables."
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
        "description": "A besayfe mostra num mapa os restaurantes face aos alergenios que evita. Onde ainda nao ha menu, fotografe-o e a app le-o e estima os alergenios por si.",
        "keywords": [
          "besayfe",
          "mapa de alergenios",
          "comer fora com alergias",
          "menu sem gluten",
          "restaurantes para alergicos",
          "fotografia do menu alergenios",
          "alergia alimentar",
          "celiaco comer fora",
          "intolerancia alimentar",
          "ocr de menus"
        ],
        "image": "/logo1000.png"
      },
      "home": {
        "title": "besayfe",
        "description": "Escolha os alergenios que evita, abra o mapa e veja os menus prato a prato. Ainda nao ha menu? Uma fotografia chega para ter uma estimativa em segundos.",
        "keywords": [
          "app alergias menu",
          "mapa de alergenios",
          "comer sem gluten",
          "fotografar menu alergenios",
          "comer fora com alergias"
        ]
      },
      "about": {
        "title": "besayfe | sobre",
        "description": "Conheca os fundadores da besayfe e porque quisemos tornar simples comer fora para quem tem alergias ou intolerancias alimentares.",
        "keywords": [
          "fundadores besayfe",
          "startup alergias alimentares",
          "comer fora em seguranca",
          "transparencia alimentar"
        ]
      },
      "contact": {
        "title": "besayfe | contacto",
        "description": "Fale com a equipa besayfe. Sugira um restaurante, tire uma duvida ou traga a besayfe para a sua casa.",
        "keywords": [
          "contacto besayfe",
          "sugerir restaurante",
          "menu para alergicos"
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
      "heroCta": "Fale connosco",
      "heroEyebrow": "Para quem come fora",
      "heroTitle": "Saiba o que está no prato antes de pedir.",
      "heroText": "Escolha os alergénios que evita e a besayfe lê o menu por si, prato a prato. Onde o restaurante ainda não aderiu, uma fotografia do menu chega para ter resposta.",
      "heroSecondaryCta": "Ver como funciona",
      "mock": {
        "menuTag": "Menu do restaurante",
        "filterLabel": "O seu perfil",
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
            "status": "warn",
            "statusLabel": "Contém glúten e leite"
          },
          {
            "name": "Polvo à lagareiro",
            "category": "Pratos principais",
            "allergens": [
              "Moluscos"
            ],
            "status": "safe",
            "statusLabel": "Nenhum dos seus alergénios"
          },
          {
            "name": "Arroz de pato",
            "category": "Pratos principais",
            "allergens": [
              "Glúten?",
              "Ovo?"
            ],
            "status": "estimate",
            "statusLabel": "Estimado por fotografia, não confirmado"
          }
        ]
      },
      "problemEyebrow": "A realidade",
      "problemTitle": "Comer fora ainda depende de confiar numa resposta",
      "problemIntro": "Quem evita um ingrediente conhece a rotina: perguntar, esperar e torcer para que a resposta que chega seja a certa.",
      "problem": {
        "points": [
          {
            "icon": "01",
            "title": "A resposta muda com quem está ao serviço",
            "text": "A mesma pergunta tem respostas diferentes consoante quem tira o pedido, e muitas vezes ninguém consegue confirmar a receita naquele momento."
          },
          {
            "icon": "02",
            "title": "Perguntar, sempre",
            "text": "Explicar uma alergia com a sala cheia, a meio do serviço, cansa. Muita gente acaba por pedir o prato do costume, ou por ficar em casa."
          },
          {
            "icon": "03",
            "title": "A maioria dos sítios não publica nada",
            "text": "Só uma pequena parte dos restaurantes coloca a informação de alergénios onde a possa ler antes, por isso a pergunta acaba sempre por voltar à mesa."
          }
        ]
      },
      "solutionEyebrow": "Como funciona",
      "solutionTitle": "Os seus alergénios, no mapa e no menu",
      "solutionIntro": "A besayfe abre no navegador. Não instala nada e funciona da mesma maneira, esteja o restaurante connosco ou não.",
      "solution": {
        "steps": [
          {
            "icon": "01",
            "title": "Diga o que evita",
            "text": "Assinale os seus alergénios entre os 14 de declaração obrigatória. O mapa e todos os menus passam a ser lidos face à sua lista e não a uma lista genérica."
          },
          {
            "icon": "02",
            "title": "Abra o mapa, abra o menu",
            "text": "Os restaurantes à sua volta ficam marcados pelo que significam para si: contém, não declara, ou nada conhecido. Abra um e tem a mesma leitura prato a prato."
          },
          {
            "icon": "03",
            "title": "Ainda não há menu? Fotografe",
            "text": "Aponte a câmara ao menu de papel. A besayfe lê-o em português ou inglês, calcula os alergénios prováveis de cada prato e mostra-lhe o resultado ali mesmo."
          }
        ]
      },
      "featuresEyebrow": "O que ganha",
      "featuresTitle": "Útil ainda antes de o restaurante estar connosco",
      "featuresIntro": "Três origens de informação, sempre identificadas para saber qual está a ler.",
      "features": {
        "items": [
          {
            "icon": "01",
            "title": "Vem direto da cozinha",
            "text": "Os restaurantes com besayfe preenchem uma ficha técnica por receita. Só o que confirmam conta como verificado e só isso pode aparecer como sem alergénios."
          },
          {
            "icon": "02",
            "title": "Dados oficiais das cadeias",
            "text": "Das grandes cadeias carregamos as tabelas de alergénios que publicam. A informação declarada prevalece sempre sobre o que o modelo calcula."
          },
          {
            "icon": "03",
            "title": "No resto, a IA lê o menu",
            "text": "Nos restaurantes que ainda não aderiram basta uma fotografia: o OCR extrai os pratos e o modelo estima os alergénios prováveis a partir do prato e da forma como costuma ser feito."
          },
          {
            "icon": "04",
            "title": "Uma estimativa diz que é",
            "text": "Os pratos inferidos ficam marcados como não verificados e nunca são pintados como seguros. Sabe sempre de onde veio a resposta e decide a partir daí."
          },
          {
            "icon": "05",
            "title": "Um mapa à sua medida",
            "text": "Os pontos são coloridos face ao seu perfil: contém, não declara, nada conhecido, ou ainda sem dados. O equipamento partilhado aparece como possível contacto."
          },
          {
            "icon": "06",
            "title": "Seu, e de todos",
            "text": "Os menus que fotografa são revistos e passam a ajudar a próxima pessoa com a mesma alergia. Tudo em português e inglês."
          }
        ]
      },
      "socialProofEyebrow": "Porque é que isto importa",
      "socialProofTitle": "Milhões de pessoas escolhem onde comer assim",
      "socialProofIntro": "As alergias e as intolerâncias condicionam uma decisão que devia ser simples, e a informação para resolver isso já existe.",
      "socialProof": {
        "items": [
          {
            "icon": "01",
            "title": "1 em cada 10 adultos europeus",
            "text": "Adultos com alergia ou intolerância escolhem o restaurante pela confiança com que a sua pergunta é respondida.",
            "meta": "Prevalência de alergias e intolerâncias"
          },
          {
            "icon": "02",
            "title": "Até 22% das crianças europeias",
            "text": "Mais de uma em cada cinco apresenta sintomas alérgicos, e muitas famílias deixam de comer fora por causa disso.",
            "meta": "<a href=\"https://www.spaic.pt/noticias/ate-22-das-criancas-na-europa-tem-uma-alergia\" target=\"_blank\" rel=\"noreferrer\">SPAIC, 2023</a>"
          },
          {
            "icon": "03",
            "title": "A informação já existe",
            "text": "O Regulamento (UE) 1169/2011 exige informação sobre alergénios nos alimentos não pré-embalados desde 2014. Onde está publicada usamo-la, e onde não está lemos o menu.",
            "meta": "Regulamento (UE) 1169/2011"
          }
        ]
      },
      "ctaEyebrow": "Há um sítio onde come muitas vezes?",
      "ctaTitle": "Diga-nos onde gostava de encontrar a besayfe.",
      "ctaText": "Envie-nos o restaurante e tratamos do resto. E se for seu, configuramos o menu para que os seus pratos apareçam como confirmados e não como estimados.",
      "ctaButton": "Enviar mensagem",
      "ctaSecondary": "Pedir o relatório de mercado"
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
      "title": "Fale connosco",
      "intro": "Diga-nos onde costuma comer, ou o que serve, e respondemos-lhe.",
      "fields": {
        "name": "Nome",
        "email": "Email",
        "message": "Mensagem",
        "placeholders": {
          "name": "O seu nome",
          "email": "exemplo@email.com",
          "message": "Como podemos ajudar?"
        }
      },
      "submit": "Enviar mensagem",
      "submitting": "A enviar...",
      "status": {
        "incomplete": "Preencha todos os campos antes de enviar.",
        "invalidEmail": "Indique um email válido.",
        "sending": "A enviar a mensagem encriptada...",
        "success": "Obrigado! Responderemos em breve.",
        "error": "Não foi possível enviar agora. Tente novamente dentro de momentos."
      },
      "directLabel": "Prefere email? Escreva para"
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
      "missionBody": "Ouvimos quem hesita antes de pedir e amigos que leem cada menu duas vezes. A besayfe põe a resposta nas mãos deles: o que cada prato leva, comparado com aquilo que evitam, vindo da cozinha onde o restaurante está connosco e do próprio menu onde não está.",
      "missionPillars": [
        "A resposta pertence a quem está a comer.",
        "Uma estimativa é sempre identificada como tal.",
        "Sem conta, sem app para instalar e sem complicações."
      ],
      "teamTitle": "Conheça os fundadores",
      "teamIntro": "Somos uma equipa pequena que une tecnologia, rigor e horas passadas em cozinhas reais para mudar a forma como a informação chega à mesa.",
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
      "ctaTitle": "Pronto para fazer parte da mudança?",
      "ctaBody": "Comer fora não devia depender de quem calha tirar o pedido.<br> Junte-se à besayfe e ajude-nos a levar informação clara sobre alergénios a mais mesas."
    }
  }
};

export default translations;
